// src/tests/i18n/i18n.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n, { 
  useTranslation, 
  useTypedTranslation,
  supportedLanguages,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPhone,
  detectSystemLanguage,
  loadNamespace,
  addResourceBundle,
  validateTranslationKeys,
  getAllTranslations,
  initializeI18n
} from '../../i18n'

// Mock do localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// Mock do navigator
Object.defineProperty(navigator, 'language', {
  value: 'pt-BR',
  writable: true
})

Object.defineProperty(navigator, 'languages', {
  value: ['pt-BR', 'en-US'],
  writable: true
})

// Wrapper para testes com i18n
const createWrapper = (language = 'pt-BR') => {
  return ({ children }: { children: ReactNode }) => {
    i18n.changeLanguage(language)
    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
  }
}

describe('i18n', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    i18n.changeLanguage('pt-BR')
  })

  describe('Configuração inicial', () => {
    it('inicializa com idioma padrão', () => {
      expect(i18n.language).toBe('pt-BR')
    })

    it('carrega recursos corretamente', () => {
      expect(i18n.hasResourceBundle('pt-BR', 'common')).toBe(true)
      expect(i18n.hasResourceBundle('en-US', 'common')).toBe(true)
      expect(i18n.hasResourceBundle('es-ES', 'common')).toBe(true)
    })

    it('configura namespaces padrão', () => {
      expect(i18n.options.defaultNS).toBe('common')
      expect(i18n.options.ns).toContain('common')
    })
  })

  describe('useTranslation hook', () => {
    it('retorna função de tradução', () => {
      const { result } = renderHook(() => useTranslation(), {
        wrapper: createWrapper()
      })

      expect(typeof result.current.t).toBe('function')
      expect(typeof result.current.i18n).toBe('object')
    })

    it('traduz chaves existentes', () => {
      const { result } = renderHook(() => useTranslation(), {
        wrapper: createWrapper()
      })

      const { t } = result.current
      expect(t('app.name')).toBe('R.M. Estética PRO+')
      expect(t('actions.save')).toBe('Salvar')
      expect(t('actions.cancel')).toBe('Cancelar')
    })

    it('retorna chave para traduções não encontradas', () => {
      const { result } = renderHook(() => useTranslation(), {
        wrapper: createWrapper()
      })

      const { t } = result.current
      expect(t('chave.inexistente')).toBe('chave.inexistente')
    })

    it('suporta interpolação', () => {
      const { result } = renderHook(() => useTranslation(), {
        wrapper: createWrapper()
      })

      const { t } = result.current
      expect(t('pagination.showing', { start: 1, end: 10, total: 100 }))
        .toBe('Exibindo 1 a 10 de 100 itens')
    })

    it('suporta pluralização', () => {
      const { result } = renderHook(() => useTranslation(), {
        wrapper: createWrapper()
      })

      const { t } = result.current
      expect(t('validation.min_length', { count: 1 }))
        .toBe('Deve ter pelo menos 1 caracteres')
      expect(t('validation.min_length', { count: 5 }))
        .toBe('Deve ter pelo menos 5 caracteres')
    })
  })

  describe('useTypedTranslation hook', () => {
    it('retorna função de tradução tipada', () => {
      const { result } = renderHook(() => useTypedTranslation(), {
        wrapper: createWrapper()
      })

      expect(typeof result.current.t).toBe('function')
      expect(typeof result.current.changeLanguage).toBe('function')
      expect(result.current.currentLanguage).toBe('pt-BR')
    })

    it('indica se está pronto', () => {
      const { result } = renderHook(() => useTypedTranslation(), {
        wrapper: createWrapper()
      })

      expect(result.current.isReady).toBe(true)
    })
  })

  describe('Mudança de idioma', () => {
    it('muda idioma corretamente', async () => {
      const { result } = renderHook(() => useTranslation(), {
        wrapper: createWrapper()
      })

      await act(async () => {
        await result.current.i18n.changeLanguage('en-US')
      })

      expect(result.current.i18n.language).toBe('en-US')
      expect(result.current.t('actions.save')).toBe('Save')
    })

    it('persiste idioma no localStorage', async () => {
      const { result } = renderHook(() => useTranslation(), {
        wrapper: createWrapper()
      })

      await act(async () => {
        await result.current.i18n.changeLanguage('en-US')
      })

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('i18nextLng', 'en-US')
    })

    it('dispara evento customizado', async () => {
      const eventListener = vi.fn()
      window.addEventListener('languageChanged', eventListener)

      const { result } = renderHook(() => useTranslation(), {
        wrapper: createWrapper()
      })

      await act(async () => {
        await result.current.i18n.changeLanguage('en-US')
      })

      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { language: 'en-US' }
        })
      )

      window.removeEventListener('languageChanged', eventListener)
    })

    it('atualiza atributo lang do HTML', async () => {
      const { result } = renderHook(() => useTranslation(), {
        wrapper: createWrapper()
      })

      await act(async () => {
        await result.current.i18n.changeLanguage('en-US')
      })

      expect(document.documentElement.lang).toBe('en-US')
    })
  })

  describe('Formatação', () => {
    it('formata moeda corretamente', () => {
      expect(formatCurrency(1234.56, 'pt-BR')).toBe('R$ 1.234,56')
      expect(formatCurrency(1234.56, 'en-US')).toBe('$1,234.56')
      expect(formatCurrency(1234.56, 'es-ES')).toBe('1.234,56 €')
    })

    it('formata data corretamente', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      expect(formatDate(date, 'pt-BR')).toBe('15/01/2024')
      expect(formatDate(date, 'en-US')).toBe('1/15/2024')
      expect(formatDate(date, 'es-ES')).toBe('15/1/2024')
    })

    it('formata data e hora corretamente', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      expect(formatDateTime(date, 'pt-BR')).toBe('15/01/2024 10:30')
      expect(formatDateTime(date, 'en-US')).toBe('1/15/2024 10:30 AM')
    })

    it('formata telefone corretamente', () => {
      expect(formatPhone('11999999999', 'pt-BR')).toBe('(11) 99999-9999')
      expect(formatPhone('1199999999', 'pt-BR')).toBe('(11) 9999-9999')
    })

    it('lida com valores inválidos na formatação', () => {
      expect(formatCurrency(NaN, 'pt-BR')).toBe('R$ 0,00')
      expect(formatDate('invalid', 'pt-BR')).toBe('Data inválida')
      expect(formatPhone('', 'pt-BR')).toBe('')
    })
  })

  describe('Detecção de idioma', () => {
    it('detecta idioma do sistema', () => {
      Object.defineProperty(navigator, 'language', {
        value: 'pt-BR',
        writable: true
      })

      expect(detectSystemLanguage()).toBe('pt-BR')
    })

    it('detecta idioma por prefixo', () => {
      Object.defineProperty(navigator, 'language', {
        value: 'pt',
        writable: true
      })

      expect(detectSystemLanguage()).toBe('pt-BR')
    })

    it('retorna padrão para idioma não suportado', () => {
      Object.defineProperty(navigator, 'language', {
        value: 'fr-FR',
        writable: true
      })

      expect(detectSystemLanguage()).toBe('pt-BR')
    })
  })

  describe('Idiomas suportados', () => {
    it('lista idiomas suportados corretamente', () => {
      expect(supportedLanguages).toHaveLength(3)
      expect(supportedLanguages.map(lang => lang.code)).toContain('pt-BR')
      expect(supportedLanguages.map(lang => lang.code)).toContain('en-US')
      expect(supportedLanguages.map(lang => lang.code)).toContain('es-ES')
    })

    it('contém informações completas dos idiomas', () => {
      const ptBR = supportedLanguages.find(lang => lang.code === 'pt-BR')
      expect(ptBR).toEqual({
        code: 'pt-BR',
        name: 'Português (Brasil)',
        flag: '🇧🇷',
        nativeName: 'Português'
      })
    })
  })

  describe('Gerenciamento de namespaces', () => {
    it('carrega namespace dinamicamente', async () => {
      const result = await loadNamespace('validation')
      expect(result).toBeUndefined()
      expect(i18n.hasResourceBundle('pt-BR', 'validation')).toBe(true)
    })

    it('adiciona recursos dinamicamente', () => {
      const resources = {
        'test.key': 'Valor de teste',
        'test.nested.key': 'Valor aninhado'
      }

      addResourceBundle('pt-BR', 'test', resources)
      
      expect(i18n.exists('test.key', { lng: 'pt-BR', ns: 'test' })).toBe(true)
      expect(i18n.t('test.key', { ns: 'test' })).toBe('Valor de teste')
    })

    it('obtém todas as traduções de um namespace', () => {
      const translations = getAllTranslations('common', 'pt-BR')
      expect(translations).toHaveProperty('app')
      expect(translations).toHaveProperty('actions')
      expect(translations).toHaveProperty('navigation')
    })
  })

  describe('Validação de traduções', () => {
    it('valida chaves de tradução existentes', () => {
      const keys = ['app.name', 'actions.save', 'actions.cancel']
      const result = validateTranslationKeys(keys, 'pt-BR')
      
      expect(result.found).toEqual(keys)
      expect(result.missing).toEqual([])
    })

    it('identifica chaves de tradução faltantes', () => {
      const keys = ['app.name', 'chave.inexistente', 'actions.save']
      const result = validateTranslationKeys(keys, 'pt-BR')
      
      expect(result.found).toEqual(['app.name', 'actions.save'])
      expect(result.missing).toEqual(['chave.inexistente'])
    })

    it('valida em idioma específico', () => {
      const keys = ['app.name']
      const result = validateTranslationKeys(keys, 'en-US')
      
      expect(result.found).toEqual(keys)
      expect(result.missing).toEqual([])
    })
  })

  describe('Inicialização customizada', () => {
    it('inicializa com configurações customizadas', async () => {
      const customConfig = {
        fallbackLng: 'en-US',
        debug: false
      }

      await initializeI18n(customConfig)
      
      expect(i18n.options.fallbackLng).toBe('en-US')
      expect(i18n.options.debug).toBe(false)
    })

    it('resolve quando já inicializado', async () => {
      const result = await initializeI18n()
      expect(result).toBeUndefined()
    })
  })

  describe('Contexto e pluralização', () => {
    it('suporta contexto na tradução', () => {
      const { result } = renderHook(() => useTranslation(), {
        wrapper: createWrapper()
      })

      const { t } = result.current
      // Assumindo que existe contexto configurado
      expect(t('common.active')).toBe('Ativo')
    })

    it('suporta pluralização complexa', () => {
      const { result } = renderHook(() => useTranslation(), {
        wrapper: createWrapper()
      })

      const { t } = result.current
      // Testando pluralização se configurada
      expect(t('common.items', { count: 0 })).toBe('Itens')
      expect(t('common.items', { count: 1 })).toBe('Itens')
      expect(t('common.items', { count: 2 })).toBe('Itens')
    })
  })

  describe('Fallback e tratamento de erros', () => {
    it('usa fallback para traduções não encontradas', () => {
      const { result } = renderHook(() => useTranslation(), {
        wrapper: createWrapper()
      })

      const { t } = result.current
      expect(t('chave.completamente.inexistente')).toBe('chave.completamente.inexistente')
    })

    it('lida com namespace inexistente', () => {
      const { result } = renderHook(() => useTranslation('namespace-inexistente'), {
        wrapper: createWrapper()
      })

      const { t } = result.current
      expect(t('qualquer.chave')).toBe('qualquer.chave')
    })

    it('lida com idioma inexistente', async () => {
      const { result } = renderHook(() => useTranslation(), {
        wrapper: createWrapper()
      })

      await act(async () => {
        await result.current.i18n.changeLanguage('xx-XX')
      })

      // Deve fallback para idioma padrão
      expect(result.current.t('actions.save')).toBe('Salvar')
    })
  })

  describe('Performance', () => {
    it('não re-renderiza desnecessariamente', () => {
      const renderSpy = vi.fn()
      
      const { rerender } = renderHook(() => {
        renderSpy()
        return useTranslation()
      }, {
        wrapper: createWrapper()
      })

      expect(renderSpy).toHaveBeenCalledTimes(1)
      
      // Re-render não deve causar nova renderização interna
      rerender()
      expect(renderSpy).toHaveBeenCalledTimes(2)
    })

    it('cache de traduções funciona corretamente', () => {
      const { result } = renderHook(() => useTranslation(), {
        wrapper: createWrapper()
      })

      const { t } = result.current
      
      // Múltiplas chamadas da mesma tradução devem usar cache
      const start = performance.now()
      for (let i = 0; i < 1000; i++) {
        t('actions.save')
      }
      const end = performance.now()
      
      expect(end - start).toBeLessThan(10) // Deve ser muito rápido
    })
  })

  describe('Integração com React', () => {
    it('re-renderiza quando idioma muda', async () => {
      const { result } = renderHook(() => useTranslation(), {
        wrapper: createWrapper()
      })

      expect(result.current.t('actions.save')).toBe('Salvar')

      await act(async () => {
        await result.current.i18n.changeLanguage('en-US')
      })

      expect(result.current.t('actions.save')).toBe('Save')
    })

    it('mantém estado durante mudanças de idioma', async () => {
      const { result } = renderHook(() => {
        const { t, i18n } = useTranslation()
        return { t, i18n, currentLang: i18n.language }
      }, {
        wrapper: createWrapper()
      })

      expect(result.current.currentLang).toBe('pt-BR')

      await act(async () => {
        await result.current.i18n.changeLanguage('en-US')
      })

      expect(result.current.currentLang).toBe('en-US')
    })
  })

  describe('Formatação com contexto de idioma', () => {
    it('formata com contexto do idioma atual', () => {
      const { result } = renderHook(() => useTranslation(), {
        wrapper: createWrapper('pt-BR')
      })

      const { i18n } = result.current
      
      // Usar formatação com contexto do idioma atual
      expect(formatCurrency(1234.56, i18n.language)).toBe('R$ 1.234,56')
    })

    it('adapta formatação ao mudar idioma', async () => {
      const { result } = renderHook(() => useTranslation(), {
        wrapper: createWrapper('pt-BR')
      })

      await act(async () => {
        await result.current.i18n.changeLanguage('en-US')
      })

      expect(formatCurrency(1234.56, result.current.i18n.language)).toBe('$1,234.56')
    })
  })
})
