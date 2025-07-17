// src/features/configuracoes/BackupConfig.tsx
import React, { useState, useEffect } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { ConfiguracaoSistema } from '../../types'

interface BackupConfigProps {
  configuracoes: ConfiguracaoSistema[]
  onUpdate: (chave: string, valor: string) => Promise<void>
  onHasChanges: (hasChanges: boolean) => void
}

export const BackupConfig: React.FC<BackupConfigProps> = ({
  configuracoes,
  onUpdate,
  onHasChanges
}) => {
  const [form, setForm] = useState({
    enabled: 'true',
    frequency: 'daily',
    retention: '30',
    autoBackup: 'true',
    location: 'local',
    lastBackup: '',
    includeFiles: 'true',
    compression: 'true',
    encryptBackup: 'false',
    maxBackupSize: '100',
    backupTime: '02:00',
    emailNotification: 'true',
    webhookUrl: ''
  })

  const [originalForm, setOriginalForm] = useState(form)
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [backupHistory, setBackupHistory] = useState<Array<{
    id: string
    date: string
    size: string
    status: 'success' | 'failed' | 'partial'
    type: 'manual' | 'automatic'
  }>>([])

  useEffect(() => {
    const getConfig = (chave: string, defaultValue: string) => {
      const config = configuracoes.find(c => c.chave === chave)
      return config?.valor || defaultValue
    }

    const newForm = {
      enabled: getConfig('backup_enabled', 'true'),
      frequency: getConfig('backup_frequency', 'daily'),
      retention: getConfig('backup_retention', '30'),
      autoBackup: getConfig('backup_auto', 'true'),
      location: getConfig('backup_location', 'local'),
      lastBackup: getConfig('backup_last', ''),
      includeFiles: getConfig('backup_include_files', 'true'),
      compression: getConfig('backup_compression', 'true'),
      encryptBackup: getConfig('backup_encrypt', 'false'),
      maxBackupSize: getConfig('backup_max_size', '100'),
      backupTime: getConfig('backup_time', '02:00'),
      emailNotification: getConfig('backup_email_notification', 'true'),
      webhookUrl: getConfig('backup_webhook_url', '')
    }

    setForm(newForm)
    setOriginalForm(newForm)
    
    // Simular histórico de backups
    setBackupHistory([
      { id: '1', date: '2024-01-15 02:00', size: '2.3 MB', status: 'success', type: 'automatic' },
      { id: '2', date: '2024-01-14 02:00', size: '2.1 MB', status: 'success', type: 'automatic' },
      { id: '3', date: '2024-01-13 14:30', size: '2.2 MB', status: 'success', type: 'manual' },
      { id: '4', date: '2024-01-12 02:00', size: '2.0 MB', status: 'failed', type: 'automatic' },
      { id: '5', date: '2024-01-11 02:00', size: '1.9 MB', status: 'success', type: 'automatic' }
    ])
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
        onUpdate('backup_enabled', form.enabled),
        onUpdate('backup_frequency', form.frequency),
        onUpdate('backup_retention', form.retention),
        onUpdate('backup_auto', form.autoBackup),
        onUpdate('backup_location', form.location),
        onUpdate('backup_include_files', form.includeFiles),
        onUpdate('backup_compression', form.compression),
        onUpdate('backup_encrypt', form.encryptBackup),
        onUpdate('backup_max_size', form.maxBackupSize),
        onUpdate('backup_time', form.backupTime),
        onUpdate('backup_email_notification', form.emailNotification),
        onUpdate('backup_webhook_url', form.webhookUrl)
      ])

      setOriginalForm(form)
      alert('Configurações de backup salvas com sucesso!')
    } catch (error) {
      alert('Erro ao salvar configurações de backup')
    }
  }

  const handleReset = () => {
    setForm(originalForm)
  }

  const createManualBackup = async () => {
    setIsCreatingBackup(true)
    try {
      // Simular criação de backup
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Adicionar ao histórico
      const newBackup = {
        id: Date.now().toString(),
        date: new Date().toLocaleString('pt-BR'),
        size: '2.4 MB',
        status: 'success' as const,
        type: 'manual' as const
      }
      
      setBackupHistory(prev => [newBackup, ...prev])
      
      // Atualizar último backup
      const now = new Date().toISOString()
      await onUpdate('backup_last', now)
      setForm(prev => ({ ...prev, lastBackup: now }))
      
      alert('Backup criado com sucesso!')
    } catch (error) {
      alert('Erro ao criar backup')
    } finally {
      setIsCreatingBackup(false)
    }
  }

  const downloadBackup = (backupId: string) => {
    // Simular download de backup
    const link = document.createElement('a')
    link.href = '#'
    link.download = `backup_${backupId}.zip`
    link.click()
    alert('Download do backup iniciado')
  }

  const restoreBackup = (backupId: string) => {
    if (window.confirm('Tem certeza que deseja restaurar este backup? Esta ação não pode ser desfeita.')) {
      alert('Funcionalidade de restauração será implementada em versão futura')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      case 'partial':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'Sucesso'
      case 'failed':
        return 'Falhou'
      case 'partial':
        return 'Parcial'
      default:
        return 'Desconhecido'
    }
  }

  const frequencyOptions = [
    { value: 'daily', label: 'Diário' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'manual', label: 'Manual apenas' }
  ]

  const locationOptions = [
    { value: 'local', label: 'Local (Navegador)' },
    { value: 'cloud', label: 'Nuvem (Google Drive)' },
    { value: 'supabase', label: 'Supabase Storage' }
  ]

  return (
    <div className="space-y-6">
      {/* Configurações Gerais */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Configurações de Backup</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Backup Automático
                </label>
                <p className="text-xs text-gray-500">
                  Habilita a criação automática de backups
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.enabled === 'true'}
                  onChange={(e) => handleChange('enabled', e.target.checked ? 'true' : 'false')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequência
                </label>
                <select
                  value={form.frequency}
                  onChange={(e) => handleChange('frequency', e.target.value)}
                  disabled={form.enabled === 'false'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
                >
                  {frequencyOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Local de Armazenamento
                </label>
                <select
                  value={form.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {locationOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Retenção (dias)"
                type="number"
                value={form.retention}
                onChange={(e) => handleChange('retention', e.target.value)}
                min="1"
                max="365"
                placeholder="30"
              />

              <Input
                label="Horário do Backup"
                type="time"
                value={form.backupTime}
                onChange={(e) => handleChange('backupTime', e.target.value)}
                disabled={form.frequency === 'manual'}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Configurações Avançadas */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Configurações Avançadas</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Incluir Arquivos
                </label>
                <p className="text-xs text-gray-500">
                  Inclui uploads e anexos no backup
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.includeFiles === 'true'}
                  onChange={(e) => handleChange('includeFiles', e.target.checked ? 'true' : 'false')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Compressão
                </label>
                <p className="text-xs text-gray-500">
                  Comprime o backup para economizar espaço
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.compression === 'true'}
                  onChange={(e) => handleChange('compression', e.target.checked ? 'true' : 'false')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Criptografia
                </label>
                <p className="text-xs text-gray-500">
                  Criptografa o backup para maior segurança
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.encryptBackup === 'true'}
                  onChange={(e) => handleChange('encryptBackup', e.target.checked ? 'true' : 'false')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Notificação por E-mail
                </label>
                <p className="text-xs text-gray-500">
                  Envia e-mail quando o backup for concluído
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.emailNotification === 'true'}
                  onChange={(e) => handleChange('emailNotification', e.target.checked ? 'true' : 'false')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Tamanho Máximo do Backup (MB)"
                type="number"
                value={form.maxBackupSize}
                onChange={(e) => handleChange('maxBackupSize', e.target.value)}
                min="1"
                max="1000"
                placeholder="100"
              />

              <Input
                label="Webhook URL (opcional)"
                type="url"
                value={form.webhookUrl}
                onChange={(e) => handleChange('webhookUrl', e.target.value)}
                placeholder="https://exemplo.com/webhook"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Status do Backup */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Status do Backup</h2>
            <Button
              variant="primary"
              onClick={createManualBackup}
              disabled={isCreatingBackup}
              loading={isCreatingBackup}
            >
              {isCreatingBackup ? 'Criando...' : 'Criar Backup Manual'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Último Backup</div>
              <div className="text-lg font-semibold text-blue-800">
                {form.lastBackup 
                  ? new Date(form.lastBackup).toLocaleString('pt-BR')
                  : 'Nunca'
                }
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Próximo Backup</div>
              <div className="text-lg font-semibold text-green-800">
                {form.enabled === 'true' && form.frequency !== 'manual'
                  ? `Hoje às ${form.backupTime}`
                  : 'Desabilitado'
                }
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 font-medium">Total de Backups</div>
              <div className="text-lg font-semibold text-gray-800">
                {backupHistory.length}
              </div>
            </div>
          </div>

          {/* Histórico de Backups */}
          <div>
            <h3 className="font-medium mb-3">Histórico de Backups</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {backupHistory.map(backup => (
                <div key={backup.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(backup.status)}`}>
                      {getStatusText(backup.status)}
                    </span>
                    <div>
                      <div className="font-medium">{backup.date}</div>
                      <div className="text-sm text-gray-500">
                        {backup.size} • {backup.type === 'manual' ? 'Manual' : 'Automático'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      variant="outline"
                      onClick={() => downloadBackup(backup.id)}
                      disabled={backup.status === 'failed'}
                    >
                      <i className="fas fa-download mr-1"></i>
                      Download
                    </Button>
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => restoreBackup(backup.id)}
                      disabled={backup.status === 'failed'}
                    >
                      <i className="fas fa-undo mr-1"></i>
                      Restaurar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
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
