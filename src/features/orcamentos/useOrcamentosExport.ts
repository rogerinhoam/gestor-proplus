import { useCallback } from 'react'
import { Orcamento } from '../../types'
import { usePDFGeneration } from './usePDFGeneration'

export const useOrcamentosExport = (orcamentos: Orcamento[]) => {
  const { loading: pdfLoading, generatePdf } = usePDFGeneration()

  const exportAll = useCallback(async () => {
    for (const orc of orcamentos) {
      await generatePdf('orcamento', orc)
    }
  }, [generatePdf, orcamentos])

  return { pdfLoading, exportAll }
}
