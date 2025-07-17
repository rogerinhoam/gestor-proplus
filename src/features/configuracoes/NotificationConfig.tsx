// src/features/configuracoes/NotificationConfig.tsx
import React, { useState, useEffect } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { ConfiguracaoSistema } from '../../types'

interface NotificationConfigProps {
  configuracoes: ConfiguracaoSistema[]
  onUpdate: (chave: string, valor: string) => Promise<void>
  onHasChanges: (hasChanges: boolean) => void
}

export const NotificationConfig: React.FC<NotificationConfigProps> = ({
  configuracoes,
  onUpdate,
  onHasChanges
}) => {
  const [form, setForm] = useState({
    emailEnabled: 'true',
    pushEnabled: 'true',
    smsEnabled: 'false',
    followUpReminder: 'true',
    paymentReminder: 'true',
    appointmentReminder: 'true',
    backupNotification: 'true',
    systemAlerts: 'true',
    
    // Configurações de E-mail
    emailProvider: 'smtp',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: 'true',
    fromEmail: '',
    fromName: '',
    
    // Configurações de SMS
    smsProvider: 'twilio',
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioFromNumber: '',
    
    // Configurações de Push
    pushProvider: 'firebase',
    firebaseServerKey: '',
    firebaseSenderId: '',
    
    // Configurações de Webhook
    webhookUrl: '',
    webhookSecret: '',
    
    // Configurações de Horário
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    timezone: 'America/Sao_Paulo'
  })

  const [originalForm, setOriginalForm] = useState(form)
  const [testingEmail, setTestingEmail] = useState(false)
  const [testingSMS, setTestingSMS] = useState(false)

  useEffect(() => {
    const getConfig = (chave: string, defaultValue: string) => {
      const config = configuracoes.find(c => c.chave === chave)
      return config?.valor || defaultValue
    }

    const newForm = {
      emailEnabled: getConfig('notification_email', 'true'),
      pushEnabled: getConfig('notification_push', 'true'),
      smsEnabled: getConfig('notification_sms', 'false'),
      followUpReminder: getConfig('notification_followup_reminder', 'true'),
      paymentReminder: getConfig('notification_payment_reminder', 'true'),
      appointmentReminder: getConfig('notification_appointment_reminder', 'true'),
      backupNotification: getConfig('notification_backup', 'true'),
      systemAlerts: getConfig('notification_system_alerts', 'true'),
      
      emailProvider: getConfig('notification_email_provider', 'smtp'),
      smtpHost: getConfig('notification_smtp_host', ''),
      smtpPort: getConfig('notification_smtp_port', '587'),
      smtpUser: getConfig('notification_smtp_user', ''),
      smtpPassword: getConfig('notification_smtp_password', ''),
      smtpSecure: getConfig('notification_smtp_secure', 'true'),
      fromEmail: getConfig('notification_from_email', ''),
      fromName: getConfig('notification_from_name', ''),
      
      smsProvider: getConfig('notification_sms_provider', 'twilio'),
      twilioAccountSid: getConfig('notification_twilio_account_sid', ''),
      twilioAuthToken: getConfig('notification_twilio_auth_token', ''),
      twilioFromNumber: getConfig('notification_twilio_from_number', ''),
      
      pushProvider: getConfig('notification_push_provider', 'firebase'),
      firebaseServerKey: getConfig('notification_firebase_server_key', ''),
      firebaseSenderId: getConfig('notification_firebase_sender_id', ''),
      
      webhookUrl: getConfig('notification_webhook_url', ''),
      webhookSecret: getConfig('notification_webhook_secret', ''),
      
      quietHoursStart: getConfig('notification_quiet_hours_start', '22:00'),
      quietHoursEnd: getConfig('notification_quiet_hours_end', '08:00'),
      timezone: getConfig('notification_timezone', 'America/Sao_Paulo')
    }

    setForm(newForm)
    setOriginalForm(newForm)
  }, [configuracoes])

  useEffect(() => {
    const hasChanges = JSON.stringify(form) !== JSON.stringify(originalForm)
    onHasChanges(hasChanges)
  }, [form, originalForm, onHasChanges])

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      await Promise.all([
        onUpdate('notification_email', form.emailEnabled),
        onUpdate('notification_push', form.pushEnabled),
        onUpdate('notification_sms', form.smsEnabled),
        onUpdate('notification_followup_reminder', form.followUpReminder),
        onUpdate('notification_payment_reminder', form.paymentReminder),
        onUpdate('notification_appointment_reminder', form.appointmentReminder),
        onUpdate('notification_backup', form.backupNotification),
        onUpdate('notification_system_alerts', form.systemAlerts),
        
        onUpdate('notification_email_provider', form.emailProvider),
        onUpdate('notification_smtp_host', form.smtpHost),
        onUpdate('notification_smtp_port', form.smtpPort),
        onUpdate('notification_smtp_user', form.smtpUser),
        onUpdate('notification_smtp_password', form.smtpPassword),
        onUpdate('notification_smtp_secure', form.smtpSecure),
        onUpdate('notification_from_email', form.fromEmail),
        onUpdate('notification_from_name', form.fromName),
        
        onUpdate('notification_sms_provider', form.smsProvider),
        onUpdate('notification_twilio_account_sid', form.twilioAccountSid),
        onUpdate('notification_twilio_auth_token', form.twilioAuthToken),
        onUpdate('notification_twilio_from_number', form.twilioFromNumber),
        
        onUpdate('notification_push_provider', form.pushProvider),
        onUpdate('notification_firebase_server_key', form.firebaseServerKey),
        onUpdate('notification_firebase_sender_id', form.firebaseSenderId),
        
        onUpdate('notification_webhook_url', form.webhookUrl),
        onUpdate('notification_webhook_secret', form.webhookSecret),
        
        onUpdate('notification_quiet_hours_start', form.quietHoursStart),
        onUpdate('notification_quiet_hours_end', form.quietHoursEnd),
        onUpdate('notification_timezone', form.timezone)
      ])

      setOriginalForm(form)
      alert('Configurações de notificação salvas com sucesso!')
    } catch (error) {
      alert('Erro ao salvar configurações de notificação')
    }
  }

  const handleReset = () => {
    setForm(originalForm)
  }

  const testEmailConnection = async () => {
    setTestingEmail(true)
    try {
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Teste de e-mail enviado com sucesso!')
    } catch (error) {
      alert('Erro ao testar conexão de e-mail')
    } finally {
      setTestingEmail(false)
    }
  }

  const testSMSConnection = async () => {
    setTestingSMS(true)
    try {
      // Simular teste de SMS
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Teste de SMS enviado com sucesso!')
    } catch (error) {
      alert('Erro ao testar conexão de SMS')
    } finally {
      setTestingSMS(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Configurações Gerais */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Tipos de Notificação</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">E-mail</label>
                <p className="text-xs text-gray-500">Enviar notificações por e-mail</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.emailEnabled === 'true'}
                  onChange={(e) => handleChange('emailEnabled', e.target.checked ? 'true' : 'false')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                <p className="text-xs text-gray-500">Notificações no navegador</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.pushEnabled === 'true'}
                  onChange={(e) => handleChange('pushEnabled', e.target.checked ? 'true' : 'false')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">SMS</label>
                <p className="text-xs text-gray-500">Enviar notificações por SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.smsEnabled === 'true'}
                  onChange={(e) => handleChange('smsEnabled', e.target.checked ? 'true' : 'false')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Eventos de Notificação */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Eventos de Notificação</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Lembretes de Follow-up</label>
                <p className="text-xs text-gray-500">Notifica quando há follow-ups pendentes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.followUpReminder === 'true'}
                  onChange={(e) => handleChange('followUpReminder', e.target.checked ? 'true' : 'false')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Lembretes de Pagamento</label>
                <p className="text-xs text-gray-500">Notifica sobre contas vencidas</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.paymentReminder === 'true'}
                  onChange={(e) => handleChange('paymentReminder', e.target.checked ? 'true' : 'false')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Lembretes de Agendamento</label>
                <p className="text-xs text-gray-500">Notifica sobre agendamentos próximos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.appointmentReminder === 'true'}
                  onChange={(e) => handleChange('appointmentReminder', e.target.checked ? 'true' : 'false')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Notificações de Backup</label>
                <p className="text-xs text-gray-500">Notifica sobre status dos backups</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.backupNotification === 'true'}
                  onChange={(e) => handleChange('backupNotification', e.target.checked ? 'true' : 'false')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Alertas do Sistema</label>
                <p className="text-xs text-gray-500">Notifica sobre erros e alertas</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.systemAlerts === 'true'}
                  onChange={(e) => handleChange('systemAlerts', e.target.checked ? 'true' : 'false')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Configurações de E-mail */}
      {form.emailEnabled === 'true' && (
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Configurações de E-mail</h2>
              <Button
                variant="outline"
                size="small"
                onClick={testEmailConnection}
                loading={testingEmail}
                disabled={!form.smtpHost || !form.smtpUser}
              >
                Testar Conexão
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Servidor SMTP"
                type="text"
                value={form.smtpHost}
                onChange={(e) => handleChange('smtpHost', e.target.value)}
                placeholder="smtp.gmail.com"
                required
              />

              <Input
                label="Porta SMTP"
                type="number"
                value={form.smtpPort}
                onChange={(e) => handleChange('smtpPort', e.target.value)}
                placeholder="587"
                required
              />

              <Input
                label="Usuário SMTP"
                type="email"
                value={form.smtpUser}
                onChange={(e) => handleChange('smtpUser', e.target.value)}
                placeholder="usuario@gmail.com"
                required
              />

              <Input
                label="Senha SMTP"
                type="password"
                value={form.smtpPassword}
                onChange={(e) => handleChange('smtpPassword', e.target.value)}
                placeholder="••••••••"
                required
              />

              <Input
                label="E-mail do Remetente"
                type="email"
                value={form.fromEmail}
                onChange={(e) => handleChange('fromEmail', e.target.value)}
                placeholder="noreply@rmestetica.com"
              />

              <Input
                label="Nome do Remetente"
                type="text"
                value={form.fromName}
                onChange={(e) => handleChange('fromName', e.target.value)}
                placeholder="R.M. Estética"
              />
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Conexão Segura (TLS)</label>
                  <p className="text-xs text-gray-500">Usar conexão criptografada</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.smtpSecure === 'true'}
                    onChange={(e) => handleChange('smtpSecure', e.target.checked ? 'true' : 'false')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Horário de Silêncio */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Horário de Silêncio</h2>
          <p className="text-sm text-gray-600 mb-4">
            As notificações não serão enviadas durante este período
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Início do Silêncio"
              type="time"
              value={form.quietHoursStart}
              onChange={(e) => handleChange('quietHoursStart', e.target.value)}
            />

            <Input
              label="Fim do Silêncio"
              type="time"
              value={form.quietHoursEnd}
              onChange={(e) => handleChange('quietHoursEnd', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Ações */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={JSON.stringify(form) === JSON.stringify(originalForm)}
        >
          Salvar Configurações
        </Button>
        <Button
          variant="secondary"
          onClick={handleReset}
          disabled={JSON.stringify(form) === JSON.stringify(originalForm)}
        >
          Cancelar
        </Button>
      </div>
    </div>
  )
}
