// src/hooks/useLocalStorage.ts
import { useState, useEffect, useCallback } from 'react'

/**
 * Hook para gerenciar dados no localStorage de forma reativa
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Erro ao ler localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Função para atualizar o valor
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
      
      // Disparar evento customizado para sincronizar entre abas
      window.dispatchEvent(new CustomEvent('localStorage-change', {
        detail: { key, value: valueToStore }
      }))
    } catch (error) {
      console.error(`Erro ao salvar no localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  // Função para remover o valor
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
      
      window.dispatchEvent(new CustomEvent('localStorage-change', {
        detail: { key, value: null }
      }))
    } catch (error) {
      console.error(`Erro ao remover localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  // Escutar mudanças do localStorage (entre abas)
  useEffect(() => {
    const handleStorageChange = (e: CustomEvent) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.value ?? initialValue)
      }
    }

    const handleNativeStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.error(`Erro ao parsear localStorage change para key "${key}":`, error)
        }
      }
    }

    window.addEventListener('localStorage-change', handleStorageChange as EventListener)
    window.addEventListener('storage', handleNativeStorageChange)

    return () => {
      window.removeEventListener('localStorage-change', handleStorageChange as EventListener)
      window.removeEventListener('storage', handleNativeStorageChange)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

/**
 * Hook para gerenciar múltiplas chaves do localStorage
 */
export function useMultipleLocalStorage<T extends Record<string, any>>(
  keys: T,
  prefix?: string
): {
  values: T
  setValue: <K extends keyof T>(key: K, value: T[K]) => void
  setValues: (values: Partial<T>) => void
  removeValue: <K extends keyof T>(key: K) => void
  removeAll: () => void
} {
  const [values, setValues] = useState<T>(() => {
    const stored = {} as T
    
    Object.keys(keys).forEach(key => {
      const storageKey = prefix ? `${prefix}_${key}` : key
      try {
        const item = window.localStorage.getItem(storageKey)
        stored[key as keyof T] = item ? JSON.parse(item) : keys[key as keyof T]
      } catch (error) {
        stored[key as keyof T] = keys[key as keyof T]
      }
    })
    
    return stored
  })

  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    const storageKey = prefix ? `${prefix}_${String(key)}` : String(key)
    
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value))
      setValues(prev => ({ ...prev, [key]: value }))
    } catch (error) {
      console.error(`Erro ao salvar localStorage key "${storageKey}":`, error)
    }
  }, [prefix])

  const setMultipleValues = useCallback((newValues: Partial<T>) => {
    Object.entries(newValues).forEach(([key, value]) => {
      const storageKey = prefix ? `${prefix}_${key}` : key
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(value))
      } catch (error) {
        console.error(`Erro ao salvar localStorage key "${storageKey}":`, error)
      }
    })
    
    setValues(prev => ({ ...prev, ...newValues }))
  }, [prefix])

  const removeValue = useCallback(<K extends keyof T>(key: K) => {
    const storageKey = prefix ? `${prefix}_${String(key)}` : String(key)
    
    try {
      window.localStorage.removeItem(storageKey)
      setValues(prev => ({ ...prev, [key]: keys[key] }))
    } catch (error) {
      console.error(`Erro ao remover localStorage key "${storageKey}":`, error)
    }
  }, [keys, prefix])

  const removeAll = useCallback(() => {
    Object.keys(keys).forEach(key => {
      const storageKey = prefix ? `${prefix}_${key}` : key
      try {
        window.localStorage.removeItem(storageKey)
      } catch (error) {
        console.error(`Erro ao remover localStorage key "${storageKey}":`, error)
      }
    })
    
    setValues(keys)
  }, [keys, prefix])

  return {
    values,
    setValue,
    setValues: setMultipleValues,
    removeValue,
    removeAll
  }
}

/**
 * Hook para localStorage com validação
 */
export function useValidatedLocalStorage<T>(
  key: string,
  initialValue: T,
  validator: (value: any) => value is T
): [T, (value: T) => void, () => void, string | null] {
  const [error, setError] = useState<string | null>(null)

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        const parsed = JSON.parse(item)
        if (validator(parsed)) {
          setError(null)
          return parsed
        } else {
          setError('Dados inválidos no localStorage')
          return initialValue
        }
      }
      return initialValue
    } catch (error) {
      setError('Erro ao ler localStorage')
      return initialValue
    }
  })

  const setValue = useCallback((value: T) => {
    if (!validator(value)) {
      setError('Valor inválido')
      return
    }

    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
      setError(null)
    } catch (error) {
      setError('Erro ao salvar no localStorage')
    }
  }, [key, validator])

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
      setError(null)
    } catch (error) {
      setError('Erro ao remover do localStorage')
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue, error]
}

/**
 * Hook para localStorage com compressão
 */
export function useCompressedLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void, () => void] {
  const compress = (data: T): string => {
    // Implementação simples de compressão (base64)
    const jsonString = JSON.stringify(data)
    return btoa(jsonString)
  }

  const decompress = (compressedData: string): T => {
    try {
      const jsonString = atob(compressedData)
      return JSON.parse(jsonString)
    } catch (error) {
      throw new Error('Erro ao descomprimir dados')
    }
  }

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? decompress(item) : initialValue
    } catch (error) {
      console.error(`Erro ao ler localStorage comprimido key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T) => {
    try {
      const compressed = compress(value)
      setStoredValue(value)
      window.localStorage.setItem(key, compressed)
    } catch (error) {
      console.error(`Erro ao salvar localStorage comprimido key "${key}":`, error)
    }
  }, [key])

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.error(`Erro ao remover localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

/**
 * Hook para localStorage com expiração
 */
export function useExpiringLocalStorage<T>(
  key: string,
  initialValue: T,
  expirationMinutes: number
): [T, (value: T) => void, () => void, boolean] {
  const [isExpired, setIsExpired] = useState(false)

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        const { value, timestamp } = JSON.parse(item)
        const now = Date.now()
        const expirationTime = timestamp + (expirationMinutes * 60 * 1000)
        
        if (now < expirationTime) {
          setIsExpired(false)
          return value
        } else {
          setIsExpired(true)
          window.localStorage.removeItem(key)
        }
      }
      return initialValue
    } catch (error) {
      console.error(`Erro ao ler localStorage com expiração key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T) => {
    try {
      const item = {
        value,
        timestamp: Date.now()
      }
      setStoredValue(value)
      setIsExpired(false)
      window.localStorage.setItem(key, JSON.stringify(item))
    } catch (error) {
      console.error(`Erro ao salvar localStorage com expiração key "${key}":`, error)
    }
  }, [key])

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
      setIsExpired(false)
    } catch (error) {
      console.error(`Erro ao remover localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  // Verificar expiração periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const item = window.localStorage.getItem(key)
        if (item) {
          const { timestamp } = JSON.parse(item)
          const now = Date.now()
          const expirationTime = timestamp + (expirationMinutes * 60 * 1000)
          
          if (now >= expirationTime) {
            setIsExpired(true)
            setStoredValue(initialValue)
            window.localStorage.removeItem(key)
          }
        }
      } catch (error) {
        console.error('Erro ao verificar expiração:', error)
      }
    }, 60000) // Verificar a cada minuto

    return () => clearInterval(interval)
  }, [key, expirationMinutes, initialValue])

  return [storedValue, setValue, removeValue, isExpired]
}

/**
 * Hook para sincronizar estado com localStorage
 */
export function useSyncedLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue, removeValue] = useLocalStorage(key, initialValue)

  const syncedSetValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(newValue)
  }, [setValue])

  return [value, syncedSetValue]
}

/**
 * Hook para gerenciar configurações do usuário
 */
export function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage('user_preferences', {
    theme: 'light',
    language: 'pt-BR',
    itemsPerPage: 10,
    sidebarCollapsed: false,
    notifications: true,
    autoSave: true,
    dateFormat: 'DD/MM/YYYY',
    currency: 'BRL'
  })

  const updatePreference = useCallback((key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }, [setPreferences])

  const resetPreferences = useCallback(() => {
    setPreferences({
      theme: 'light',
      language: 'pt-BR',
      itemsPerPage: 10,
      sidebarCollapsed: false,
      notifications: true,
      autoSave: true,
      dateFormat: 'DD/MM/YYYY',
      currency: 'BRL'
    })
  }, [setPreferences])

  return {
    preferences,
    updatePreference,
    resetPreferences,
    setPreferences
  }
}

/**
 * Hook para gerenciar histórico de ações
 */
export function useActionHistory<T>(maxHistory: number = 50) {
  const [history, setHistory] = useLocalStorage<T[]>('action_history', [])

  const addToHistory = useCallback((action: T) => {
    setHistory(prev => {
      const newHistory = [action, ...prev].slice(0, maxHistory)
      return newHistory
    })
  }, [setHistory, maxHistory])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [setHistory])

  const removeFromHistory = useCallback((index: number) => {
    setHistory(prev => prev.filter((_, i) => i !== index))
  }, [setHistory])

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory
  }
}
