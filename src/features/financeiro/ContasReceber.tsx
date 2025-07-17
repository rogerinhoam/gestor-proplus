// src/features/financeiro/ContasReceber.tsx
import React, { useState, useEffect } from 'react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { ContaReceber } from '../../types'
import { formatCurrency } from '../../utils/formatting'

interface ContasReceberProps {
  contas: ContaReceber[]
  onCreate: (data: Partial<ContaReceber>) => void
  onClose: () => void
  current: ContaReceber | null
}

export const ContasReceber: React.FC<ContasReceberProps> = ({
  contas,
  onCreate,
  onClose,
  current
}) => {
  const [form, setForm] = useState({
    descricao: '',
    valor: '',
    data_vencimento: '',
    cliente_nome: '',
    status: 'pendente'
  })

  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (current && Object.keys(current).length > 0) {
      setForm({
        descricao: current.descricao || '',
        valor: current.valor?.toString() || '',
        data_vencimento: current.data_vencimento || '',
        cliente_nome: current.cliente_nome || '',
        status: current.status || 'pendente'
      })
      setShowForm(true)
    }
  }, [current])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate({
      ...form,
      valor: parseFloat(form.valor)
    })
    setForm({
      descricao: '',
      valor: '',
      data_vencimento: '',
      cliente_nome: '',
      status: 'pendente'
    })
    setShowForm(false)
  }

  const totalPendente = contas
    .filter(c => c.status === 'pendente')
    .reduce((sum, c) => sum + (c.valor || 0), 0)

  const totalRecebido = contas
    .filter(c => c.status === 'pago')
    .reduce((sum, c) => sum + (c.valor || 0), 0)

  const contasVencidas = contas.filter(c => 
    c.status === 'pendente' && 
    new Date(c.data_vencimento || '') < new Date()
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'text-green-600 bg-green-100'
      case 'vencido':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-yellow-600 bg-yellow-100'
    }
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Contas a Receber</h2>
          <Button
            variant="primary"
            onClick={() => setShowForm(true)}
            size="small"
          >
            Nova Conta
          </Button>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h3 className="font-medium text-green-800 text-sm">A Receber</h3>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(totalPendente)}
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h3 className="font-medium text-blue-800 text-sm">Recebido</h3>
            <p className="text-xl font-bold text-blue-600">
              {formatCurrency(totalRecebido)}
            </p>
          </div>
        </div>

        {/* Contas Vencidas */}
        {contasVencidas.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <h3 className="font-medium text-red-800 text-sm">
              ⚠️ {contasVencidas.length} conta(s) vencida(s)
            </h3>
            <p className="text-sm text-red-600">
              Total: {formatCurrency(contasVencidas.reduce((sum, c) => sum + (c.valor || 0), 0))}
            </p>
          </div>
        )}

        {/* Formulário */}
        {showForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-medium mb-3">
              {current ? 'Editar Conta' : 'Nova Conta a Receber'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                label="Descrição"
                type="text"
                value={form.descricao}
                onChange={e => setForm(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Serviço realizado, produto vendido..."
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Valor"
                  type="number"
                  step="0.01"
                  value={form.valor}
                  onChange={e => setForm(prev => ({ ...prev, valor: e.target.value }))}
                  placeholder="0,00"
                  required
                />
                <Input
                  label="Vencimento"
                  type="date"
                  value={form.data_vencimento}
                  onChange={e => setForm(prev => ({ ...prev, data_vencimento: e.target.value }))}
                  required
                />
              </div>

              <Input
                label="Cliente"
                type="text"
                value={form.cliente_nome}
                onChange={e => setForm(prev => ({ ...prev, cliente_nome: e.target.value }))}
                placeholder="Nome do cliente"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                  <option value="vencido">Vencido</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" variant="primary" size="small">
                  Salvar
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="small"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Contas */}
        <div>
          <h3 className="font-medium mb-3">Contas Recentes</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {contas.slice(0, 10).map((conta, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-white border rounded">
                <div className="flex-1">
                  <p className="font-medium">{conta.descricao}</p>
                  <p className="text-sm text-gray-500">
                    {conta.cliente_nome} • Venc: {new Date(conta.data_vencimento || '').toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    {formatCurrency(conta.valor || 0)}
                  </p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conta.status || 'pendente')}`}>
                    {conta.status === 'pago' ? 'Pago' : conta.status === 'vencido' ? 'Vencido' : 'Pendente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
