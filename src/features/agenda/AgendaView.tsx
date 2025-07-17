// src/features/agenda/AgendaView.tsx
import React, { useEffect } from 'react'
import { useAgenda } from './useAgenda'
import { Button } from '../../components/ui/Button'
import { AppointmentCard } from './AppointmentCard'
import { CalendarioView } from './CalendarioView'
import { AgendamentoForm } from './AgendamentoForm'

export const AgendaView: React.FC = () => {
  const {
    agendamentos,
    loading,
    fetchAgenda,
    openForm,
    closeForm,
    current,
    create,
    update,
    remove
  } = useAgenda()

  useEffect(() => {
    fetchAgenda()
  }, [fetchAgenda])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Agenda</h1>
        <Button variant="primary" onClick={() => openForm(null)}>
          Novo Agendamento
        </Button>
      </div>

      {/* Calendário */}
      <CalendarioView
        events={agendamentos}
        onEventClick={openForm}
      />

      {/* Próximos Agendamentos */}
      <h2 className="text-xl font-semibold">Próximos Agendamentos</h2>
      <div className="space-y-4">
        {loading ? (
          <p>Carregando...</p>
        ) : agendamentos.slice(0, 5).map(a => (
          <AppointmentCard
            key={a.id}
            agendamento={a}
            onEdit={() => openForm(a)}
            onDelete={() => remove(a.id)}
          />
        ))}
      </div>

      {/* Formulário Modal */}
      {current !== null && (
        <AgendamentoForm
          agendamento={current}
          onSave={current.id ? update : create}
          onClose={closeForm}
        />
      )}
    </div>
)
}
