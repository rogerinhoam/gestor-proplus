// src/hooks/useAsyncState.ts
import { useState, useCallback, useRef, useEffect } from 'react'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
  lastFetch: Date | null
}

export interface AsyncConfig {
  initialData?: any
  retryCount?: number
  retryDelay?: number
  timeout?: number
  cache?: boolean
  cacheKey?: string
  cacheDuration?: number
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  onStart?: () => void
  onComplete?: () => void
}

export interface AsyncActions<T> {
  execute: (...args: any[]) => Promise<T>
  retry: () => Promise<T>
  reset: () => void
  refresh: () => Promise<T>
  cancel: () => void
}

/**
 * Hook principal para gerenciar estado assíncrono
 */
export function useAsyncState<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  config: AsyncConfig = {}
): AsyncState<T> & AsyncActions<T> {
  const {
    initialData = null,
    retryCount = 0,
    retryDelay = 1000,
    timeout = 10000,
    cache = false,
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5 minutos
    onSuccess,
    onError,
    onStart,
    onComplete
  } = config

  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
    lastFetch: null
  })

  const lastArgs = useRef<any[]>([])
  const abortController = useRef<AbortController | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentRetryCount = useRef(0)

  // Cache management
  const getCachedData = useCallback((key: string) => {
    if (!cache || !key) return null
    
    try {
      const cached = localStorage.getItem(`async_cache_${key}`)
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < cacheDuration) {
          return data
        } else {
          localStorage.removeItem(`async_cache_${key}`)
        }
      }
    } catch (error) {
      console.warn('Erro ao ler cache:', error)
    }
    
    return null
  }, [cache, cacheDuration])

  const setCachedData = useCallback((key: string, data: T) => {
    if (!cache || !key) return
    
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      }
      localStorage.setItem(`async_cache_${key}`, JSON.stringify(cacheData))
    } catch (error) {
      console.warn('Erro ao salvar cache:', error)
    }
  }, [cache])

  const execute = useCallback(async (...args: any[]): Promise<T> => {
    // Cancelar execução anterior se existir
    if (abortController.current) {
      abortController.current.abort()
    }

    // Limpar retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }

    lastArgs.current = args
    currentRetryCount.current = 0

    // Verificar cache primeiro
    if (cache && cacheKey) {
      const cachedData = getCachedData(cacheKey)
      if (cachedData) {
        setState(prev => ({
          ...prev,
          data: cachedData,
          loading: false,
          error: null,
          lastFetch: new Date()
        }))
        return cachedData
      }
    }

    // Criar novo AbortController
    abortController.current = new AbortController()
    const { signal } = abortController.current

    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }))

    onStart?.()

    try {
      // Implementar timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), timeout)
      })

      const result = await Promise.race([
        asyncFunction(...args),
        timeoutPromise
      ])

      // Verificar se foi cancelado
      if (signal.aborted) {
        throw new Error('Operação cancelada')
      }

      setState(prev => ({
        ...prev,
        data: result,
        loading: false,
        error: null,
        lastFetch: new Date()
      }))

      // Salvar no cache
      if (cache && cacheKey) {
        setCachedData(cacheKey, result)
      }

      onSuccess?.(result)
      onComplete?.()

      return result
    } catch (error) {
      if (signal.aborted) {
        return state.data as T
      }

      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))

      onError?.(error as Error)
      onComplete?.()

      throw error
    }
  }, [asyncFunction, cache, cacheKey, timeout, onStart, onSuccess, onError, onComplete, getCachedData, setCachedData, state.data])

  const executeWithRetry = useCallback(async (...args: any[]): Promise<T> => {
    try {
      return await execute(...args)
    } catch (error) {
      if (currentRetryCount.current < retryCount) {
        currentRetryCount.current++
        
        return new Promise((resolve, reject) => {
          retryTimeoutRef.current = setTimeout(async () => {
            try {
              const result = await executeWithRetry(...args)
              resolve(result)
            } catch (retryError) {
              reject(retryError)
            }
          }, retryDelay * currentRetryCount.current)
        })
      }
      
      throw error
    }
  }, [execute, retryCount, retryDelay])

  const retry = useCallback(async (): Promise<T> => {
    return executeWithRetry(...lastArgs.current)
  }, [executeWithRetry])

  const refresh = useCallback(async (): Promise<T> => {
    // Limpar cache se existir
    if (cache && cacheKey) {
      localStorage.removeItem(`async_cache_${cacheKey}`)
    }
    
    return executeWithRetry(...lastArgs.current)
  }, [executeWithRetry, cache, cacheKey])

  const reset = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort()
    }
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }

    setState({
      data: initialData,
      loading: false,
      error: null,
      lastFetch: null
    })

    currentRetryCount.current = 0
  }, [initialData])

  const cancel = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort()
    }
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }

    setState(prev => ({
      ...prev,
      loading: false
    }))
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort()
      }
      
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

  return {
    ...state,
    execute: retryCount > 0 ? executeWithRetry : execute,
    retry,
    reset,
    refresh,
    cancel
  }
}

/**
 * Hook para múltiplas operações assíncronas
 */
export function useAsyncStates<T extends Record<string, (...args: any[]) => Promise<any>>>(
  asyncFunctions: T
): {
  [K in keyof T]: AsyncState<Awaited<ReturnType<T[K]>>> & AsyncActions<Awaited<ReturnType<T[K]>>>
} {
  const states = {} as any

  Object.keys(asyncFunctions).forEach(key => {
    states[key] = useAsyncState(asyncFunctions[key])
  })

  return states
}

/**
 * Hook para paginação assíncrona
 */
export function useAsyncPagination<T>(
  fetchFunction: (page: number, pageSize: number) => Promise<{ data: T[], total: number }>,
  config: AsyncConfig & { initialPage?: number; initialPageSize?: number } = {}
) {
  const { initialPage = 1, initialPageSize = 10, ...asyncConfig } = config
  
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)
  
  const asyncState = useAsyncState(
    (page: number, size: number) => fetchFunction(page, size),
    asyncConfig
  )

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage)
    asyncState.execute(newPage, pageSize)
  }, [asyncState, pageSize])

  const changePageSize = useCallback((newSize: number) => {
    setPageSize(newSize)
    setPage(1)
    asyncState.execute(1, newSize)
  }, [asyncState])

  const refresh = useCallback(() => {
    asyncState.execute(page, pageSize)
  }, [asyncState, page, pageSize])

  // Auto-fetch on mount
  useEffect(() => {
    asyncState.execute(page, pageSize)
  }, [])

  return {
    ...asyncState,
    page,
    pageSize,
    goToPage,
    changePageSize,
    refresh,
    totalPages: asyncState.data ? Math.ceil(asyncState.data.total / pageSize) : 0,
    hasNextPage: asyncState.data ? page < Math.ceil(asyncState.data.total / pageSize) : false,
    hasPreviousPage: page > 1
  }
}

/**
 * Hook para polling (busca periódica)
 */
export function useAsyncPolling<T>(
  asyncFunction: () => Promise<T>,
  interval: number,
  config: AsyncConfig & { enabled?: boolean } = {}
) {
  const { enabled = true, ...asyncConfig } = config
  const asyncState = useAsyncState(asyncFunction, asyncConfig)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      asyncState.execute()
    }, interval)

    // Execute immediately
    asyncState.execute()
  }, [asyncState, interval])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      startPolling()
    } else {
      stopPolling()
    }

    return stopPolling
  }, [enabled, startPolling, stopPolling])

  return {
    ...asyncState,
    startPolling,
    stopPolling,
    isPolling: intervalRef.current !== null
  }
}

/**
 * Hook para operações que dependem uma da outra
 */
export function useAsyncChain<T1, T2>(
  firstFunction: () => Promise<T1>,
  secondFunction: (result: T1) => Promise<T2>,
  config: AsyncConfig = {}
) {
  const [firstResult, setFirstResult] = useState<T1 | null>(null)
  
  const firstState = useAsyncState(firstFunction, config)
  const secondState = useAsyncState(secondFunction, {
    ...config,
    onSuccess: (data) => {
      config.onSuccess?.(data)
    }
  })

  const executeChain = useCallback(async () => {
    try {
      const result1 = await firstState.execute()
      setFirstResult(result1)
      const result2 = await secondState.execute(result1)
      return result2
    } catch (error) {
      throw error
    }
  }, [firstState, secondState])

  const reset = useCallback(() => {
    firstState.reset()
    secondState.reset()
    setFirstResult(null)
  }, [firstState, secondState])

  return {
    firstResult,
    secondResult: secondState.data,
    loading: firstState.loading || secondState.loading,
    error: firstState.error || secondState.error,
    executeChain,
    reset,
    firstState,
    secondState
  }
}

/**
 * Hook para cache inteligente com invalidação
 */
export function useSmartCache<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  dependencies: any[] = [],
  cacheDuration: number = 5 * 60 * 1000
) {
  const [cacheKey, setCacheKey] = useState(() => 
    `${key}_${JSON.stringify(dependencies)}`
  )

  const asyncState = useAsyncState(fetchFunction, {
    cache: true,
    cacheKey,
    cacheDuration
  })

  // Invalidar cache quando dependências mudarem
  useEffect(() => {
    const newCacheKey = `${key}_${JSON.stringify(dependencies)}`
    if (newCacheKey !== cacheKey) {
      setCacheKey(newCacheKey)
      asyncState.refresh()
    }
  }, [dependencies, key, cacheKey, asyncState])

  const invalidateCache = useCallback(() => {
    localStorage.removeItem(`async_cache_${cacheKey}`)
    asyncState.refresh()
  }, [cacheKey, asyncState])

  return {
    ...asyncState,
    invalidateCache,
    cacheKey
  }
}

/**
 * Utilitários para async state
 */
export const AsyncStateUtils = {
  // Limpar todo o cache
  clearAllCache: () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('async_cache_')) {
        localStorage.removeItem(key)
      }
    })
  },

  // Obter tamanho do cache
  getCacheSize: () => {
    let totalSize = 0
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('async_cache_')) {
        totalSize += localStorage.getItem(key)?.length || 0
      }
    })
    return totalSize
  },

  // Limpar cache expirado
  clearExpiredCache: () => {
    const now = Date.now()
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('async_cache_')) {
        try {
          const cached = localStorage.getItem(key)
          if (cached) {
            const { timestamp } = JSON.parse(cached)
            if (now - timestamp > 5 * 60 * 1000) { // 5 minutos padrão
              localStorage.removeItem(key)
            }
          }
        } catch (error) {
          localStorage.removeItem(key)
        }
      }
    })
  }
}
