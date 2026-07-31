const { onDocumentUpdated, onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();

const db = getFirestore();
const messaging = getMessaging();

/**
 * Notifica al autor del post cuando alguien le da like (y no es él mismo).
 */
exports.notifyOnLike = onDocumentUpdated(
    {
        document: 'community_posts/{postId}',
        region: 'us-central1',
    },
    async (event) => {
        const before = event.data.before.data();
        const after = event.data.after.data();

        const likesBefore = before.likedBy || [];
        const likesAfter = after.likedBy || [];

        // Solo actuar si aumentaron los likes (alguien dio like, no quitó)
        if (likesAfter.length <= likesBefore.length) return null;

        const authorId = after.authorId;
        if (!authorId) return null;

        // Encontrar quién dio el like nuevo (el uid que está en after pero no en before)
        const newLiker = likesAfter.find((uid) => !likesBefore.includes(uid));

        // No notificar si el autor se dio like a sí mismo
        if (!newLiker || newLiker === authorId) return null;

        // Leer el FCM token del autor
        const userDoc = await db.collection('users').doc(authorId).get();
        if (!userDoc.exists) return null;

        const fcmToken = userDoc.data().fcmToken;
        if (!fcmToken) return null;

        const postPreview = after.content
            ? after.content.substring(0, 60)
            : 'tu publicación';

        const message = {
            token: fcmToken,
            notification: {
                title: '¡A alguien le importó tu publicación! ❤️',
                body: `"${postPreview}${after.content?.length > 60 ? '...' : ''}"`,
            },
            webpush: {
                fcmOptions: {
                    link: `/community/post/${event.params.postId}`,
                },
                notification: {
                    icon: '/favicon.svg',
                    badge: '/favicon.svg',
                    vibrate: [200, 100, 200],
                },
            },
        };

        try {
            await messaging.send(message);
            console.log(`[notifyOnLike] Notificación enviada a usuario ${authorId}`);
        } catch (error) {
            console.error('[notifyOnLike] Error enviando notificación:', error);
            // Si el token es inválido, limpiarlo de Firestore
            if (
                error.code === 'messaging/registration-token-not-registered' ||
                error.code === 'messaging/invalid-registration-token'
            ) {
                await db.collection('users').doc(authorId).update({ fcmToken: null });
            }
        }

        return null;
    }
);

/**
 * Notifica al autor del post cuando alguien comenta (y no es él mismo).
 */
exports.notifyOnComment = onDocumentUpdated(
    {
        document: 'community_posts/{postId}',
        region: 'us-central1',
    },
    async (event) => {
        const before = event.data.before.data();
        const after = event.data.after.data();

        const commentsBefore = before.comments || [];
        const commentsAfter = after.comments || [];

        // Solo actuar si aumentaron los comentarios
        if (commentsAfter.length <= commentsBefore.length) return null;

        const authorId = after.authorId;
        if (!authorId) return null;

        // El comentario nuevo es el último
        const newComment = commentsAfter[commentsAfter.length - 1];

        // No notificar si el autor se comentó a sí mismo, ni si es Uwu el bot
        if (!newComment) return null;

        // Detectar si el commenter es el mismo autor (comparar nombre como fallback)
        // Idealmente el comentario tendría authorId, pero actualmente solo tiene authorName
        // Usamos el nombre de Uwu para no notificar el bot
        if (newComment.authorName?.includes('Uwu')) return null;

        // Leer el FCM token del autor del post
        const userDoc = await db.collection('users').doc(authorId).get();
        if (!userDoc.exists) return null;

        const fcmToken = userDoc.data().fcmToken;
        if (!fcmToken) return null;

        const commenterName = newComment.authorName || 'Alguien';
        const commentPreview =
            newComment.type === 'gif'
                ? 'te envió una estampa de apoyo 🫂'
                : newComment.text
                  ? `"${newComment.text.substring(0, 60)}${newComment.text.length > 60 ? '...' : ''}"`
                  : 'te respondió';

        const message = {
            token: fcmToken,
            notification: {
                title: `💬 ${commenterName} comentó en tu publicación`,
                body: commentPreview,
            },
            webpush: {
                fcmOptions: {
                    link: `/community/post/${event.params.postId}`,
                },
                notification: {
                    icon: '/favicon.svg',
                    badge: '/favicon.svg',
                    vibrate: [200, 100, 200],
                },
            },
        };

        try {
            await messaging.send(message);
            console.log(`[notifyOnComment] Notificación enviada a usuario ${authorId}`);
        } catch (error) {
            console.error('[notifyOnComment] Error enviando notificación:', error);
            if (
                error.code === 'messaging/registration-token-not-registered' ||
                error.code === 'messaging/invalid-registration-token'
            ) {
                await db.collection('users').doc(authorId).update({ fcmToken: null });
            }
        }

        return null;
    }
);

/**
 * Notifica a antonyayansi@gmail.com cuando un terapeuta envía su solicitud.
 *
 * Configura las credenciales SMTP con:
 *   firebase functions:config:set mail.user="tu@gmail.com" mail.pass="app_password"
 * (Requiere una Google App Password con 2FA activado en la cuenta remitente)
 *
 * Para aprobar una solicitud:
 *   - En la app: usuario con role "admin" → /admin (Autorizar psicólogos)
 *   - O manualmente en Firebase Console:
 *       1. therapist_applications/{uid} → status: "approved"
 *       2. Crear therapists/{uid} con los datos del perfil
 *       3. users/{uid} → role: "therapist"
 *
 * Primer súper usuario: en Firestore users/{uid} → role: "admin"
 */
exports.notifyAdminOnTherapistApplication = onDocumentCreated(
    {
        document: 'therapist_applications/{uid}',
        region: 'us-central1',
    },
    async (event) => {
        const data = event.data.data();
        if (!data) return null;

        const nodemailer = require('nodemailer');
        const functions = require('firebase-functions');

        let mailUser, mailPass;
        try {
            const cfg = functions.config();
            mailUser = cfg.mail?.user;
            mailPass = cfg.mail?.pass;
        } catch (e) {
            console.warn('[notifyAdmin] No se pudo leer firebase config. Omitiendo email.');
            return null;
        }

        if (!mailUser || !mailPass) {
            console.warn('[notifyAdmin] mail.user / mail.pass no configurados. Omitiendo email.');
            return null;
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: mailUser, pass: mailPass }
        });

        const expRows = (data.experience || [])
            .map(e => `<tr><td style="padding:4px 8px;">${e.period || ''}</td><td style="padding:4px 8px;">${e.role || ''}</td><td style="padding:4px 8px;">${e.institution || ''}</td></tr>`)
            .join('');
        const eduList = (data.education || [])
            .map(e => `<li>${e.degree} — ${e.institution} (${e.year || ''})</li>`)
            .join('');

        const html = `
<h2 style="color:#16a34a;">Nueva solicitud de terapeuta — PsicoRapport</h2>
<p><strong>Nombre:</strong> ${data.displayName}</p>
<p><strong>Email:</strong> ${data.email}</p>
<p><strong>Título:</strong> ${data.title}</p>
<p><strong>N° de colegiatura:</strong> ${data.licenseNumber}</p>
<p><strong>Especialidad:</strong> ${data.mainSpecialty}</p>
<p><strong>Subespecialidad:</strong> ${data.subspecialty || '—'}</p>
<p><strong>UID de Firebase:</strong> <code>${data.uid}</code></p>
<h3>Experiencia clínica</h3>
<table border="1" cellspacing="0" style="border-collapse:collapse;">
  <thead><tr style="background:#f1f5f9;"><th style="padding:6px 10px;">Período</th><th style="padding:6px 10px;">Rol</th><th style="padding:6px 10px;">Institución</th></tr></thead>
  <tbody>${expRows}</tbody>
</table>
<h3>Formación académica</h3><ul>${eduList}</ul>
<h3>Áreas de enfoque</h3>
<ul>${(data.focusAreas || []).map(f => `<li>${f}</li>`).join('')}</ul>
<hr>
<p><strong>Para aprobar esta solicitud:</strong></p>
<ol>
  <li>En Firestore → <code>therapist_applications/${data.uid}</code> → cambia <code>status</code> a <code>"approved"</code>.</li>
  <li>Crea un documento en <code>therapists/${data.uid}</code> con el perfil completo.</li>
  <li>En <code>users/${data.uid}</code> → cambia <code>role</code> a <code>"therapist"</code>.</li>
</ol>
<p style="color:#94a3b8;font-size:11px;">PsicoRapport — Notificación automática del sistema</p>`;

        await transporter.sendMail({
            from: `"PsicoRapport Admin" <${mailUser}>`,
            to: 'antonyayansi@gmail.com',
            subject: `🩺 Nueva solicitud de terapeuta: ${data.displayName}`,
            html
        });

        console.log(`[notifyAdmin] Email enviado a antonyayansi@gmail.com para solicitud de ${data.uid}`);
        return null;
    }
);
