// src/features/financeiro/FinanceiroChart.tsx
import React from 'react'
import { Card } from '../../components/ui/Card'
import { Despesa, ContaReceber } from '../../types'
import { formatCurrency } from '../../utils/formatting'

interface FinanceiroChartProps {
  despesas: Despesa[]
  contasReceber: ContaReceber[]
}

export const FinanceiroChart: React.FC<FinanceiroChartProps> = ({
  despesas,
  contasReceber
}) => {
  const hoje = new Date()
  const mesAtual = hoje.getMonth()
  const anoAtual = hoje.getFullYear()

  // Calcular totais do mês atual
  const despesasMes = despesas.filter(d => {
    const dataDespesa = new Date(d.data || '')
    return dataDespesa.getMonth() === mesAtual && dataDespesa.getFullYear() === anoAtual
  })

  const receitasMes = contasReceber.filter(c => {
    if (c.status !== 'pago' || !c.data_pagamento) return false
    const dataPagamento = new Date(c.data_pagamento)
    return dataPagamento.getMonth() === mesAtual && dataPagamento.getFullYear() === anoAtual
  })

  const totalDespesas = despesasMes.reduce((sum, d) => sum + (d.valor || 0), 0)
  const totalReceitas = receitasMes.reduce((sum, c) => sum + (c.valor || 0), 0)
  const saldo = totalReceitas - totalDespesas

  // Calcular despesas por categoria
  const despesasPorCategoria = despesasMes.reduce((acc, despesa) => {
    const categoria = despesa.categoria || 'Outros'
    acc[categoria] = (acc[categoria] || 0) + (despesa.valor || 0)
    return acc
  }, {} as Record<string, number>)

  // Contas a receber pendentes
  const contasPendentes = contasReceber.filter(c => c.status === 'pendente')
  const totalPendente = contasPendentes.reduce((sum, c) => sum + (c.valor || 0), 0)

  // Contas vencidas
  const contasVencidas = contasPendentes.filter(c => 
    new Date(c.data_vencimento || '') < hoje
  )
  const totalVencido = contasVencidas.reduce((sum, c) => sum + (c.valor || 0), 0)

  const getSaldoColor = (valor: number) => {
    if (valor > 0) return 'text-green-600'
    if (valor < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getSaldoIcon = (valor: number) => {
    if (valor > 0) return 'fas fa-arrow-up'
    if (valor < 0) return 'fas fa-arrow-down'
    return 'fas fa-minus'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Receitas */}
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Receitas (Mês)</h3>
            <i className="fas fa-arrow-up text-green-500"></i>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalReceitas)}
          </div>
          <p className="text-xs text-gray-500">
            {receitasMes.length} recebimento(s)
          </p>
        </div>
      </Card>

      {/* Despesas */}
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Despesas (Mês)</h3>
            <i className="fas fa-arrow-down text-red-500"></i>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(totalDespesas)}
          </div>
          <p className="text-xs text-gray-500">
            {despesasMes.length} despesa(s)
          </p>
        </div>
      </Card>

      {/* Saldo */}
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Saldo (Mês)</h3>
            <i className={`${getSaldoIcon(saldo)} ${getSaldoColor(saldo)}`}></i>
          </div>
          <div className={`text-2xl font-bold ${getSaldoColor(saldo)}`}>
            {formatCurrency(saldo)}
          </div>
          <p className="text-xs text-gray-500">
            {saldo > 0 ? 'Positivo' : saldo < 0 ? 'Negativo' : 'Neutro'}
          </p>
        </div>
      </Card>

      {/* Contas a Receber */}
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">A Receber</h3>
            <i className="fas fa-clock text-yellow-500"></i>
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {formatCurrency(totalPendente)}
          </div>
          <p className="text-xs text-gray-500">
            {contasPendentes.length} conta(s) pendente(s)
          </p>
          {totalVencido > 0 && (
            <p className="text-xs text-red-600 mt-1">
              {formatCurrency(totalVencido)} vencido(s)
            </p>
          )}
        </div>
      </Card>

      {/* Gráfico de Despesas por Categoria */}
      {Object.keys(despesasPorCategoria).length > 0 && (
        <Card className="md:col-span-2">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Despesas por Categoria (Mês)
            </h3>
            <div className="space-y-2">
              {Object.entries(despesasPorCategoria)
                .sort(([,a], [,b]) => b - a)
                .map(([categoria, valor]) => {
                  const porcentagem = (valor / totalDespesas) * 100
                  return (
                    <div key={categoria} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm">{categoria}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">{formatCurrency(valor)}</span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({porcentagem.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </Card>
      )}

      {/* Alertas */}
      {(contasVencidas.length > 0 || saldo < 0) && (
        <Card className="md:col-span-2">
          <div className="p-4">
            <h3 className="text-sm font-medium text-red-700 mb-3">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              Alertas Financeiros
            </h3>
            <div className="space-y-2">
              {contasVencidas.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <i className="fas fa-clock"></i>
                  <span>
                    {contasVencidas.length} conta(s) vencida(s) - {formatCurrency(totalVencido)}
                  </span>
                </div>
              )}
              {saldo < 0 && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <i className="fas fa-chart-line-down"></i>
                  <span>
                    Saldo negativo no mês - {formatCurrency(Math.abs(saldo))}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
