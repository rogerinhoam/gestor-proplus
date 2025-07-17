import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { devtools, persist } from 'zustand/middleware'

import type { 
  Cliente, 
  Orcamento, 
  Servico, 
  Agendamento, 
  Despesa, 
  ContaReceber,
  CRMInteraction,
  ConfiguracaoSistema,
  DashboardMetrics
} from '@/types'

/**
 * Estado global da aplicação R.M. Estética PRO+ v2.0
 * 
 * Utiliza Zustand para gerenciamento de estado com:
 * - Persistência local
 * - DevTools para debug
 * - Subscriptions para reatividade
 * - Middleware para funcionalidades avançadas
 */
interface AppState {
  // Estados de dados
  clientes: Cliente[]
  orcamentos: Orcamento[]
  servicos: Servico[]
  agendamentos: Agendamento[]
  despesas: Despesa[]
  contasReceber: ContaReceber[]
  crmInteractions: CRMInteraction[]
  configuracoes: ConfiguracaoSistema[]
  dashboardMetrics: DashboardMetrics | null

  // Estados de UI
  isLoading: boolean
  isInitialized: boolean
  currentView: string
  sidebarOpen: boolean
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    timestamp: Date
  }>
  
  // Estados de filtros
  filters: {
    clientes: {
      search: string
      status: string
      periodo: string
    }
    orcamentos: {
      search: string
      status: string
      cliente: string
      periodo: string
    }
    agendamentos: {
      data: string
      status: string
      cliente: string
    }
    despesas: {
      periodo: string
      categoria: string
    }
    crm: {
      tipo: string
      periodo: string
    }
  }

  // Estados de conectividade
  isOnline: boolean
  lastSync: Date | null
  syncErrors: string[]

  // Actions para dados
  setClientes: (clientes: Cliente[]) => void
  addCliente: (cliente: Cliente) => void
  updateCliente: (id: string, cliente: Partial<Cliente>) => void
  deleteCliente: (id: string) => void

  setOrcamentos: (orcamentos: Orcamento[]) => void
  addOrcamento: (orcamento: Orcamento) => void
  updateOrcamento: (id: string, orcamento: Partial<Orcamento>) => void
  deleteOrcamento: (id: string) => void

  setServicos: (servicos: Servico[]) => void
  addServico: (servico: Servico) => void
  updateServico: (id: string, servico: Partial<Servico>) => void
  deleteServico: (id: string) => void

  setAgendamentos: (agendamentos: Agendamento[]) => void
  addAgendamento: (agendamento: Agendamento) => void
  updateAgendamento: (id: string, agendamento: Partial<Agendamento>) => void
  deleteAgendamento: (id: string) => void

  setDespesas: (despesas: Despesa[]) => void
  addDespesa: (despesa: Despesa) => void
  updateDespesa: (id: string, despesa: Partial<Despesa>) => void
  deleteDespesa: (id: string) => void

  setContasReceber: (contas: ContaReceber[]) => void
  addContaReceber: (conta: ContaReceber) => void
  updateContaReceber: (id: string, conta: Partial<ContaReceber>) => void
  deleteContaReceber: (id: string) => void

  setCRMInteractions: (interactions: CRMInteraction[]) => void
  addCRMInteraction: (interaction: CRMInteraction) => void
  updateCRMInteraction: (id: string, interaction: Partial<CRMInteraction>) => void
  deleteCRMInteraction: (id: string) => void

  setConfiguracoes: (configuracoes: ConfiguracaoSistema[]) => void
  updateConfiguracao: (chave: string, valor: string) => void

  setDashboardMetrics: (metrics: DashboardMetrics) => void

  // Actions para UI
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  setCurrentView: (view: string) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void

  // Actions para filtros
  setClientesFilter: (filter: Partial<AppState['filters']['clientes']>) => void
  setOrcamentosFilter: (filter: Partial<AppState['filters']['orcamentos']>) => void
  setAgendamentosFilter: (filter: Partial<AppState['filters']['agendamentos']>) => void
  setDespesasFilter: (filter: Partial<AppState['filters']['despesas']>) => void
  setCRMFilter: (filter: Partial<AppState['filters']['crm']>) => void
  clearAllFilters: () => void

  // Actions para conectividade
  setOnline: (online: boolean) => void
  setLastSync: (date: Date) => void
  addSyncError: (error: string) => void
  clearSyncErrors: () => void

  // Actions utilitárias
  reset: () => void
  hydrate: () => void
}

/**
 * Estado inicial da aplicação
 */
const initialState = {
  // Estados de dados
  clientes: [],
  orcamentos: [],
  servicos: [],
  agendamentos: [],
  despesas: [],
  contasReceber: [],
  crmInteractions: [],
  configuracoes: [],
  dashboardMetrics: null,

  // Estados de UI
  isLoading: false,
  isInitialized: false,
  currentView: 'dashboard',
  sidebarOpen: true,
  notifications: [],

  // Estados de filtros
  filters: {
    clientes: {
      search: '',
      status: '',
      periodo: ''
    },
    orcamentos: {
      search: '',
      status: '',
      cliente: '',
      periodo: ''
    },
    agendamentos: {
      data: '',
      status: '',
      cliente: ''
    },
    despesas: {
      periodo: '',
      categoria: ''
    },
    crm: {
      tipo: '',
      periodo: ''
    }
  },

  // Estados de conectividade
  isOnline: navigator.onLine,
  lastSync: null,
  syncErrors: []
}

/**
 * Store principal da aplicação
 */
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      subscribeWithSelector(
        (set, get) => ({
          ...initialState,

          // Actions para dados
          setClientes: (clientes) => set({ clientes }),
          addCliente: (cliente) => set((state) => ({ 
            clientes: [...state.clientes, cliente] 
          })),
          updateCliente: (id, cliente) => set((state) => ({
            clientes: state.clientes.map(c => c.id === id ? { ...c, ...cliente } : c)
          })),
          deleteCliente: (id) => set((state) => ({
            clientes: state.clientes.filter(c => c.id !== id)
          })),

          setOrcamentos: (orcamentos) => set({ orcamentos }),
          addOrcamento: (orcamento) => set((state) => ({ 
            orcamentos: [...state.orcamentos, orcamento] 
          })),
          updateOrcamento: (id, orcamento) => set((state) => ({
            orcamentos: state.orcamentos.map(o => o.id === id ? { ...o, ...orcamento } : o)
          })),
          deleteOrcamento: (id) => set((state) => ({
            orcamentos: state.orcamentos.filter(o => o.id !== id)
          })),

          setServicos: (servicos) => set({ servicos }),
          addServico: (servico) => set((state) => ({ 
            servicos: [...state.servicos, servico] 
          })),
          updateServico: (id, servico) => set((state) => ({
            servicos: state.servicos.map(s => s.id === id ? { ...s, ...servico } : s)
          })),
          deleteServico: (id) => set((state) => ({
            servicos: state.servicos.filter(s => s.id !== id)
          })),

          setAgendamentos: (agendamentos) => set({ agendamentos }),
          addAgendamento: (agendamento) => set((state) => ({ 
            agendamentos: [...state.agendamentos, agendamento] 
          })),
          updateAgendamento: (id, agendamento) => set((state) => ({
            agendamentos: state.agendamentos.map(a => a.id === id ? { ...a, ...agendamento } : a)
          })),
          deleteAgendamento: (id) => set((state) => ({
            agendamentos: state.agendamentos.filter(a => a.id !== id)
          })),

          setDespesas: (despesas) => set({ despesas }),
          addDespesa: (despesa) => set((state) => ({ 
            despesas: [...state.despesas, despesa] 
          })),
          updateDespesa: (id, despesa) => set((state) => ({
            despesas: state.despesas.map(d => d.id === id ? { ...d, ...despesa } : d)
          })),
          deleteDespesa: (id) => set((state) => ({
            despesas: state.despesas.filter(d => d.id !== id)
          })),

          setContasReceber: (contas) => set({ contasReceber: contas }),
          addContaReceber: (conta) => set((state) => ({ 
            contasReceber: [...state.contasReceber, conta] 
          })),
          updateContaReceber: (id, conta) => set((state) => ({
            contasReceber: state.contasReceber.map(c => c.id === id ? { ...c, ...conta } : c)
          })),
          deleteContaReceber: (id) => set((state) => ({
            contasReceber: state.contasReceber.filter(c => c.id !== id)
          })),

          setCRMInteractions: (interactions) => set({ crmInteractions: interactions }),
          addCRMInteraction: (interaction) => set((state) => ({ 
            crmInteractions: [...state.crmInteractions, interaction] 
          })),
          updateCRMInteraction: (id, interaction) => set((state) => ({
            crmInteractions: state.crmInteractions.map(i => i.id === id ? { ...i, ...interaction } : i)
          })),
          deleteCRMInteraction: (id) => set((state) => ({
            crmInteractions: state.crmInteractions.filter(i => i.id !== id)
          })),

          setConfiguracoes: (configuracoes) => set({ configuracoes }),
          updateConfiguracao: (chave, valor) => set((state) => ({
            configuracoes: state.configuracoes.map(c => 
              c.chave === chave ? { ...c, valor } : c
            )
          })),

          setDashboardMetrics: (metrics) => set({ dashboardMetrics: metrics }),

          // Actions para UI
          setLoading: (loading) => set({ isLoading: loading }),
          setInitialized: (initialized) => set({ isInitialized: initialized }),
          setCurrentView: (view) => set({ currentView: view }),
          setSidebarOpen: (open) => set({ sidebarOpen: open }),
          toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
          
          addNotification: (notification) => set((state) => ({ 
            notifications: [...state.notifications, { 
              ...notification, 
              id: crypto.randomUUID(), 
              timestamp: new Date() 
            }] 
          })),
          removeNotification: (id) => set((state) => ({
            notifications: state.notifications.filter(n => n.id !== id)
          })),
          clearNotifications: () => set({ notifications: [] }),

          // Actions para filtros
          setClientesFilter: (filter) => set((state) => ({
            filters: { ...state.filters, clientes: { ...state.filters.clientes, ...filter } }
          })),
          setOrcamentosFilter: (filter) => set((state) => ({
            filters: { ...state.filters, orcamentos: { ...state.filters.orcamentos, ...filter } }
          })),
          setAgendamentosFilter: (filter) => set((state) => ({
            filters: { ...state.filters, agendamentos: { ...state.filters.agendamentos, ...filter } }
          })),
          setDespesasFilter: (filter) => set((state) => ({
            filters: { ...state.filters, despesas: { ...state.filters.despesas, ...filter } }
          })),
          setCRMFilter: (filter) => set((state) => ({
            filters: { ...state.filters, crm: { ...state.filters.crm, ...filter } }
          })),
          clearAllFilters: () => set({ filters: initialState.filters }),

          // Actions para conectividade
          setOnline: (online) => set({ isOnline: online }),
          setLastSync: (date) => set({ lastSync: date }),
          addSyncError: (error) => set((state) => ({
            syncErrors: [...state.syncErrors, error]
          })),
          clearSyncErrors: () => set({ syncErrors: [] }),

          // Actions utilitárias
          reset: () => set(initialState),
          hydrate: () => {
            // Lógica de hidratação personalizada se necessário
            console.log('Store hidratado com sucesso')
          }
        })
      ),
      {
        name: 'rm-estetica-store',
        version: 1,
        partialize: (state) => ({
          // Apenas persistir dados importantes, não UI state
          clientes: state.clientes,
          orcamentos: state.orcamentos,
          servicos: state.servicos,
          agendamentos: state.agendamentos,
          despesas: state.despesas,
          contasReceber: state.contasReceber,
          crmInteractions: state.crmInteractions,
          configuracoes: state.configuracoes,
          filters: state.filters,
          sidebarOpen: state.sidebarOpen,
          currentView: state.currentView,
        })
      }
    ),
    {
      name: 'rm-estetica-store'
    }
  )
)

// Seletores úteis
export const useClientes = () => useAppStore((state) => state.clientes)
export const useOrcamentos = () => useAppStore((state) => state.orcamentos)
export const useServicos = () => useAppStore((state) => state.servicos)
export const useAgendamentos = () => useAppStore((state) => state.agendamentos)
export const useDespesas = () => useAppStore((state) => state.despesas)
export const useContasReceber = () => useAppStore((state) => state.contasReceber)
export const useCRMInteractions = () => useAppStore((state) => state.crmInteractions)
export const useConfiguracoes = () => useAppStore((state) => state.configuracoes)
export const useDashboardMetrics = () => useAppStore((state) => state.dashboardMetrics)

export const useLoadingState = () => useAppStore((state) => state.isLoading)
export const useInitializedState = () => useAppStore((state) => state.isInitialized)
export const useCurrentView = () => useAppStore((state) => state.currentView)
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen)
export const useNotifications = () => useAppStore((state) => state.notifications)
export const useFilters = () => useAppStore((state) => state.filters)
export const useOnlineState = () => useAppStore((state) => state.isOnline)

// Listener para mudanças de conectividade
window.addEventListener('online', () => useAppStore.getState().setOnline(true))
window.addEventListener('offline', () => useAppStore.getState().setOnline(false))