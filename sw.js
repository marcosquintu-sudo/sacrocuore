// Notifiche «è entrato qualcuno nel quartiere» (src/avvisi.ts): l'avviso arriva vuoto, il nome lo dice la stanza.
const SERVER = new URL(location.href).searchParams.get('server') || 'https://sacrocuore-stanze.sacrocuore-stanze.workers.dev';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (e) => e.waitUntil((async () => {
  let nome = 'Qualcuno';
  try {
    const u = await (await fetch(`${SERVER}/avvisi/ultimo`, { cache: 'no-store' })).json();
    if (u && u.nome) nome = u.nome;
  } catch { /* resta «Qualcuno» */ }
  await self.registration.showNotification(`🟢 ${nome} è entrato nel quartiere`, {
    body: 'Tocca per entrare anche tu', tag: 'quartiere', renotify: true,
  });
})()));

// clic: il gioco già aperto viene davanti, altrimenti si apre direttamente online
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil((async () => {
    const qui = self.registration.scope;
    const aperti = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const gioco = aperti.find((c) => c.url.startsWith(qui));
    if (gioco) return gioco.focus();
    return self.clients.openWindow(`${qui}?stanza=quartiere`);
  })());
});
