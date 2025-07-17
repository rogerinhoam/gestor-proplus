// src/features/agenda/AgendamentoForm.tsx
import React, { useState, useEffect } from 'react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useClientes } from '../clientes/useClientes'
import { Agendamento } from '../../types'

interface AgendamentoFormProps {
  agendamento: Agendamento | null
  onSave: (data: Partial<Agendamento>) => void
  onClose: () => void
}

export const AgendamentoForm: React.FC<AgendamentoFormProps> = ({
  agendamento,
  onSave,
  onClose
}) => {
  const { clientes, fetchClientes } = useClientes()
  const [form, setForm] = useState<Partial<Agendamento>>({
    cliente_id: '',
    servico: '',
    data_hora: '',
    status: 'agendado',
    observacoes: ''
  })

  useEffect(() => {
    fetchClientes()
    if (agendamento) {
      setForm(agendamento)
    }
  }, [agendamento, fetchClientes])

  const handleChange = (field: keyof Agendamento, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-lg w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-semibold">
          {agendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
        </h2>

        <div>
          <label className="block text-sm font-medium">Cliente</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={form.cliente_id}
            onChange={e => handleChange('cliente_id', e.target.value)}
            required
          >
            <option value="">Selecione...</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Serviço</label>
          <Input
            type="text"
            value={form.servico || ''}
            onChange={e => handleChange('servico', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Data e Hora</label>
          <Input
            type="datetime-local"
            value={form.data_hora || ''}
            onChange={e => handleChange('data_hora', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Observações</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={form.observacoes}
            onChange={e => handleChange('observacoes', e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Salvar
          </Button>
        </div>
      </form>
    </div>
)
}
