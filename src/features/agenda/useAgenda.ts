// src/features/agenda/useAgenda.ts
import { useState, useCallback } from 'react'
import { Agendamento } from '../../types'
import { agendaService } from './agendaService'

export const useAgenda = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState<Agendamento | null>(null)

  const fetchAgenda = useCallback(async () => {
    setLoading(true)
    try {
      const data = await agendaService.getAll()
      setAgendamentos(data)
    } catch (err) {
      console.error('Erro ao buscar agenda:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const openForm = (ag: Agendamento | null) => setCurrent(ag)
  const closeForm = () => setCurrent(null)

  const create = useCallback(async (data: Partial<Agendamento>) => {
    setLoading(true)
    try {
      await agendaService.create(data)
      await fetchAgenda()
      closeForm()
    } catch (err) {
      console.error('Erro ao criar agendamento:', err)
    } finally {
      setLoading(false)
    }
  }, [fetchAgenda])

  const update = useCallback(async (data: Partial<Agendamento>) => {
    if (!current) return
    setLoading(true)
    try {
      await agendaService.update(current.id, data)
      await fetchAgenda()
      closeForm()
    } catch (err) {
      console.error('Erro ao atualizar agendamento:', err)
    } finally {
      setLoading(false)
    }
  }, [current, fetchAgenda])

  const remove = useCallback(async (id: string) => {
    setLoading(true)
    try {
      await agendaService.delete(id)
      setAgendamentos(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      console.error('Erro ao excluir agendamento:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    agendamentos,
    loading,
    current,
    fetchAgenda,
    openForm,
    closeForm,
    create,
    update,
    remove
  }
}
