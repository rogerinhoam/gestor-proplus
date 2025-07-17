// src/features/financeiro/FinanceiroView.tsx
import React, { useEffect } from 'react'
import { useFinanceiro } from './useFinanceiro'
import { Button } from '../../components/ui/Button'
import { DespesaForm } from './DespesaForm'
import { ContasReceber } from './ContasReceber'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { FinanceiroChart } from './FinanceiroChart'

export const FinanceiroView: React.FC = () => {
  const {
    despesas,
    contasReceber,
    loading,
    fetchDespesas,
    fetchContasReceber,
    openDespesaForm,
    openReceberForm,
    closeForm,
    current,
    createDespesa,
    createReceber
  } = useFinanceiro()

  useEffect(() => {
    fetchDespesas()
    fetchContasReceber()
  }, [fetchDespesas, fetchContasReceber])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openReceberForm(null)}>
            Nova Conta a Receber
          </Button>
          <Button variant="primary" onClick={() => openDespesaForm(null)}>
            Nova Despesa
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="large" />
      ) : (
        <>
          <FinanceiroChart despesas={despesas} contasReceber={contasReceber} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContasReceber
              contas={contasReceber}
              onCreate={createReceber}
              onClose={closeForm}
              current={current?.type === 'receber' ? current.item : null}
            />
            <DespesaForm
              despesas={despesas}
              onCreate={createDespesa}
              onClose={closeForm}
              current={current?.type === 'despesa' ? current.item : null}
            />
          </div>
        </>
      )}
    </div>
)
}
