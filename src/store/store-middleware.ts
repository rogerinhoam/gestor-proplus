import { StateCreator } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import toast from 'react-hot-toast'

import { supabaseClient } from '@/services/supabaseClient'
import { formatDateTime } from '@/utils/formatting'

/**
 * Middleware personalizado para sincronização com Supabase
 * 
 * Funcionalidades:
 * - Sincronização automática com Supabase
 * - Retry automático em caso de falha
 * - Notificações de sincronização
 * - Cache local para offline
 * - Logging de ações
 */

interface SyncState {
  lastSync: Date | null
  syncErrors: string[]
  isSyncing: boolean
  retryCount: number
}

interface SyncActions {
  sync: () => Promise<void>
  forceSync: () => Promise<void>
  resetSync: () => void
  addSyncError: (error: string) => void
  clearSyncErrors: () => void
}

export interface SyncSlice extends SyncState, SyncActions {}

/**
 * Middleware de sincronização com Supabase
 */
export const createSyncMiddleware = <T extends SyncSlice>(
  initializer: StateCreator<T, [], [], T>
) => {
  return subscribeWithSelector<T>((set, get, api) => ({
    ...initializer(set, get, api),
    
    // Estado inicial de sincronização
    lastSync: null,
    syncErrors: [],
    isSyncing: false,
    retryCount: 0,

    // Sincronização automática
    sync: async () => {
      const state = get()
      
      if (state.isSyncing) {
        console.log('Sincronização já em andamento, ignorando...')
        return
      }

      set({ isSyncing: true } as Partial<T>)

      try {
        console.log('🔄 Iniciando sincronização com Supabase...')
        
        // Sincronizar cada entidade
        await Promise.all([
          syncClientes(state, set),
          syncOrcamentos(state, set),
          syncServicos(state, set),
          syncAgendamentos(state, set),
          syncDespesas(state, set),
          syncCRMInteractions(state, set),
          syncConfiguracoes(state, set),
        ])

        set({ 
          lastSync: new Date(),
          syncErrors: [],
          retryCount: 0,
          isSyncing: false
        } as Partial<T>)

        console.log('✅ Sincronização concluída com sucesso')
        
        // Notificação de sucesso apenas se houve dados sincronizados
        if (state.retryCount > 0) {
          toast.success('Dados sincronizados com sucesso')
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        
        console.error('❌ Erro na sincronização:', errorMessage)
        
        set((state) => ({
          syncErrors: [...state.syncErrors, errorMessage],
          retryCount: state.retryCount + 1,
          isSyncing: false
        }) as Partial<T>)

        // Retry automático com backoff exponencial
        if (state.retryCount < 3) {
          const delay = Math.pow(2, state.retryCount) * 1000 // 1s, 2s, 4s
          setTimeout(() => {
            console.log(`🔄 Tentativa ${state.retryCount + 1} de sincronização em ${delay}ms`)
            get().sync()
          }, delay)
        } else {
          toast.error('Erro na sincronização. Verifique sua conexão.')
        }
      }
    },

    // Sincronização forçada (manual)
    forceSync: async () => {
      set({ retryCount: 0 } as Partial<T>)
      await get().sync()
    },

    // Reset do estado de sincronização
    resetSync: () => {
      set({
        lastSync: null,
        syncErrors: [],
        isSyncing: false,
        retryCount: 0
      } as Partial<T>)
    },

    // Adicionar erro de sincronização
    addSyncError: (error: string) => {
      set((state) => ({
        syncErrors: [...state.syncErrors, `${formatDateTime(new Date())}: ${error}`]
      }) as Partial<T>)
    },

    // Limpar erros de sincronização
    clearSyncErrors: () => {
      set({ syncErrors: [] } as Partial<T>)
    }
  }))
}

/**
 * Funções auxiliares de sincronização por entidade
 */

async function syncClientes(state: any, set: any) {
  try {
    const { data, error } = await supabaseClient
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    set({ clientes: data || [] })
    console.log(`📋 Sincronizados ${data?.length || 0} clientes`)
  } catch (error) {
    console.error('Erro ao sincronizar clientes:', error)
    throw error
  }
}

async function syncOrcamentos(state: any, set: any) {
  try {
    const { data, error } = await supabaseClient
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
          quantidade,
          servicos (
            id,
            descricao,
            valor
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    set({ orcamentos: data || [] })
    console.log(`📋 Sincronizados ${data?.length || 0} orçamentos`)
  } catch (error) {
    console.error('Erro ao sincronizar orçamentos:', error)
    throw error
  }
}

async function syncServicos(state: any, set: any) {
  try {
    const { data, error } = await supabaseClient
      .from('servicos')
      .select('*')
      .order('descricao', { ascending: true })

    if (error) throw error

    set({ servicos: data || [] })
    console.log(`📋 Sincronizados ${data?.length || 0} serviços`)
  } catch (error) {
    console.error('Erro ao sincronizar serviços:', error)
    throw error
  }
}

async function syncAgendamentos(state: any, set: any) {
  try {
    const { data, error } = await supabaseClient
      .from('agendamentos')
      .select(`
        *,
        clientes (
          id,
          nome,
          telefone,
          carro,
          placa
        ),
        servicos (
          id,
          descricao,
          valor
        )
      `)
      .order('data_hora', { ascending: true })

    if (error) throw error

    set({ agendamentos: data || [] })
    console.log(`📋 Sincronizados ${data?.length || 0} agendamentos`)
  } catch (error) {
    console.error('Erro ao sincronizar agendamentos:', error)
    throw error
  }
}

async function syncDespesas(state: any, set: any) {
  try {
    const { data, error } = await supabaseClient
      .from('despesas')
      .select('*')
      .order('data', { ascending: false })

    if (error) throw error

    set({ despesas: data || [] })
    console.log(`📋 Sincronizadas ${data?.length || 0} despesas`)
  } catch (error) {
    console.error('Erro ao sincronizar despesas:', error)
    throw error
  }
}

async function syncCRMInteractions(state: any, set: any) {
  try {
    const { data, error } = await supabaseClient
      .from('crm_interactions')
      .select(`
        *,
        clientes (
          id,
          nome,
          telefone,
          carro,
          placa
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    set({ crmInteractions: data || [] })
    console.log(`📋 Sincronizadas ${data?.length || 0} interações CRM`)
  } catch (error) {
    console.error('Erro ao sincronizar interações CRM:', error)
    throw error
  }
}

async function syncConfiguracoes(state: any, set: any) {
  try {
    const { data, error } = await supabaseClient
      .from('configuracoes_sistema')
      .select('*')
      .order('chave', { ascending: true })

    if (error) throw error

    set({ configuracoes: data || [] })
    console.log(`📋 Sincronizadas ${data?.length || 0} configurações`)
  } catch (error) {
    console.error('Erro ao sincronizar configurações:', error)
    throw error
  }
}

/**
 * Middleware de logging para debug
 */
export const createLoggingMiddleware = <T>(
  initializer: StateCreator<T, [], [], T>
) => {
  return (set: any, get: any, api: any) => {
    const loggedSet = (...args: any[]) => {
      if (import.meta.env.DEV) {
        console.log('🔄 Store Update:', args)
      }
      return set(...args)
    }

    return initializer(loggedSet, get, api)
  }
}

/**
 * Middleware de cache para otimização
 */
export const createCacheMiddleware = <T>(
  initializer: StateCreator<T, [], [], T>
) => {
  const cache = new Map()

  return (set: any, get: any, api: any) => {
    const cachedSet = (...args: any[]) => {
      const key = JSON.stringify(args)
      
      if (cache.has(key)) {
        console.log('📦 Cache hit:', key)
        return cache.get(key)
      }

      const result = set(...args)
      cache.set(key, result)
      
      // Limpar cache após 5 minutos
      setTimeout(() => {
        cache.delete(key)
      }, 5 * 60 * 1000)

      return result
    }

    return initializer(cachedSet, get, api)
  }
}

/**
 * Middleware de performance para monitoramento
 */
export const createPerformanceMiddleware = <T>(
  initializer: StateCreator<T, [], [], T>
) => {
  return (set: any, get: any, api: any) => {
    const performanceSet = (...args: any[]) => {
      if (import.meta.env.DEV) {
        const startTime = performance.now()
        const result = set(...args)
        const endTime = performance.now()
        
        console.log(`⚡ Store Update Performance: ${endTime - startTime}ms`)
        
        return result
      }
      
      return set(...args)
    }

    return initializer(performanceSet, get, api)
  }
}