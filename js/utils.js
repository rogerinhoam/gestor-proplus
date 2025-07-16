/**
 * Utilitários e funções auxiliares
 * @file utils.js
 * @version 2.0.0
 */

// Formatação de moeda
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Formatação de data
function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

// Formatação de data e hora
function formatDateTime(date) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

// Máscara de telefone
function formatPhone(value) {
    return value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d)(\d{4})$/, '$1-$2');
}

// Máscara de placa
function formatPlate(value) {
    return value
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase()
        .replace(/^([A-Z]{3})(\d)/, '$1-$2');
}

// Debounce para pesquisas
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Gerar ID único
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Sanitizar HTML
function sanitizeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Validar email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validar telefone
function validatePhone(phone) {
    const re = /^\(\d{2}\) \d{4,5}-\d{4}$/;
    return re.test(phone);
}

// Notificação toast
function showNotification(message, type = 'info', duration = 5000) {
    const toast = document.getElementById('notification');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Confirmar ação
function confirmAction(message, title = 'Confirmar') {
    return new Promise((resolve) => {
        const result = window.confirm(`${title}\n\n${message}`);
        resolve(result);
    });
}

// Detectar dispositivo móvel
function isMobile() {
    return window.innerWidth <= 768;
}

// Fechar modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

// Exportar para uso global
window.Utils = {
    formatCurrency,
    formatDate,
    formatDateTime,
    formatPhone,
    formatPlate,
    debounce,
    generateId,
    sanitizeHtml,
    validateEmail,
    validatePhone,
    showNotification,
    confirmAction,
    isMobile,
    closeModal
};
