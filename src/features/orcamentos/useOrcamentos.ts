// src/features/orcamentos/useOrcamentos.ts
import { useState, useCallback } from 'react';
import { Orcamento } from '../../types';
import { orcamentosService } from './orcamentosService';
import { useStore } from '../../store';

export const useOrcamentos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    orcamentos, 
    setOrcamentos, 
    addOrcamento, 
    updateOrcamentoStore, 
    removeOrcamento 
  } = useStore();

  const fetchOrcamentos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orcamentosService.getAll();
      setOrcamentos(data);
    } catch (err) {
      setError('Erro ao carregar orçamentos');
      console.error('Erro ao fetchOrcamentos:', err);
    } finally {
      setLoading(false);
    }
  }, [setOrcamentos]);

  const createOrcamento = useCallback(async (orcamentoData: Partial<Orcamento>) => {
    try {
      setLoading(true);
      setError(null);
      
      const newOrcamento = await orcamentosService.create(orcamentoData);
      addOrcamento(newOrcamento);
      
      return newOrcamento;
    } catch (err) {
      setError('Erro ao criar orçamento');
      console.error('Erro ao createOrcamento:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addOrcamento]);

  const updateOrcamento = useCallback(async (id: string, orcamentoData: Partial<Orcamento>) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedOrcamento = await orcamentosService.update(id, orcamentoData);
      updateOrcamentoStore(id, updatedOrcamento);
      
      return updatedOrcamento;
    } catch (err) {
      setError('Erro ao atualizar orçamento');
      console.error('Erro ao updateOrcamento:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateOrcamentoStore]);

  const deleteOrcamento = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await orcamentosService.delete(id);
      removeOrcamento(id);
    } catch (err) {
      setError('Erro ao excluir orçamento');
      console.error('Erro ao deleteOrcamento:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [removeOrcamento]);

  const getOrcamentosByStatus = useCallback(async (status: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await orcamentosService.getByStatus(status);
      return results;
    } catch (err) {
      setError('Erro ao buscar orçamentos por status');
      console.error('Erro ao getOrcamentosByStatus:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrcamentosByClienteId = useCallback(async (clienteId: string) => {
    try {
      setError(null);
      return await orcamentosService.getByClienteId(clienteId);
    } catch (err) {
      setError('Erro ao buscar orçamentos do cliente');
      console.error('Erro ao getOrcamentosByClienteId:', err);
      return [];
    }
  }, []);

  return {
    orcamentos,
    loading,
    error,
    fetchOrcamentos,
    createOrcamento,
    updateOrcamento,
    deleteOrcamento,
    getOrcamentosByStatus,
    getOrcamentosByClienteId
  };
};
