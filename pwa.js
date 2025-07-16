// Progressive Web App Implementation
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupOfflineHandling();
        this.setupNotifications();
        this.checkIfInstalled();
    }

    // Service Worker Registration
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registrado:', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
            } catch (error) {
                console.error('Erro ao registrar Service Worker:', error);
            }
        }
    }

    // Install Prompt
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });

        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.hideInstallPrompt();
            showNotification('App instalado com sucesso!', 'success');
        });
    }

    showInstallPrompt() {
        const prompt = document.getElementById('pwaInstallPrompt');
        if (prompt && !this.isInstalled) {
            prompt.classList.add('show');
        }
    }

    hideInstallPrompt() {
        const prompt = document.getElementById('pwaInstallPrompt');
        if (prompt) {
            prompt.classList.remove('show');
        }
    }

    async installPWA() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('PWA instalado');
            } else {
                console.log('PWA não instalado');
            }
            
            this.deferredPrompt = null;
            this.hideInstallPrompt();
        }
    }

    dismissPWAPrompt() {
        this.hideInstallPrompt();
        // Don't show again for 7 days
                localStorage.setItem('pwa_prompt_dismissed', Date.now());
    }

    checkIfInstalled() {
        // Check if running in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            this.hideInstallPrompt();
        }
    }

    // Offline Handling
    setupOfflineHandling() {
        window.addEventListener('online', () => {
            this.handleOnline();
        });

        window.addEventListener('offline', () => {
            this.handleOffline();
        });

        // Check initial connection status
        if (!navigator.onLine) {
            this.handleOffline();
        }
    }

    handleOnline() {
        this.updateSyncStatus('Online');
        showNotification('Conexão restaurada', 'success');
        this.syncOfflineData();
    }

    handleOffline() {
        this.updateSyncStatus('Offline');
        showNotification('Modo offline ativado', 'warning');
    }

    updateSyncStatus(status) {
        const syncStatus = document.getElementById('syncStatus');
        if (syncStatus) {
            syncStatus.textContent = status;
            syncStatus.className = status.toLowerCase();
        }
    }

    // Sync offline data when back online
    async syncOfflineData() {
        const offlineData = this.getOfflineData();
        
        if (offlineData.length > 0) {
            for (const item of offlineData) {
                try {
                    await this.syncItem(item);
                    this.removeOfflineItem(item.id);
                } catch (error) {
                    console.error('Erro ao sincronizar item:', error);
                }
            }
            
            showNotification('Dados sincronizados com sucesso', 'success');
        }
    }

    getOfflineData() {
        const data = localStorage.getItem('offline_data');
        return data ? JSON.parse(data) : [];
    }

    saveOfflineData(data) {
        const offlineData = this.getOfflineData();
        offlineData.push({
            id: Date.now(),
             data,
            timestamp: new Date().toISOString(),
            type: data.type || 'unknown'
        });
        
        localStorage.setItem('offline_data', JSON.stringify(offlineData));
    }

    removeOfflineItem(itemId) {
        const offlineData = this.getOfflineData();
        const filteredData = offlineData.filter(item => item.id !== itemId);
        localStorage.setItem('offline_data', JSON.stringify(filteredData));
    }

    async syncItem(item) {
        switch (item.type) {
            case 'cliente':
                return await this.syncCliente(item.data);
            case 'orcamento':
                return await this.syncOrcamento(item.data);
            case 'servico':
                return await this.syncServico(item.data);
            default:
                console.warn('Tipo de item desconhecido:', item.type);
        }
    }

    async syncCliente(clienteData) {
        const { data, error } = await db
            .from('clientes')
            .insert([clienteData]);
        
        if (error) throw error;
        return data;
    }

    async syncOrcamento(orcamentoData) {
        const { data, error } = await db
            .from('orcamentos')
            .insert([orcamentoData]);
        
        if (error) throw error;
        return data;
    }

    async syncServico(servicoData) {
        const { data, error } = await db
            .from('servicos')
            .insert([servicoData]);
        
        if (error) throw error;
        return data;
    }

    // Notifications
    setupNotifications() {
        if ('Notification' in window) {
            this.requestNotificationPermission();
        }
    }

    async requestNotificationPermission() {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notificações habilitadas');
            this.scheduleNotifications();
        }
    }

    scheduleNotifications() {
        // Schedule daily reminder
        setInterval(() => {
            this.sendDailyReminder();
        }, 24 * 60 * 60 * 1000); // 24 hours
    }

    sendDailyReminder() {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('R.M. CRM Pro+', {
                body: 'Não esqueça de verificar seus follow-ups hoje!',
                icon: '/icon-192x192.png',
                badge: '/badge-72x72.png',
                tag: 'daily-reminder'
            });
        }
    }

    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h4>Nova versão disponível!</h4>
                <p>Recarregue a página para obter as últimas melhorias.</p>
                <button onclick="window.location.reload()">Recarregar</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 10000);
    }

    // Background Sync
    registerBackgroundSync(tag) {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            navigator.serviceWorker.ready.then(registration => {
                return registration.sync.register(tag);
            });
        }
    }

    // Cache Management
    async clearCache() {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
        }
    }

    // Analytics
    trackInstallation() {
        if (this.isInstalled) {
            // Track PWA installation
            if (typeof gtag !== 'undefined') {
                gtag('event', 'pwa_install', {
                    event_category: 'engagement',
                    event_label: 'PWA Installation'
                });
            }
        }
    }
}

// Initialize PWA Manager
let pwaManager;

document.addEventListener('DOMContentLoaded', function() {
    pwaManager = new PWAManager();
});

// Global PWA Functions
function installPWA() {
    if (pwaManager) {
        pwaManager.installPWA();
    }
}

function dismissPWAPrompt() {
    if (pwaManager) {
        pwaManager.dismissPWAPrompt();
    }
}

// Export for global access
window.pwaManager = pwaManager;

