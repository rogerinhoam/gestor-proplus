/**
 * Service Worker - Gestor ProPlus
 * @file sw.js
 * @version 2.0.0
 */

const CACHE_NAME = 'gestor-proplus-v2.0.0';
const STATIC_CACHE = 'static-v2.0.0';
const DYNAMIC_CACHE = 'dynamic-v2.0.0';

// Arquivos para cache estático
const STATIC_FILES = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/crm.js',
    '/js/pwa.js',
    '/js/utils.js',
    '/assets/offline.html',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png',
    '/manifest.json'
];

// URLs externas para cache
const EXTERNAL_RESOURCES = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
    console.log('🔧 Service Worker: Instalando...');
    
    event.waitUntil(
        Promise.all([
            // Cache estático
            caches.open(STATIC_CACHE).then(cache => {
                console.log('📦 Cache estático criado');
                return cache.addAll(STATIC_FILES);
            }),
            
            // Cache de recursos externos
            caches.open(DYNAMIC_CACHE).then(cache => {
                console.log('🌐 Cache dinâmico criado');
                return cache.addAll(EXTERNAL_RESOURCES);
            })
        ]).then(() => {
            console.log('✅ Service Worker instalado');
            self.skipWaiting();
        })
    );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker: Ativando...');
    
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
                        console.log('🗑️ Removendo cache antigo:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker ativado');
            self.clients.claim();
        })
    );
});

// Interceptar requests
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Ignorar requests que não são GET
    if (request.method !== 'GET') {
        return;
    }
    
    // Estratégias de cache baseadas no tipo de recurso
    if (STATIC_FILES.includes(url.pathname)) {
        // Cache First para arquivos estáticos
        event.respondWith(cacheFirst(request));
    } else if (url.origin === location.origin) {
        // Network First para conteúdo dinâmico
        event.respondWith(networkFirst(request));
    } else {
        // Stale While Revalidate para recursos externos
        event.respondWith(staleWhileRevalidate(request));
    }
});

// Estratégia Cache First
async function cacheFirst(request) {
    try {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        
        if (cached) {
            return cached;
        }
        
        const response = await fetch(request);
        cache.put(request, response.clone());
        return response;
    } catch (error) {
        console.error('❌ Cache First falhou:', error);
        
        // Fallback para página offline
        if (request.mode === 'navigate') {
            return caches.match('/assets/offline.html');
        }
        
        return new Response('Recurso não disponível offline', { status: 503 });
    }
}

// Estratégia Network First
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        
        // Salvar no cache dinâmico
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, response.clone());
        
        return response;
    } catch (error) {
        console.log('🔄 Network falhou, tentando cache:', request.url);
        
        const cache = await caches.open(DYNAMIC_CACHE);
        const cached = await cache.match(request);
        
        if (cached) {
            return cached;
        }
        
        // Fallback para página offline em navegação
        if (request.mode === 'navigate') {
            return caches.match('/assets/offline.html');
        }
        
        return new Response('Recurso não disponível offline', { status: 503 });
    }
}

// Estratégia Stale While Revalidate
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);
    
    const fetchPromise = fetch(request).then(response => {
        cache.put(request, response.clone());
        return response;
    }).catch(() => {
        // Se falhar e não tiver cache, retornar erro
        if (!cached) {
            return new Response('Recurso não disponível', { status: 503 });
        }
    });
    
    return cached || fetchPromise;
}

// Sincronização em background
self.addEventListener('sync', event => {
    console.log('🔄 Background Sync:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

// Função de sincronização
async function doBackgroundSync() {
    try {
        // Aqui você pode implementar lógica para sincronizar dados
        // Por exemplo, enviar dados salvos localmente para o servidor
        console.log('📡 Sincronizando dados...');
        
        // Notificar todos os clientes sobre a sincronização
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_COMPLETE',
                data: { message: 'Dados sincronizados com sucesso' }
            });
        });
    } catch (error) {
        console.error('❌ Erro na sincronização:', error);
    }
}

// Notificações Push
self.addEventListener('push', event => {
    console.log('📱 Push recebido:', event);
    
    const options = {
        body: event.data ? event.data.text() : 'Nova notificação',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-192x192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Ver detalhes',
                icon: '/assets/icons/icon-192x192.png'
            },
            {
                action: 'close',
                title: 'Fechar',
                icon: '/assets/icons/icon-192x192.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('R.M. CRM Pro+', options)
    );
});

// Clique em notificações
self.addEventListener('notificationclick', event => {
    console.log('🔔 Notificação clicada:', event);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        // Abrir a aplicação
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'close') {
        // Apenas fechar
        event.notification.close();
    } else {
        // Clique no corpo da notificação
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Mensagens dos clientes
self.addEventListener('message', event => {
    console.log('💬 Mensagem recebida:', event.data);
    
    if (event.data && event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});

// Limpeza automática de cache
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key.startsWith('dynamic-') && key !== DYNAMIC_CACHE) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

// Atualização automática
self.addEventListener('install', event => {
    // Forçar atualização imediata
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    // Assumir controle imediatamente
    event.waitUntil(self.clients.claim());
});
