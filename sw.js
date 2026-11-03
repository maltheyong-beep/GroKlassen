const CACHE = 'groklassen-v1.0.0';
const ASSETS = ['./', './index.html', './style.css', './script.js', './core.js', './favicon.svg', './qr.svg'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('groklassen-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if(request.method !== 'GET' || url.origin !== self.location.origin) return;
  const appRoot = new URL('./', self.location.href).pathname;
  if(!url.pathname.startsWith(appRoot)) return;
  event.respondWith(fetch(request).then(response => {
    if(response.ok && (request.mode === 'navigate' || ASSETS.some(asset => new URL(asset,self.location.href).pathname === url.pathname))) { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(request, copy))); }
    return response;
  }).catch(async () => (await caches.match(request)) || (request.mode === 'navigate' ? await caches.match(new URL('./index.html',self.location.href)) : Response.error())));
});
