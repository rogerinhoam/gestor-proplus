// src/features/financeiro/DespesaForm.tsx
import React, { useState, useEffect } from 'react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { Despesa } from '../../types'
import { formatCurrency } from '../../utils/formatting'

interface DespesaFormProps {
  despesas: Despesa[]
  onCreate: (data: Partial<Despesa>) => void
  onClose: () => void
  current: Despesa | null
}

const categorias = [
  'Produtos',
  'Equipamentos', 
  'Aluguel',
  'Energia',
  'Água',
  'Internet',
  'Combustível',
  'Manutenção',
  'Marketing',
  'Outros'
]

export const DespesaForm: React.FC<DespesaFormProps> = ({
  despesas,
  onCreate,
  onClose,
  current
}) => {
  const [form, setForm] = useState({
    data: new Date().toISOString().split('T')[0],
    descricao: '',
    valor: '',
    categoria: 'Outros'
  })

  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (current && Object.keys(current).length > 0) {
      setForm({
        data: current.data || new Date().toISOString().split('T')[0],
        descricao: current.descricao || '',
        valor: current.valor?.toString() || '',
        categoria: current.categoria || 'Outros'
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
      data: new Date().toISOString().split('T')[0],
      descricao: '',
      valor: '',
      categoria: 'Outros'
    })
    setShowForm(false)
  }

  const totalMes = despesas
    .filter(d => d.data?.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((sum, d) => sum + (d.valor || 0), 0)

  const totalCategoria = (cat: string) => 
    despesas
      .filter(d => d.categoria === cat)
      .reduce((sum, d) => sum + (d.valor || 0), 0)

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Controle de Despesas</h2>
          <Button
            variant="primary"
            onClick={() => setShowForm(true)}
            size="small"
          >
            Nova Despesa
          </Button>
        </div>

        {/* Resumo do Mês */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-red-800 mb-2">Total do Mês</h3>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(totalMes)}
          </p>
          <p className="text-sm text-red-600">
            {despesas.filter(d => d.data?.startsWith(new Date().toISOString().slice(0, 7))).length} despesas registradas
          </p>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-medium mb-3">
              {current ? 'Editar Despesa' : 'Nova Despesa'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Data"
                  type="date"
                  value={form.data}
                  onChange={e => setForm(prev => ({ ...prev, data: e.target.value }))}
                  required
                />
                <Input
                  label="Valor"
                  type="number"
                  step="0.01"
                  value={form.valor}
                  onChange={e => setForm(prev => ({ ...prev, valor: e.target.value }))}
                  placeholder="0,00"
                  required
                />
              </div>
              
              <Input
                label="Descrição"
                type="text"
                value={form.descricao}
                onChange={e => setForm(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva a despesa"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={form.categoria}
                  onChange={e => setForm(prev => ({ ...prev, categoria: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
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

        {/* Lista de Despesas Recentes */}
        <div>
          <h3 className="font-medium mb-3">Últimas Despesas</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {despesas.slice(0, 10).map((despesa, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-white border rounded">
                <div>
                  <p className="font-medium">{despesa.descricao}</p>
                  <p className="text-sm text-gray-500">
                    {despesa.categoria} • {new Date(despesa.data || '').toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">
                    {formatCurrency(despesa.valor || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo por Categoria */}
        <div className="mt-4">
          <h3 className="font-medium mb-3">Por Categoria</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {categorias.map(cat => {
              const total = totalCategoria(cat)
              return total > 0 ? (
                <div key={cat} className="flex justify-between">
                  <span>{cat}:</span>
                  <span className="font-medium">{formatCurrency(total)}</span>
                </div>
              ) : null
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}
