// src/features/configuracoes/configuracoesService.ts
import { supabase } from '../../services/supabaseClient'
import { ConfiguracaoSistema } from '../../types'

export class ConfiguracoesService {
  async getAll(): Promise<ConfiguracaoSistema[]> {
    const { data, error } = await supabase
      .from('configuracoes_sistema')
      .select('*')
      .order('chave', { ascending: true })

    if (error) {
      throw new Error(`Erro ao buscar configurações: ${error.message}`)
    }

    return data || []
  }

  async getByChave(chave: string): Promise<ConfiguracaoSistema | null> {
    const { data, error } = await supabase
      .from('configuracoes_sistema')
      .select('*')
      .eq('chave', chave)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Registro não encontrado
        return null
      }
      throw new Error(`Erro ao buscar configuração: ${error.message}`)
    }

    return data
  }

  async update(chave: string, valor: string): Promise<ConfiguracaoSistema> {
    // Primeiro, tentar atualizar
    const { data: existingData, error: selectError } = await supabase
      .from('configuracoes_sistema')
      .select('id')
      .eq('chave', chave)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      throw new Error(`Erro ao verificar configuração: ${selectError.message}`)
    }

    if (existingData) {
      // Atualizar registro existente
      const { data, error } = await supabase
        .from('configuracoes_sistema')
        .update({
          valor,
          updated_at: new Date().toISOString()
        })
        .eq('chave', chave)
        .select()
        .single()

      if (error) {
        throw new Error(`Erro ao atualizar configuração: ${error.message}`)
      }

      return data
    } else {
      // Criar novo registro
      const { data, error } = await supabase
        .from('configuracoes_sistema')
        .insert([{
          chave,
          valor,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        throw new Error(`Erro ao criar configuração: ${error.message}`)
      }

      return data
    }
  }

  async delete(chave: string): Promise<void> {
    const { error } = await supabase
      .from('configuracoes_sistema')
      .delete()
      .eq('chave', chave)

    if (error) {
      throw new Error(`Erro ao deletar configuração: ${error.message}`)
    }
  }

  async resetToDefaults(): Promise<void> {
    const defaultConfiguracoes = [
      // Configurações da Empresa
      { chave: 'empresa_nome', valor: 'R.M. Estética Automotiva' },
      { chave: 'empresa_cnpj', valor: '18.637.639/0001-48' },
      { chave: 'empresa_telefone', valor: '(24) 99948-6232' },
      { chave: 'empresa_endereco', valor: 'Rua 40, TV - Recanto dos Pássaros, Pq. Mambucaba, Angra dos Reis - RJ' },
      { chave: 'empresa_email', valor: '' },
      { chave: 'empresa_website', valor: '' },
      { chave: 'empresa_logo', valor: '' },

      // Configurações do Sistema
      { chave: 'system_timezone', valor: 'America/Sao_Paulo' },
      { chave: 'system_language', valor: 'pt-BR' },
      { chave: 'system_currency', valor: 'BRL' },
      { chave: 'system_date_format', valor: 'DD/MM/YYYY' },
      { chave: 'system_theme', valor: 'light' },
      { chave: 'system_items_per_page', valor: '10' },
      { chave: 'system_auto_save', valor: 'true' },
      { chave: 'system_debug', valor: 'false' },
      { chave: 'system_session_timeout', valor: '30' },
      { chave: 'system_max_file_size', valor: '10' },
      { chave: 'system_allowed_file_types', valor: 'jpg,jpeg,png,pdf' },
      { chave: 'system_enable_audit_log', valor: 'true' },
      { chave: 'system_enable_notifications', valor: 'true' },
      { chave: 'system_default_orcamento_validity', valor: '7' },

      // Configurações de Backup
      { chave: 'backup_enabled', valor: 'true' },
      { chave: 'backup_frequency', valor: 'daily' },
      { chave: 'backup_retention', valor: '30' },
      { chave: 'backup_auto', valor: 'true' },
      { chave: 'backup_location', valor: 'local' },
      { chave: 'backup_include_files', valor: 'true' },
      { chave: 'backup_compression', valor: 'true' },
      { chave: 'backup_encrypt', valor: 'false' },
      { chave: 'backup_max_size', valor: '100' },
      { chave: 'backup_time', valor: '02:00' },
      { chave: 'backup_email_notification', valor: 'true' },
      { chave: 'backup_webhook_url', valor: '' },

      // Configurações de Notificação
      { chave: 'notification_email', valor: 'true' },
      { chave: 'notification_push', valor: 'true' },
      { chave: 'notification_sms', valor: 'false' },
      { chave: 'notification_followup_reminder', valor: 'true' },
      { chave: 'notification_payment_reminder', valor: 'true' },
      { chave: 'notification_appointment_reminder', valor: 'true' },
      { chave: 'notification_backup', valor: 'true' },
      { chave: 'notification_system_alerts', valor: 'true' },
      { chave: 'notification_email_provider', valor: 'smtp' },
      { chave: 'notification_smtp_host', valor: '' },
      { chave: 'notification_smtp_port', valor: '587' },
      { chave: 'notification_smtp_user', valor: '' },
      { chave: 'notification_smtp_password', valor: '' },
      { chave: 'notification_smtp_secure', valor: 'true' },
      { chave: 'notification_from_email', valor: '' },
      { chave: 'notification_from_name', valor: '' },
      { chave: 'notification_quiet_hours_start', valor: '22:00' },
      { chave: 'notification_quiet_hours_end', valor: '08:00' },
      { chave: 'notification_timezone', valor: 'America/Sao_Paulo' },

      // Configurações de WhatsApp
      { chave: 'whatsapp_enabled', valor: 'true' },
      { chave: 'whatsapp_api_key', valor: '' },
      { chave: 'whatsapp_webhook_url', valor: '' },
      { chave: 'whatsapp_business_phone', valor: '' },
      { chave: 'whatsapp_auto_reply', valor: 'false' },
      { chave: 'whatsapp_message_delay', valor: '2000' }
    ]

    try {
      // Deletar todas as configurações existentes
      const { error: deleteError } = await supabase
        .from('configuracoes_sistema')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Deletar todos

      if (deleteError) {
        throw new Error(`Erro ao limpar configurações: ${deleteError.message}`)
      }

      // Inserir configurações padrão
      const { error: insertError } = await supabase
        .from('configuracoes_sistema')
        .insert(defaultConfiguracoes.map(config => ({
          ...config,
          updated_at: new Date().toISOString()
        })))

      if (insertError) {
        throw new Error(`Erro ao inserir configurações padrão: ${insertError.message}`)
      }
    } catch (error) {
      throw new Error(`Erro ao restaurar configurações padrão: ${error}`)
    }
  }

  async exportAll(): Promise<any> {
    const configuracoes = await this.getAll()
    
    return {
      versao: '2.0',
      timestamp: new Date().toISOString(),
      configuracoes: configuracoes.reduce((acc, config) => {
        acc[config.chave] = config.valor
        return acc
      }, {} as Record<string, string>),
      metadata: {
        totalConfiguracoes: configuracoes.length,
        exportedBy: 'sistema',
        exportedAt: new Date().toISOString()
      }
    }
  }

  async importAll(data: any): Promise<void> {
    if (!data.configuracoes || typeof data.configuracoes !== 'object') {
      throw new Error('Formato de dados inválido')
    }

    const configuracoes = Object.entries(data.configuracoes).map(([chave, valor]) => ({
      chave,
      valor: String(valor),
      updated_at: new Date().toISOString()
    }))

    try {
      // Usar upsert para atualizar ou inserir
      const { error } = await supabase
        .from('configuracoes_sistema')
        .upsert(configuracoes, {
          onConflict: 'chave'
        })

      if (error) {
        throw new Error(`Erro ao importar configurações: ${error.message}`)
      }
    } catch (error) {
      throw new Error(`Erro ao importar configurações: ${error}`)
    }
  }

  async validateConfiguration(chave: string, valor: string): Promise<boolean> {
    const validationRules: Record<string, (value: string) => boolean> = {
      'system_items_per_page': (value) => {
        const num = parseInt(value)
        return !isNaN(num) && num > 0 && num <= 100
      },
      'system_session_timeout': (value) => {
        const num = parseInt(value)
        return !isNaN(num) && num >= 5 && num <= 480
      },
      'system_max_file_size': (value) => {
        const num = parseInt(value)
        return !isNaN(num) && num > 0 && num <= 1000
      },
      'backup_retention': (value) => {
        const num = parseInt(value)
        return !isNaN(num) && num >= 1 && num <= 365
      },
      'backup_max_size': (value) => {
        const num = parseInt(value)
        return !isNaN(num) && num > 0 && num <= 1000
      },
      'notification_smtp_port': (value) => {
        const num = parseInt(value)
        return !isNaN(num) && num > 0 && num <= 65535
      },
      'empresa_cnpj': (value) => {
        const cnpj = value.replace(/\D/g, '')
        return cnpj.length === 14
      },
      'empresa_email': (value) => {
        if (!value) return true // Email é opcional
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(value)
      },
      'empresa_website': (value) => {
        if (!value) return true // Website é opcional
        const websiteRegex = /^https?:\/\/.+\..+/
        return websiteRegex.test(value)
      }
    }

    const validator = validationRules[chave]
    return validator ? validator(valor) : true
  }

  async getConfigurationsByCategory(category: string): Promise<ConfiguracaoSistema[]> {
    const { data, error } = await supabase
      .from('configuracoes_sistema')
      .select('*')
      .ilike('chave', `${category}_%`)
      .order('chave', { ascending: true })

    if (error) {
      throw new Error(`Erro ao buscar configurações da categoria: ${error.message}`)
    }

    return data || []
  }

  async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'error'
    checks: Array<{
      name: string
      status: 'ok' | 'warning' | 'error'
      message: string
    }>
  }> {
    const checks = []

    try {
      // Verificar conexão com o banco
      const { error: dbError } = await supabase
        .from('configuracoes_sistema')
        .select('count')
        .limit(1)

      checks.push({
        name: 'Database Connection',
        status: dbError ? 'error' : 'ok',
        message: dbError ? 'Erro na conexão com o banco' : 'Conexão OK'
      })

      // Verificar configurações críticas
      const criticalConfigs = [
        'empresa_nome',
        'empresa_cnpj',
        'system_timezone',
        'system_language'
      ]

      for (const config of criticalConfigs) {
        const value = await this.getByChave(config)
        checks.push({
          name: `Config: ${config}`,
          status: value && value.valor ? 'ok' : 'warning',
          message: value && value.valor ? 'Configurado' : 'Não configurado'
        })
      }

      // Verificar backup
      const backupEnabled = await this.getByChave('backup_enabled')
      const lastBackup = await this.getByChave('backup_last')
      
      let backupStatus: 'ok' | 'warning' | 'error' = 'ok'
      let backupMessage = 'Backup configurado'
      
      if (backupEnabled?.valor !== 'true') {
        backupStatus = 'warning'
        backupMessage = 'Backup desabilitado'
      } else if (lastBackup?.valor) {
        const lastBackupDate = new Date(lastBackup.valor)
        const daysSince = (new Date().getTime() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24)
        
        if (daysSince > 7) {
          backupStatus = 'warning'
          backupMessage = `Último backup há ${Math.floor(daysSince)} dias`
        }
      }

      checks.push({
        name: 'Backup System',
        status: backupStatus,
        message: backupMessage
      })

      // Determinar status geral
      const hasErrors = checks.some(check => check.status === 'error')
      const hasWarnings = checks.some(check => check.status === 'warning')
      
      let overallStatus: 'healthy' | 'warning' | 'error' = 'healthy'
      if (hasErrors) {
        overallStatus = 'error'
      } else if (hasWarnings) {
        overallStatus = 'warning'
      }

      return {
        status: overallStatus,
        checks
      }
    } catch (error) {
      return {
        status: 'error',
        checks: [{
          name: 'System Health Check',
          status: 'error',
          message: 'Erro ao verificar saúde do sistema'
        }]
      }
    }
  }

  async createBackup(): Promise<{
    id: string
    filename: string
    size: number
    status: 'success' | 'failed'
  }> {
    try {
      const exportData = await this.exportAll()
      const dataString = JSON.stringify(exportData, null, 2)
      const blob = new Blob([dataString], { type: 'application/json' })
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `configuracoes_backup_${timestamp}.json`
      
      // Simular criação de backup
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Atualizar último backup
      await this.update('backup_last', new Date().toISOString())
      
      return {
        id: Date.now().toString(),
        filename,
        size: blob.size,
        status: 'success'
      }
    } catch (error) {
      return {
        id: Date.now().toString(),
        filename: '',
        size: 0,
        status: 'failed'
      }
    }
  }
}

export const configuracoesService = new ConfiguracoesService()
