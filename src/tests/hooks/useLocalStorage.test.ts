// src/tests/hooks/useLocalStorage.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { 
  useLocalStorage, 
  useMultipleLocalStorage,
  useValidatedLocalStorage,
  useCompressedLocalStorage,
  useExpiringLocalStorage,
  useSyncedLocalStorage,
  useUserPreferences,
  useActionHistory
} from '../../hooks/useLocalStorage'

// Mock do localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
})

describe('useLocalStorage Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('useLocalStorage', () => {
    it('retorna valor inicial quando localStorage está vazio', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'))
      
      expect(result.current[0]).toBe('initial-value')
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key')
    })

    it('retorna valor do localStorage quando existe', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify('stored-value'))
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'))
      
      expect(result.current[0]).toBe('stored-value')
    })

    it('atualiza valor no localStorage', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'))
      
      act(() => {
        result.current[1]('new-value')
      })

      expect(result.current[0]).toBe('new-value')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'))
    })

    it('suporta função de atualização', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify('current-value'))
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'))
      
      act(() => {
        result.current[1]((prev) => prev + '-updated')
      })

      expect(result.current[0]).toBe('current-value-updated')
    })

    it('remove valor do localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify('stored-value'))
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'))
      
      act(() => {
        result.current[2]() // removeValue
      })

      expect(result.current[0]).toBe('initial-value')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key')
    })

    it('lida com erro de parsing graciosamente', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json')
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'))
      
      expect(result.current[0]).toBe('initial-value')
    })

    it('lida com erro de setItem graciosamente', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage full')
      })
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'))
      
      act(() => {
        result.current[1]('new-value')
      })

      // Valor deve ser atualizado no estado mesmo se o localStorage falhar
      expect(result.current[0]).toBe('new-value')
    })

    it('dispara evento customizado ao atualizar', () => {
      const eventListener = vi.fn()
      window.addEventListener('localStorage-change', eventListener)
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'))
      
      act(() => {
        result.current[1]('new-value')
      })

      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { key: 'test-key', value: 'new-value' }
        })
      )
      
      window.removeEventListener('localStorage-change', eventListener)
    })

    it('sincroniza entre abas', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'))
      
      // Simular evento de mudança de outra aba
      const customEvent = new CustomEvent('localStorage-change', {
        detail: { key: 'test-key', value: 'value-from-other-tab' }
      })
      
      act(() => {
        window.dispatchEvent(customEvent)
      })

      expect(result.current[0]).toBe('value-from-other-tab')
    })

    it('ignora eventos de outras chaves', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'))
      
      const customEvent = new CustomEvent('localStorage-change', {
        detail: { key: 'other-key', value: 'other-value' }
      })
      
      act(() => {
        window.dispatchEvent(customEvent)
      })

      expect(result.current[0]).toBe('initial-value')
    })

    it('funciona com objetos complexos', () => {
      const complexObject = {
        name: 'Test',
        nested: { value: 42 },
        array: [1, 2, 3]
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(complexObject))
      
      const { result } = renderHook(() => useLocalStorage('test-key', {}))
      
      expect(result.current[0]).toEqual(complexObject)
    })
  })

  describe('useMultipleLocalStorage', () => {
    it('inicializa com valores padrão', () => {
      const keys = {
        name: 'Default Name',
        age: 0,
        active: true
      }
      
      const { result } = renderHook(() => useMultipleLocalStorage(keys))
      
      expect(result.current.values).toEqual(keys)
    })

    it('carrega valores do localStorage', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'name') return JSON.stringify('Stored Name')
        if (key === 'age') return JSON.stringify(25)
        return null
      })
      
      const keys = {
        name: 'Default Name',
        age: 0,
        active: true
      }
      
      const { result } = renderHook(() => useMultipleLocalStorage(keys))
      
      expect(result.current.values).toEqual({
        name: 'Stored Name',
        age: 25,
        active: true
      })
    })

    it('atualiza valor individual', () => {
      const keys = { name: 'Default', age: 0 }
      
      const { result } = renderHook(() => useMultipleLocalStorage(keys))
      
      act(() => {
        result.current.setValue('name', 'New Name')
      })

      expect(result.current.values.name).toBe('New Name')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('name', JSON.stringify('New Name'))
    })

    it('atualiza múltiplos valores', () => {
      const keys = { name: 'Default', age: 0 }
      
      const { result } = renderHook(() => useMultipleLocalStorage(keys))
      
      act(() => {
        result.current.setValues({ name: 'New Name', age: 25 })
      })

      expect(result.current.values).toEqual({ name: 'New Name', age: 25 })
    })

    it('remove valor individual', () => {
      const keys = { name: 'Default', age: 0 }
      
      const { result } = renderHook(() => useMultipleLocalStorage(keys))
      
      act(() => {
        result.current.removeValue('name')
      })

      expect(result.current.values.name).toBe('Default')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('name')
    })

    it('remove todos os valores', () => {
      const keys = { name: 'Default', age: 0 }
      
      const { result } = renderHook(() => useMultipleLocalStorage(keys))
      
      act(() => {
        result.current.removeAll()
      })

      expect(result.current.values).toEqual(keys)
    })

    it('usa prefixo nas chaves', () => {
      const keys = { name: 'Default' }
      
      const { result } = renderHook(() => useMultipleLocalStorage(keys, 'app'))
      
      act(() => {
        result.current.setValue('name', 'New Name')
      })

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('app_name', JSON.stringify('New Name'))
    })
  })

  describe('useValidatedLocalStorage', () => {
    const validator = (value: any): value is string => typeof value === 'string'

    it('valida valor inicial', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify('valid-string'))
      
      const { result } = renderHook(() => 
        useValidatedLocalStorage('test-key', 'default', validator)
      )
      
      expect(result.current[0]).toBe('valid-string')
      expect(result.current[3]).toBeNull() // error
    })

    it('rejeita valor inválido', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(123))
      
      const { result } = renderHook(() => 
        useValidatedLocalStorage('test-key', 'default', validator)
      )
      
      expect(result.current[0]).toBe('default')
      expect(result.current[3]).toBe('Dados inválidos no localStorage')
    })

    it('valida ao definir valor', () => {
      const { result } = renderHook(() => 
        useValidatedLocalStorage('test-key', 'default', validator)
      )
      
      act(() => {
        result.current[1](123 as any)
      })

      expect(result.current[0]).toBe('default')
      expect(result.current[3]).toBe('Valor inválido')
    })

    it('aceita valor válido', () => {
      const { result } = renderHook(() => 
        useValidatedLocalStorage('test-key', 'default', validator)
      )
      
      act(() => {
        result.current[1]('valid-string')
      })

      expect(result.current[0]).toBe('valid-string')
      expect(result.current[3]).toBeNull()
    })
  })

  describe('useCompressedLocalStorage', () => {
    it('comprime e descomprime dados', () => {
      const largeData = { data: 'x'.repeat(1000) }
      
      const { result } = renderHook(() => 
        useCompressedLocalStorage('test-key', {})
      )
      
      act(() => {
        result.current[1](largeData)
      })

      expect(result.current[0]).toEqual(largeData)
      
      // Verificar se foi comprimido (base64)
      const setItemCall = mockLocalStorage.setItem.mock.calls[0]
      expect(setItemCall[1]).toMatch(/^[A-Za-z0-9+/=]+$/)
    })

    it('lida com dados comprimidos inválidos', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-base64')
      
      const { result } = renderHook(() => 
        useCompressedLocalStorage('test-key', 'default')
      )
      
      expect(result.current[0]).toBe('default')
    })
  })

  describe('useExpiringLocalStorage', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('armazena com timestamp', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      
      const { result } = renderHook(() => 
        useExpiringLocalStorage('test-key', 'default', 60)
      )
      
      act(() => {
        result.current[1]('test-value')
      })

      expect(result.current[0]).toBe('test-value')
      expect(result.current[3]).toBe(false) // isExpired
    })

    it('recupera dados não expirados', () => {
      const now = Date.now()
      const storedData = {
        value: 'stored-value',
        timestamp: now - 30 * 60 * 1000 // 30 minutos atrás
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedData))
      vi.setSystemTime(now)
      
      const { result } = renderHook(() => 
        useExpiringLocalStorage('test-key', 'default', 60)
      )
      
      expect(result.current[0]).toBe('stored-value')
      expect(result.current[3]).toBe(false)
    })

    it('expira dados antigos', () => {
      const now = Date.now()
      const storedData = {
        value: 'stored-value',
        timestamp: now - 90 * 60 * 1000 // 90 minutos atrás
      }
      
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedData))
      vi.setSystemTime(now)
      
      const { result } = renderHook(() => 
        useExpiringLocalStorage('test-key', 'default', 60)
      )
      
      expect(result.current[0]).toBe('default')
      expect(result.current[3]).toBe(true)
    })

    it('verifica expiração periodicamente', () => {
      const now = Date.now()
      vi.setSystemTime(now)
      
      const { result } = renderHook(() => 
        useExpiringLocalStorage('test-key', 'default', 60)
      )
      
      act(() => {
        result.current[1]('test-value')
      })

      expect(result.current[3]).toBe(false)
      
      // Avançar para além do tempo de expiração
      vi.setSystemTime(now + 120 * 60 * 1000)
      
      act(() => {
        vi.advanceTimersByTime(60000) // Avançar 1 minuto para triggerar verificação
      })

      expect(result.current[3]).toBe(true)
    })
  })

  describe('useSyncedLocalStorage', () => {
    it('sincroniza com localStorage', () => {
      const { result } = renderHook(() => 
        useSyncedLocalStorage('test-key', 'default')
      )
      
      act(() => {
        result.current[1]('synced-value')
      })

      expect(result.current[0]).toBe('synced-value')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('synced-value'))
    })

    it('suporta função de atualização', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify('current'))
      
      const { result } = renderHook(() => 
        useSyncedLocalStorage('test-key', 'default')
      )
      
      act(() => {
        result.current[1]((prev) => prev + '-updated')
      })

      expect(result.current[0]).toBe('current-updated')
    })
  })

  describe('useUserPreferences', () => {
    it('carrega preferências padrão', () => {
      const { result } = renderHook(() => useUserPreferences())
      
      expect(result.current.preferences).toEqual({
        theme: 'light',
        language: 'pt-BR',
        itemsPerPage: 10,
        sidebarCollapsed: false,
        notifications: true,
        autoSave: true,
        dateFormat: 'DD/MM/YYYY',
        currency: 'BRL'
      })
    })

    it('atualiza preferência individual', () => {
      const { result } = renderHook(() => useUserPreferences())
      
      act(() => {
        result.current.updatePreference('theme', 'dark')
      })

      expect(result.current.preferences.theme).toBe('dark')
    })

    it('reseta preferências', () => {
      const { result } = renderHook(() => useUserPreferences())
      
      act(() => {
        result.current.updatePreference('theme', 'dark')
      })

      act(() => {
        result.current.resetPreferences()
      })

      expect(result.current.preferences.theme).toBe('light')
    })

    it('persiste preferências no localStorage', () => {
      const { result } = renderHook(() => useUserPreferences())
      
      act(() => {
        result.current.updatePreference('theme', 'dark')
      })

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'user_preferences',
        expect.stringContaining('"theme":"dark"')
      )
    })
  })

  describe('useActionHistory', () => {
    it('inicializa com histórico vazio', () => {
      const { result } = renderHook(() => useActionHistory())
      
      expect(result.current.history).toEqual([])
    })

    it('adiciona ação ao histórico', () => {
      const { result } = renderHook(() => useActionHistory<string>())
      
      act(() => {
        result.current.addToHistory('action-1')
      })

      expect(result.current.history).toEqual(['action-1'])
    })

    it('mantém ordem cronológica (mais recente primeiro)', () => {
      const { result } = renderHook(() => useActionHistory<string>())
      
      act(() => {
        result.current.addToHistory('action-1')
        result.current.addToHistory('action-2')
      })

      expect(result.current.history).toEqual(['action-2', 'action-1'])
    })

    it('limita tamanho do histórico', () => {
      const { result } = renderHook(() => useActionHistory<string>(3))
      
      act(() => {
        result.current.addToHistory('action-1')
        result.current.addToHistory('action-2')
        result.current.addToHistory('action-3')
        result.current.addToHistory('action-4')
      })

      expect(result.current.history).toEqual(['action-4', 'action-3', 'action-2'])
    })

    it('remove ação do histórico', () => {
      const { result } = renderHook(() => useActionHistory<string>())
      
      act(() => {
        result.current.addToHistory('action-1')
        result.current.addToHistory('action-2')
      })

      act(() => {
        result.current.removeFromHistory(0)
      })

      expect(result.current.history).toEqual(['action-1'])
    })

    it('limpa histórico', () => {
      const { result } = renderHook(() => useActionHistory<string>())
      
      act(() => {
        result.current.addToHistory('action-1')
        result.current.addToHistory('action-2')
      })

      act(() => {
        result.current.clearHistory()
      })

      expect(result.current.history).toEqual([])
    })

    it('persiste no localStorage', () => {
      const { result } = renderHook(() => useActionHistory<string>())
      
      act(() => {
        result.current.addToHistory('action-1')
      })

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'action_history',
        JSON.stringify(['action-1'])
      )
    })
  })

  describe('Edge Cases', () => {
    it('lida com localStorage indisponível', () => {
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true
      })

      const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
      
      expect(result.current[0]).toBe('default')
    })

    it('lida com JSON circular', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
      
      const circularObj: any = { name: 'test' }
      circularObj.self = circularObj
      
      act(() => {
        result.current[1](circularObj)
      })

      // Deve falhar graciosamente
      expect(result.current[0]).toBe(circularObj)
    })

    it('lida com quota exceeded', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        const error = new Error('QuotaExceededError')
        error.name = 'QuotaExceededError'
        throw error
      })
      
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
      
      act(() => {
        result.current[1]('new-value')
      })

      expect(result.current[0]).toBe('new-value')
    })
  })

  describe('Performance', () => {
    it('não re-renderiza desnecessariamente', () => {
      const renderSpy = vi.fn()
      
      const { rerender } = renderHook(() => {
        renderSpy()
        return useLocalStorage('test-key', 'default')
      })

      expect(renderSpy).toHaveBeenCalledTimes(1)
      
      rerender()
      expect(renderSpy).toHaveBeenCalledTimes(2)
    })

    it('debounce de atualizações', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
      
      act(() => {
        result.current[1]('value-1')
        result.current[1]('value-2')
        result.current[1]('value-3')
      })

      // Deve ter chamado setItem apenas uma vez com o último valor
      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(3)
      expect(mockLocalStorage.setItem).toHaveBeenLastCalledWith('test-key', JSON.stringify('value-3'))
    })
  })

  describe('Cleanup', () => {
    it('remove event listeners no unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      
      const { unmount } = renderHook(() => useLocalStorage('test-key', 'default'))
      
      unmount()
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('localStorage-change', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function))
      
      removeEventListenerSpy.mockRestore()
    })

    it('limpa timers no unmount', () => {
      vi.useFakeTimers()
      
      const { unmount } = renderHook(() => 
        useExpiringLocalStorage('test-key', 'default', 60)
      )
      
      unmount()
      
      // Verificar se não há timers pendentes
      expect(vi.getTimerCount()).toBe(0)
      
      vi.useRealTimers()
    })
  })
})
