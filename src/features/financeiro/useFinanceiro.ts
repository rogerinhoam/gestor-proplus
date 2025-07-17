// src/features/financeiro/useFinanceiro.ts
import { useState, useCallback } from 'react'
import { Despesa, ContaReceber } from '../../types'
import { financeiroService } from './financeiroService'

interface CurrentForm {
  type: 'despesa' | 'receber'
  item: Despesa | ContaReceber
}

export const useFinanceiro = () => {
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [contasReceber, setContasReceber] = useState<ContaReceber[]>([])
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState<CurrentForm | null>(null)

  const fetchDespesas = useCallback(async () => {
    setLoading(true)
    try {
      const data = await financeiroService.getDespesas()
      setDespesas(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchContasReceber = useCallback(async () => {
    setLoading(true)
    try {
      const data = await financeiroService.getContasReceber()
      setContasReceber(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const openDespesaForm = (item: Despesa | null) => setCurrent(item ? { type: 'despesa', item } : { type: 'despesa', item: {} as Despesa })
  const openReceberForm = (item: ContaReceber | null) => setCurrent(item ? { type: 'receber', item } : { type: 'receber', item: {} as ContaReceber })
  const closeForm = () => setCurrent(null)

  const createDespesa = useCallback(async (data: Partial<Despesa>) => {
    setLoading(true)
    try {
      await financeiroService.createDespesa(data)
      await fetchDespesas()
      closeForm()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [fetchDespesas])

  const createReceber = useCallback(async (data: Partial<ContaReceber>) => {
    setLoading(true)
    try {
      await financeiroService.createContaReceber(data)
      await fetchContasReceber()
      closeForm()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [fetchContasReceber])

  return {
    despesas,
    contasReceber,
    loading,
    current,
    fetchDespesas,
    fetchContasReceber,
    openDespesaForm,
    openReceberForm,
    closeForm,
    createDespesa,
    createReceber
  }
}
