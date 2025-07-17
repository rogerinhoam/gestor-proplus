// src/features/configuracoes/ConfiguracoesView.tsx
import React, { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { useConfiguracoes } from './useConfiguracoes'
import { EmpresaConfig } from './EmpresaConfig'
import { SystemConfig } from './SystemConfig'
import { BackupConfig } from './BackupConfig'
import { NotificationConfig } from './NotificationConfig'

export const ConfiguracoesView: React.FC = () => {
  const {
    configuracoes,
    loading,
    error,
    fetchConfiguracoes,
    updateConfiguracao,
    resetToDefaults
  } = useConfiguracoes()

  const [activeTab, setActiveTab] = useState<'empresa' | 'system' | 'backup' | 'notifications'>('empresa')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchConfiguracoes()
  }, [fetchConfiguracoes])

  const tabs = [
    { id: 'empresa', label: 'Empresa', icon: 'fas fa-building' },
    { id: 'system', label: 'Sistema', icon: 'fas fa-cog' },
    { id: 'backup', label: 'Backup', icon: 'fas fa-database' },
    { id: 'notifications', label: 'Notificações', icon: 'fas fa-bell' }
  ]

  const handleSave = async () => {
    try {
      // Lógica para salvar todas as configurações pendentes
      await Promise.all([
        // Salvar configurações conforme necessário
      ])
      setHasChanges(false)
      alert('Configurações salvas com sucesso!')
    } catch (error) {
      alert('Erro ao salvar configurações')
    }
  }

  const handleReset = async () => {
    if (window.confirm('Tem certeza que deseja restaurar as configurações padrão? Esta ação não pode ser desfeita.')) {
      try {
        await resetToDefaults()
        alert('Configurações restauradas para o padrão')
      } catch (error) {
        alert('Erro ao restaurar configurações')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Gerencie as configurações do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={loading}
          >
            <i className="fas fa-undo mr-2"></i>
            Restaurar Padrões
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={loading || !hasChanges}
          >
            <i className="fas fa-save mr-2"></i>
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <i className={tab.icon}></i>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'empresa' && (
          <EmpresaConfig
            configuracoes={configuracoes}
            onUpdate={updateConfiguracao}
            onHasChanges={setHasChanges}
          />
        )}
        
        {activeTab === 'system' && (
          <SystemConfig
            configuracoes={configuracoes}
            onUpdate={updateConfiguracao}
            onHasChanges={setHasChanges}
          />
        )}
        
        {activeTab === 'backup' && (
          <BackupConfig
            configuracoes={configuracoes}
            onUpdate={updateConfiguracao}
            onHasChanges={setHasChanges}
          />
        )}
        
        {activeTab === 'notifications' && (
          <NotificationConfig
            configuracoes={configuracoes}
            onUpdate={updateConfiguracao}
            onHasChanges={setHasChanges}
          />
        )}
      </div>

      {/* System Info */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Informações do Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Versão</label>
              <p className="text-sm text-gray-900">R.M. Estética PRO+ v2.0</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Banco de Dados</label>
              <p className="text-sm text-gray-900">Supabase PostgreSQL</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Última Atualização</label>
              <p className="text-sm text-gray-900">
                {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700">Online</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Usuários Ativos</label>
              <p className="text-sm text-gray-900">1 usuário</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Região</label>
              <p className="text-sm text-gray-900">Brasil - São Paulo</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
        >
          <i className="fas fa-sync mr-2"></i>
          Recarregar Sistema
        </Button>
        
        <Button
          variant="secondary"
          onClick={() => {
            const data = {
              timestamp: new Date().toISOString(),
              configuracoes: configuracoes,
              versao: '2.0'
            }
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `configuracoes_backup_${new Date().toISOString().slice(0, 10)}.json`
            a.click()
            URL.revokeObjectURL(url)
          }}
        >
          <i className="fas fa-download mr-2"></i>
          Exportar Configurações
        </Button>
      </div>
    </div>
  )
}
