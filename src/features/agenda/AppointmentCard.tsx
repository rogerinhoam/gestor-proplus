// src/features/agenda/AppointmentCard.tsx
import React from 'react'
import { Agendamento } from '../../types'
import { Button } from '../../components/ui/Button'
import { format } from 'date-fns'

interface AppointmentCardProps {
  agendamento: Agendamento
  onEdit: (ag: Agendamento) => void
  onDelete: (id: string) => void
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  agendamento,
  onEdit,
  onDelete
}) => (
  <div className="flex items-center justify-between p-4 bg-white rounded shadow">
    <div>
      <p className="font-medium">{agendamento.clientes?.nome}</p>
      <p className="text-sm text-gray-600">{agendamento.servico}</p>
      <p className="text-sm text-gray-600">
        {format(new Date(agendamento.data_hora), 'dd/MM/yyyy HH:mm')}
      </p>
    </div>
    <div className="flex gap-2">
      <Button size="small" variant="outline" onClick={() => onEdit(agendamento)}>
        Editar
      </Button>
      <Button size="small" variant="error" onClick={() => onDelete(agendamento.id)}>
        Excluir
      </Button>
    </div>
  </div>
)
