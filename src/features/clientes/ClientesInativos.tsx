// src/features/crm/ClientesInativos.tsx
import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Cliente } from '../../types'
import { formatCurrency } from '../../utils/formatting'

interface ClienteInativo extends Cliente {
  diasInativo: number
  ultimoServico: string | null
  valorTotal: number
}

interface ClientesInativosProps {
  clientes: ClienteInativo[]
  loading: boolean
  onSendMessage: (clienteId: string, templateType: string, customMessage?: string) => Promise<boolean>
  onCreateInteraction: (data: any) => Promise<void>
}

export const ClientesInativos: React.FC<ClientesInativosProps> = ({
  clientes,
  loading,
  onSendMessage,
  onCreateInteraction
}) => {
  const [filtro, setFiltro] = useState<'todos' | '30' | '60' | '90'>('todos')
  const [sendingTo, setSendingTo] = useState<string | null>(null)

  const clientesFiltrados = clientes.filter(cliente => {
    switch (filtro) {
      case '30':
        return cliente.diasInativo <= 30
      case '60':
        return cliente.diasInativo > 30 && cliente.diasInativo <= 60
      case '90':
        return cliente.diasInativo > 60
      default:
        return true
    }
  })

  const getStatusColor = (dias: number) => {
    if (dias <= 30) return 'text-yellow-700 bg-yellow-100'
    if (dias <= 60) return 'text-orange-700 bg-orange-100'
    return 'text-red-700 bg-red-100'
  }

  const getStatusText = (dias: number) => {
    if (dias <= 30) return 'Recente'
    if (dias <= 60) return 'Em Risco'
    return 'Inativo'
  }

  const handleSendTemplate = async (cliente: ClienteInativo, templateType: string) => {
    if (!cliente.telefone) {
      alert('Cliente não possui telefone cadastrado')
      return
    }

    setSendingTo(cliente.id)
    try {
      await onSendMessage(cliente.id, templateType)
      alert('Mensagem enviada com sucesso!')
    } catch (error) {
      alert('Erro ao enviar mensagem')
    } finally {
      setSendingTo(null)
    }
  }

  const handleCreateInteraction = async (cliente: ClienteInativo) => {
    const notes = prompt('Adicione observações sobre a interação:')
    if (notes) {
      try {
        await onCreateInteraction({
          cliente_id: cliente.id,
          interaction_type: 'telefone',
          notes,
          follow_up_date: null
        })
        alert('Interação registrada!')
      } catch (error) {
        alert('Erro ao registrar interação')
      }
    }
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Clientes Inativos</h2>
          <div className="text-sm text-gray-500">
            {clientesFiltrados.length} cliente(s)
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-4">
          <Button
            size="small"
            variant={filtro === 'todos' ? 'primary' : 'outline'}
            onClick={() => setFiltro('todos')}
          >
            Todos
          </Button>
          <Button
            size="small"
            variant={filtro === '30' ? 'primary' : 'outline'}
            onClick={() => setFiltro('30')}
          >
            30 dias
          </Button>
          <Button
            size="small"
            variant={filtro === '60' ? 'primary' : 'outline'}
            onClick={() => setFiltro('60')}
          >
            60 dias
          </Button>
          <Button
            size="small"
            variant={filtro === '90' ? 'primary' : 'outline'}
            onClick={() => setFiltro('90')}
          >
            90+ dias
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {clientesFiltrados.map(cliente => (
              <div key={cliente.id} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{cliente.nome}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cliente.diasInativo)}`}>
                        {getStatusText(cliente.diasInativo)}
                      </span>
                    </div>
                    
                    {cliente.telefone && (
                      <p className="text-sm text-gray-600">
                        📱 {cliente.telefone}
                      </p>
                    )}
                    
                    {cliente.carro && (
                      <p className="text-sm text-gray-600">
                        🚗 {cliente.carro} {cliente.placa && `- ${cliente.placa}`}
                      </p>
                    )}
                    
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>Inativo há {cliente.diasInativo} dias</span>
                      {cliente.valorTotal > 0 && (
                        <span>LTV: {formatCurrency(cliente.valorTotal)}</span>
                      )}
                      {cliente.ultimoServico && (
                        <span>Último: {new Date(cliente.ultimoServico).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2 flex-wrap">
                  {cliente.telefone && (
                    <>
                      <Button
                        size="small"
                        variant="success"
                        onClick={() => handleSendTemplate(cliente, 'inactive_friendly')}
                        loading={sendingTo === cliente.id}
                        disabled={sendingTo !== null}
                      >
                        <i className="fab fa-whatsapp mr-1"></i>
                        Lembrete
                      </Button>
                      
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => handleSendTemplate(cliente, 'inactive_offer')}
                        loading={sendingTo === cliente.id}
                        disabled={sendingTo !== null}
                      >
                        Oferta
                      </Button>
                    </>
                  )}
                  
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => handleCreateInteraction(cliente)}
                  >
                    <i className="fas fa-phone mr-1"></i>
                    Ligar
                  </Button>

                  {cliente.telefone && (
                    <Button
                      size="small"
                      variant="outline"
                      onClick={() => {
                        const message = `Olá ${cliente.nome}, tudo bem?`
                        window.open(`https://wa.me/55${cliente.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank')
                      }}
                    >
                      <i className="fab fa-whatsapp mr-1"></i>
                      Manual
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {clientesFiltrados.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-users text-3xl mb-2"></i>
                <p>Nenhum cliente inativo encontrado</p>
                <p className="text-sm">Ótimo! Todos os clientes estão ativos</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
