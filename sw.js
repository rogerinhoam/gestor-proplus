// ===== CONFIGURAÇÃO DO SERVICE WORKER =====
const CACHE_NAME = 'rm-crm-pro-v2.0.0';
const CACHE_VERSION = '2.0.0';
const OFFLINE_URL = '/offline.html';

// Recursos para pré-cache (essenciais)
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/offline.html'
];

// Recursos externos (CDN)
const EXTERNAL_RESOURCES = [
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.51.0/dist/umd/supabase.js',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js'
];

// URLs da API Supabase
const SUPABASE_URLS = [
    'https://bezbszbkaifcanqsmdbi.supabase.co'
];

// Configuração de cache por tipo de recurso
const CACHE_STRATEGIES = {
    // Páginas HTML - Network First
    pages: {
        strategy: 'networkFirst',
        cacheName: `${CACHE_NAME}-pages`,
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        maxEntries: 50
    },
    
    // CSS e JS - Stale While Revalidate
    static: {
        strategy: 'staleWhileRevalidate',
        cacheName: `${CACHE_NAME}-static`,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
        maxEntries: 100
    },
    
    // Imagens - Cache First
    images: {
        strategy: 'cacheFirst',
        cacheName: `${CACHE_NAME}-images`,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
        maxEntries: 200
    },
    
    // Fonts - Cache First
    fonts: {
        strategy: 'cacheFirst',
        cacheName: `${CACHE_NAME}-fonts`,
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 ano
        maxEntries: 30
    },
    
    // API Supabase - Network First com fallback
    api: {
        strategy: 'networkFirst',
        cacheName: `${CACHE_NAME}-api`,
        maxAge: 5 * 60 * 1000, // 5 minutos
        maxEntries: 100
    }
};

// ===== UTILITÁRIOS =====
const Utils = {
    // Criar resposta JSON
    createJSONResponse: (data) => {
        return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
        });
    },

    // Criar resposta HTML
    createHTMLResponse: (html) => {
        return new Response(html, {
            headers: { 'Content-Type': 'text/html' }
        });
    },

    // Verificar se é uma URL da API
    isApiUrl: (url) => {
        return SUPABASE_URLS.some(apiUrl => url.includes(apiUrl));
    },

    // Obter estratégia de cache baseada na URL
    getCacheStrategy: (url) => {
        if (url.includes('.html') || url.endsWith('/')) {
            return CACHE_STRATEGIES.pages;
        } else if (url.includes('.css') || url.includes('.js')) {
            return CACHE_STRATEGIES.static;
        } else if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
            return CACHE_STRATEGIES.fonts;
        } else if (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg') || url.includes('.gif') || url.includes('.svg')) {
            return CACHE_STRATEGIES.images;
        } else if (Utils.isApiUrl(url)) {
            return CACHE_STRATEGIES.api;
        } else {
            return CACHE_STRATEGIES.static;
        }
    },

    // Limpar cache antigo
    cleanOldCaches: async () => {
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => 
            name.startsWith('rm-crm-pro-') && name !== CACHE_NAME
        );
        
        await Promise.all(
            oldCaches.map(cacheName => caches.delete(cacheName))
        );
        
        console.log('🧹 Caches antigos limpos:', oldCaches);
    },

    // Limpar entradas antigas do cache
    cleanCacheEntries: async (cacheName, maxEntries, maxAge) => {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        if (keys.length > maxEntries) {
            const entriesToDelete = keys.slice(0, keys.length - maxEntries);
            await Promise.all(
                entriesToDelete.map(key => cache.delete(key))
            );
        }
        
        // Limpar entradas antigas baseadas na data
        const now = Date.now();
        const requests = await cache.keys();
        
        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const dateHeader = response.headers.get('date');
                if (dateHeader) {
                    const age = now - new Date(dateHeader).getTime();
                    if (age > maxAge) {
                        await cache.delete(request);
                    }
                }
            }
        }
    },

    // Salvar dados offline
    saveOfflineData: async (key, data) => {
        try {
            const cache = await caches.open(`${CACHE_NAME}-offline-data`);
            const response = Utils.createJSONResponse({
                data: data,
                timestamp: Date.now(),
                id: Math.random().toString(36).substr(2, 9)
            });
            await cache.put(`/offline-data/${key}`, response);
        } catch (error) {
            console.error('Erro ao salvar dados offline:', error);
        }
    },

    // Recuperar dados offline
    getOfflineData: async (key) => {
        try {
            const cache = await caches.open(`${CACHE_NAME}-offline-data`);
            const response = await cache.match(`/offline-data/${key}`);
            if (response) {
                const data = await response.json();
                return data;
            }
        } catch (error) {
            console.error('Erro ao recuperar dados offline:', error);
        }
        return null;
    },

    // Listar todos os dados offline
    getAllOfflineData: async () => {
        try {
            const cache = await caches.open(`${CACHE_NAME}-offline-data`);
            const keys = await cache.keys();
            const offlineData = [];
            
            for (const request of keys) {
                const response = await cache.match(request);
                if (response) {
                    const data = await response.json();
                    offlineData.push(data);
                }
            }
            
            return offlineData;
        } catch (error) {
            console.error('Erro ao listar dados offline:', error);
            return [];
        }
    },

    // Remover dados offline
    removeOfflineData: async (key) => {
        try {
            const cache = await caches.open(`${CACHE_NAME}-offline-data`);
            await cache.delete(`/offline-data/${key}`);
        } catch (error) {
            console.error('Erro ao remover dados offline:', error);
        }
    }
};

// ===== ESTRATÉGIAS DE CACHE =====
const CacheStrategies = {
    // Network First - Tenta rede primeiro, fallback para cache
    networkFirst: async (request, cacheName) => {
        try {
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
                const cache = await caches.open(cacheName);
                await cache.put(request, networkResponse.clone());
                return networkResponse;
            }
        } catch (error) {
            console.warn('Network failed, trying cache:', error);
        }
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Se não há cache e é uma página, retorna offline
        if (request.destination === 'document') {
            return caches.match(OFFLINE_URL);
        }
        
        throw new Error('No network and no cache');
    },

    // Cache First - Tenta cache primeiro, fallback para rede
    cacheFirst: async (request, cacheName) => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        try {
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
                const cache = await caches.open(cacheName);
                await cache.put(request, networkResponse.clone());
                return networkResponse;
            }
        } catch (error) {
            console.warn('Network failed:', error);
        }
        
        throw new Error('No cache and no network');
    },

    // Stale While Revalidate - Retorna cache e atualiza em background
    staleWhileRevalidate: async (request, cacheName) => {
        const cachedResponse = await caches.match(request);
        
        const networkPromise = fetch(request).then(async (networkResponse) => {
            if (networkResponse.ok) {
                const cache = await caches.open(cacheName);
                await cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        }).catch(error => {
            console.warn('Background fetch failed:', error);
        });
        
        return cachedResponse || networkPromise;
    }
};

// ===== INSTALAÇÃO DO SERVICE WORKER =====
self.addEventListener('install', (event) => {
    console.log('📦 Service Worker instalando...');
    
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            
            // Pré-cache dos recursos essenciais
            await cache.addAll(PRECACHE_URLS);
            
            // Tentar fazer cache dos recursos externos
            for (const url of EXTERNAL_RESOURCES) {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        await cache.put(url, response);
                    }
                } catch (error) {
                    console.warn(`Falha ao fazer cache de ${url}:`, error);
                }
            }
            
            // Criar página offline se não existir
            if (!PRECACHE_URLS.includes('/offline.html')) {
                await cache.put('/offline.html', Utils.createHTMLResponse(`
                    <!DOCTYPE html>
                    <html lang="pt-BR">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>R.M. CRM - Offline</title>
                        <style>
                            body {
                                font-family: 'Inter', sans-serif;
                                background: #0f172a;
                                color: #f1f5f9;
                                margin: 0;
                                padding: 2rem;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                min-height: 100vh;
                                text-align: center;
                            }
                            .offline-container {
                                max-width: 400px;
                            }
                            .offline-icon {
                                font-size: 4rem;
                                color: #ef4444;
                                margin-bottom: 1rem;
                            }
                            h1 {
                                color: #ef4444;
                                margin-bottom: 1rem;
                            }
                            p {
                                color: #cbd5e1;
                                line-height: 1.6;
                                margin-bottom: 2rem;
                            }
                            .btn {
                                background: #ef4444;
                                color: white;
                                padding: 0.75rem 1.5rem;
                                border: none;
                                border-radius: 0.5rem;
                                cursor: pointer;
                                font-weight: 500;
                                text-decoration: none;
                                display: inline-block;
                            }
                            .btn:hover {
                                background: #dc2626;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="offline-container">
                            <div class="offline-icon">🚫</div>
                            <h1>Sem Conexão</h1>
                            <p>Você está offline. Verifique sua conexão com a internet e tente novamente.</p>
                            <a href="/" class="btn">Tentar Novamente</a>
                        </div>
                    </body>
                    </html>
                `));
            }
            
            console.log('✅ Service Worker instalado com sucesso');
        })()
    );
    
    // Ativar imediatamente
    self.skipWaiting();
});

// ===== ATIVAÇÃO DO SERVICE WORKER =====
self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker ativando...');
    
    event.waitUntil(
        (async () => {
            // Limpar caches antigos
            await Utils.cleanOldCaches();
            
            // Limpar entradas antigas dos caches atuais
            for (const [name, config] of Object.entries(CACHE_STRATEGIES)) {
                await Utils.cleanCacheEntries(
                    config.cacheName,
                    config.maxEntries,
                    config.maxAge
                );
            }
            
            // Assumir controle de todas as páginas
            await self.clients.claim();
            
            console.log('✅ Service Worker ativado com sucesso');
        })()
    );
});

// ===== INTERCEPTAÇÃO DE REQUESTS =====
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Ignorar requests não-HTTP
    if (!request.url.startsWith('http')) {
        return;
    }
    
    // Ignorar requests do Chrome DevTools
    if (url.pathname.startsWith('/devtools/')) {
        return;
    }
    
    // Interceptar e processar request
    event.respondWith(
        (async () => {
            try {
                const strategy = Utils.getCacheStrategy(request.url);
                
                // Aplicar estratégia de cache apropriada
                switch (strategy.strategy) {
                    case 'networkFirst':
                        return await CacheStrategies.networkFirst(request, strategy.cacheName);
                    
                    case 'cacheFirst':
                        return await CacheStrategies.cacheFirst(request, strategy.cacheName);
                    
                    case 'staleWhileRevalidate':
                        return await CacheStrategies.staleWhileRevalidate(request, strategy.cacheName);
                    
                    default:
                        return await fetch(request);
                }
            } catch (error) {
                console.error('Erro ao processar request:', error);
                
                // Fallback para página offline se for navegação
                if (request.destination === 'document') {
                    return caches.match(OFFLINE_URL);
                }
                
                // Para outros recursos, retorna erro
                return new Response('Recurso não disponível offline', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
            }
        })()
    );
});

// ===== BACKGROUND SYNC =====
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync:', event.tag);
    
    switch (event.tag) {
        case 'clients-sync':
            event.waitUntil(syncClients());
            break;
        
        case 'services-sync':
            event.waitUntil(syncServices());
            break;
        
        case 'quotes-sync':
            event.waitUntil(syncQuotes());
            break;
        
        case 'offline-data-sync':
            event.waitUntil(syncOfflineData());
            break;
        
        default:
            console.warn('Sync tag desconhecida:', event.tag);
    }
});

// Sincronizar clientes
async function syncClients() {
    try {
        const offlineClients = await Utils.getOfflineData('clients');
        if (offlineClients && offlineClients.data) {
            console.log('🔄 Sincronizando clientes offline...');
            
            // Aqui você enviaria os dados para o servidor
            // Por exemplo: await fetch('/api/clients', { method: 'POST', body: JSON.stringify(offlineClients.data) });
            
            // Após sincronizar com sucesso, remover dados offline
            await Utils.removeOfflineData('clients');
            
            // Notificar cliente sobre sincronização
            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SYNC_COMPLETE',
                        data: { type: 'clients', success: true }
                    });
                });
            });
        }
    } catch (error) {
        console.error('Erro ao sincronizar clientes:', error);
    }
}

// Sincronizar serviços
async function syncServices() {
    try {
        const offlineServices = await Utils.getOfflineData('services');
        if (offlineServices && offlineServices.data) {
            console.log('🔄 Sincronizando serviços offline...');
            
            // Sincronizar com servidor
            // await fetch('/api/services', { method: 'POST', body: JSON.stringify(offlineServices.data) });
            
            await Utils.removeOfflineData('services');
            
            // Notificar cliente
            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SYNC_COMPLETE',
                        data: { type: 'services', success: true }
                    });
                });
            });
        }
    } catch (error) {
        console.error('Erro ao sincronizar serviços:', error);
    }
}

// Sincronizar orçamentos
async function syncQuotes() {
    try {
        const offlineQuotes = await Utils.getOfflineData('quotes');
        if (offlineQuotes && offlineQuotes.data) {
            console.log('🔄 Sincronizando orçamentos offline...');
            
            // Sincronizar com servidor
            // await fetch('/api/quotes', { method: 'POST', body: JSON.stringify(offlineQuotes.data) });
            
            await Utils.removeOfflineData('quotes');
            
            // Notificar cliente
            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SYNC_COMPLETE',
                        data: { type: 'quotes', success: true }
                    });
                });
            });
        }
    } catch (error) {
        console.error('Erro ao sincronizar orçamentos:', error);
    }
}

// Sincronizar todos os dados offline
async function syncOfflineData() {
    try {
        const allOfflineData = await Utils.getAllOfflineData();
        
        if (allOfflineData.length > 0) {
            console.log('🔄 Sincronizando todos os dados offline...');
            
            for (const dataItem of allOfflineData) {
                // Processar cada item de dados
                console.log('Sincronizando:', dataItem);
                
                // Aqui você implementaria a lógica específica de sincronização
                // baseada no tipo de dados
            }
            
            // Notificar cliente sobre sincronização completa
            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SYNC_COMPLETE',
                        data: { type: 'all', success: true, count: allOfflineData.length }
                    });
                });
            });
        }
    } catch (error) {
        console.error('Erro ao sincronizar dados offline:', error);
    }
}

// ===== PUSH NOTIFICATIONS =====
self.addEventListener('push', (event) => {
    console.log('📬 Push notification recebida');
    
    let data = {};
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (error) {
            data = { title: 'R.M. CRM', body: event.data.text() };
        }
    }
    
    const options = {
        title: data.title || 'R.M. CRM Pro+',
        body: data.body || 'Nova notificação do sistema',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        image: data.image,
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: data.primaryKey || 'default',
            url: data.url || '/'
        },
        actions: [
            {
                action: 'explore',
                title: 'Abrir',
                icon: '/icons/icon-192x192.png'
            },
            {
                action: 'close',
                title: 'Fechar',
                icon: '/icons/icon-192x192.png'
            }
        ],
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false,
        tag: data.tag || 'rm-crm-notification'
    };
    
    event.waitUntil(
        self.registration.showNotification(options.title, options)
    );
});

// ===== CLIQUE EM NOTIFICAÇÃO =====
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notificação clicada:', event.action);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        const urlToOpen = event.notification.data.url || '/';
        
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
                // Procurar por uma janela já aberta
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Se não encontrar, abrir nova janela
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
        );
    } else if (event.action === 'close') {
        // Apenas fechar (já foi fechada acima)
        console.log('Notificação fechada pelo usuário');
    }
});

// ===== MENSAGENS DO CLIENT =====
self.addEventListener('message', (event) => {
    console.log('📨 Mensagem recebida:', event.data);
    
    switch (event.data.type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
        
        case 'SAVE_OFFLINE_DATA':
            Utils.saveOfflineData(event.data.key, event.data.data);
            break;
        
        case 'GET_OFFLINE_DATA':
            Utils.getOfflineData(event.data.key).then(data => {
                event.ports[0].postMessage({ success: true, data });
            });
            break;
        
        case 'SYNC_NOW':
            self.registration.sync.register('offline-data-sync');
            break;
        
        case 'CLEAR_CACHE':
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }).then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
        
        default:
            console.warn('Tipo de mensagem desconhecida:', event.data.type);
    }
});

// ===== ATUALIZAÇÃO DO SERVICE WORKER =====
self.addEventListener('updatefound', () => {
    console.log('🔄 Nova versão do Service Worker encontrada');
    
    // Notificar cliente sobre atualização disponível
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'UPDATE_AVAILABLE',
                data: { version: CACHE_VERSION }
            });
        });
    });
});

// ===== ERRO NO SERVICE WORKER =====
self.addEventListener('error', (event) => {
    console.error('❌ Erro no Service Worker:', event.error);
    
    // Notificar cliente sobre erro
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'SW_ERROR',
                data: { error: event.error.message }
            });
        });
    });
});

// ===== LOG DE INICIALIZAÇÃO =====
console.log('🚀 Service Worker R.M. CRM Pro+ v' + CACHE_VERSION + ' carregado');
console.log('📦 Cache name:', CACHE_NAME);
console.log('🔧 Estratégias de cache configuradas:', Object.keys(CACHE_STRATEGIES));
