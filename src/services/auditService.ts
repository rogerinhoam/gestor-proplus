// src/services/auditService.ts
import { supabase } from './supabaseClient'

export interface AuditLog {
  id: string
  user_id?: string
  action: string
  table_name?: string
  record_id?: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
  session_id?: string
  created_at: string
  metadata?: Record<string, any>
}

export interface AuditFilter {
  user_id?: string
  action?: string
  table_name?: string
  date_from?: string
  date_to?: string
  ip_address?: string
  limit?: number
  offset?: number
}

export class AuditService {
  private isEnabled: boolean = true
  private batchSize: number = 100
  private batchTimeout: number = 5000
  private pendingLogs: Omit<AuditLog, 'id' | 'created_at'>[] = []
  private batchTimer: NodeJS.Timeout | null = null

  constructor() {
    this.setupBatchProcessing()
  }

  /**
   * Habilita ou desabilita o sistema de auditoria
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
  }

  /**
   * Configura o tamanho do batch para processamento
   */
  setBatchSize(size: number): void {
    this.batchSize = size
  }

  /**
   * Registra uma ação no log de auditoria
   */
  async log(
    action: string,
    details: {
      table_name?: string
      record_id?: string
      old_values?: Record<string, any>
      new_values?: Record<string, any>
      metadata?: Record<string, any>
      user_id?: string
    } = {}
  ): Promise<void> {
    if (!this.isEnabled) return

    const logEntry: Omit<AuditLog, 'id' | 'created_at'> = {
      action,
      table_name: details.table_name,
      record_id: details.record_id,
      old_values: details.old_values,
      new_values: details.new_values,
      metadata: details.metadata,
      user_id: details.user_id || this.getCurrentUserId(),
      ip_address: await this.getClientIP(),
      user_agent: navigator.userAgent,
      session_id: this.getSessionId()
    }

    this.addToBatch(logEntry)
  }

  /**
   * Registra operações CRUD automaticamente
   */
  async logCRUD(
    operation: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE',
    table: string,
    recordId: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>
  ): Promise<void> {
    await this.log(`${operation}_${table.toUpperCase()}`, {
      table_name: table,
      record_id: recordId,
      old_values: oldValues,
      new_values: newValues,
      metadata: {
        operation,
        timestamp: new Date().toISOString()
      }
    })
  }

  /**
   * Registra login/logout
   */
  async logAuth(action: 'LOGIN' | 'LOGOUT', metadata?: Record<string, any>): Promise<void> {
    await this.log(`AUTH_${action}`, {
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    })
  }

  /**
   * Registra alterações de configuração
   */
  async logConfigChange(
    configKey: string,
    oldValue: any,
    newValue: any,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log('CONFIG_CHANGE', {
      table_name: 'configuracoes_sistema',
      record_id: configKey,
      old_values: { [configKey]: oldValue },
      new_values: { [configKey]: newValue },
      metadata: {
        config_key: configKey,
        ...metadata
      }
    })
  }

  /**
   * Registra erros do sistema
   */
  async logError(
    error: Error,
    context?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log('SYSTEM_ERROR', {
      metadata: {
        error_message: error.message,
        error_stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        ...metadata
      }
    })
  }

  /**
   * Registra ações de segurança
   */
  async logSecurity(
    action: string,
    details: {
      severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
      description?: string
      affected_resource?: string
      metadata?: Record<string, any>
    } = {}
  ): Promise<void> {
    await this.log(`SECURITY_${action}`, {
      metadata: {
        severity: details.severity || 'MEDIUM',
        description: details.description,
        affected_resource: details.affected_resource,
        timestamp: new Date().toISOString(),
        ...details.metadata
      }
    })
  }

  /**
   * Busca logs de auditoria com filtros
   */
  async getLogs(filter: AuditFilter = {}): Promise<{
    logs: AuditLog[]
    total: number
  }> {
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (filter.user_id) {
      query = query.eq('user_id', filter.user_id)
    }

    if (filter.action) {
      query = query.ilike('action', `%${filter.action}%`)
    }

    if (filter.table_name) {
      query = query.eq('table_name', filter.table_name)
    }

    if (filter.date_from) {
      query = query.gte('created_at', filter.date_from)
    }

    if (filter.date_to) {
      query = query.lte('created_at', filter.date_to)
    }

    if (filter.ip_address) {
      query = query.eq('ip_address', filter.ip_address)
    }

    if (filter.limit) {
      query = query.limit(filter.limit)
    }

    if (filter.offset) {
      query = query.range(filter.offset, filter.offset + (filter.limit || 50) - 1)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Erro ao buscar logs de auditoria: ${error.message}`)
    }

    return {
      logs: data || [],
      total: count || 0
    }
  }

  /**
   * Busca logs por record_id específico
   */
  async getLogsByRecord(table: string, recordId: string): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('table_name', table)
      .eq('record_id', recordId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar logs do registro: ${error.message}`)
    }

    return data || []
  }

  /**
   * Gera relatório de auditoria
   */
  async generateReport(
    dateFrom: string,
    dateTo: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<string | AuditLog[]> {
    const { logs } = await this.getLogs({
      date_from: dateFrom,
      date_to: dateTo,
      limit: 10000
    })

    if (format === 'csv') {
      return this.convertToCSV(logs)
    }

    return logs
  }

  /**
   * Limpa logs antigos baseado em política de retenção
   */
  async cleanupOldLogs(retentionDays: number = 90): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

    const { data, error } = await supabase
      .from('audit_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .select('id')

    if (error) {
      throw new Error(`Erro ao limpar logs antigos: ${error.message}`)
    }

    return data?.length || 0
  }

  /**
   * Obtém estatísticas de auditoria
   */
  async getStatistics(days: number = 30): Promise<{
    totalLogs: number
    logsByAction: Record<string, number>
    logsByTable: Record<string, number>
    logsByUser: Record<string, number>
    logsByDay: Array<{ date: string; count: number }>
  }> {
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - days)

    const { logs } = await this.getLogs({
      date_from: dateFrom.toISOString(),
      limit: 10000
    })

    const stats = {
      totalLogs: logs.length,
      logsByAction: {} as Record<string, number>,
      logsByTable: {} as Record<string, number>,
      logsByUser: {} as Record<string, number>,
      logsByDay: [] as Array<{ date: string; count: number }>
    }

    // Processar estatísticas
    const dayMap = new Map<string, number>()

    logs.forEach(log => {
      // Por ação
      stats.logsByAction[log.action] = (stats.logsByAction[log.action] || 0) + 1

      // Por tabela
      if (log.table_name) {
        stats.logsByTable[log.table_name] = (stats.logsByTable[log.table_name] || 0) + 1
      }

      // Por usuário
      if (log.user_id) {
        stats.logsByUser[log.user_id] = (stats.logsByUser[log.user_id] || 0) + 1
      }

      // Por dia
      const day = log.created_at.split('T')[0]
      dayMap.set(day, (dayMap.get(day) || 0) + 1)
    })

    // Converter mapa de dias para array
    stats.logsByDay = Array.from(dayMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return stats
  }

  /**
   * Verifica integridade dos logs
   */
  async verifyIntegrity(): Promise<{
    isValid: boolean
    issues: string[]
  }> {
    const issues: string[] = []

    try {
      // Verificar logs órfãos (sem user_id)
      const { data: orphanLogs } = await supabase
        .from('audit_logs')
        .select('id')
        .is('user_id', null)
        .limit(10)

      if (orphanLogs && orphanLogs.length > 0) {
        issues.push(`${orphanLogs.length}+ logs sem user_id encontrados`)
      }

      // Verificar logs com ações inválidas
      const { data: invalidActions } = await supabase
        .from('audit_logs')
        .select('id, action')
        .not('action', 'like', '%_%')
        .limit(10)

      if (invalidActions && invalidActions.length > 0) {
        issues.push(`${invalidActions.length}+ logs com ações inválidas`)
      }

      // Verificar consistência temporal
      const { data: futureLogs } = await supabase
        .from('audit_logs')
        .select('id')
        .gt('created_at', new Date().toISOString())
        .limit(10)

      if (futureLogs && futureLogs.length > 0) {
        issues.push(`${futureLogs.length}+ logs com data futura`)
      }

    } catch (error) {
      issues.push(`Erro ao verificar integridade: ${error}`)
    }

    return {
      isValid: issues.length === 0,
      issues
    }
  }

  // Métodos privados
  private addToBatch(logEntry: Omit<AuditLog, 'id' | 'created_at'>): void {
    this.pendingLogs.push(logEntry)

    if (this.pendingLogs.length >= this.batchSize) {
      this.processBatch()
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.processBatch()
      }, this.batchTimeout)
    }
  }

  private async processBatch(): Promise<void> {
    if (this.pendingLogs.length === 0) return

    const batch = [...this.pendingLogs]
    this.pendingLogs = []

    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }

    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert(batch.map(log => ({
          ...log,
          created_at: new Date().toISOString()
        })))

      if (error) {
        console.error('Erro ao salvar batch de audit logs:', error)
        // Re-adicionar ao batch em caso de erro
        this.pendingLogs.unshift(...batch)
      }
    } catch (error) {
      console.error('Erro ao processar batch de audit logs:', error)
      this.pendingLogs.unshift(...batch)
    }
  }

  private setupBatchProcessing(): void {
    // Processar batch pendente antes de fechar a página
    window.addEventListener('beforeunload', () => {
      if (this.pendingLogs.length > 0) {
        // Envio síncrono para garantir que os logs sejam salvos
        navigator.sendBeacon('/api/audit/batch', JSON.stringify(this.pendingLogs))
      }
    })

    // Processar batch periodicamente
    setInterval(() => {
      if (this.pendingLogs.length > 0) {
        this.processBatch()
      }
    }, this.batchTimeout)
  }

  private getCurrentUserId(): string | undefined {
    // Implementar lógica para obter o ID do usuário atual
    // Por enquanto, retorna um ID fixo
    return 'user-001'
  }

  private async getClientIP(): Promise<string | undefined> {
    try {
      // Em produção, isso seria obtido do backend
      // Por enquanto, retorna undefined
      return undefined
    } catch (error) {
      return undefined
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('audit_session_id')
    if (!sessionId) {
      sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      sessionStorage.setItem('audit_session_id', sessionId)
    }
    return sessionId
  }

  private convertToCSV(logs: AuditLog[]): string {
    if (logs.length === 0) return ''

    const headers = [
      'ID',
      'User ID',
      'Action',
      'Table',
      'Record ID',
      'IP Address',
      'Created At'
    ]

    const rows = logs.map(log => [
      log.id,
      log.user_id || '',
      log.action,
      log.table_name || '',
      log.record_id || '',
      log.ip_address || '',
      log.created_at
    ])

    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
  }
}

export const auditService = new AuditService()

// Decorator para auditoria automática
export function Auditable(action: string, table?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now()
      let result: any
      let error: Error | null = null

      try {
        result = await method.apply(this, args)
        
        await auditService.log(action, {
          table_name: table,
          metadata: {
            method: propertyName,
            duration: Date.now() - startTime,
            success: true
          }
        })

        return result
      } catch (err) {
        error = err as Error
        
        await auditService.log(`${action}_ERROR`, {
          table_name: table,
          metadata: {
            method: propertyName,
            duration: Date.now() - startTime,
            success: false,
            error: error.message
          }
        })

        throw error
      }
    }

    return descriptor
  }
}
