// src/features/clientes/clientesService.ts
import { supabase } from '../../services/supabaseClient';
import { Cliente } from '../../types';

export class ClientesService {
  async getAll(): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar clientes: ${error.message}`);
    }

    return data || [];
  }

  async getById(id: string): Promise<Cliente> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Erro ao buscar cliente: ${error.message}`);
    }

    return data;
  }

  async create(clienteData: Partial<Cliente>): Promise<Cliente> {
    // Verificar se já existe cliente com o mesmo telefone
    if (clienteData.telefone) {
      const { data: existingCliente } = await supabase
        .from('clientes')
        .select('id')
        .eq('telefone', clienteData.telefone)
        .single();

      if (existingCliente) {
        throw new Error('Já existe um cliente com este telefone');
      }
    }

    const { data, error } = await supabase
      .from('clientes')
      .insert([{
        nome: clienteData.nome,
        telefone: clienteData.telefone,
        carro: clienteData.carro,
        placa: clienteData.placa?.toUpperCase(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar cliente: ${error.message}`);
    }

    return data;
  }

  async update(id: string, clienteData: Partial<Cliente>): Promise<Cliente> {
    // Verificar se já existe outro cliente com o mesmo telefone
    if (clienteData.telefone) {
      const { data: existingCliente } = await supabase
        .from('clientes')
        .select('id')
        .eq('telefone', clienteData.telefone)
        .neq('id', id)
        .single();

      if (existingCliente) {
        throw new Error('Já existe outro cliente com este telefone');
      }
    }

    const { data, error } = await supabase
      .from('clientes')
      .update({
        nome: clienteData.nome,
        telefone: clienteData.telefone,
        carro: clienteData.carro,
        placa: clienteData.placa?.toUpperCase(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar cliente: ${error.message}`);
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    // Verificar se o cliente tem orçamentos
    const { data: orcamentos } = await supabase
      .from('orcamentos')
      .select('id')
      .eq('cliente_id', id)
      .limit(1);

    if (orcamentos && orcamentos.length > 0) {
      throw new Error('Não é possível excluir cliente com orçamentos cadastrados');
    }

    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao excluir cliente: ${error.message}`);
    }
  }

  async search(searchTerm: string): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .or(`nome.ilike.%${searchTerm}%,telefone.ilike.%${searchTerm}%,carro.ilike.%${searchTerm}%,placa.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar clientes: ${error.message}`);
    }

    return data || [];
  }

  async getClientesInativos(dias: number): Promise<Cliente[]> {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - dias);

    const { data, error } = await supabase
      .from('clientes')
      .select(`
        *,
        orcamentos(
          id,
          status,
          updated_at,
          valor_total
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar clientes inativos: ${error.message}`);
    }

    // Filtrar clientes que não tiveram serviços finalizados nos últimos X dias
    const clientesInativos = data?.filter(cliente => {
      const orcamentosFinalizados = cliente.orcamentos?.filter(
        (orc: any) => orc.status === 'Finalizado'
      );

      if (!orcamentosFinalizados || orcamentosFinalizados.length === 0) {
        return true; // Cliente nunca teve serviço
      }

      const ultimoServico = orcamentosFinalizados
        .map((orc: any) => new Date(orc.updated_at))
        .sort((a, b) => b.getTime() - a.getTime())[0];

      return ultimoServico < dataLimite;
    }) || [];

    return clientesInativos;
  }

  async getClienteStats(id: string): Promise<{
    totalOrcamentos: number;
    totalGasto: number;
    servicosFinalizados: number;
    ultimoServico: Date | null;
  }> {
    const { data, error } = await supabase
      .from('orcamentos')
      .select('id, status, valor_total, updated_at')
      .eq('cliente_id', id);

    if (error) {
      throw new Error(`Erro ao buscar estatísticas do cliente: ${error.message}`);
    }

    const orcamentos = data || [];
    const servicosFinalizados = orcamentos.filter(o => o.status === 'Finalizado');
    
    const totalOrcamentos = orcamentos.length;
    const totalGasto = servicosFinalizados.reduce((sum, orc) => sum + (orc.valor_total || 0), 0);
    const ultimoServico = servicosFinalizados.length > 0 
      ? new Date(servicosFinalizados.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )[0].updated_at)
      : null;

    return {
      totalOrcamentos,
      totalGasto,
      servicosFinalizados: servicosFinalizados.length,
      ultimoServico
    };
  }
}

export const clientesService = new ClientesService();
