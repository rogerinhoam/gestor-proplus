// src/features/crm/FollowUpManager.tsx
import React, { useState, useEffect } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { CRMInteraction } from '../../types'
import { formatDateTime } from '../../utils/formatting'

interface FollowUpManagerProps {
  interactions: CRMInteraction[]
  onUpdateInteraction: (id: string, updates: Partial<CRMInteraction>) => Promise<void>
  onCreateInteraction: (data: Partial<CRMInteraction>) => Promise<void>
}

export const FollowUpManager: React.FC<FollowUpManagerProps> = ({
  interactions,
  onUpdateInteraction,
  onCreateInteraction
}) => {
  const [pendingFollowUps, setPendingFollowUps] = useState<CRMInteraction[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedInteraction, setSelectedInteraction] = useState<CRMInteraction | null>(null)
  const [form, setForm] = useState({
    notes: '',
    nextFollowUp: '',
    status: 'completed'
  })

  useEffect(() => {
    const hoje = new Date()
    const pending = interactions.filter(i => 
      i.follow_up_date && new Date(i.follow_up_date) <= hoje
    ).sort((a, b) => new Date(a.follow_up_date!).getTime() - new Date(b.follow_up_date!).getTime())
    
    setPendingFollowUps(pending)
  }, [interactions])

  const handleCompleteFollowUp = (interaction: CRMInteraction) => {
    setSelectedInteraction(interaction)
    setForm({
      notes: '',
      nextFollowUp: '',
      status: 'completed'
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInteraction) return

    try {
      // Atualizar interação atual
      await onUpdateInteraction(selectedInteraction.id, {
        notes: `${selectedInteraction.notes}\n\n[Follow-up realizado]: ${form.notes}`,
        follow_up_date: null // Remove o follow-up atual
      })

      // Criar nova interação se necessário próximo follow-up
      if (form.nextFollowUp) {
        await onCreateInteraction({
          cliente_id: selectedInteraction.cliente_id,
          interaction_type: selectedInteraction.interaction_type,
          notes: `Follow-up agendado: ${form.notes}`,
          follow_up_date: form.nextFollowUp
        })
      }

      setShowForm(false)
      setSelectedInteraction(null)
      alert('Follow-up marcado como concluído!')
    } catch (error) {
      alert('Erro ao processar follow-up')
    }
  }

  const handleSnooze = async (interaction: CRMInteraction, days: number) => {
    const novaData = new Date()
    novaData.setDate(novaData.getDate() + days)
    
    try {
      await onUpdateInteraction(interaction.id, {
        follow_up_date: novaData.toISOString().split('T')[0]
      })
      alert(`Follow-up adiado para ${novaData.toLocaleDateString('pt-BR')}`)
    } catch (error) {
      alert('Erro ao adiar follow-up')
    }
  }

  const getDaysOverdue = (date: string) => {
    const hoje = new Date()
    const followUpDate = new Date(date)
    const diffTime = hoje.getTime() - followUpDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getUrgencyColor = (days: number) => {
    if (days <= 0) return 'text-yellow-600 bg-yellow-100'
    if (days <= 3) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getUrgencyText = (days: number) => {
    if (days <= 0) return 'Hoje'
    if (days === 1) return '1 dia atrasado'
    return `${days} dias atrasado`
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Follow-ups Pendentes</h2>
          <div className="text-sm text-gray-500">
            {pendingFollowUps.length} pendente(s)
          </div>
        </div>

        {pendingFollowUps.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-check-circle text-4xl mb-3 text-green-500"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Parabéns! Nenhum follow-up pendente
            </h3>
            <p className="text-sm">
              Todos os follow-ups foram concluídos ou não há nenhum agendado.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingFollowUps.map(interaction => {
              const daysOverdue = getDaysOverdue(interaction.follow_up_date!)
              
              return (
                <div key={interaction.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {interaction.clientes?.nome || 'Cliente desconhecido'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(daysOverdue)}`}>
                          {getUrgencyText(daysOverdue)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {interaction.notes}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          <i className="fas fa-calendar mr-1"></i>
                          Follow-up: {new Date(interaction.follow_up_date!).toLocaleDateString('pt-BR')}
                        </span>
                        <span>
                          <i className="fas fa-clock mr-1"></i>
                          Criado: {formatDateTime(interaction.created_at)}
                        </span>
                        <span>
                          <i className="fas fa-phone mr-1"></i>
                          {interaction.clientes?.telefone || 'Sem telefone'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="small"
                      variant="primary"
                      onClick={() => handleCompleteFollowUp(interaction)}
                    >
                      <i className="fas fa-check mr-1"></i>
                      Concluir
                    </Button>
                    
                    <Button
                      size="small"
                      variant="outline"
                      onClick={() => handleSnooze(interaction, 1)}
                    >
                      <i className="fas fa-clock mr-1"></i>
                      +1 dia
                    </Button>
                    
                    <Button
                      size="small"
                      variant="outline"
                      onClick={() => handleSnooze(interaction, 7)}
                    >
                      <i className="fas fa-calendar mr-1"></i>
                      +1 semana
                    </Button>

                    {interaction.clientes?.telefone && (
                      <Button
                        size="small"
                        variant="success"
                        onClick={() => {
                          const telefone = interaction.clientes?.telefone?.replace(/\D/g, '')
                          const message = `Olá ${interaction.clientes?.nome}, como combinado, estou retornando o contato.`
                          window.open(`https://wa.me/55${telefone}?text=${encodeURIComponent(message)}`, '_blank')
                        }}
                      >
                        <i className="fab fa-whatsapp mr-1"></i>
                        WhatsApp
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal de Conclusão */}
        {showForm && selectedInteraction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                Concluir Follow-up
              </h3>
              
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Cliente:</strong> {selectedInteraction.clientes?.nome}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Interação original:</strong> {selectedInteraction.notes}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resultado do Follow-up
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md h-20 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Descreva o resultado do follow-up..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Próximo Follow-up (opcional)
                  </label>
                  <Input
                    type="date"
                    value={form.nextFollowUp}
                    onChange={(e) => setForm(prev => ({ ...prev, nextFollowUp: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" variant="primary">
                    Concluir Follow-up
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Estatísticas */}
        {interactions.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Estatísticas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {interactions.filter(i => i.follow_up_date).length}
                </div>
                <div className="text-xs text-gray-500">Total com Follow-up</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">
                  {pendingFollowUps.length}
                </div>
                <div className="text-xs text-gray-500">Pendentes</div>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">
                  {pendingFollowUps.filter(i => getDaysOverdue(i.follow_up_date!) > 0).length}
                </div>
                <div className="text-xs text-gray-500">Atrasados</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {interactions.filter(i => i.follow_up_date && new Date(i.follow_up_date) > new Date()).length}
                </div>
                <div className="text-xs text-gray-500">Futuros</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
