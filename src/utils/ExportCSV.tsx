// src/features/orcamentos/advanced/ExportCSV.tsx
import React from 'react'
import { Button } from '../../../components/ui/Button'
import { Orcamento } from '../../../types'

interface ExportCSVProps {
  data: Orcamento[]
}

/**
 * Botão para exportar lista de orçamentos em CSV.
 */
export const ExportCSV: React.FC<ExportCSVProps> = ({ data }) => {
  const handleExport = () => {
    const headers = ['ID','Cliente','Valor Total','Status','Data']
    const rows = data.map(o => [
      `"${o.id}"`,
      `"${o.clientes?.nome || ''}"`,
      `"${o.valor_total.toFixed(2)}"`,
      `"${o.status}"`,
      `"${new Date(o.created_at).toLocaleDateString('pt-BR')}"`
    ])
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.setAttribute('download','orcamentos_export.csv')
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <Button variant="outline" onClick={handleExport}>
      Exportar CSV
    </Button>
  )
}
