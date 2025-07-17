// src/features/clientes/useClientes.ts
import { useState, useCallback } from 'react';
import { Cliente } from '../../types';
import { clientesService } from './clientesService';
import { useStore } from '../../store';

export const useClientes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    clientes, 
    setClientes, 
    addCliente, 
    updateClienteStore, 
    removeCliente 
  } = useStore();

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientesService.getAll();
      setClientes(data);
    } catch (err) {
      setError('Erro ao carregar clientes');
      console.error('Erro ao fetchClientes:', err);
    } finally {
      setLoading(false);
    }
  }, [setClientes]);

  const createCliente = useCallback(async (clienteData: Partial<Cliente>) => {
    try {
      setLoading(true);
      setError(null);
      
      const newCliente = await clientesService.create(clienteData);
      addCliente(newCliente);
      
      return newCliente;
    } catch (err) {
      setError('Erro ao criar cliente');
      console.error('Erro ao createCliente:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addCliente]);

  const updateCliente = useCallback(async (id: string, clienteData: Partial<Cliente>) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedCliente = await clientesService.update(id, clienteData);
      updateClienteStore(id, updatedCliente);
      
      return updatedCliente;
    } catch (err) {
      setError('Erro ao atualizar cliente');
      console.error('Erro ao updateCliente:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateClienteStore]);

  const deleteCliente = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await clientesService.delete(id);
      removeCliente(id);
    } catch (err) {
      setError('Erro ao excluir cliente');
      console.error('Erro ao deleteCliente:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [removeCliente]);

  const searchClientes = useCallback(async (searchTerm: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await clientesService.search(searchTerm);
      setClientes(results);
    } catch (err) {
      setError('Erro ao buscar clientes');
      console.error('Erro ao searchClientes:', err);
    } finally {
      setLoading(false);
    }
  }, [setClientes]);

  const getClienteById = useCallback(async (id: string) => {
    try {
      setError(null);
      return await clientesService.getById(id);
    } catch (err) {
      setError('Erro ao buscar cliente');
      console.error('Erro ao getClienteById:', err);
      throw err;
    }
  }, []);

  return {
    clientes,
    loading,
    error,
    fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
    searchClientes,
    getClienteById
  };
};
