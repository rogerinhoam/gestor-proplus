/**
 * PWA - Progressive Web App
 * @file pwa.js
 * @version 2.0.0
 */

// Configuração do PWA
const PWA = {
    // Registrar Service Worker
    init() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('✅ Service Worker registrado:', registration);
                        
                        // Verificar atualizações
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // Nova versão disponível
                                    this.showUpdateNotification();
                                }
                            });
                        });
                    })
                    .catch(error => {
                        console.error('❌ Erro ao registrar Service Worker:', error);
                    });
            });
        }

        // Configurar eventos do PWA
        this.setupPWAEvents();
    },

    // Configurar eventos do PWA
    setupPWAEvents() {
        // Evento de instalação
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // Evento de instalação bem-sucedida
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA instalado com sucesso');
            showNotification('App instalado com sucesso!', 'success');
            this.hideInstallButton();
        });

        // Eventos de conexão
        window.addEventListener('online', () => {
            console.log('🌐 Conectado à internet');
            showNotification('Conectado à internet', 'success');
        });

        window.addEventListener('offline', () => {
            console.log('📴 Desconectado da internet');
            showNotification('Você está offline', 'warning');
        });
    },

    // Mostrar botão de instalação
    showInstallButton() {
        const installButton = document.createElement('button');
        installButton.id = 'installPWA';
        installButton.className = 'btn btn-primary';
        installButton.innerHTML = `
            <i class="fas fa-download"></i>
            Instalar App
        `;
        
        installButton.addEventListener('click', () => {
            this.installPWA();
        });

        // Adicionar ao header
        const headerRight = document.querySelector('.header-right');
        if (headerRight) {
            headerRight.insertBefore(installButton, headerRight.firstChild);
        }
    },

    // Esconder botão de instalação
    hideInstallButton() {
        const installButton = document.getElementById('installPWA');
        if (installButton) {
            installButton.remove();
        }
    },

    // Instalar PWA
    async installPWA() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('✅ Usuário aceitou instalar o PWA');
            } else {
                console.log('❌ Usuário recusou instalar o PWA');
            }
            
            this.deferredPrompt = null;
        }
    },

    // Mostrar notificação de atualização
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <div class="update-text">
                    <i class="fas fa-download"></i>
                    <span>Nova versão disponível!</span>
                </div>
                <button class="btn btn-primary btn-sm" onclick="PWA.updateApp()">
                    Atualizar
                </button>
                <button class="btn btn-secondary btn-sm" onclick="PWA.dismissUpdate()">
                    Mais tarde
                </button>
            </div>
        `;

        document.body.appendChild(notification);
        
        // Mostrar notificação
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
    },

    // Atualizar aplicação
    updateApp() {
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
        }
        
        window.location.reload();
    },

    // Dispensar atualização
    dismissUpdate() {
        const notification = document.querySelector('.update-notification');
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    },

    // Configurar shortcuts
    setupShortcuts() {
        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N = Novo cliente
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                App.showClientForm();
            }
            
            // Ctrl/Cmd + S = Novo serviço
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                App.showServiceForm();
            }
            
            // Ctrl/Cmd + O = Novo orçamento
            if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
                e.preventDefault();
                App.showQuoteForm();
            }
            
            // Ctrl/Cmd + F = Focar na busca
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                const searchInput = document.getElementById('searchClientes');
                if (searchInput && STATE.currentTab === 'clientes') {
                    searchInput.focus();
                }
            }
            
            // Escape = Fechar modais
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal-backdrop');
                modals.forEach(modal => {
                    modal.remove();
                });
            }
        });
    },

    // Configurar notificações push
    setupPushNotifications() {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            // Solicitar permissão para notificações
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('✅ Permissão para notificações concedida');
                    
                    // Configurar notificações para lembretes
                    this.scheduleReminders();
                }
            });
        }
    },

    // Agendar lembretes
    scheduleReminders() {
        // Lembrete para verificar orçamentos pendentes
        setInterval(() => {
            const orcamentosPendentes = STATE.data.orcamentos.filter(o => o.status === 'Orçamento');
            
            if (orcamentosPendentes.length > 0) {
                const badge = document.getElementById('notificationCount');
                if (badge) {
                    badge.textContent = orcamentosPendentes.length;
                    badge.style.display = 'flex';
                }
            }
        }, 60000); // Verificar a cada minuto
    },

    // Compartilhar conteúdo
    share(data) {
        if (navigator.share) {
            navigator.share({
                title: data.title || 'R.M. CRM Pro+',
                text: data.text || 'Confira este orçamento',
                url: data.url || window.location.href
            });
        } else {
            // Fallback para navegadores que não suportam Web Share API
            const url = data.url || window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                showNotification('Link copiado para a área de transferência', 'success');
            });
        }
    }
};

// Adicionar estilos para PWA
const pwaStyles = `
    .update-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        padding: var(--spacing-md);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        min-width: 300px;
    }

    .update-notification.show {
        transform: translateX(0);
    }

    .update-content {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
    }

    .update-text {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        color: var(--text-primary);
        flex: 1;
    }

    .update-text i {
        color: var(--primary-color);
    }

    #installPWA {
        margin-right: var(--spacing-md);
    }

    @media (max-width: 768px) {
        .update-notification {
            top: 10px;
            right: 10px;
            left: 10px;
            transform: translateY(-100%);
        }

        .update-notification.show {
            transform: translateY(0);
        }

        .update-content {
            flex-direction: column;
            gap: var(--spacing-sm);
        }

        .update-text {
            justify-content: center;
        }
    }
`;

// Adicionar estilos ao documento
const styleSheet = document.createElement('style');
styleSheet.textContent = pwaStyles;
document.head.appendChild(styleSheet);

// Inicializar PWA
document.addEventListener('DOMContentLoaded', () => {
    PWA.init();
    PWA.setupShortcuts();
    PWA.setupPushNotifications();
});

// Exportar para uso global
window.PWA = PWA;
