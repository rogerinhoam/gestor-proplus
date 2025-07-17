// src/types/index.ts
export interface Cliente {
  id: string
  nome: string
  telefone?: string
  carro?: string
  placa?: string
  created_at: string
  updated_at: string
}

export interface Servico {
  id: string
  descricao: string
  valor: number
  dias_retorno?: number
  created_at: string
}

export interface Orcamento {
  id: string
  cliente_id: string
  valor_total: number
  status: 'Orçamento' | 'Aprovado' | 'Finalizado' | 'Cancelado'
  desconto?: number
  formas_pagamento?: string
  created_at: string
  updated_at: string
  clientes?: Cliente
  orcamento_itens?: OrcamentoItem[]
}

export interface OrcamentoItem {
  id: string
  orcamento_id: string
  servico_id?: string
  descricao_servico: string
  valor_cobrado: number
  quantidade: number
}

export interface Despesa {
  id: string
  data: string
  descricao: string
  valor: number
  categoria?: string
}

export interface ContaReceber {
  id: string
  orcamento_id?: string
  valor: number
  data_vencimento: string
  data_pagamento?: string
  status: 'pendente' | 'pago' | 'vencido'
  descricao?: string
  cliente_nome?: string
  created_at: string
  updated_at: string
}

export interface Agendamento {
  id: string
  cliente_id: string
  orcamento_id?: string
  data_hora: string
  servico: string
  status: 'agendado' | 'confirmado' | 'realizado' | 'cancelado'
  observacoes?: string
  created_at: string
  updated_at: string
  clientes?: Cliente
  orcamentos?: Orcamento
}

export interface CRMInteraction {
  id: string
  cliente_id: string
  interaction_type: 'telefone' | 'whatsapp' | 'email' | 'presencial'
  notes: string
  follow_up_date?: string
  created_at: string
  clientes?: Cliente
}

export interface ConfiguracaoSistema {
  id: string
  chave: string
  valor: string
  updated_at: string
}

// Tipos para o Store Zustand
export interface AppState {
  // Clientes
  clientes: Cliente[]
  selectedCliente: Cliente | null
  clientesLoading: boolean
  clientesError: string | null
  
  // Orçamentos
  orcamentos: Orcamento[]
  selectedOrcamento: Orcamento | null
  orcamentosLoading: boolean
  orcamentosError: string | null
  
  // Serviços
  servicos: Servico[]
  servicosLoading: boolean
  servicosError: string | null
  
  // Despesas
  despesas: Despesa[]
  despesasLoading: boolean
  despesasError: string | null
  
  // Contas a Receber
  contasReceber: ContaReceber[]
  contasReceberLoading: boolean
  contasReceberError: string | null
  
  // Agendamentos
  agendamentos: Agendamento[]
  agendamentosLoading: boolean
  agendamentosError: string | null
  
  // CRM
  crmInteractions: CRMInteraction[]
  crmLoading: boolean
  crmError: string | null
  
  // Configurações
  configuracoes: ConfiguracaoSistema[]
  configuracoesLoading: boolean
  configuracoesError: string | null
  
  // UI State
  sidebarOpen: boolean
  currentView: string
  notifications: Notification[]
  
  // Actions
  setClientes: (clientes: Cliente[]) => void
  addCliente: (cliente: Cliente) => void
  updateCliente: (id: string, cliente: Partial<Cliente>) => void
  removeCliente: (id: string) => void
  setSelectedCliente: (cliente: Cliente | null) => void
  
  setOrcamentos: (orcamentos: Orcamento[]) => void
  addOrcamento: (orcamento: Orcamento) => void
  updateOrcamento: (id: string, orcamento: Partial<Orcamento>) => void
  removeOrcamento: (id: string) => void
  setSelectedOrcamento: (orcamento: Orcamento | null) => void
  
  setServicos: (servicos: Servico[]) => void
  addServico: (servico: Servico) => void
  updateServico: (id: string, servico: Partial<Servico>) => void
  removeServico: (id: string) => void
  
  setDespesas: (despesas: Despesa[]) => void
  addDespesa: (despesa: Despesa) => void
  updateDespesa: (id: string, despesa: Partial<Despesa>) => void
  removeDespesa: (id: string) => void
  
  setContasReceber: (contas: ContaReceber[]) => void
  addContaReceber: (conta: ContaReceber) => void
  updateContaReceber: (id: string, conta: Partial<ContaReceber>) => void
  removeContaReceber: (id: string) => void
  
  setAgendamentos: (agendamentos: Agendamento[]) => void
  addAgendamento: (agendamento: Agendamento) => void
  updateAgendamento: (id: string, agendamento: Partial<Agendamento>) => void
  removeAgendamento: (id: string) => void
  
  setCrmInteractions: (interactions: CRMInteraction[]) => void
  addCrmInteraction: (interaction: CRMInteraction) => void
  updateCrmInteraction: (id: string, interaction: Partial<CRMInteraction>) => void
  removeCrmInteraction: (id: string) => void
  
  setConfiguracoes: (configuracoes: ConfiguracaoSistema[]) => void
  updateConfiguracao: (chave: string, valor: string) => void
  
  setSidebarOpen: (open: boolean) => void
  setCurrentView: (view: string) => void
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
  
  setLoading: (module: string, loading: boolean) => void
  setError: (module: string, error: string | null) => void
}

// Tipos para notificações
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  read: boolean
  actions?: NotificationAction[]
}

export interface NotificationAction {
  label: string
  action: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'error'
}

// Tipos para formulários
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'datetime-local' | 'select' | 'textarea'
  required?: boolean
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  validation?: (value: any) => string | null
  mask?: string
}

export interface FormValidation {
  field: string
  message: string
}

// Tipos para API responses
export interface ApiResponse<T> {
  data: T
  error?: string
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Tipos para relatórios
export interface RelatorioPeriodo {
  dataInicio: string
  dataFim: string
  totalClientes: number
  totalOrcamentos: number
  totalReceitas: number
  totalDespesas: number
  saldoLiquido: number
  servicosMaisVendidos: Array<{
    servico: string
    quantidade: number
    receita: number
  }>
  clientesAtivos: number
  clientesInativos: number
}

// Tipos para dashboard
export interface DashboardMetrics {
  totalClientes: number
  clientesAtivos: number
  clientesInativos: number
  orcamentosPendentes: number
  orcamentosAprovados: number
  orcamentosFinalizados: number
  receitaMes: number
  despesaMes: number
  saldoMes: number
  agendamentosHoje: number
  agendamentosAmanha: number
  followUpsPendentes: number
  contasVencidas: number
  contasVencendo: number
}

// Tipos para filtros
export interface FiltroClientes {
  nome?: string
  telefone?: string
  carro?: string
  placa?: string
  inativo?: boolean
  diasInativo?: number
}

export interface FiltroOrcamentos {
  cliente?: string
  status?: string
  dataInicio?: string
  dataFim?: string
  valorMinimo?: number
  valorMaximo?: number
}

export interface FiltroAgendamentos {
  cliente?: string
  status?: string
  dataInicio?: string
  dataFim?: string
  servico?: string
}

export interface FiltroDespesas {
  categoria?: string
  dataInicio?: string
  dataFim?: string
  valorMinimo?: number
  valorMaximo?: number
}

// Tipos para export
export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf'
  fields: string[]
  filters?: any
  dateRange?: {
    start: string
    end: string
  }
}

// Tipos para WhatsApp
export interface WhatsAppTemplate {
  id: string
  name: string
  type: 'inactive_friendly' | 'inactive_offer' | 'maintenance' | 'general_contact' | 'weekly_promo' | 'seasonal_service'
  title: string
  message: string
  variables: string[]
  category: 'marketing' | 'customer_service' | 'follow_up'
}

export interface WhatsAppMessage {
  id: string
  clienteId: string
  template?: string
  message: string
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  sentAt?: string
  deliveredAt?: string
  readAt?: string
  error?: string
}

// Tipos para logs
export interface SystemLog {
  id: string
  level: 'info' | 'warning' | 'error' | 'debug'
  message: string
  module: string
  userId?: string
  metadata?: Record<string, any>
  timestamp: string
}

// Tipos para configurações
export interface AppConfig {
  empresa: {
    nome: string
    cnpj: string
    telefone: string
    endereco: string
    email?: string
    website?: string
  }
  whatsapp: {
    enabled: boolean
    apiKey?: string
    webhookUrl?: string
  }
  pdf: {
    logo?: string
    watermark?: string
    template: 'default' | 'custom'
  }
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  backup: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
    retention: number
  }
}

// Tipos para hooks
export interface UseAsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
  execute: (...args: any[]) => Promise<void>
  reset: () => void
}

// Tipos para validação
export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
}

export interface ValidationSchema {
  [field: string]: ValidationRule
}

// Tipos para utilitários
export interface DateRange {
  start: Date
  end: Date
}

export interface TimeSlot {
  start: string
  end: string
  available: boolean
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

// Tipos para theme
export interface Theme {
  colors: {
    primary: string
    secondary: string
    success: string
    error: string
    warning: string
    info: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  fonts: {
    body: string
    heading: string
    mono: string
  }
}
