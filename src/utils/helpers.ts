import { PHONE_PATTERNS, PLATE_PATTERNS, CURRENCY_CONFIG, DATE_CONFIG } from './constants';

/**
 * Formatação de texto e valores
 */
export const formatters = {
  // Formatação de moeda
  currency: (value: number): string => {
    return new Intl.NumberFormat(CURRENCY_CONFIG.LOCALE, {
      style: 'currency',
      currency: CURRENCY_CONFIG.CURRENCY,
      minimumFractionDigits: 2
    }).format(value);
  },

  // Formatação de porcentagem
  percentage: (value: number): string => {
    return new Intl.NumberFormat(CURRENCY_CONFIG.LOCALE, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  },

  // Formatação de telefone
  phone: (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return value;
  },

  // Formatação de placa
  plate: (value: string): string => {
    const cleaned = value.replace(/[^A-Z0-9]/g, '').toUpperCase();
    
    if (cleaned.length === 7) {
      // Formato Mercosul: ABC1D23
      return `${cleaned.slice(0, 3)}${cleaned.slice(3, 4)}${cleaned.slice(4, 5)}${cleaned.slice(5, 7)}`;
    }
    
    if (cleaned.length >= 7) {
      // Formato antigo: ABC-1234
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}`;
    }
    
    return value;
  },

  // Formatação de data
  date: (value: Date | string): string => {
    const date = new Date(value);
    return new Intl.DateTimeFormat(DATE_CONFIG.LOCALE, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  },

  // Formatação de data e hora
  datetime: (value: Date | string): string => {
    const date = new Date(value);
    return new Intl.DateTimeFormat(DATE_CONFIG.LOCALE, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  },

  // Formatação de tempo
  time: (value: Date | string): string => {
    const date = new Date(value);
    return new Intl.DateTimeFormat(DATE_CONFIG.LOCALE, {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  },

  // Formatação de número
  number: (value: number): string => {
    return new Intl.NumberFormat(CURRENCY_CONFIG.LOCALE).format(value);
  },

  // Capitalização de nome
  name: (value: string): string => {
    return value
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  // Formatação de CNPJ
  cnpj: (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 14) {
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
    }
    return value;
  },

  // Formatação de CEP
  cep: (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }
    return value;
  }
};

/**
 * Validações
 */
export const validators = {
  // Validação de email
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  // Validação de telefone
  phone: (value: string): boolean => {
    const cleaned = value.replace(/\D/g, '');
    return PHONE_PATTERNS.BR_CLEAN.test(cleaned);
  },

  // Validação de placa
  plate: (value: string): boolean => {
    const cleaned = value.replace(/[^A-Z0-9]/g, '').toUpperCase();
    return PLATE_PATTERNS.OLD.test(cleaned) || PLATE_PATTERNS.MERCOSUL.test(cleaned);
  },

  // Validação de CNPJ
  cnpj: (value: string): boolean => {
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cleaned)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    let weight = 5;
    
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleaned.charAt(i)) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    
    let digit1 = sum % 11;
    digit1 = digit1 < 2 ? 0 : 11 - digit1;
    
    if (parseInt(cleaned.charAt(12)) !== digit1) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    weight = 6;
    
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleaned.charAt(i)) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    
    let digit2 = sum % 11;
    digit2 = digit2 < 2 ? 0 : 11 - digit2;
    
    return parseInt(cleaned.charAt(13)) === digit2;
  },

  // Validação de CEP
  cep: (value: string): boolean => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length === 8;
  },

  // Validação de valor monetário
  currency: (value: number): boolean => {
    return typeof value === 'number' && value >= 0;
  },

  // Validação de data
  date: (value: Date | string): boolean => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  },

  // Validação de campos obrigatórios
  required: (value: any): boolean => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  }
};

/**
 * Utilitários de data
 */
export const dateUtils = {
  // Adicionar dias a uma data
  addDays: (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  // Subtrair dias de uma data
  subtractDays: (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  },

  // Verificar se uma data é hoje
  isToday: (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  },

  // Verificar se uma data é ontem
  isYesterday: (date: Date): boolean => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  },

  // Verificar se uma data é amanhã
  isTomorrow: (date: Date): boolean => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  },

  // Obter início do dia
  startOfDay: (date: Date): Date => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  },

  // Obter fim do dia
  endOfDay: (date: Date): Date => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  },

  // Obter início da semana
  startOfWeek: (date: Date): Date => {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day;
    return new Date(result.setDate(diff));
  },

  // Obter fim da semana
  endOfWeek: (date: Date): Date => {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day + 6;
    return new Date(result.setDate(diff));
  },

  // Obter início do mês
  startOfMonth: (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  },

  // Obter fim do mês
  endOfMonth: (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  },

  // Diferença em dias entre duas datas
  diffInDays: (date1: Date, date2: Date): number => {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  },

  // Formato relativo (há X dias, em X dias)
  relativeTime: (date: Date): string => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays === -1) return 'Ontem';
    if (diffDays > 0) return `Em ${diffDays} dias`;
    return `Há ${Math.abs(diffDays)} dias`;
  }
};

/**
 * Utilitários de array
 */
export const arrayUtils = {
  // Remover duplicatas
  unique: <T>(array: T[]): T[] => {
    return [...new Set(array)];
  },

  // Agrupar por propriedade
  groupBy: <T>(array: T[], key: keyof T): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const value = String(item[key]);
      groups[value] = groups[value] || [];
      groups[value].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },

  // Ordenar por propriedade
  sortBy: <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
    return [...array].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  },

  // Filtrar por propriedade
  filterBy: <T>(array: T[], key: keyof T, value: any): T[] => {
    return array.filter(item => item[key] === value);
  },

  // Buscar por texto
  search: <T>(array: T[], searchTerm: string, keys: (keyof T)[]): T[] => {
    const term = searchTerm.toLowerCase();
    return array.filter(item =>
      keys.some(key =>
        String(item[key]).toLowerCase().includes(term)
      )
    );
  },

  // Paginar array
  paginate: <T>(array: T[], page: number, pageSize: number): T[] => {
    const start = (page - 1) * pageSize;
    return array.slice(start, start + pageSize);
  }
};

/**
 * Utilitários de string
 */
export const stringUtils = {
  // Capitalizar primeira letra
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // Converter para slug
  slug: (str: string): string => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  },

  // Truncar texto
  truncate: (str: string, length: number): string => {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
  },

  // Gerar ID único
  generateId: (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Limpar texto
  clean: (str: string): string => {
    return str.trim().replace(/\s+/g, ' ');
  },

  // Remover acentos
  removeAccents: (str: string): string => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
};

/**
 * Utilitários de localStorage
 */
export const storageUtils = {
  // Salvar no localStorage
  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  },

  // Buscar no localStorage
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Erro ao buscar no localStorage:', error);
      return defaultValue;
    }
  },

  // Remover do localStorage
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Erro ao remover do localStorage:', error);
    }
  },

  // Limpar localStorage
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
    }
  }
};

/**
 * Utilitários de performance
 */
export const performanceUtils = {
  // Debounce
  debounce: <T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  // Throttle
  throttle: <T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void => {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  },

  // Memoização simples
  memoize: <T extends (...args: any[]) => any>(func: T): T => {
    const cache = new Map();
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = func(...args);
      cache.set(key, result);
      return result;
    }) as T;
  }
};

/**
 * Utilitários de URL
 */
export const urlUtils = {
  // Construir query string
  buildQueryString: (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  },

  // Parsear query string
  parseQueryString: (search: string): Record<string, string> => {
    const params = new URLSearchParams(search);
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
};

/**
 * Utilitários de erro
 */
export const errorUtils = {
  // Extrair mensagem de erro
  getMessage: (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Erro desconhecido';
  },

  // Verificar se é erro de rede
  isNetworkError: (error: unknown): boolean => {
    return error instanceof Error && error.name === 'NetworkError';
  },

  // Verificar se é erro de timeout
  isTimeoutError: (error: unknown): boolean => {
    return error instanceof Error && error.name === 'TimeoutError';
  }
};