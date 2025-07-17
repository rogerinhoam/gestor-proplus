// src/features/orcamentos/advanced/usePDFGeneration.ts
import { useState, useCallback } from 'react'
import { Orcamento } from '../../../types'
import { PDFGenerator } from './PDFGenerator'

/**
 * Hook para geração de PDF de orçamentos e recibos.
 */
export const usePDFGeneration = () => {
  const [loading, setLoading] = useState(false)

  const generatePdf = useCallback(
    async (type: 'orcamento' | 'recibo', orcamento: Orcamento) => {
      setLoading(true)
      try {
        // PDFGenerator salva e lança download
        await PDFGenerator({ orcamento, type })
      } catch (err) {
        console.error('Erro ao gerar PDF:', err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { loading, generatePdf }
}
