// src/features/configuracoes/useConfiguracoes.ts
import { useState, useCallback } from 'react'
import { ConfiguracaoSistema } from '../../types'
import { configuracoesService } from './configuracoesService'

export const useConfiguracoes = () => {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoSistema[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchConfiguracoes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await configuracoesService.getAll()
      setConfiguracoes(data)
    } catch (err) {
      setError('Erro ao carregar configurações')
      console.error('Erro ao fetchConfiguracoes:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const getConfiguracao = useCallback((chave: string): string | null => {
    const config = configuracoes.find(c => c.chave === chave)
    return config?.valor || null
  }, [configuracoes])

  const updateConfiguracao = useCallback(async (chave: string, valor: string) => {
    try {
      setLoading(true)
      setError(null)
      
      await configuracoesService.update(chave, valor)
      
      // Atualizar estado local
      setConfiguracoes(prev => {
        const existing = prev.find(c => c.chave === chave)
        if (existing) {
          return prev.map(c => 
            c.chave === chave 
              ? { ...c, valor, updated_at: new Date().toISOString() }
              : c
          )
        } else {
          return [...prev, {
            id: Date.now().toString(),
            chave,
            valor,
            updated_at: new Date().toISOString()
          }]
        }
      })
    } catch (err) {
      setError('Erro ao atualizar configuração')
      console.error('Erro ao updateConfiguracao:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateMultipleConfiguracoes = useCallback(async (configs: Array<{chave: string, valor: string}>) => {
    try {
      setLoading(true)
      setError(null)
      
      await Promise.all(
        configs.map(config => configuracoesService.update(config.chave, config.valor))
      )
      
      // Atualizar estado local
      setConfiguracoes(prev => {
        let updated = [...prev]
        
        configs.forEach(config => {
          const existingIndex = updated.findIndex(c => c.chave === config.chave)
          if (existingIndex >= 0) {
            updated[existingIndex] = {
              ...updated[existingIndex],
              valor: config.valor,
              updated_at: new Date().toISOString()
            }
          } else {
            updated.push({
              id: Date.now().toString() + Math.random().toString(),
              chave: config.chave,
              valor: config.valor,
              updated_at: new Date().toISOString()
            })
          }
        })
        
        return updated
      })
    } catch (err) {
      setError('Erro ao atualizar configurações')
      console.error('Erro ao updateMultipleConfiguracoes:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const resetToDefaults = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      await configuracoesService.resetToDefaults()
      await fetchConfiguracoes()
    } catch (err) {
      setError('Erro ao restaurar configurações padrão')
      console.error('Erro ao resetToDefaults:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchConfiguracoes])

  const exportConfiguracoes = useCallback(async () => {
    try {
      const data = await configuracoesService.exportAll()
      return data
    } catch (err) {
      setError('Erro ao exportar configurações')
      console.error('Erro ao exportConfiguracoes:', err)
      throw err
    }
  }, [])

  const importConfiguracoes = useCallback(async (data: any) => {
    try {
      setLoading(true)
      setError(null)
      
      await configuracoesService.importAll(data)
      await fetchConfiguracoes()
    } catch (err) {
      setError('Erro ao importar configurações')
      console.error('Erro ao importConfiguracoes:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchConfiguracoes])

  // Helpers para configurações específicas
  const getEmpresaConfig = useCallback(() => {
    return {
      nome: getConfiguracao('empresa_nome') || 'R.M. Estética Automotiva',
      cnpj: getConfiguracao('empresa_cnpj') || '18.637.639/0001-48',
      telefone: getConfiguracao('empresa_telefone') || '(24) 99948-6232',
      endereco: getConfiguracao('empresa_endereco') || 'Rua 40, TV - Recanto dos Pássaros, Pq. Mambucaba, Angra dos Reis - RJ',
      email: getConfiguracao('empresa_email') || '',
      website: getConfiguracao('empresa_website') || '',
      logo: getConfiguracao('empresa_logo') || ''
    }
  }, [getConfiguracao])

  const getSystemConfig = useCallback(() => {
    return {
      timezone: getConfiguracao('system_timezone') || 'America/Sao_Paulo',
      language: getConfiguracao('system_language') || 'pt-BR',
      currency: getConfiguracao('system_currency') || 'BRL',
      dateFormat: getConfiguracao('system_date_format') || 'DD/MM/YYYY',
      theme: getConfiguracao('system_theme') || 'light',
      itemsPerPage: parseInt(getConfiguracao('system_items_per_page') || '10'),
      autoSave: getConfiguracao('system_auto_save') === 'true',
      debug: getConfiguracao('system_debug') === 'true'
    }
  }, [getConfiguracao])

  const getWhatsAppConfig = useCallback(() => {
    return {
      enabled: getConfiguracao('whatsapp_enabled') === 'true',
      apiKey: getConfiguracao('whatsapp_api_key') || '',
      webhookUrl: getConfiguracao('whatsapp_webhook_url') || '',
      businessPhone: getConfiguracao('whatsapp_business_phone') || '',
      autoReply: getConfiguracao('whatsapp_auto_reply') === 'true',
      messageDelay: parseInt(getConfiguracao('whatsapp_message_delay') || '2000')
    }
  }, [getConfiguracao])

  const getBackupConfig = useCallback(() => {
    return {
      enabled: getConfiguracao('backup_enabled') === 'true',
      frequency: getConfiguracao('backup_frequency') || 'daily',
      retention: parseInt(getConfiguracao('backup_retention') || '30'),
      autoBackup: getConfiguracao('backup_auto') === 'true',
      lastBackup: getConfiguracao('backup_last') || null,
      location: getConfiguracao('backup_location') || 'local'
    }
  }, [getConfiguracao])

  const getNotificationConfig = useCallback(() => {
    return {
      email: getConfiguracao('notification_email') === 'true',
      push: getConfiguracao('notification_push') === 'true',
      sms: getConfiguracao('notification_sms') === 'true',
      followUpReminder: getConfiguracao('notification_followup_reminder') === 'true',
      paymentReminder: getConfiguracao('notification_payment_reminder') === 'true',
      appointmentReminder: getConfiguracao('notification_appointment_reminder') === 'true',
      emailProvider: getConfiguracao('notification_email_provider') || 'smtp',
      smtpHost: getConfiguracao('notification_smtp_host') || '',
      smtpPort: parseInt(getConfiguracao('notification_smtp_port') || '587'),
      smtpUser: getConfiguracao('notification_smtp_user') || '',
      smtpPassword: getConfiguracao('notification_smtp_password') || ''
    }
  }, [getConfiguracao])

  return {
    configuracoes,
    loading,
    error,
    fetchConfiguracoes,
    getConfiguracao,
    updateConfiguracao,
    updateMultipleConfiguracoes,
    resetToDefaults,
    exportConfiguracoes,
    importConfiguracoes,
    
    // Helpers
    getEmpresaConfig,
    getSystemConfig,
    getWhatsAppConfig,
    getBackupConfig,
    getNotificationConfig
  }
}
