// src/features/crm/useCRM.ts
import { useState, useCallback } from 'react'
import { Cliente, CRMInteraction } from '../../types'
import { crmService } from './crmService'

interface ClienteInativo extends Cliente {
  diasInativo: number
  ultimoServico: string | null
  valorTotal: number
}

export const useCRM = () => {
  const [clientesInativos, setClientesInativos] = useState<ClienteInativo[]>([])
  const [interacoes, setInteracoes] = useState<CRMInteraction[]>([])
  const [loading, setLoading] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)

  const fetchClientesInativos = useCallback(async (dias: number = 30) => {
    setLoading(true)
    try {
      const data = await crmService.getClientesInativos(dias)
      setClientesInativos(data)
    } catch (err) {
      console.error('Erro ao buscar clientes inativos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchInteracoes = useCallback(async () => {
    setLoading(true)
    try {
      const data = await crmService.getInteracoes()
      setInteracoes(data)
    } catch (err) {
      console.error('Erro ao buscar interações:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createInteraction = useCallback(async (interactionData: Partial<CRMInteraction>) => {
    try {
      setLoading(true)
      const newInteraction = await crmService.createInteraction(interactionData)
      setInteracoes(prev => [newInteraction, ...prev])
      return newInteraction
    } catch (err) {
      console.error('Erro ao criar interação:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const sendWhatsAppMessage = useCallback(async (
    clienteId: string, 
    templateType: string, 
    customMessage?: string
  ) => {
    setSendingMessage(true)
    try {
      await crmService.sendWhatsAppMessage(clienteId, templateType, customMessage)
      
      // Criar registro da interação
      await createInteraction({
        cliente_id: clienteId,
        interaction_type: 'whatsapp',
        notes: customMessage || `Template: ${templateType}`,
        follow_up_date: null
      })

      return true
    } catch (err) {
      console.error('Erro ao enviar mensagem WhatsApp:', err)
      throw err
    } finally {
      setSendingMessage(false)
    }
  }, [createInteraction])

  const markFollowUpComplete = useCallback(async (interactionId: string) => {
    try {
      await crmService.updateInteraction(interactionId, {
        follow_up_date: null,
        notes: 'Follow-up realizado'
      })
      await fetchInteracoes()
    } catch (err) {
      console.error('Erro ao marcar follow-up:', err)
    }
  }, [fetchInteracoes])

  const getClienteSegmentation = useCallback(() => {
    const hoje = new Date()
    const segments = {
      novos: clientesInativos.filter(c => c.diasInativo <= 15),
      emRisco: clientesInativos.filter(c => c.diasInativo > 15 && c.diasInativo <= 30),
      inativos: clientesInativos.filter(c => c.diasInativo > 30 && c.diasInativo <= 60),
      perdidos: clientesInativos.filter(c => c.diasInativo > 60)
    }

    return segments
  }, [clientesInativos])

  const getInteractionStats = useCallback(() => {
    const hoje = new Date()
    const mesAtual = hoje.getMonth()
    const anoAtual = hoje.getFullYear()

    const interacoesMes = interacoes.filter(i => {
      const dataInteracao = new Date(i.created_at)
      return dataInteracao.getMonth() === mesAtual && dataInteracao.getFullYear() === anoAtual
    })

    const stats = {
      totalMes: interacoesMes.length,
      whatsappMes: interacoesMes.filter(i => i.interaction_type === 'whatsapp').length,
      telefoneMes: interacoesMes.filter(i => i.interaction_type === 'telefone').length,
      followUpsPendentes: interacoes.filter(i => i.follow_up_date && new Date(i.follow_up_date) <= hoje).length
    }

    return stats
  }, [interacoes])

  return {
    clientesInativos,
    interacoes,
    loading,
    sendingMessage,
    fetchClientesInativos,
    fetchInteracoes,
    createInteraction,
    sendWhatsAppMessage,
    markFollowUpComplete,
    getClienteSegmentation,
    getInteractionStats
  }
}
