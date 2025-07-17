// src/i18n/index.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'

// Importar recursos de tradução
import ptBR from './locales/pt-BR.json'
import enUS from './locales/en-US.json'
import esES from './locales/es-ES.json'

export const defaultNS = 'common'
export const resources = {
  'pt-BR': {
    common: ptBR
  },
  'en-US': {
    common: enUS
  },
  'es-ES': {
    common: esES
  }
} as const

// Configuração do i18next
i18n
  .use(Backend) // Para carregar traduções via HTTP
  .use(LanguageDetector) // Para detectar idioma do navegador
  .use(initReactI18next) // Para integração com React
  .init({
    // Recursos de tradução
    resources,
    
    // Namespace padrão
    defaultNS,
    
    // Idioma padrão
    fallbackLng: 'pt-BR',
    
    // Idiomas suportados
    supportedLngs: ['pt-BR', 'en-US', 'es-ES'],
    
    // Detecção de idioma
    detection: {
      // Ordem de detecção
      order: ['localStorage', 'navigator', 'htmlTag'],
      
      // Cache no localStorage
      caches: ['localStorage'],
      
      // Chave para localStorage
      lookupLocalStorage: 'i18nextLng',
      
      // Não detectar do path/subdomain
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
    },
    
    // Configurações de debug (apenas em desenvolvimento)
    debug: process.env.NODE_ENV === 'development',
    
    // Interpolação
    interpolation: {
      // Não escapar HTML (React já faz isso)
      escapeValue: false,
      
      // Formato de números e datas
      format: (value, format, lng) => {
        if (format === 'currency') {
          return new Intl.NumberFormat(lng, {
            style: 'currency',
            currency: 'BRL'
          }).format(value)
        }
        
        if (format === 'date') {
          return new Intl.DateTimeFormat(lng).format(new Date(value))
        }
        
        if (format === 'datetime') {
          return new Intl.DateTimeFormat(lng, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).format(new Date(value))
        }
        
        if (format === 'phone') {
          return formatPhone(value, lng)
        }
        
        return value
      }
    },
    
    // Configurações de backend
    backend: {
      // Path para arquivos de tradução
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      
      // Adicionar timestamp para cache-busting
      addPath: '/locales/add/{{lng}}/{{ns}}',
      
      // Headers personalizados
      requestOptions: {
        cache: 'default'
      }
    },
    
    // Configurações de carregamento
    load: 'languageOnly', // Carregar apenas 'pt' ao invés de 'pt-BR'
    
    // Configurações de namespace
    ns: ['common', 'validation', 'errors'],
    
    // Separador de namespace
    nsSeparator: ':',
    
    // Separador de chave
    keySeparator: '.',
    
    // Pluralização
    pluralSeparator: '_',
    contextSeparator: '_',
    
    // Configurações de retorno
    returnNull: false,
    returnEmptyString: false,
    returnObjects: false,
    
    // Configurações de escape
    parseMissingKeyHandler: (key) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${key}`)
      }
      return key
    },
    
    // Configurações de espera
    react: {
      // Aguardar recursos carregarem antes de renderizar
      wait: false,
      
      // Componente de loading
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      
      // Usar Suspense
      useSuspense: false,
      
      // Timeout para carregamento
      nsMode: 'default'
    },
    
    // Configurações de cache
    cleanCode: true,
    
    // Configurações de carregamento assíncrono
    partialBundledLanguages: true,
    
    // Configurações de inicialização
    initImmediate: false
  })

// Utilitários de formatação
export const formatPhone = (phone: string, locale: string = 'pt-BR'): string => {
  const cleaned = phone.replace(/\D/g, '')
  
  if (locale === 'pt-BR') {
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
  }
  
  return phone
}

export const formatCurrency = (value: number, locale: string = 'pt-BR'): string => {
  const currency = locale === 'pt-BR' ? 'BRL' : locale === 'en-US' ? 'USD' : 'EUR'
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(value)
}

export const formatDate = (date: Date | string, locale: string = 'pt-BR'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(dateObj)
}

export const formatDateTime = (date: Date | string, locale: string = 'pt-BR'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj)
}

// Hook personalizado para tradução tipada
export const useTypedTranslation = (ns?: string) => {
  const { t, i18n: i18nInstance } = useTranslation(ns)
  
  return {
    t: t as (key: string, options?: any) => string,
    i18n: i18nInstance,
    currentLanguage: i18nInstance.language,
    changeLanguage: i18nInstance.changeLanguage,
    isReady: i18nInstance.isInitialized
  }
}

// Função para carregar namespace dinamicamente
export const loadNamespace = async (ns: string): Promise<void> => {
  if (!i18n.hasResourceBundle(i18n.language, ns)) {
    await i18n.loadNamespaces(ns)
  }
}

// Função para adicionar recursos dinamicamente
export const addResourceBundle = (
  lng: string,
  ns: string,
  resources: Record<string, any>
): void => {
  i18n.addResourceBundle(lng, ns, resources, true, true)
}

// Validação de chaves de tradução
export const validateTranslationKeys = (
  keys: string[],
  lng?: string
): { missing: string[]; found: string[] } => {
  const currentLng = lng || i18n.language
  const missing: string[] = []
  const found: string[] = []
  
  keys.forEach(key => {
    if (i18n.exists(key, { lng: currentLng })) {
      found.push(key)
    } else {
      missing.push(key)
    }
  })
  
  return { missing, found }
}

// Função para obter todas as traduções de um namespace
export const getAllTranslations = (ns: string = 'common', lng?: string) => {
  const currentLng = lng || i18n.language
  return i18n.getResourceBundle(currentLng, ns) || {}
}

// Configuração de idiomas suportados
export const supportedLanguages = [
  {
    code: 'pt-BR',
    name: 'Português (Brasil)',
    flag: '🇧🇷',
    nativeName: 'Português'
  },
  {
    code: 'en-US',
    name: 'English (United States)',
    flag: '🇺🇸',
    nativeName: 'English'
  },
  {
    code: 'es-ES',
    name: 'Español (España)',
    flag: '🇪🇸',
    nativeName: 'Español'
  }
] as const

// Middleware para persistir idioma selecionado
export const persistLanguage = (lng: string): void => {
  localStorage.setItem('i18nextLng', lng)
}

// Função para detectar idioma do sistema
export const detectSystemLanguage = (): string => {
  const systemLang = navigator.language || navigator.languages[0]
  const supportedCodes = supportedLanguages.map(lang => lang.code)
  
  // Verificar correspondência exata
  if (supportedCodes.includes(systemLang)) {
    return systemLang
  }
  
  // Verificar correspondência por prefixo (ex: 'pt' para 'pt-BR')
  const langPrefix = systemLang.split('-')[0]
  const matchByPrefix = supportedCodes.find(code => code.startsWith(langPrefix))
  
  return matchByPrefix || 'pt-BR'
}

// Função para inicializar i18n com configurações personalizadas
export const initializeI18n = async (config?: Partial<typeof i18n.options>): Promise<void> => {
  if (config) {
    await i18n.init({
      ...i18n.options,
      ...config
    })
  }
  
  return i18n.isInitialized ? Promise.resolve() : i18n.init()
}

// Eventos customizados para mudança de idioma
const languageChangeEvent = new CustomEvent('languageChanged', {
  detail: { language: i18n.language }
})

i18n.on('languageChanged', (lng) => {
  persistLanguage(lng)
  
  // Atualizar evento customizado
  const event = new CustomEvent('languageChanged', {
    detail: { language: lng }
  })
  
  window.dispatchEvent(event)
  
  // Atualizar atributo lang do HTML
  document.documentElement.lang = lng
})

// Configurar idioma inicial no HTML
document.documentElement.lang = i18n.language

// Importar hook de tradução do React
import { useTranslation } from 'react-i18next'

export { i18n, useTranslation }
export default i18n

// Tipos TypeScript para autocompletar chaves
export type TranslationKey = 
  | 'common:app.name'
  | 'common:app.subtitle'
  | 'common:navigation.dashboard'
  | 'common:navigation.clientes'
  | 'common:navigation.orcamentos'
  | 'common:navigation.agenda'
  | 'common:navigation.financeiro'
  | 'common:navigation.crm'
  | 'common:navigation.configuracoes'
  | 'common:actions.save'
  | 'common:actions.cancel'
  | 'common:actions.delete'
  | 'common:actions.edit'
  | 'common:actions.create'
  | 'common:actions.search'
  | 'common:status.loading'
  | 'common:status.success'
  | 'common:status.error'
  | 'validation:required'
  | 'validation:email'
  | 'validation:phone'
  | 'validation:cnpj'
  | 'errors:network'
  | 'errors:server'
  | 'errors:validation'

// Plugin para desenvolvimento - mostrar chaves missing
if (process.env.NODE_ENV === 'development') {
  const missingKeys = new Set<string>()
  
  i18n.on('missingKey', (lng, namespace, key) => {
    const fullKey = `${namespace}:${key}`
    if (!missingKeys.has(fullKey)) {
      missingKeys.add(fullKey)
      console.warn(`🌐 Missing translation: ${fullKey} for language: ${lng}`)
    }
  })
  
  // Função para exportar chaves missing (útil para desenvolvimento)
  ;(window as any).exportMissingKeys = () => {
    console.log('Missing translation keys:', Array.from(missingKeys))
    return Array.from(missingKeys)
  }
}
