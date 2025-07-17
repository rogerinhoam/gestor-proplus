// src/features/agenda/CalendarioView.tsx
import React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { format } from 'date-fns'
import { Agendamento } from '../../types'

interface CalendarioViewProps {
  events: Agendamento[]
  onEventClick: (event: Agendamento) => void
}

export const CalendarioView: React.FC<CalendarioViewProps> = ({
  events,
  onEventClick
}) => (
  <FullCalendar
    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
    initialView="dayGridMonth"
    height={500}
    events={events.map(e => ({
      id: e.id,
      title: `${e.cliente?.nome} - ${format(new Date(e.data_hora), 'HH:mm')}`,
      start: e.data_hora,
      backgroundColor: e.status === 'confirmado' ? '#21808D' : '#94A3B8'
    }))}
    eventClick={({ event }) => {
      const ag = events.find(a => a.id === event.id)
      if (ag) onEventClick(ag)
    }}
  />
)
