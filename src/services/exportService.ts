// src/services/exportService.ts
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

export interface ExportColumn {
  key: string
  title: string
  width?: number
  type?: 'text' | 'number' | 'date' | 'currency' | 'boolean'
  format?: (value: any) => string
}

export interface ExportOptions {
  filename?: string
  title?: string
  subtitle?: string
  includeTimestamp?: boolean
  pageOrientation?: 'portrait' | 'landscape'
  pageSize?: 'a4' | 'a3' | 'letter'
  margins?: {
    top: number
    right: number
    bottom: number
    left: number
  }
  headerStyle?: {
    fontSize?: number
    fontStyle?: 'normal' | 'bold'
    textColor?: string
    fillColor?: string
  }
  bodyStyle?: {
    fontSize?: number
    alternateRowColors?: boolean
    gridLines?: boolean
  }
  footerText?: string
}

export interface CSVOptions {
  delimiter?: string
  includeHeaders?: boolean
  encoding?: 'UTF-8' | 'UTF-8-BOM'
}

export interface PDFOptions extends ExportOptions {
  format?: 'table' | 'report'
  logo?: string
  watermark?: string
}

export interface ExcelOptions extends ExportOptions {
  sheetName?: string
  includeFormulas?: boolean
  autoFilter?: boolean
  freezeHeaders?: boolean
}

export class ExportService {
  private defaultOptions: ExportOptions = {
    includeTimestamp: true,
    pageOrientation: 'portrait',
    pageSize: 'a4',
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    headerStyle: {
      fontSize: 12,
      fontStyle: 'bold',
      textColor: '#000000',
      fillColor: '#f0f0f0'
    },
    bodyStyle: {
      fontSize: 10,
      alternateRowColors: true,
      gridLines: true
    }
  }

  /**
   * Exporta dados para CSV
   */
  async exportToCSV<T>(
    data: T[],
    columns: ExportColumn[],
    options: CSVOptions & Pick<ExportOptions, 'filename'> = {}
  ): Promise<void> {
    const {
      delimiter = ',',
      includeHeaders = true,
      encoding = 'UTF-8-BOM',
      filename = 'export.csv'
    } = options

    let csvContent = ''

    // Adicionar cabeçalhos
    if (includeHeaders) {
      const headers = columns.map(col => this.escapeCsvValue(col.title))
      csvContent += headers.join(delimiter) + '\n'
    }

    // Adicionar dados
    data.forEach(row => {
      const values = columns.map(col => {
        const value = this.getNestedValue(row, col.key)
        const formattedValue = col.format ? col.format(value) : this.formatValue(value, col.type)
        return this.escapeCsvValue(formattedValue)
      })
      csvContent += values.join(delimiter) + '\n'
    })

    // Adicionar BOM para UTF-8 se necessário
    const bom = encoding === 'UTF-8-BOM' ? '\uFEFF' : ''
    const finalContent = bom + csvContent

    this.downloadFile(finalContent, filename, 'text/csv;charset=utf-8')
  }

  /**
   * Exporta dados para Excel
   */
  async exportToExcel<T>(
    data: T[],
    columns: ExportColumn[],
    options: ExcelOptions = {}
  ): Promise<void> {
    const {
      filename = 'export.xlsx',
      sheetName = 'Dados',
      title,
      includeTimestamp = true,
      autoFilter = true,
      freezeHeaders = true
    } = { ...this.defaultOptions, ...options }

    // Criar workbook
    const wb = XLSX.utils.book_new()
    
    // Preparar dados
    const worksheetData: any[][] = []

    // Adicionar título se especificado
    let currentRow = 0
    if (title) {
      worksheetData.push([title])
      currentRow++
      
      if (includeTimestamp) {
        worksheetData.push([`Gerado em: ${new Date().toLocaleString('pt-BR')}`])
        currentRow++
      }
      
      worksheetData.push([]) // Linha vazia
      currentRow++
    }

    // Adicionar cabeçalhos
    const headers = columns.map(col => col.title)
    worksheetData.push(headers)
    const headerRow = currentRow
    currentRow++

    // Adicionar dados
    data.forEach(row => {
      const rowData = columns.map(col => {
        const value = this.getNestedValue(row, col.key)
        return col.format ? col.format(value) : value
      })
      worksheetData.push(rowData)
    })

    // Criar worksheet
    const ws = XLSX.utils.aoa_to_sheet(worksheetData)

    // Aplicar formatação
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
    
    // Definir larguras das colunas
    const colWidths = columns.map(col => ({ 
      wch: col.width || Math.max(col.title.length, 15) 
    }))
    ws['!cols'] = colWidths

    // Aplicar auto-filtro
    if (autoFilter && data.length > 0) {
      ws['!autofilter'] = {
        ref: `A${headerRow + 1}:${String.fromCharCode(65 + columns.length - 1)}${headerRow + data.length + 1}`
      }
    }

    // Congelar cabeçalhos
    if (freezeHeaders) {
      ws['!freeze'] = { xSplit: 0, ySplit: headerRow + 1 }
    }

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName)

    // Gerar e baixar arquivo
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    this.downloadBlob(blob, filename)
  }

  /**
   * Exporta dados para PDF
   */
  async exportToPDF<T>(
    data: T[],
    columns: ExportColumn[],
    options: PDFOptions = {}
  ): Promise<void> {
    const mergedOptions = { ...this.defaultOptions, ...options }
    const {
      filename = 'export.pdf',
      title,
      subtitle,
      includeTimestamp = true,
      pageOrientation = 'portrait',
      pageSize = 'a4',
      format = 'table',
      logo,
      watermark,
      footerText
    } = mergedOptions

    // Criar documento PDF
    const doc = new jsPDF({
      orientation: pageOrientation,
      unit: 'mm',
      format: pageSize
    })

    let yPosition = 20

    // Adicionar logo se especificado
    if (logo) {
      try {
        doc.addImage(logo, 'PNG', 20, yPosition, 30, 20)
        yPosition += 25
      } catch (error) {
        console.warn('Erro ao adicionar logo:', error)
      }
    }

    // Adicionar título
    if (title) {
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text(title, 20, yPosition)
      yPosition += 10
    }

    // Adicionar subtítulo
    if (subtitle) {
      doc.setFontSize(14)
      doc.setFont('helvetica', 'normal')
      doc.text(subtitle, 20, yPosition)
      yPosition += 8
    }

    // Adicionar timestamp
    if (includeTimestamp) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, yPosition)
      yPosition += 15
    }

    if (format === 'table') {
      // Exportar como tabela
      await this.addTableToPDF(doc, data, columns, yPosition, mergedOptions)
    } else {
      // Exportar como relatório
      await this.addReportToPDF(doc, data, columns, yPosition, mergedOptions)
    }

    // Adicionar watermark se especificado
    if (watermark) {
      this.addWatermark(doc, watermark)
    }

    // Adicionar rodapé
    if (footerText) {
      this.addFooter(doc, footerText)
    }

    // Salvar PDF
    doc.save(filename)
  }

  /**
   * Exporta múltiplas planilhas para Excel
   */
  async exportMultipleSheets(
    sheets: Array<{
      name: string
      data: any[]
      columns: ExportColumn[]
    }>,
    filename: string = 'export-multiplo.xlsx'
  ): Promise<void> {
    const wb = XLSX.utils.book_new()

    sheets.forEach(sheet => {
      // Preparar dados da planilha
      const headers = sheet.columns.map(col => col.title)
      const data = sheet.data.map(row => 
        sheet.columns.map(col => {
          const value = this.getNestedValue(row, col.key)
          return col.format ? col.format(value) : value
        })
      )

      // Criar worksheet
      const ws = XLSX.utils.aoa_to_sheet([headers, ...data])

      // Definir larguras das colunas
      const colWidths = sheet.columns.map(col => ({ 
        wch: col.width || Math.max(col.title.length, 15) 
      }))
      ws['!cols'] = colWidths

      // Adicionar ao workbook
      XLSX.utils.book_append_sheet(wb, ws, sheet.name)
    })

    // Gerar e baixar arquivo
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    this.downloadBlob(blob, filename)
  }

  /**
   * Gera relatório financeiro específico
   */
  async exportFinancialReport(
    receitas: any[],
    despesas: any[],
    periodo: { inicio: string; fim: string },
    filename: string = 'relatorio-financeiro.pdf'
  ): Promise<void> {
    const doc = new jsPDF()
    
    // Cabeçalho do relatório
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Relatório Financeiro', 20, 20)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Período: ${periodo.inicio} a ${periodo.fim}`, 20, 30)
    
    let yPos = 50

    // Resumo financeiro
    const totalReceitas = receitas.reduce((sum, r) => sum + (r.valor || 0), 0)
    const totalDespesas = despesas.reduce((sum, d) => sum + (d.valor || 0), 0)
    const saldo = totalReceitas - totalDespesas

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Resumo do Período', 20, yPos)
    yPos += 10

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Total de Receitas: R$ ${totalReceitas.toFixed(2)}`, 20, yPos)
    yPos += 8
    doc.text(`Total de Despesas: R$ ${totalDespesas.toFixed(2)}`, 20, yPos)
    yPos += 8
    
    doc.setFont('helvetica', 'bold')
    const saldoColor = saldo >= 0 ? '#008000' : '#FF0000'
    doc.setTextColor(saldoColor)
    doc.text(`Saldo: R$ ${saldo.toFixed(2)}`, 20, yPos)
    doc.setTextColor('#000000')
    yPos += 20

    // Tabela de receitas
    if (receitas.length > 0) {
      (doc as any).autoTable({
        head: [['Data', 'Descrição', 'Cliente', 'Valor']],
        body: receitas.map(r => [
          new Date(r.data_pagamento || r.data_vencimento).toLocaleDateString('pt-BR'),
          r.descricao || 'Pagamento',
          r.cliente_nome || '',
          `R$ ${(r.valor || 0).toFixed(2)}`
        ]),
        startY: yPos,
        theme: 'grid',
        headStyles: { fillColor: [0, 128, 0] },
        margin: { left: 20, right: 20 }
      })
      
      yPos = (doc as any).lastAutoTable.finalY + 10
    }

    // Tabela de despesas
    if (despesas.length > 0) {
      (doc as any).autoTable({
        head: [['Data', 'Descrição', 'Categoria', 'Valor']],
        body: despesas.map(d => [
          new Date(d.data).toLocaleDateString('pt-BR'),
          d.descricao,
          d.categoria || 'Geral',
          `R$ ${(d.valor || 0).toFixed(2)}`
        ]),
        startY: yPos,
        theme: 'grid',
        headStyles: { fillColor: [255, 0, 0] },
        margin: { left: 20, right: 20 }
      })
    }

    doc.save(filename)
  }

  // Métodos privados
  private async addTableToPDF<T>(
    doc: jsPDF,
    data: T[],
    columns: ExportColumn[],
    startY: number,
    options: PDFOptions
  ): Promise<void> {
    const headers = columns.map(col => col.title)
    const body = data.map(row => 
      columns.map(col => {
        const value = this.getNestedValue(row, col.key)
        return col.format ? col.format(value) : this.formatValue(value, col.type)
      })
    )

    ;(doc as any).autoTable({
      head: [headers],
      body: body,
      startY: startY,
      theme: 'grid',
      headStyles: {
        fillColor: this.hexToRgb(options.headerStyle?.fillColor || '#f0f0f0'),
        fontSize: options.headerStyle?.fontSize || 12,
        fontStyle: options.headerStyle?.fontStyle || 'bold'
      },
      bodyStyles: {
        fontSize: options.bodyStyle?.fontSize || 10
      },
      alternateRowStyles: options.bodyStyle?.alternateRowColors ? {
        fillColor: [245, 245, 245]
      } : undefined,
      margin: options.margins
    })
  }

  private async addReportToPDF<T>(
    doc: jsPDF,
    data: T[],
    columns: ExportColumn[],
    startY: number,
    options: PDFOptions
  ): Promise<void> {
    let yPosition = startY

    data.forEach((item, index) => {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`Item ${index + 1}`, 20, yPosition)
      yPosition += 10

      columns.forEach(col => {
        const value = this.getNestedValue(item, col.key)
        const formattedValue = col.format ? col.format(value) : this.formatValue(value, col.type)
        
        doc.setFont('helvetica', 'bold')
        doc.text(`${col.title}:`, 20, yPosition)
        doc.setFont('helvetica', 'normal')
        doc.text(String(formattedValue), 60, yPosition)
        yPosition += 8
      })

      yPosition += 5
    })
  }

  private addWatermark(doc: jsPDF, text: string): void {
    const pageCount = doc.getNumberOfPages()
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(50)
      doc.setTextColor(200, 200, 200)
      doc.text(text, 105, 148, {
        angle: 45,
        align: 'center'
      })
    }
  }

  private addFooter(doc: jsPDF, text: string): void {
    const pageCount = doc.getNumberOfPages()
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(text, 20, 285)
      doc.text(`Página ${i} de ${pageCount}`, 190, 285, { align: 'right' })
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private formatValue(value: any, type?: string): string {
    if (value == null) return ''

    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(Number(value))
      
      case 'number':
        return new Intl.NumberFormat('pt-BR').format(Number(value))
      
      case 'date':
        return new Date(value).toLocaleDateString('pt-BR')
      
      case 'boolean':
        return value ? 'Sim' : 'Não'
      
      default:
        return String(value)
    }
  }

  private escapeCsvValue(value: string): string {
    const stringValue = String(value)
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }
    return stringValue
  }

  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0]
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    this.downloadBlob(blob, filename)
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export const exportService = new ExportService()

// Funções utilitárias para exportação rápida
export const ExportUtils = {
  // Exportação rápida de clientes
  exportClientes: (clientes: any[]) => {
    const columns: ExportColumn[] = [
      { key: 'nome', title: 'Nome' },
      { key: 'telefone', title: 'Telefone' },
      { key: 'carro', title: 'Veículo' },
      { key: 'placa', title: 'Placa' },
      { key: 'created_at', title: 'Cadastrado em', type: 'date' }
    ]
    
    return exportService.exportToExcel(clientes, columns, {
      filename: 'clientes.xlsx',
      title: 'Lista de Clientes'
    })
  },

  // Exportação rápida de orçamentos
  exportOrcamentos: (orcamentos: any[]) => {
    const columns: ExportColumn[] = [
      { key: 'id', title: 'ID' },
      { key: 'clientes.nome', title: 'Cliente' },
      { key: 'valor_total', title: 'Valor', type: 'currency' },
      { key: 'status', title: 'Status' },
      { key: 'created_at', title: 'Data', type: 'date' }
    ]
    
    return exportService.exportToExcel(orcamentos, columns, {
      filename: 'orcamentos.xlsx',
      title: 'Lista de Orçamentos'
    })
  },

  // Exportação rápida de agenda
  exportAgenda: (agendamentos: any[]) => {
    const columns: ExportColumn[] = [
      { key: 'clientes.nome', title: 'Cliente' },
      { key: 'servico', title: 'Serviço' },
      { key: 'data_hora', title: 'Data/Hora', type: 'date' },
      { key: 'status', title: 'Status' },
      { key: 'observacoes', title: 'Observações' }
    ]
    
    return exportService.exportToExcel(agendamentos, columns, {
      filename: 'agenda.xlsx',
      title: 'Agenda de Atendimentos'
    })
  }
}
