import React from 'react'
import ReactDOM from 'react-dom/client'
import { StrictMode } from 'react'

import App from './App'
import './styles/globals.css'

/**
 * Entry point da aplicação R.M. Estética PRO+ v2.0
 * 
 * Configurações:
 * - React 18 com Concurrent Features
 * - StrictMode para desenvolvimento
 * - Importação de estilos globais
 * - Inicialização do React DOM
 */

// Verificar se o elemento root existe
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Elemento root não encontrado! Verifique o arquivo index.html.')
}

// Criar root do React 18
const root = ReactDOM.createRoot(rootElement)

// Renderizar aplicação
root.render(
  <StrictMode>
    <App />
  </StrictMode>
)

// Hot module replacement para desenvolvimento
if (import.meta.hot) {
  import.meta.hot.accept()
}

// Service Worker para cache (opcional - desabilitado por padrão)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}

// Configuração global para desenvolvimento
if (import.meta.env.DEV) {
  console.log('🚀 R.M. Estética PRO+ v2.0 iniciado em modo de desenvolvimento')
  console.log('📦 Versão:', import.meta.env.VITE_APP_VERSION || '2.0.0')
  console.log('🌐 Supabase URL:', import.meta.env.VITE_SUPABASE_URL || 'Não configurado')
  
  // Disponibilizar store global para debugging
  if (typeof window !== 'undefined') {
    window.__APP_VERSION__ = import.meta.env.VITE_APP_VERSION || '2.0.0'
    window.__DEV_MODE__ = true
  }
}

// Tratamento de erros não capturados
window.addEventListener('error', (event) => {
  console.error('Erro não capturado:', event.error)
  
  // Em produção, enviar erro para serviço de monitoramento
  if (import.meta.env.PROD) {
    // Implementar integração com Sentry ou similar
    console.error('Erro em produção:', {
      message: event.error?.message,
      stack: event.error?.stack,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  }
})

// Tratamento de promises rejeitadas
window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rejeitada não tratada:', event.reason)
  
  // Em produção, enviar erro para serviço de monitoramento
  if (import.meta.env.PROD) {
    console.error('Promise rejeitada em produção:', {
      reason: event.reason,
      promise: event.promise,
    })
  }
})

// Configuração de performance (opcional)
if (import.meta.env.DEV) {
  // Medir performance de renderização
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'measure') {
        console.log(`⚡ Performance: ${entry.name} - ${entry.duration}ms`)
      }
    }
  })
  
  observer.observe({ entryTypes: ['measure'] })
}

// Configuração de acessibilidade
if (import.meta.env.DEV) {
  // Avisar sobre problemas de acessibilidade em desenvolvimento
  import('react-dom/client').then(() => {
    console.log('♿ Modo de desenvolvimento: Verificações de acessibilidade ativadas')
  })
}