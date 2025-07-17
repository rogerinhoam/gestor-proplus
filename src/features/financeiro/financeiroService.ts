// src/features/financeiro/financeiroService.ts
import { supabase } from '../../services/supabaseClient'
import { Despesa, ContaReceber } from '../../types'

export class FinanceiroService {
  async getDespesas(): Promise<Despesa[]> {
    const { data, error } = await supabase
      .from('despesas')
      .select('*')
      .order('data', { ascending: false })
    
    if (error) throw new Error(`Erro ao buscar despesas: ${error.message}`)
    return data || []
  }

  async createDespesa(despesa: Partial<Despesa>): Promise<Despesa> {
    const { data, error } = await supabase
      .from('despesas')
      .insert([{
        data: despesa.data,
        descricao: despesa.descricao,
        valor: despesa.valor,
        categoria: despesa.categoria
      }])
      .select()
      .single()
    
    if (error) throw new Error(`Erro ao criar despesa: ${error.message}`)
    return data
  }

  async getContasReceber(): Promise<ContaReceber[]> {
    const { data, error } = await supabase
      .from('contas_receber')
      .select(`
        *,
        orcamentos (
          id,
          clientes (nome)
        )
      `)
      .order('data_vencimento', { ascending: true })
    
    if (error) throw new Error(`Erro ao buscar contas a receber: ${error.message}`)
    return data || []
  }

  async createContaReceber(conta: Partial<ContaReceber>): Promise<ContaReceber> {
    const { data, error } = await supabase
      .from('contas_receber')
      .insert([{
        orcamento_id: conta.orcamento_id,
        valor: conta.valor,
        data_vencimento: conta.data_vencimento,
        data_pagamento: conta.data_pagamento,
        status: conta.status || 'pendente'
      }])
      .select()
      .single()
    
    if (error) throw new Error(`Erro ao criar conta a receber: ${error.message}`)
    return data
  }

  async updateContaReceber(id: string, conta: Partial<ContaReceber>): Promise<ContaReceber> {
    const { data, error } = await supabase
      .from('contas_receber')
      .update(conta)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw new Error(`Erro ao atualizar conta: ${error.message}`)
    return data
  }

  async getFluxoCaixa(mesAno: string): Promise<{
    totalReceitas: number
    totalDespesas: number
    saldo: number
    receitasPorDia: Array<{ data: string; valor: number }>
    despesasPorDia: Array<{ data: string; valor: number }>
  }> {
    const [ano, mes] = mesAno.split('-')
    const dataInicio = `${ano}-${mes}-01`
    const dataFim = `${ano}-${mes}-31`

    // Buscar receitas (contas pagas)
    const { data: receitas, error: receitasError } = await supabase
      .from('contas_receber')
      .select('valor, data_pagamento')
      .eq('status', 'pago')
      .gte('data_pagamento', dataInicio)
      .lte('data_pagamento', dataFim)

    if (receitasError) throw new Error(`Erro ao buscar receitas: ${receitasError.message}`)

    // Buscar despesas
    const { data: despesas, error: despesasError } = await supabase
      .from('despesas')
      .select('valor, data')
      .gte('data', dataInicio)
      .lte('data', dataFim)

    if (despesasError) throw new Error(`Erro ao buscar despesas: ${despesasError.message}`)

    const totalReceitas = receitas?.reduce((sum, r) => sum + (r.valor || 0), 0) || 0
    const totalDespesas = despesas?.reduce((sum, d) => sum + (d.valor || 0), 0) || 0
    const saldo = totalReceitas - totalDespesas

    // Agrupar por dia
    const receitasPorDia = receitas?.reduce((acc: any[], r) => {
      const data = r.data_pagamento
      const existing = acc.find(item => item.data === data)
      if (existing) {
        existing.valor += r.valor || 0
      } else {
        acc.push({ data, valor: r.valor || 0 })
      }
      return acc
    }, []) || []

    const despesasPorDia = despesas?.reduce((acc: any[], d) => {
      const data = d.data
      const existing = acc.find(item => item.data === data)
      if (existing) {
        existing.valor += d.valor || 0
      } else {
        acc.push({ data, valor: d.valor || 0 })
      }
      return acc
    }, []) || []

    return {
      totalReceitas,
      totalDespesas,
      saldo,
      receitasPorDia,
      despesasPorDia
    }
  }
}

export const financeiroService = new FinanceiroService()
