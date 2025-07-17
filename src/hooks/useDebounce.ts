// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react'

/**
 * Hook para debounce de valores
 * Útil para campos de busca e inputs que disparam ações custosas
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook para debounce de callbacks
 * Útil para funções que devem ser executadas após um delay
 */
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): [T, () => void] {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  const debouncedCallback = ((...args: Parameters<T>) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    const timer = setTimeout(() => {
      callback(...args)
    }, delay)

    setDebounceTimer(timer)
  }) as T

  const cancelDebounce = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      setDebounceTimer(null)
    }
  }

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [debounceTimer])

  return [debouncedCallback, cancelDebounce]
}

/**
 * Hook para debounce de estado com loading
 * Útil quando você quer mostrar loading durante o debounce
 */
export function useDebounceState<T>(
  initialValue: T,
  delay: number
): {
  value: T
  debouncedValue: T
  isDebouncing: boolean
  setValue: (value: T) => void
  setValueImmediate: (value: T) => void
} {
  const [value, setValue] = useState<T>(initialValue)
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue)
  const [isDebouncing, setIsDebouncing] = useState(false)

  useEffect(() => {
    if (value !== debouncedValue) {
      setIsDebouncing(true)
    }

    const handler = setTimeout(() => {
      setDebouncedValue(value)
      setIsDebouncing(false)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay, debouncedValue])

  const setValueImmediate = (newValue: T) => {
    setValue(newValue)
    setDebouncedValue(newValue)
    setIsDebouncing(false)
  }

  return {
    value,
    debouncedValue,
    isDebouncing,
    setValue,
    setValueImmediate
  }
}

/**
 * Hook para debounce de arrays
 * Útil para listas que são atualizadas frequentemente
 */
export function useDebounceArray<T>(
  array: T[],
  delay: number,
  compareFn?: (a: T[], b: T[]) => boolean
): T[] {
  const [debouncedArray, setDebouncedArray] = useState<T[]>(array)

  useEffect(() => {
    const isEqual = compareFn 
      ? compareFn(array, debouncedArray)
      : JSON.stringify(array) === JSON.stringify(debouncedArray)

    if (!isEqual) {
      const handler = setTimeout(() => {
        setDebouncedArray(array)
      }, delay)

      return () => {
        clearTimeout(handler)
      }
    }
  }, [array, delay, debouncedArray, compareFn])

  return debouncedArray
}

/**
 * Hook para debounce de objetos
 * Útil para formulários e configurações
 */
export function useDebounceObject<T extends Record<string, any>>(
  obj: T,
  delay: number,
  keys?: (keyof T)[]
): T {
  const [debouncedObj, setDebouncedObj] = useState<T>(obj)

  useEffect(() => {
    const keysToCheck = keys || Object.keys(obj) as (keyof T)[]
    
    const hasChanges = keysToCheck.some(key => obj[key] !== debouncedObj[key])

    if (hasChanges) {
      const handler = setTimeout(() => {
        setDebouncedObj(obj)
      }, delay)

      return () => {
        clearTimeout(handler)
      }
    }
  }, [obj, delay, debouncedObj, keys])

  return debouncedObj
}

/**
 * Hook para debounce com controle manual
 * Útil quando você quer controlar quando o debounce é aplicado
 */
export function useManualDebounce<T>(
  delay: number
): {
  value: T | undefined
  setValue: (value: T) => void
  trigger: () => void
  cancel: () => void
  isDebouncing: boolean
} {
  const [value, setValue] = useState<T | undefined>(undefined)
  const [pendingValue, setPendingValue] = useState<T | undefined>(undefined)
  const [isDebouncing, setIsDebouncing] = useState(false)
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)

  const trigger = () => {
    if (pendingValue !== undefined) {
      setIsDebouncing(true)
      
      const newTimer = setTimeout(() => {
        setValue(pendingValue)
        setIsDebouncing(false)
        setTimer(null)
      }, delay)

      if (timer) {
        clearTimeout(timer)
      }
      
      setTimer(newTimer)
    }
  }

  const cancel = () => {
    if (timer) {
      clearTimeout(timer)
      setTimer(null)
    }
    setIsDebouncing(false)
  }

  const updateValue = (newValue: T) => {
    setPendingValue(newValue)
  }

  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [timer])

  return {
    value,
    setValue: updateValue,
    trigger,
    cancel,
    isDebouncing
  }
}

/**
 * Hook para debounce de promisses
 * Útil para requisições HTTP que podem ser disparadas rapidamente
 */
export function useDebouncePromise<T extends (...args: any[]) => Promise<any>>(
  promiseFn: T,
  delay: number
): [
  T,
  {
    cancel: () => void
    isPending: boolean
  }
] {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)
  const [isPending, setIsPending] = useState(false)

  const debouncedPromise = ((...args: Parameters<T>) => {
    return new Promise<Awaited<ReturnType<T>>>((resolve, reject) => {
      if (timer) {
        clearTimeout(timer)
      }

      setIsPending(true)

      const newTimer = setTimeout(async () => {
        try {
          const result = await promiseFn(...args)
          resolve(result)
        } catch (error) {
          reject(error)
        } finally {
          setIsPending(false)
          setTimer(null)
        }
      }, delay)

      setTimer(newTimer)
    })
  }) as T

  const cancel = () => {
    if (timer) {
      clearTimeout(timer)
      setTimer(null)
    }
    setIsPending(false)
  }

  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [timer])

  return [debouncedPromise, { cancel, isPending }]
}

/**
 * Hook para debounce de busca
 * Específico para campos de busca com funcionalidades extras
 */
export function useSearchDebounce(
  delay: number = 300
): {
  searchTerm: string
  debouncedSearchTerm: string
  isSearching: boolean
  setSearchTerm: (term: string) => void
  clearSearch: () => void
} {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true)
    }

    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setIsSearching(false)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm, delay, debouncedSearchTerm])

  const clearSearch = () => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
    setIsSearching(false)
  }

  return {
    searchTerm,
    debouncedSearchTerm,
    isSearching,
    setSearchTerm,
    clearSearch
  }
}
