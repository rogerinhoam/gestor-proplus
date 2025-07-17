// Sistema de Cores
export const COLORS = {
  primary: 'rgba(33, 128, 141, 1)',
  primaryDark: 'rgba(25, 96, 106, 1)',
  secondary: 'rgba(94, 82, 64, 0.12)',
  secondaryDark: 'rgba(94, 82, 64, 0.2)',
  error: 'rgba(192, 21, 47, 1)',
  errorDark: 'rgba(153, 17, 38, 1)',
  success: 'rgba(34, 197, 94, 1)',
  successDark: 'rgba(22, 163, 74, 1)',
  warning: 'rgba(245, 158, 11, 1)',
  warningDark: 'rgba(217, 119, 6, 1)',
  info: 'rgba(59, 130, 246, 1)',
  infoDark: 'rgba(37, 99, 235, 1)',
  
  // Tons de Cinza
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
};

// Status de Orçamentos
export const ORCAMENTO_STATUS = {
  ORCAMENTO: 'Orçamento',
  APROVADO: 'Aprovado',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado'
} as const;

export const ORCAMENTO_STATUS_COLORS = {
  [ORCAMENTO_STATUS.ORCAMENTO]: 'bg-blue-100 text-blue-800',
  [ORCAMENTO_STATUS.APROVADO]: 'bg-green-100 text-green-800',
  [ORCAMENTO_STATUS.FINALIZADO]: 'bg-gray-100 text-gray-800',
  [ORCAMENTO_STATUS.CANCELADO]: 'bg-red-100 text-red-800'
};

// Status de Agendamentos
export const AGENDAMENTO_STATUS = {
  AGENDADO: 'agendado',
  CONFIRMADO: 'confirmado',
  REALIZADO: 'realizado',
  CANCELADO: 'cancelado'
} as const;

export const AGENDAMENTO_STATUS_COLORS = {
  [AGENDAMENTO_STATUS.AGENDADO]: 'bg-blue-100 text-blue-800',
  [AGENDAMENTO_STATUS.CONFIRMADO]: 'bg-green-100 text-green-800',
  [AGENDAMENTO_STATUS.REALIZADO]: 'bg-gray-100 text-gray-800',
  [AGENDAMENTO_STATUS.CANCELADO]: 'bg-red-100 text-red-800'
};

// Tipos de Interação CRM
export const CRM_INTERACTION_TYPES = {
  TELEFONE: 'telefone',
  WHATSAPP: 'whatsapp',
  EMAIL: 'email',
  PRESENCIAL: 'presencial',
  OUTROS: 'outros'
} as const;

// Categorias de Despesas
export const EXPENSE_CATEGORIES = [
  'Produtos',
  'Equipamentos',
  'Aluguel',
  'Energia',
  'Água',
  'Internet',
  'Combustível',
  'Manutenção',
  'Marketing',
  'Salários',
  'Impostos',
  'Outros'
] as const;

// Formas de Pagamento
export const PAYMENT_METHODS = [
  'Dinheiro',
  'PIX',
  'Cartão de Débito',
  'Cartão de Crédito',
  'Transferência Bancária',
  'Boleto',
  'Outros'
] as const;

// Formatos de Telefone
export const PHONE_PATTERNS = {
  BR: /^\(\d{2}\) \d{4,5}-\d{4}$/,
  BR_CLEAN: /^\d{10,11}$/
};

// Formatos de Placa
export const PLATE_PATTERNS = {
  OLD: /^[A-Z]{3}-\d{4}$/,
  MERCOSUL: /^[A-Z]{3}\d[A-Z]\d{2}$/
};

// Configurações de Paginação
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100]
};

// Configurações de Busca
export const SEARCH = {
  DEBOUNCE_DELAY: 300,
  MIN_SEARCH_LENGTH: 2
};

// Configurações de Arquivo
export const FILE_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain', 'application/msword']
};

// Configurações de API
export const API_CONFIG = {
  REQUEST_TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
};

// Configurações de Cache
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutos
  MAX_CACHE_SIZE: 100,
  STORAGE_KEY: 'rm-estetica-cache'
};

// Configurações de Notificação
export const NOTIFICATION_CONFIG = {
  DEFAULT_DURATION: 5000,
  ERROR_DURATION: 8000,
  SUCCESS_DURATION: 3000,
  MAX_NOTIFICATIONS: 3
};

// Dados da Empresa
export const COMPANY_DATA = {
  nome: 'R.M. Estética Automotiva',
  cnpj: '18.637.639/0001-48',
  telefone: '(24) 99948-6232',
  endereco: 'Rua 40, TV - Recanto dos Pássaros, Pq. Mambucaba, Angra dos Reis - RJ',
  email: 'contato@rmestetica.com.br',
  site: 'www.rmestetica.com.br',
  agradecimento: 'Obrigado pela preferência e volte sempre! 👍'
};

// Configurações de Data
export const DATE_CONFIG = {
  LOCALE: 'pt-BR',
  DATE_FORMAT: 'dd/MM/yyyy',
  DATETIME_FORMAT: 'dd/MM/yyyy HH:mm',
  TIME_FORMAT: 'HH:mm'
};

// Configurações de Moeda
export const CURRENCY_CONFIG = {
  LOCALE: 'pt-BR',
  CURRENCY: 'BRL',
  SYMBOL: 'R$'
};

// Configurações de Validação
export const VALIDATION_CONFIG = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_PHONE_LENGTH: 15,
  MAX_EMAIL_LENGTH: 100
};

// Configurações de Horário de Trabalho
export const BUSINESS_HOURS = {
  START: '08:00',
  END: '18:00',
  LUNCH_START: '12:00',
  LUNCH_END: '13:00',
  WORKING_DAYS: [1, 2, 3, 4, 5, 6] // Segunda a Sábado
};

// Configurações de Agendamento
export const APPOINTMENT_CONFIG = {
  SLOT_DURATION: 30, // minutos
  ADVANCE_BOOKING_DAYS: 30,
  MAX_APPOINTMENTS_PER_DAY: 16,
  REMINDER_HOURS: [24, 2] // Lembretes 24h e 2h antes
};

// Configurações de Relatórios
export const REPORT_CONFIG = {
  CHART_COLORS: [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6B7280'
  ],
  EXPORT_FORMATS: ['PDF', 'CSV', 'Excel'],
  DATE_RANGES: {
    TODAY: 'hoje',
    YESTERDAY: 'ontem',
    LAST_7_DAYS: 'ultimos_7_dias',
    LAST_30_DAYS: 'ultimos_30_dias',
    THIS_MONTH: 'este_mes',
    LAST_MONTH: 'mes_passado',
    THIS_YEAR: 'este_ano',
    CUSTOM: 'personalizado'
  }
};

// Configurações de Backup
export const BACKUP_CONFIG = {
  AUTO_BACKUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 horas
  MAX_BACKUPS: 7,
  BACKUP_STORAGE_KEY: 'rm-estetica-backup'
};

// Configurações de Segurança
export const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutos
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 horas
  CSRF_TOKEN_LENGTH: 32
};

// Configurações de Performance
export const PERFORMANCE_CONFIG = {
  LAZY_LOAD_THRESHOLD: 50,
  IMAGE_OPTIMIZATION: {
    QUALITY: 85,
    MAX_WIDTH: 1920,
    MAX_HEIGHT: 1080
  },
  BUNDLE_SIZE_LIMIT: 2 * 1024 * 1024 // 2MB
};

// Configurações de Acessibilidade
export const ACCESSIBILITY_CONFIG = {
  FOCUS_OUTLINE: '2px solid #3B82F6',
  HIGH_CONTRAST_MODE: false,
  REDUCED_MOTION: false,
  SCREEN_READER_SUPPORT: true
};

// Configurações de Desenvolvimento
export const DEV_CONFIG = {
  ENABLE_DEVTOOLS: process.env.NODE_ENV === 'development',
  MOCK_API_DELAY: 500,
  ENABLE_LOGGING: process.env.NODE_ENV === 'development',
  SHOW_PERFORMANCE_METRICS: process.env.NODE_ENV === 'development'
};

// Configurações de Produção
export const PROD_CONFIG = {
  ENABLE_ANALYTICS: true,
  ENABLE_ERROR_REPORTING: true,
  ENABLE_MONITORING: true,
  CACHE_STATIC_ASSETS: true
};