// src/features/agenda/agendaService.ts
import { supabase } from '../../services/supabaseClient'
import { Agendamento } from '../../types'

export class AgendaService {
  async getAll(): Promise<Agendamento[]> {
    const { data, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        clientes (nome),
        orcamentos (status, valor_total)
      `)
      .order('data_hora', { ascending: true })
    if (error) throw new Error(`Erro ao buscar agendamentos: ${error.message}`)
    return data || []
  }

  async create(data: Partial<Agendamento>): Promise<Agendamento> {
    const { data: created, error } = await supabase
      .from('agendamentos')
      .insert([{ ...data, created_at: new Date().toISOString() }])
      .select()
      .single()
    if (error) throw new Error(`Erro ao criar agendamento: ${error.message}`)
    return created
  }

  async update(id: string, data: Partial<Agendamento>): Promise<Agendamento> {
    const { data: updated, error } = await supabase
      .from('agendamentos')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(`Erro ao atualizar agendamento: ${error.message}`)
    return updated
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('agendamentos')
      .delete()
      .eq('id', id)
    if (error) throw new Error(`Erro ao excluir agendamento: ${error.message}`)
  }
}

export const agendaService = new AgendaService()
