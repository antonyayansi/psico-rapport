// Este service worker es REQUERIDO por Firebase Cloud Messaging
// para recibir notificaciones push cuando la app está en background o cerrada.
// Debe estar en /public/ para que sea accesible desde la raíz del dominio.

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyB2KfAZV_isC0sNZA94CeMkGlKWVzB3jR4",
    authDomain: "uwuia-9f371.firebaseapp.com",
    projectId: "uwuia-9f371",
    storageBucket: "uwuia-9f371.firebasestorage.app",
    messagingSenderId: "339102139400",
    appId: "1:339102139400:web:763f3ff4493fa001d4fdbd"
});

const messaging = firebase.messaging();

// Manejo de mensajes en background (app cerrada o sin foco)
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Mensaje en background recibido:', payload);

    const { title, body } = payload.notification || {};

    self.registration.showNotification(title || 'uwu 🐻', {
        body: body || 'Tienes una nueva notificación',
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        vibrate: [200, 100, 200],
        data: {
            url: payload.webpush?.fcmOptions?.link || '/',
        },
    });
});

// Al hacer click en la notificación, abrir el post correspondiente
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Si ya hay una ventana abierta, navegar ahí
            for (const client of clientList) {
                if ('navigate' in client) {
                    return client.navigate(url).then(() => client.focus());
                }
            }
            // Si no, abrir una nueva ventana
            return clients.openWindow(url);
        })
    );
});
