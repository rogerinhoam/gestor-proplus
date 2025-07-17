// src/features/clientes/clientesSlice.ts
import { StateCreator } from 'zustand';
import { Cliente } from '../../types';

export interface ClientesSlice {
  clientes: Cliente[];
  selectedCliente: Cliente | null;
  clientesLoading: boolean;
  clientesError: string | null;
  
  // Actions
  setClientes: (clientes: Cliente[]) => void;
  addCliente: (cliente: Cliente) => void;
  updateClienteStore: (id: string, cliente: Partial<Cliente>) => void;
  removeCliente: (id: string) => void;
  setSelectedCliente: (cliente: Cliente | null) => void;
  setClientesLoading: (loading: boolean) => void;
  setClientesError: (error: string | null) => void;
  
  // Computed
  getClienteById: (id: string) => Cliente | undefined;
  getClientesBySearch: (searchTerm: string) => Cliente[];
}

export const createClientesSlice: StateCreator<ClientesSlice> = (set, get) => ({
  clientes: [],
  selectedCliente: null,
  clientesLoading: false,
  clientesError: null,

  setClientes: (clientes) => set({ clientes }),

  addCliente: (cliente) => 
    set((state) => ({ 
      clientes: [cliente, ...state.clientes] 
    })),

  updateClienteStore: (id, updatedData) =>
    set((state) => ({
      clientes: state.clientes.map(cliente =>
        cliente.id === id ? { ...cliente, ...updatedData } : cliente
      ),
      selectedCliente: state.selectedCliente?.id === id 
        ? { ...state.selectedCliente, ...updatedData }
        : state.selectedCliente
    })),

  removeCliente: (id) =>
    set((state) => ({
      clientes: state.clientes.filter(cliente => cliente.id !== id),
      selectedCliente: state.selectedCliente?.id === id 
        ? null 
        : state.selectedCliente
    })),

  setSelectedCliente: (cliente) => set({ selectedCliente: cliente }),

  setClientesLoading: (loading) => set({ clientesLoading: loading }),

  setClientesError: (error) => set({ clientesError: error }),

  getClienteById: (id) => {
    const state = get();
    return state.clientes.find(cliente => cliente.id === id);
  },

  getClientesBySearch: (searchTerm) => {
    const state = get();
    if (!searchTerm.trim()) return state.clientes;
    
    const term = searchTerm.toLowerCase();
    return state.clientes.filter(cliente =>
      cliente.nome?.toLowerCase().includes(term) ||
      cliente.telefone?.includes(term) ||
      cliente.carro?.toLowerCase().includes(term) ||
      cliente.placa?.toLowerCase().includes(term)
    );
  }
});
