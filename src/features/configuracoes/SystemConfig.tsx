// src/features/configuracoes/SystemConfig.tsx
import React, { useState, useEffect } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { ConfiguracaoSistema } from '../../types'

interface SystemConfigProps {
  configuracoes: ConfiguracaoSistema[]
  onUpdate: (chave: string, valor: string) => Promise<void>
  onHasChanges: (hasChanges: boolean) => void
}

export const SystemConfig: React.FC<SystemConfigProps> = ({
  configuracoes,
  onUpdate,
  onHasChanges
}) => {
  const [form, setForm] = useState({
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
    currency: 'BRL',
    dateFormat: 'DD/MM/YYYY',
    theme: 'light',
    itemsPerPage: '10',
    autoSave: 'true',
    debug: 'false',
    sessionTimeout: '30',
    maxFileSize: '10',
    allowedFileTypes: 'jpg,jpeg,png,pdf',
    enableAuditLog: 'true',
    enableNotifications: 'true',
    defaultOrcamentoValidity: '7'
  })

  const [originalForm, setOriginalForm] = useState(form)

  useEffect(() => {
    const getConfig = (chave: string, defaultValue: string) => {
      const config = configuracoes.find(c => c.chave === chave)
      return config?.valor || defaultValue
    }

    const newForm = {
      timezone: getConfig('system_timezone', 'America/Sao_Paulo'),
      language: getConfig('system_language', 'pt-BR'),
      currency: getConfig('system_currency', 'BRL'),
      dateFormat: getConfig('system_date_format', 'DD/MM/YYYY'),
      theme: getConfig('system_theme', 'light'),
      itemsPerPage: getConfig('system_items_per_page', '10'),
      autoSave: getConfig('system_auto_save', 'true'),
      debug: getConfig('system_debug', 'false'),
      sessionTimeout: getConfig('system_session_timeout', '30'),
      maxFileSize: getConfig('system_max_file_size', '10'),
      allowedFileTypes: getConfig('system_allowed_file_types', 'jpg,jpeg,png,pdf'),
      enableAuditLog: getConfig('system_enable_audit_log', 'true'),
      enableNotifications: getConfig('system_enable_notifications', 'true'),
      defaultOrcamentoValidity: getConfig('system_default_orcamento_validity', '7')
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
        onUpdate('system_timezone', form.timezone),
        onUpdate('system_language', form.language),
        onUpdate('system_currency', form.currency),
        onUpdate('system_date_format', form.dateFormat),
        onUpdate('system_theme', form.theme),
        onUpdate('system_items_per_page', form.itemsPerPage),
        onUpdate('system_auto_save', form.autoSave),
        onUpdate('system_debug', form.debug),
        onUpdate('system_session_timeout', form.sessionTimeout),
        onUpdate('system_max_file_size', form.maxFileSize),
        onUpdate('system_allowed_file_types', form.allowedFileTypes),
        onUpdate('system_enable_audit_log', form.enableAuditLog),
        onUpdate('system_enable_notifications', form.enableNotifications),
        onUpdate('system_default_orcamento_validity', form.defaultOrcamentoValidity)
      ])

      setOriginalForm(form)
      alert('Configurações do sistema salvas com sucesso!')
    } catch (error) {
      alert('Erro ao salvar configurações do sistema')
    }
  }

  const handleReset = () => {
    setForm(originalForm)
  }

  const timezones = [
    { value: 'America/Sao_Paulo', label: 'Brasília (UTC-3)' },
    { value: 'America/Rio_Branco', label: 'Acre (UTC-5)' },
    { value: 'America/Manaus', label: 'Amazonas (UTC-4)' },
    { value: 'America/Fortaleza', label: 'Ceará (UTC-3)' }
  ]

  const languages = [
    { value: 'pt-BR', label: 'Português (Brasil)' },
    { value: 'en-US', label: 'English (United States)' },
    { value: 'es-ES', label: 'Español (España)' }
  ]

  const currencies = [
    { value: 'BRL', label: 'Real (R$)' },
    { value: 'USD', label: 'Dólar ($)' },
    { value: 'EUR', label: 'Euro (€)' }
  ]

  const dateFormats = [
    { value: 'DD/MM/YYYY', label: '31/12/2023' },
    { value: 'MM/DD/YYYY', label: '12/31/2023' },
    { value: 'YYYY-MM-DD', label: '2023-12-31' }
  ]

  const themes = [
    { value: 'light', label: 'Claro' },
    { value: 'dark', label: 'Escuro' },
    { value: 'auto', label: 'Automático' }
  ]

  const itemsPerPageOptions = [
    { value: '5', label: '5 itens' },
    { value: '10', label: '10 itens' },
    { value: '20', label: '20 itens' },
    { value: '50', label: '50 itens' }
  ]

  return (
    <div className="space-y-6">
      {/* Configurações Gerais */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Configurações Gerais</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuso Horário
              </label>
              <select
                value={form.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {timezones.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma
              </label>
              <select
                value={form.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moeda
              </label>
              <select
                value={form.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {currencies.map(curr => (
                  <option key={curr.value} value={curr.value}>{curr.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formato de Data
              </label>
              <select
                value={form.dateFormat}
                onChange={(e) => handleChange('dateFormat', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {dateFormats.map(format => (
                  <option key={format.value} value={format.value}>{format.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tema
              </label>
              <select
                value={form.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {themes.map(theme => (
                  <option key={theme.value} value={theme.value}>{theme.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Itens por Página
              </label>
              <select
                value={form.itemsPerPage}
                onChange={(e) => handleChange('itemsPerPage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {itemsPerPageOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
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
                  Salvamento Automático
                </label>
                <p className="text-xs text-gray-500">
                  Salva automaticamente os dados conforme você digita
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.autoSave === 'true'}
                  onChange={(e) => handleChange('autoSave', e.target.checked ? 'true' : 'false')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Log de Auditoria
                </label>
                <p className="text-xs text-gray-500">
                  Registra todas as ações realizadas no sistema
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.enableAuditLog === 'true'}
                  onChange={(e) => handleChange('enableAuditLog', e.target.checked ? 'true' : 'false')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Notificações
                </label>
                <p className="text-xs text-gray-500">
                  Habilita notificações do sistema
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.enableNotifications === 'true'}
                  onChange={(e) => handleChange('enableNotifications', e.target.checked ? 'true' : 'false')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Modo Debug
                </label>
                <p className="text-xs text-gray-500">
                  Habilita logs detalhados para desenvolvimento
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.debug === 'true'}
                  onChange={(e) => handleChange('debug', e.target.checked ? 'true' : 'false')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Configurações de Segurança */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Segurança</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Timeout de Sessão (minutos)"
              type="number"
              value={form.sessionTimeout}
              onChange={(e) => handleChange('sessionTimeout', e.target.value)}
              min="5"
              max="480"
              placeholder="30"
            />

            <Input
              label="Tamanho Máximo de Arquivo (MB)"
              type="number"
              value={form.maxFileSize}
              onChange={(e) => handleChange('maxFileSize', e.target.value)}
              min="1"
              max="100"
              placeholder="10"
            />

            <div className="md:col-span-2">
              <Input
                label="Tipos de Arquivo Permitidos"
                type="text"
                value={form.allowedFileTypes}
                onChange={(e) => handleChange('allowedFileTypes', e.target.value)}
                placeholder="jpg,jpeg,png,pdf,doc,docx"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separados por vírgula (ex: jpg,png,pdf)
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Configurações de Negócio */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Regras de Negócio</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Validade Padrão do Orçamento (dias)"
              type="number"
              value={form.defaultOrcamentoValidity}
              onChange={(e) => handleChange('defaultOrcamentoValidity', e.target.value)}
              min="1"
              max="365"
              placeholder="7"
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
