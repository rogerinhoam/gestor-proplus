// src/features/crm/crmService.ts
import { supabase } from '../../services/supabaseClient'
import { Cliente, CRMInteraction } from '../../types'

interface ClienteInativo extends Cliente {
  diasInativo: number
  ultimoServico: string | null
  valorTotal: number
}

export class CRMService {
  async getClientesInativos(dias: number = 30): Promise<ClienteInativo[]> {
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() - dias)

    const { data, error } = await supabase
      .from('clientes')
      .select(`
        *,
        orcamentos (
          id,
          status,
          updated_at,
          valor_total
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Erro ao buscar clientes inativos: ${error.message}`)

    // Processar clientes para calcular inatividade
    const clientesInativos: ClienteInativo[] = []

    for (const cliente of data || []) {
      const orcamentosFinalizados = cliente.orcamentos?.filter(
        (orc: any) => orc.status === 'Finalizado'
      ) || []

      let ultimoServico: string | null = null
      let diasInativo = 0
      let valorTotal = 0

      if (orcamentosFinalizados.length > 0) {
        // Encontrar o último serviço
        const ultimoOrcamento = orcamentosFinalizados
          .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0]
        
        ultimoServico = ultimoOrcamento.updated_at
        diasInativo = Math.floor((new Date().getTime() - new Date(ultimoServico).getTime()) / (1000 * 60 * 60 * 24))
        
        // Calcular valor total gasto
        valorTotal = orcamentosFinalizados.reduce((sum: number, orc: any) => sum + (orc.valor_total || 0), 0)
      } else {
        // Cliente nunca teve serviço finalizado
        diasInativo = Math.floor((new Date().getTime() - new Date(cliente.created_at).getTime()) / (1000 * 60 * 60 * 24))
      }

      // Incluir apenas clientes inativos há mais de X dias
      if (diasInativo >= dias) {
        clientesInativos.push({
          ...cliente,
          diasInativo,
          ultimoServico,
          valorTotal
        })
      }
    }

    return clientesInativos.sort((a, b) => b.diasInativo - a.diasInativo)
  }

  async getInteracoes(): Promise<CRMInteraction[]> {
    const { data, error } = await supabase
      .from('crm_interactions')
      .select(`
        *,
        clientes (
          id,
          nome,
          telefone,
          carro
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Erro ao buscar interações: ${error.message}`)
    return data || []
  }

  async createInteraction(interaction: Partial<CRMInteraction>): Promise<CRMInteraction> {
    const { data, error } = await supabase
      .from('crm_interactions')
      .insert([{
        cliente_id: interaction.cliente_id,
        interaction_type: interaction.interaction_type,
        notes: interaction.notes,
        follow_up_date: interaction.follow_up_date,
        created_at: new Date().toISOString()
      }])
      .select(`
        *,
        clientes (
          id,
          nome,
          telefone,
          carro
        )
      `)
      .single()

    if (error) throw new Error(`Erro ao criar interação: ${error.message}`)
    return data
  }

  async updateInteraction(id: string, updates: Partial<CRMInteraction>): Promise<CRMInteraction> {
    const { data, error } = await supabase
      .from('crm_interactions')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        clientes (
          id,
          nome,
          telefone,
          carro
        )
      `)
      .single()

    if (error) throw new Error(`Erro ao atualizar interação: ${error.message}`)
    return data
  }

  async sendWhatsAppMessage(
    clienteId: string, 
    templateType: string, 
    customMessage?: string
  ): Promise<void> {
    // Buscar dados do cliente
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', clienteId)
      .single()

    if (clienteError) throw new Error(`Erro ao buscar cliente: ${clienteError.message}`)
    if (!cliente.telefone) throw new Error('Cliente não possui telefone cadastrado')

    // Templates de mensagem (mesmos do projeto original)
    const templates = {
      inactive_friendly: `Olá, ${cliente.nome}! Tudo bem? Aqui é da R.M. Estética Automotiva. Notamos que já faz um tempo desde sua última visita. Só queríamos saber se está tudo certo com o seu carro e nos colocar à disposição! Precisando de algo, é só chamar. 👍`,
      
      inactive_offer: `Olá, ${cliente.nome}! Da R.M. Estética Automotiva. Como já se passaram mais de 30 dias da sua última visita, estamos com uma condição especial para você: 10% de desconto na cristalização dos vidros. Que tal dar um trato no carro? Aguardamos seu contato! ✨`,
      
      maintenance: `Olá ${cliente.nome}, tudo joia? Aqui da R.M. Estética Automotiva. Passando para lembrar que, como já faz um tempo desde o último serviço, a manutenção da estética do seu carro é importante para manter o valor e a beleza dele. Quando pretende fazer a próxima? Estamos à disposição! 🚗`,
      
      general_contact: `Olá, ${cliente.nome}! Tudo bem? Da R.M. Estética Automotiva. Estamos passando para lembrar que estamos à disposição para cuidar da estética do seu carro. Qualquer dúvida ou para agendar um serviço, é só chamar! 🚗✨`,
      
      weekly_promo: `Olá, ${cliente.nome}! 📢 PROMOÇÃO DA SEMANA na R.M. Estética Automotiva! Lavagem detalhada + cera protetora por um preço imperdível. Deixe seu carro a brilhar! Vagas limitadas. Responda para agendar! 🤩`,
      
      seasonal_service: `Olá, ${cliente.nome}! A chuva chegou e com ela a dificuldade de dirigir? A cristalização de vidros repele a água e aumenta muito a sua segurança. Garanta sua visibilidade na estrada. Fale connosco e agende seu horário! 🌧️➡️☀️`,
      
      custom: customMessage || ''
    }

    const message = templates[templateType as keyof typeof templates]
    if (!message) throw new Error('Template de mensagem não encontrado')

    // Formatear o número de telefone
    const phoneNumber = cliente.telefone.replace(/\D/g, '')
    
    // Simulação de envio (em produção, integraria com WhatsApp Business API)
    console.log('Simulando envio WhatsApp:', {
      para: phoneNumber,
      mensagem: message,
      template: templateType
    })

    // Em produção, aqui faria a chamada real para a API do WhatsApp
    // Por enquanto, apenas simula o envio
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Opcional: registrar o envio no banco
    await this.createInteraction({
      cliente_id: clienteId,
      interaction_type: 'whatsapp',
      notes: `Template: ${templateType} - ${message.substring(0, 100)}...`,
      follow_up_date: null
    })
  }

  async getClienteStats(clienteId: string): Promise<{
    totalOrcamentos: number
    totalGasto: number
    servicosFinalizados: number
    ultimaInteracao: string | null
    proximoFollowUp: string | null
  }> {
    // Buscar orçamentos do cliente
    const { data: orcamentos, error: orcError } = await supabase
      .from('orcamentos')
      .select('id, status, valor_total, updated_at')
      .eq('cliente_id', clienteId)

    if (orcError) throw new Error(`Erro ao buscar orçamentos: ${orcError.message}`)

    // Buscar interações do cliente
    const { data: interacoes, error: intError } = await supabase
      .from('crm_interactions')
      .select('created_at, follow_up_date')
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false })

    if (intError) throw new Error(`Erro ao buscar interações: ${intError.message}`)

    const totalOrcamentos = orcamentos?.length || 0
    const servicosFinalizados = orcamentos?.filter(o => o.status === 'Finalizado').length || 0
    const totalGasto = orcamentos?.filter(o => o.status === 'Finalizado')
      .reduce((sum, o) => sum + (o.valor_total || 0), 0) || 0

    const ultimaInteracao = interacoes?.[0]?.created_at || null
    const proximoFollowUp = interacoes?.find(i => i.follow_up_date && new Date(i.follow_up_date) > new Date())?.follow_up_date || null

    return {
      totalOrcamentos,
      totalGasto,
      servicosFinalizados,
      ultimaInteracao,
      proximoFollowUp
    }
  }

  async getSegmentacaoClientes(): Promise<{
    novos: number
    ativos: number
    emRisco: number
    inativos: number
    perdidos: number
  }> {
    const clientesInativos = await this.getClientesInativos(1) // Todos os clientes

    const segmentacao = {
      novos: clientesInativos.filter(c => c.diasInativo <= 15).length,
      ativos: clientesInativos.filter(c => c.diasInativo <= 30).length,
      emRisco: clientesInativos.filter(c => c.diasInativo > 30 && c.diasInativo <= 60).length,
      inativos: clientesInativos.filter(c => c.diasInativo > 60 && c.diasInativo <= 90).length,
      perdidos: clientesInativos.filter(c => c.diasInativo > 90).length
    }

    return segmentacao
  }
}

export const crmService = new CRMService()
