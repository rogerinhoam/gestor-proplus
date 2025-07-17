// src/tests/hooks/useDebounce.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { 
  useDebounce, 
  useDebounceCallback,
  useDebounceState,
  useSearchDebounce,
  useManualDebounce
} from '../../hooks/useDebounce'

describe('useDebounce Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('useDebounce', () => {
    it('retorna valor inicial imediatamente', () => {
      const { result } = renderHook(() => useDebounce('initial', 500))
      
      expect(result.current).toBe('initial')
    })

    it('debounce valor após delay especificado', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 500 }
        }
      )

      expect(result.current).toBe('initial')

      // Atualizar valor
      rerender({ value: 'updated', delay: 500 })
      
      // Valor ainda deve ser o inicial (antes do delay)
      expect(result.current).toBe('initial')

      // Avançar tempo menos que o delay
      act(() => {
        vi.advanceTimersByTime(400)
      })
      
      expect(result.current).toBe('initial')

      // Avançar tempo para completar o delay
      act(() => {
        vi.advanceTimersByTime(100)
      })
      
      expect(result.current).toBe('updated')
    })

    it('cancela debounce anterior quando valor muda rapidamente', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 500),
        {
          initialProps: { value: 'first' }
        }
      )

      expect(result.current).toBe('first')

      // Primeira mudança
      rerender({ value: 'second' })
      
      act(() => {
        vi.advanceTimersByTime(300)
      })
      
      // Segunda mudança antes do primeiro delay terminar
      rerender({ value: 'third' })
      
      act(() => {
        vi.advanceTimersByTime(300)
      })
      
      // Ainda deve estar no valor original
      expect(result.current).toBe('first')
      
      // Completar o segundo delay
      act(() => {
        vi.advanceTimersByTime(200)
      })
      
      // Deve pular direto para o terceiro valor
      expect(result.current).toBe('third')
    })

    it('funciona com diferentes tipos de valores', () => {
      // Números
      const { result: numberResult } = renderHook(() => useDebounce(42, 100))
      expect(numberResult.current).toBe(42)

      // Objetos
      const obj = { name: 'test' }
      const { result: objectResult } = renderHook(() => useDebounce(obj, 100))
      expect(objectResult.current).toBe(obj)

      // Arrays
      const arr = [1, 2, 3]
      const { result: arrayResult } = renderHook(() => useDebounce(arr, 100))
      expect(arrayResult.current).toBe(arr)
    })

    it('lida com delay zero', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 0),
        {
          initialProps: { value: 'initial' }
        }
      )

      rerender({ value: 'updated' })
      
      act(() => {
        vi.advanceTimersByTime(0)
      })
      
      expect(result.current).toBe('updated')
    })
  })

  describe('useDebounceCallback', () => {
    it('debounce execução de callback', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useDebounceCallback(callback, 500))
      
      const [debouncedCallback] = result.current

      // Chamar múltiplas vezes rapidamente
      act(() => {
        debouncedCallback('arg1')
        debouncedCallback('arg2')
        debouncedCallback('arg3')
      })

      // Callback não deve ter sido chamado ainda
      expect(callback).not.toHaveBeenCalled()

      // Avançar tempo
      act(() => {
        vi.advanceTimersByTime(500)
      })

      // Callback deve ter sido chamado apenas uma vez com último argumento
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('arg3')
    })

    it('permite cancelar debounce', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useDebounceCallback(callback, 500))
      
      const [debouncedCallback, cancelDebounce] = result.current

      act(() => {
        debouncedCallback('test')
      })

      act(() => {
        cancelDebounce()
      })

      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(callback).not.toHaveBeenCalled()
    })

    it('limpa timer no unmount', () => {
      const callback = vi.fn()
      const { result, unmount } = renderHook(() => useDebounceCallback(callback, 500))
      
      const [debouncedCallback] = result.current

      act(() => {
        debouncedCallback('test')
      })

      unmount()

      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('useDebounceState', () => {
    it('gerencia estado com debounce', () => {
      const { result } = renderHook(() => useDebounceState('initial', 500))

      const { value, debouncedValue, isDebouncing, setValue } = result.current

      expect(value).toBe('initial')
      expect(debouncedValue).toBe('initial')
      expect(isDebouncing).toBe(false)

      // Atualizar valor
      act(() => {
        setValue('updated')
      })

      expect(result.current.value).toBe('updated')
      expect(result.current.debouncedValue).toBe('initial')
      expect(result.current.isDebouncing).toBe(true)

      // Avançar tempo
      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(result.current.value).toBe('updated')
      expect(result.current.debouncedValue).toBe('updated')
      expect(result.current.isDebouncing).toBe(false)
    })

    it('permite definir valor imediatamente', () => {
      const { result } = renderHook(() => useDebounceState('initial', 500))

      act(() => {
        result.current.setValueImmediate('immediate')
      })

      expect(result.current.value).toBe('immediate')
      expect(result.current.debouncedValue).toBe('immediate')
      expect(result.current.isDebouncing).toBe(false)
    })
  })

  describe('useSearchDebounce', () => {
    it('gerencia estado de busca com debounce', () => {
      const { result } = renderHook(() => useSearchDebounce(300))

      const { searchTerm, debouncedSearchTerm, isSearching, setSearchTerm } = result.current

      expect(searchTerm).toBe('')
      expect(debouncedSearchTerm).toBe('')
      expect(isSearching).toBe(false)

      // Definir termo de busca
      act(() => {
        setSearchTerm('test')
      })

      expect(result.current.searchTerm).toBe('test')
      expect(result.current.debouncedSearchTerm).toBe('')
      expect(result.current.isSearching).toBe(true)

      // Avançar tempo
      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(result.current.searchTerm).toBe('test')
      expect(result.current.debouncedSearchTerm).toBe('test')
      expect(result.current.isSearching).toBe(false)
    })

    it('permite limpar busca', () => {
      const { result } = renderHook(() => useSearchDebounce(300))

      act(() => {
        result.current.setSearchTerm('test')
      })

      act(() => {
        result.current.clearSearch()
      })

      expect(result.current.searchTerm).toBe('')
      expect(result.current.debouncedSearchTerm).toBe('')
      expect(result.current.isSearching).toBe(false)
    })
  })

  describe('useManualDebounce', () => {
    it('permite controle manual do debounce', () => {
      const { result } = renderHook(() => useManualDebounce<string>(500))

      const { value, setValue, trigger, isDebouncing } = result.current

      expect(value).toBeUndefined()
      expect(isDebouncing).toBe(false)

      // Definir valor pendente
      act(() => {
        setValue('test')
      })

      expect(result.current.value).toBeUndefined()
      expect(result.current.isDebouncing).toBe(false)

      // Triggerar debounce
      act(() => {
        trigger()
      })

      expect(result.current.value).toBeUndefined()
      expect(result.current.isDebouncing).toBe(true)

      // Avançar tempo
      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(result.current.value).toBe('test')
      expect(result.current.isDebouncing).toBe(false)
    })

    it('permite cancelar debounce manual', () => {
      const { result } = renderHook(() => useManualDebounce<string>(500))

      act(() => {
        result.current.setValue('test')
        result.current.trigger()
      })

      expect(result.current.isDebouncing).toBe(true)

      act(() => {
        result.current.cancel()
      })

      expect(result.current.isDebouncing).toBe(false)

      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(result.current.value).toBeUndefined()
    })
  })

  describe('Edge Cases', () => {
    it('lida com delay negativo', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, -100),
        {
          initialProps: { value: 'initial' }
        }
      )

      rerender({ value: 'updated' })
      
      // Com delay negativo, deve atualizar imediatamente
      act(() => {
        vi.advanceTimersByTime(0)
      })
      
      expect(result.current).toBe('updated')
    })

    it('lida com mudanças de delay', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        {
          initialProps: { value: 'initial', delay: 500 }
        }
      )

      rerender({ value: 'updated', delay: 500 })
      
      // Mudar delay durante debounce
      rerender({ value: 'updated', delay: 1000 })
      
      act(() => {
        vi.advanceTimersByTime(500)
      })
      
      // Ainda não deve ter atualizado
      expect(result.current).toBe('initial')
      
      act(() => {
        vi.advanceTimersByTime(500)
      })
      
      // Agora deve ter atualizado
      expect(result.current).toBe('updated')
    })

    it('lida com valores undefined/null', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 100),
        {
          initialProps: { value: undefined as any }
        }
      )

      expect(result.current).toBeUndefined()

      rerender({ value: null as any })
      
      act(() => {
        vi.advanceTimersByTime(100)
      })
      
      expect(result.current).toBeNull()
    })
  })

  describe('Performance', () => {
    it('não cria novos timers desnecessariamente', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout')

      const { rerender } = renderHook(
        ({ value }) => useDebounce(value, 500),
        {
          initialProps: { value: 'initial' }
        }
      )

      // Primeira mudança
      rerender({ value: 'updated' })
      
      expect(setTimeoutSpy).toHaveBeenCalledTimes(1)
      expect(clearTimeoutSpy).toHaveBeenCalledTimes(0)

      // Segunda mudança (deve limpar timer anterior)
      rerender({ value: 'updated2' })
      
      expect(setTimeoutSpy).toHaveBeenCalledTimes(2)
      expect(clearTimeoutSpy).toHaveBeenCalledTimes(1)

      clearTimeoutSpy.mockRestore()
      setTimeoutSpy.mockRestore()
    })

    it('não re-renderiza desnecessariamente', () => {
      const renderSpy = vi.fn()
      
      const { rerender } = renderHook(() => {
        renderSpy()
        return useDebounce('value', 500)
      })

      expect(renderSpy).toHaveBeenCalledTimes(1)

      // Re-render com mesmo valor não deve triggerar novo render interno
      rerender()
      
      expect(renderSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('Integração', () => {
    it('funciona com formulários', async () => {
      const onSearch = vi.fn()
      
      const { result } = renderHook(() => {
        const searchTerm = useDebounce('', 300)
        
        React.useEffect(() => {
          if (searchTerm) {
            onSearch(searchTerm)
          }
        }, [searchTerm])
        
        return { searchTerm }
      })

      // Simular digitação
      const { rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        {
          initialProps: { value: '' }
        }
      )

      rerender({ value: 'a' })
      rerender({ value: 'ab' })
      rerender({ value: 'abc' })

      // Não deve ter chamado ainda
      expect(onSearch).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(300)
      })

      // Deve ter chamado com valor final
      expect(onSearch).toHaveBeenCalledWith('abc')
    })
  })
})
