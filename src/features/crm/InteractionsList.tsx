// src/features/crm/InteractionsList.tsx
import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { CRMInteraction } from '../../types'
import { formatDateTime } from '../../utils/formatting'

interface InteractionsListProps {
  interacoes: CRMInteraction[]
  loading: boolean
  onCreateInteraction: (data: Partial<CRMInteraction>) => Promise<void>
}

export const InteractionsList: React.FC<InteractionsListProps> = ({
  interacoes,
  loading,
  onCreateInteraction
}) => {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    cliente_id: '',
    interaction_type: 'telefone',
    notes: '',
    follow_up_date: ''
  })

  const [filtro, setFiltro] = useState<'todos' | 'telefone' | 'whatsapp' | 'email' | 'presencial'>('todos')

  const interactionTypes = {
    telefone: { label: 'Telefone', icon: 'fas fa-phone', color: 'text-blue-600 bg-blue-100' },
    whatsapp: { label: 'WhatsApp', icon: 'fab fa-whatsapp', color: 'text-green-600 bg-green-100' },
    email: { label: 'E-mail', icon: 'fas fa-envelope', color: 'text-purple-600 bg-purple-100' },
    presencial: { label: 'Presencial', icon: 'fas fa-user', color: 'text-orange-600 bg-orange-100' }
  }

  const interacoesFiltradas = interacoes.filter(interacao => {
    if (filtro === 'todos') return true
    return interacao.interaction_type === filtro
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onCreateInteraction({
        ...form,
        follow_up_date: form.follow_up_date || null
      })
      setForm({
        cliente_id: '',
        interaction_type: 'telefone',
        notes: '',
        follow_up_date: ''
      })
      setShowForm(false)
      alert('Interação registrada com sucesso!')
    } catch (error) {
      alert('Erro ao registrar interação')
    }
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))

    if (diffInDays > 0) return `${diffInDays} dia(s) atrás`
    if (diffInHours > 0) return `${diffInHours} hora(s) atrás`
    if (diffInMinutes > 0) return `${diffInMinutes} minuto(s) atrás`
    return 'Agora mesmo'
  }

  const followUpsPendentes = interacoes.filter(i => 
    i.follow_up_date && new Date(i.follow_up_date) <= new Date()
  )

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Histórico de Interações</h2>
          <Button
            size="small"
            variant="primary"
            onClick={() => setShowForm(true)}
          >
            Nova Interação
          </Button>
        </div>

        {/* Follow-ups Pendentes */}
        {followUpsPendentes.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <h3 className="font-medium text-yellow-800 mb-2">
              <i className="fas fa-clock mr-2"></i>
              Follow-ups Pendentes ({followUpsPendentes.length})
            </h3>
            <div className="space-y-2">
              {followUpsPendentes.slice(0, 3).map(interaction => (
                <div key={interaction.id} className="text-sm text-yellow-700">
                  • {interaction.clientes?.nome} - {new Date(interaction.follow_up_date!).toLocaleDateString('pt-BR')}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulário */}
        {showForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-medium mb-3">Nova Interação</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente ID
                </label>
                <Input
                  type="text"
                  value={form.cliente_id}
                  onChange={(e) => setForm(prev => ({ ...prev, cliente_id: e.target.value }))}
                  placeholder="ID do cliente"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Interação
                </label>
                <select
                  value={form.interaction_type}
                  onChange={(e) => setForm(prev => ({ ...prev, interaction_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Object.entries(interactionTypes).map(([key, type]) => (
                    <option key={key} value={key}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-20 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Descreva a interação..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Follow-up (opcional)
                </label>
                <Input
                  type="date"
                  value={form.follow_up_date}
                  onChange={(e) => setForm(prev => ({ ...prev, follow_up_date: e.target.value }))}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" variant="primary" size="small">
                  Salvar Interação
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <Button
            size="small"
            variant={filtro === 'todos' ? 'primary' : 'outline'}
            onClick={() => setFiltro('todos')}
          >
            Todos
          </Button>
          {Object.entries(interactionTypes).map(([key, type]) => (
            <Button
              key={key}
              size="small"
              variant={filtro === key ? 'primary' : 'outline'}
              onClick={() => setFiltro(key as any)}
            >
              <i className={`${type.icon} mr-1`}></i>
              {type.label}
            </Button>
          ))}
        </div>

        {/* Lista de Interações */}
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {interacoesFiltradas.map(interacao => {
              const typeConfig = interactionTypes[interacao.interaction_type as keyof typeof interactionTypes]
              
              return (
                <div key={interacao.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeConfig?.color || 'text-gray-600 bg-gray-100'}`}>
                        <i className={`${typeConfig?.icon || 'fas fa-comment'} mr-1`}></i>
                        {typeConfig?.label || interacao.interaction_type}
                      </span>
                      <span className="text-sm text-gray-500">
                        {getTimeAgo(interacao.created_at)}
                      </span>
                    </div>
                    {interacao.follow_up_date && (
                      <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                        Follow-up: {new Date(interacao.follow_up_date).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>

                  <h4 className="font-medium text-gray-900 mb-1">
                    {interacao.clientes?.nome || `Cliente ID: ${interacao.cliente_id}`}
                  </h4>

                  <p className="text-sm text-gray-600 mb-2">
                    {interacao.notes}
                  </p>

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>
                      {formatDateTime(interacao.created_at)}
                    </span>
                    {interacao.follow_up_date && new Date(interacao.follow_up_date) <= new Date() && (
                      <span className="text-yellow-600 font-medium">
                        <i className="fas fa-exclamation-triangle mr-1"></i>
                        Follow-up pendente
                      </span>
                    )}
                  </div>
                </div>
              )
            })}

            {interacoesFiltradas.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-comments text-3xl mb-2"></i>
                <p>Nenhuma interação encontrada</p>
                <p className="text-sm">Registre sua primeira interação com um cliente</p>
              </div>
            )}
          </div>
        )}

        {/* Resumo */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">{interacoes.length}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {interacoes.filter(i => i.interaction_type === 'telefone').length}
              </div>
              <div className="text-xs text-gray-500">Telefone</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {interacoes.filter(i => i.interaction_type === 'whatsapp').length}
              </div>
              <div className="text-xs text-gray-500">WhatsApp</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-600">
                {followUpsPendentes.length}
              </div>
              <div className="text-xs text-gray-500">Pendentes</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
