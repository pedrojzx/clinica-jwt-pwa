const cacheName = 'clinica-v3'
const arquivos = [
  '/',
  '/index.html',
  '/paciente.html',
  '/medico.html',
  '/usuarios.html',
  '/style.css',
  '/common.js',
  '/auth.js',
  '/paciente.js',
  '/medico.js',
  '/usuarios.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
]

self.addEventListener('install', event => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(arquivos))
  )
})

// Remove caches de versões antigas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(chaves => Promise.all(chaves.filter(c => c !== cacheName).map(c => caches.delete(c))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)

  // Nunca interceptar a API, o Swagger nem requisições que não sejam GET
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api') ||
    url.pathname === '/health'
  ) {
    return
  }

  // Rede primeiro (sempre pega a versão nova); cache só se estiver offline
  event.respondWith(
    fetch(event.request)
      .then(resposta => {
        if (resposta.ok) {
          const copia = resposta.clone()
          caches.open(cacheName).then(cache => cache.put(event.request, copia))
        }
        return resposta
      })
      .catch(() => caches.match(event.request))
  )
})
