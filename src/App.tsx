import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { I18nextProvider } from 'react-i18next'

import { MainLayout } from '@/components/layout/MainLayout'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useInitializeApp } from '@/hooks/useInitializeApp'
import i18n from '@/utils/i18n'

// Lazy loading dos módulos para otimização
const DashboardView = React.lazy(() => import('@/features/dashboard/DashboardView'))
const ClientesView = React.lazy(() => import('@/features/clientes/ClientesView'))
const OrcamentosView = React.lazy(() => import('@/features/orcamentos/OrcamentosView'))
const AgendaView = React.lazy(() => import('@/features/agenda/AgendaView'))
const FinanceiroView = React.lazy(() => import('@/features/financeiro/FinanceiroView'))
const CRMView = React.lazy(() => import('@/features/crm/CRMView'))
const ConfiguracoesView = React.lazy(() => import('@/features/configuracoes/ConfiguracoesView'))

/**
 * Componente principal da aplicação R.M. Estética PRO+ v2.0
 * 
 * Características:
 * - Roteamento com lazy loading
 * - Tratamento de erros global
 * - Sistema de notificações
 * - Internacionalização
 * - Monitoramento de conectividade
 * - Inicialização automática
 */
function App() {
  const isOnline = useOnlineStatus()
  const { isInitialized, isLoading, error } = useInitializeApp()

  // Mostrar loading durante inicialização
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando R.M. Estética PRO+...</p>
        </div>
      </div>
    )
  }

  // Mostrar erro se falhar na inicialização
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h2 className="font-bold text-lg mb-2">Erro na Inicialização</h2>
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <I18nextProvider i18n={i18n}>
      <ErrorBoundary>
        <Router>
          <div className="min-h-screen bg-gray-50">
            {/* Indicador de status offline */}
            {!isOnline && (
              <div className="bg-red-600 text-white text-center py-2 px-4 text-sm font-medium">
                ⚠️ Você está offline. Algumas funcionalidades podem estar limitadas.
              </div>
            )}

            <MainLayout>
              <Suspense 
                fallback={
                  <div className="flex items-center justify-center min-h-[400px]">
                    <LoadingSpinner size="lg" />
                  </div>
                }
              >
                <Routes>
                  {/* Rota principal - Dashboard */}
                  <Route path="/" element={<DashboardView />} />
                  
                  {/* Rotas dos módulos funcionais */}
                  <Route path="/clientes" element={<ClientesView />} />
                  <Route path="/orcamentos" element={<OrcamentosView />} />
                  <Route path="/agenda" element={<AgendaView />} />
                  <Route path="/financeiro" element={<FinanceiroView />} />
                  <Route path="/crm" element={<CRMView />} />
                  <Route path="/configuracoes" element={<ConfiguracoesView />} />
                  
                  {/* Rota de fallback - 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </MainLayout>

            {/* Sistema de notificações toast */}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '16px',
                  maxWidth: '500px',
                },
                success: {
                  style: {
                    background: 'rgba(33, 128, 141, 1)',
                  },
                  iconTheme: {
                    primary: '#fff',
                    secondary: 'rgba(33, 128, 141, 1)',
                  },
                },
                error: {
                  style: {
                    background: 'rgba(192, 21, 47, 1)',
                  },
                  iconTheme: {
                    primary: '#fff',
                    secondary: 'rgba(192, 21, 47, 1)',
                  },
                },
              }}
            />
          </div>
        </Router>
      </ErrorBoundary>
    </I18nextProvider>
  )
}

/**
 * Componente para página não encontrada (404)
 */
function NotFoundPage() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-400">404</h1>
        <p className="text-xl text-gray-600 mt-4">Página não encontrada</p>
        <p className="text-gray-500 mt-2">A página que você está procurando não existe.</p>
        <button 
          onClick={() => window.history.back()}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voltar
        </button>
      </div>
    </div>
  )
}

export default App