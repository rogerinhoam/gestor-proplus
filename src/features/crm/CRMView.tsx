// src/features/crm/CRMView.tsx
import React, { useEffect } from 'react'
import { useCRM } from './useCRM'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { ClientesInativos } from './ClientesInativos'
import { MessageTemplates } from './MessageTemplates'
import { InteractionsList } from './InteractionsList'
import { WhatsAppDispatcher } from './WhatsAppDispatcher'

export const CRMView: React.FC = () => {
  const {
    clientesInativos,
    interacoes,
    loading,
    fetchClientesInativos,
    fetchInteracoes,
    createInteraction,
    sendWhatsAppMessage
  } = useCRM()

  useEffect(() => {
    fetchClientesInativos()
    fetchInteracoes()
  }, [fetchClientesInativos, fetchInteracoes])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM</h1>
          <p className="text-gray-600">Gestão de relacionamento e comunicação com clientes</p>
        </div>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {clientesInativos.filter(c => c.diasInativo <= 30).length}
            </div>
            <div className="text-sm text-gray-600">Inativos (30 dias)</div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {clientesInativos.filter(c => c.diasInativo > 30 && c.diasInativo <= 60).length}
            </div>
            <div className="text-sm text-gray-600">Inativos (60 dias)</div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {clientesInativos.filter(c => c.diasInativo > 60).length}
            </div>
            <div className="text-sm text-gray-600">Inativos (90+ dias)</div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {interacoes.filter(i => 
                new Date(i.created_at).getMonth() === new Date().getMonth()
              ).length}
            </div>
            <div className="text-sm text-gray-600">Interações (mês)</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clientes Inativos */}
        <ClientesInativos
          clientes={clientesInativos}
          loading={loading}
          onSendMessage={sendWhatsAppMessage}
          onCreateInteraction={createInteraction}
        />

        {/* Templates de Mensagem */}
        <MessageTemplates
          onSendMessage={sendWhatsAppMessage}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Interações */}
        <InteractionsList
          interacoes={interacoes}
          loading={loading}
          onCreateInteraction={createInteraction}
        />

        {/* Dispatcher WhatsApp */}
        <WhatsAppDispatcher
          onSendMessage={sendWhatsAppMessage}
        />
      </div>
    </div>
  )
}
