import { getToken, onMessage } from 'firebase/messaging'
import { getMessaging, isSupported } from 'firebase/messaging'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY

/**
 * Inicializa FCM para el usuario autenticado:
 * 1. Verifica soporte del navegador
 * 2. Pide permiso de notificaciones
 * 3. Obtiene el FCM token
 * 4. Lo guarda en Firestore en users/{uid}/fcmToken
 *
 * Nota: No importamos `messaging` de firebase.js porque ese módulo hace
 * isSupported() de forma async y puede estar null aún. Aquí lo resolvemos
 * directamente para garantizar que esté listo.
 */
export const initFCM = async (uid) => {
    if (!VAPID_KEY || VAPID_KEY.startsWith('REEMPLAZA')) {
        console.warn('[FCM] VITE_FCM_VAPID_KEY no está configurada en .env')
        return null
    }

    try {
        // 1. Verificar compatibilidad antes de hacer nada
        const supported = await isSupported()
        if (!supported) {
            console.log('[FCM] Push notifications no soportadas en este navegador')
            return null
        }

        // 2. Pedir permiso
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
            console.log('[FCM] Permiso de notificaciones denegado')
            return null
        }

        // 3. Obtener instancia de messaging directamente aquí (patrón lazy)
        const { getApp } = await import('firebase/app')
        const messaging = getMessaging(getApp())

        // 4. Registrar el service worker manualmente para tener control
        const swRegistration = await navigator.serviceWorker.register(
            '/firebase-messaging-sw.js',
            { scope: '/' }
        )

        // 5. Obtener token FCM
        const token = await getToken(messaging, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: swRegistration,
        })

        if (!token) {
            console.warn('[FCM] No se pudo obtener token FCM')
            return null
        }

        // 6. Guardar token en Firestore (merge para no pisar otros campos)
        await setDoc(
            doc(db, 'users', uid),
            { fcmToken: token },
            { merge: true }
        )

        console.log('[FCM] Token registrado para usuario:', uid)

        // 7. Manejar mensajes en foreground (app en foco)
        onMessage(messaging, (payload) => {
            console.log('[FCM] Mensaje en foreground:', payload)
            const { title, body } = payload.notification || {}
            if (Notification.permission === 'granted') {
                new Notification(title || 'uwu 🐻', {
                    body: body || '',
                    icon: '/favicon.svg',
                    badge: '/favicon.svg',
                })
            }
        })

        return token
    } catch (error) {
        // AbortError suele ser por HTTPS requerido o push service no disponible
        // (ej: en devtools sin conexión). Lo logueamos pero no rompemos la app.
        if (error.name === 'AbortError') {
            console.warn('[FCM] Push service no disponible (posiblemente sin HTTPS o sin conexión):', error.message)
        } else {
            console.error('[FCM] Error inicializando FCM:', error)
        }
        return null
    }
}
