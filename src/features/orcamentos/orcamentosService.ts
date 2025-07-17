// src/features/orcamentos/orcamentosService.ts
import { supabase } from '../../services/supabaseClient';
import { Orcamento, OrcamentoItem } from '../../types';

export class OrcamentosService {
  async getAll(): Promise<Orcamento[]> {
    const { data, error } = await supabase
      .from('orcamentos')
      .select(`
        *,
        clientes (
          id,
          nome,
          telefone,
          carro,
          placa
        ),
        orcamento_itens (
          id,
          servico_id,
          descricao_servico,
          valor_cobrado,
          quantidade
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar orçamentos: ${error.message}`);
    }

    return data || [];
  }

  async getById(id: string): Promise<Orcamento> {
    const { data, error } = await supabase
      .from('orcamentos')
      .select(`
        *,
        clientes (
          id,
          nome,
          telefone,
          carro,
          placa
        ),
        orcamento_itens (
          id,
          servico_id,
          descricao_servico,
          valor_cobrado,
          quantidade
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Erro ao buscar orçamento: ${error.message}`);
    }

    return data;
  }

  async create(orcamentoData: Partial<Orcamento>): Promise<Orcamento> {
    const { orcamento_itens, ...orcamentoBase } = orcamentoData;

    // Criar o orçamento
    const { data: orcamento, error: orcamentoError } = await supabase
      .from('orcamentos')
      .insert([{
        cliente_id: orcamentoBase.cliente_id,
        valor_total: orcamentoBase.valor_total,
        status: orcamentoBase.status || 'Orçamento',
        desconto: orcamentoBase.desconto || 0,
        formas_pagamento: orcamentoBase.formas_pagamento,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (orcamentoError) {
      throw new Error(`Erro ao criar orçamento: ${orcamentoError.message}`);
    }

    // Criar os itens do orçamento
    if (orcamento_itens && orcamento_itens.length > 0) {
      const itens = orcamento_itens.map(item => ({
        orcamento_id: orcamento.id,
        servico_id: item.servico_id,
        descricao_servico: item.descricao_servico,
        valor_cobrado: item.valor_cobrado,
        quantidade: item.quantidade
      }));

      const { error: itensError } = await supabase
        .from('orcamento_itens')
        .insert(itens);

      if (itensError) {
        // Rollback: deletar o orçamento criado
        await supabase.from('orcamentos').delete().eq('id', orcamento.id);
        throw new Error(`Erro ao criar itens do orçamento: ${itensError.message}`);
      }
    }

    // Retornar o orçamento completo
    return this.getById(orcamento.id);
  }

  async update(id: string, orcamentoData: Partial<Orcamento>): Promise<Orcamento> {
    const { orcamento_itens, ...orcamentoBase } = orcamentoData;

    // Atualizar o orçamento
    const { error: orcamentoError } = await supabase
      .from('orcamentos')
      .update({
        cliente_id: orcamentoBase.cliente_id,
        valor_total: orcamentoBase.valor_total,
        status: orcamentoBase.status,
        desconto: orcamentoBase.desconto,
        formas_pagamento: orcamentoBase.formas_pagamento,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (orcamentoError) {
      throw new Error(`Erro ao atualizar orçamento: ${orcamentoError.message}`);
    }

    // Atualizar itens se fornecidos
    if (orcamento_itens) {
      // Deletar itens existentes
      await supabase
        .from('orcamento_itens')
        .delete()
        .eq('orcamento_id', id);

      // Criar novos itens
      if (orcamento_itens.length > 0) {
        const itens = orcamento_itens.map(item => ({
          orcamento_id: id,
          servico_id: item.servico_id,
          descricao_servico: item.descricao_servico,
          valor_cobrado: item.valor_cobrado,
          quantidade: item.quantidade
        }));

        const { error: itensError } = await supabase
          .from('orcamento_itens')
          .insert(itens);

        if (itensError) {
          throw new Error(`Erro ao atualizar itens do orçamento: ${itensError.message}`);
        }
      }
    }

    // Retornar o orçamento atualizado
    return this.getById(id);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('orcamentos')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao excluir orçamento: ${error.message}`);
    }
  }

  async getByStatus(status: string): Promise<Orcamento[]> {
    const { data, error } = await supabase
      .from('orcamentos')
      .select(`
        *,
        clientes (
          id,
          nome,
          telefone,
          carro,
          placa
        ),
        orcamento_itens (
          id,
          servico_id,
          descricao_servico,
          valor_cobrado,
          quantidade
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar orçamentos por status: ${error.message}`);
    }

    return data || [];
  }

  async getByClienteId(clienteId: string): Promise<Orcamento[]> {
    const { data, error } = await supabase
      .from('orcamentos')
      .select(`
        *,
        clientes (
          id,
          nome,
          telefone,
          carro,
          placa
        ),
        orcamento_itens (
          id,
          servico_id,
          descricao_servico,
          valor_cobrado,
          quantidade
        )
      `)
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar orçamentos do cliente: ${error.message}`);
    }

    return data || [];
  }

  async getOrcamentosRecentChanges(days: number = 30): Promise<Orcamento[]> {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - days);

    const { data, error } = await supabase
      .from('orcamentos')
      .select(`
        *,
        clientes (
          id,
          nome,
          telefone,
          carro,
          placa
        ),
        orcamento_itens (
          id,
          servico_id,
          descricao_servico,
          valor_cobrado,
          quantidade
        )
      `)
      .gte('updated_at', dataLimite.toISOString())
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar orçamentos recentes: ${error.message}`);
    }

    return data || [];
  }
}

export const orcamentosService = new OrcamentosService();
