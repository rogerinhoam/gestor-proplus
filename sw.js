// ===== CONFIGURAÇÃO DO SERVICE WORKER =====
const CACHE_NAME = 'rm-crm-pro-v2.0.0';
const OFFLINE_URL = '/offline.html';

// Recursos para pré-cache
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/offline.html',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Instalação: pré-cache dos recursos essenciais
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

// Ativação: limpar caches antigos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch: network first para HTML, cache first para estáticos
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.destination === 'document') {
        event.respondWith(
            fetch(request)
                .then(resp => {
                    caches.open(CACHE_NAME).then(cache => cache.put(request, resp.clone()));
                    return resp;
                })
                .catch(() => caches.match(OFFLINE_URL))
        );
    } else if (['style', 'script', 'image', 'font'].includes(request.destination)) {
        event.respondWith(
            caches.match(request).then(cached =>
                cached || fetch(request).then(resp => {
                    caches.open(CACHE_NAME).then(cache => cache.put(request, resp.clone()));
                    return resp;
                })
            )
        );
    }
});
