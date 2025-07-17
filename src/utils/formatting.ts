import { CURRENCY_CONFIG, DATE_CONFIG, COMPANY_DATA } from './constants';

/**
 * Formatação de valores monetários
 */
export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return 'R$ 0,00';
  
  return new Intl.NumberFormat(CURRENCY_CONFIG.LOCALE, {
    style: 'currency',
    currency: CURRENCY_CONFIG.CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

/**
 * Formatação de números
 */
export const formatNumber = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';
  
  return new Intl.NumberFormat(CURRENCY_CONFIG.LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(numValue);
};

/**
 * Formatação de percentual
 */
export const formatPercentage = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0%';
  
  return new Intl.NumberFormat(CURRENCY_CONFIG.LOCALE, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(numValue / 100);
};

/**
 * Formatação de data
 */
export const formatDate = (value: Date | string): string => {
  if (!value) return '';
  
  const date = new Date(value);
  
  if (isNaN(date.getTime())) return '';
  
  return new Intl.DateTimeFormat(DATE_CONFIG.LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

/**
 * Formatação de data e hora
 */
export const formatDateTime = (value: Date | string): string => {
  if (!value) return '';
  
  const date = new Date(value);
  
  if (isNaN(date.getTime())) return '';
  
  return new Intl.DateTimeFormat(DATE_CONFIG.LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
};

/**
 * Formatação de hora
 */
export const formatTime = (value: Date | string): string => {
  if (!value) return '';
  
  const date = new Date(value);
  
  if (isNaN(date.getTime())) return '';
  
  return new Intl.DateTimeFormat(DATE_CONFIG.LOCALE, {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Formatação de telefone brasileiro
 */
export const formatPhone = (value: string): string => {
  if (!value) return '';
  
  const cleaned = value.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    // Formato: (11) 1234-5678
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11) {
    // Formato: (11) 12345-6789
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  
  return value;
};

/**
 * Formatação de placa de veículo (antigo e Mercosul)
 */
export const formatPlate = (value: string): string => {
  if (!value) return '';
  
  const cleaned = value.replace(/[^A-Z0-9]/g, '').toUpperCase();
  
  if (cleaned.length === 7) {
    // Verifica se é formato Mercosul (ABC1D23)
    if (/^[A-Z]{3}\d[A-Z]\d{2}$/.test(cleaned)) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    }
    
    // Formato antigo (ABC-1234)
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }
  
  return value;
};

/**
 * Formatação de CNPJ
 */
export const formatCNPJ = (value: string): string => {
  if (!value) return '';
  
  const cleaned = value.replace(/\D/g, '');
  
  if (cleaned.length === 14) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
  }
  
  return value;
};

/**
 * Formatação de CEP
 */
export const formatCEP = (value: string): string => {
  if (!value) return '';
  
  const cleaned = value.replace(/\D/g, '');
  
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  
  return value;
};

/**
 * Formatação de nome (capitalização)
 */
export const formatName = (value: string): string => {
  if (!value) return '';
  
  return value
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Não capitalizar preposições e artigos
      const lowercaseWords = ['da', 'de', 'do', 'dos', 'das', 'e', 'em', 'na', 'no', 'nas', 'nos'];
      if (lowercaseWords.includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ')
    .replace(/\s+/g, ' '); // Remove espaços extras
};

/**
 * Formatação de status com cores
 */
export const formatStatus = (status: string): { text: string; color: string } => {
  const statusMap: Record<string, { text: string; color: string }> = {
    // Status de Orçamento
    'Orçamento': { text: 'Orçamento', color: 'bg-blue-100 text-blue-800' },
    'Aprovado': { text: 'Aprovado', color: 'bg-green-100 text-green-800' },
    'Finalizado': { text: 'Finalizado', color: 'bg-gray-100 text-gray-800' },
    'Cancelado': { text: 'Cancelado', color: 'bg-red-100 text-red-800' },
    
    // Status de Agendamento
    'agendado': { text: 'Agendado', color: 'bg-blue-100 text-blue-800' },
    'confirmado': { text: 'Confirmado', color: 'bg-green-100 text-green-800' },
    'realizado': { text: 'Realizado', color: 'bg-gray-100 text-gray-800' },
    'cancelado': { text: 'Cancelado', color: 'bg-red-100 text-red-800' },
    
    // Status de Pagamento
    'pendente': { text: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
    'pago': { text: 'Pago', color: 'bg-green-100 text-green-800' },
    'vencido': { text: 'Vencido', color: 'bg-red-100 text-red-800' }
  };
  
  return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
};

/**
 * Formatação de tempo relativo
 */
export const formatRelativeTime = (date: Date | string): string => {
  if (!date) return '';
  
  const now = new Date();
  const target = new Date(date);
  
  if (isNaN(target.getTime())) return '';
  
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffDays === 0) {
    if (diffHours === 0) {
      if (diffMinutes === 0) return 'Agora';
      if (diffMinutes === 1) return 'Em 1 minuto';
      if (diffMinutes === -1) return 'Há 1 minuto';
      if (diffMinutes > 0) return `Em ${diffMinutes} minutos`;
      return `Há ${Math.abs(diffMinutes)} minutos`;
    }
    if (diffHours === 1) return 'Em 1 hora';
    if (diffHours === -1) return 'Há 1 hora';
    if (diffHours > 0) return `Em ${diffHours} horas`;
    return `Há ${Math.abs(diffHours)} horas`;
  }
  
  if (diffDays === 1) return 'Amanhã';
  if (diffDays === -1) return 'Ontem';
  if (diffDays > 0) return `Em ${diffDays} dias`;
  return `Há ${Math.abs(diffDays)} dias`;
};

/**
 * Formatação de tamanho de arquivo
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Formatação de duração em segundos
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return remainingSeconds === 0 ? `${minutes}m` : `${minutes}m ${remainingSeconds}s`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Formatação de endereço
 */
export const formatAddress = (address: {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}): string => {
  const parts = [];
  
  if (address.street) {
    let streetPart = address.street;
    if (address.number) streetPart += `, ${address.number}`;
    if (address.complement) streetPart += `, ${address.complement}`;
    parts.push(streetPart);
  }
  
  if (address.neighborhood) parts.push(address.neighborhood);
  if (address.city) {
    let cityPart = address.city;
    if (address.state) cityPart += ` - ${address.state}`;
    parts.push(cityPart);
  }
  
  if (address.zipCode) parts.push(`CEP: ${formatCEP(address.zipCode)}`);
  
  return parts.join(', ');
};

/**
 * Formatação de texto truncado
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Formatação de lista de itens
 */
export const formatList = (items: string[], separator: string = ', ', lastSeparator: string = ' e '): string => {
  if (!items || items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return items.join(lastSeparator);
  
  const allButLast = items.slice(0, -1);
  const last = items[items.length - 1];
  
  return allButLast.join(separator) + lastSeparator + last;
};

/**
 * Formatação de cabeçalho de empresa para PDF
 */
export const formatCompanyHeader = (): string => {
  return `
${COMPANY_DATA.nome}
CNPJ: ${formatCNPJ(COMPANY_DATA.cnpj)}
Telefone: ${formatPhone(COMPANY_DATA.telefone)}
${COMPANY_DATA.endereco}
  `.trim();
};

/**
 * Formatação de rodapé para PDF
 */
export const formatPDFFooter = (): string => {
  return `
${formatDateTime(new Date())}
${COMPANY_DATA.agradecimento}
  `.trim();
};

/**
 * Formatação de campo opcional
 */
export const formatOptional = (value: any, formatter?: (value: any) => string): string => {
  if (value === null || value === undefined || value === '') {
    return 'Não informado';
  }
  
  return formatter ? formatter(value) : String(value);
};

/**
 * Formatação de campo booleano
 */
export const formatBoolean = (value: boolean, trueText: string = 'Sim', falseText: string = 'Não'): string => {
  return value ? trueText : falseText;
};

/**
 * Formatação de array para texto
 */
export const formatArrayToText = (array: any[], formatter?: (item: any) => string): string => {
  if (!array || array.length === 0) return 'Nenhum item';
  
  const formattedItems = formatter ? array.map(formatter) : array.map(String);
  return formatList(formattedItems);
};

/**
 * Formatação de iniciais de nome
 */
export const formatInitials = (name: string): string => {
  if (!name) return '';
  
  return name
    .trim()
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

/**
 * Formatação de campo de busca
 */
export const formatSearchTerm = (term: string): string => {
  return term
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
};

/**
 * Formatação de slug para URL
 */
export const formatSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};