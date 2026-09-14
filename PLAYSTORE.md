# PsicoRapport — Ficha Google Play Store

Datos listos para pegar en Play Console, más checklist de lo que suelen pedir al publicar.

---

## 1. Nombre de la aplicación

```
Psico Rapport
```

- Límite: 30 caracteres ✅ (13/30)
- Nombre técnico en app (`capacitor`): `PsicoRapport`
- Package ID actual: `com.uwu` ← **cámbialo antes de publicar** (ej. `com.psicorapport.app`). Una vez publicado, el package no se puede cambiar.

---

## 2. Descripción breve (máx. 80 caracteres)

**Opción recomendada (67/80):**

```
Tu espacio seguro para sanar: chat, ánimo y terapeutas verificados.
```

**Alternativas:**

```
Apoyo emocional con mascota virtual y puente a terapeutas.
```
(59/80)

```
Compañero emocional, seguimiento de ánimo y matching terapéutico.
```
(67/80)

---

## 3. Descripción completa (máx. 4000 caracteres)

```
PsicoRapport es tu espacio seguro para sanar.

Una plataforma de apoyo emocional y salud mental que te acompaña paso a paso: primero con un compañero virtual (mascota personalizable), luego hacia mayor autonomía y, cuando estés listo, hacia un terapeuta humano verificado.

Inspirada en la teoría del objeto transicional de Winnicott, PsicoRapport te sostiene en los momentos difíciles sin reemplazar la atención profesional.

¿Qué puedes hacer en PsicoRapport?

• Conversar con tu compañero emocional
  Un chat de apoyo disponible cuando lo necesites, para desahogarte, ordenar ideas y sentirte acompañado.

• Cuidar tu mascota virtual
  Personalízala y cuídala. Es tu Objeto Digital Transicional (ODT): un ancla emocional que te ayuda a avanzar hacia la independencia.

• Registrar tu estado de ánimo
  Haz seguimiento de cómo te sientes día a día y observa tu progreso con estadísticas claras.

• Unirte a la comunidad
  Comparte, lee y conecta con otras personas en un espacio de contención y respeto.

• Encontrar un terapeuta verificado
  Cuando te sientas preparado, elige un profesional de la salud mental y da el paso hacia acompañamiento humano.

• Avanzar a tu ritmo
  Gamificación suave (puntos, rachas y etapas) que motiva el autocuidado sin presión.

Etapas de tu camino
1. Dependencia — acompañamiento cercano con tu mascota.
2. Independencia — más autonomía emocional.
3. Puente terapéutico — conexión con un terapeuta verificado.

Importante
PsicoRapport NO es un psicólogo, psiquiatra ni servicio de emergencia. No reemplaza terapia ni atención clínica profesional. Si estás en crisis, contacta servicios de emergencia locales o líneas de ayuda especializadas.

Privacidad y consentimiento
Usamos consentimiento informado, control sobre qué datos compartes y prácticas orientadas a proteger tu información emocional.

Comienza tu viaje. Estamos contigo.
```

---

## 4. Otros datos que suele pedir Play Console

### Detalles de la ficha (Store listing)

| Campo | Sugerencia |
| --- | --- |
| **Nombre corto / título** | Psico Rapport |
| **Descripción breve** | Ver sección 2 |
| **Descripción completa** | Ver sección 3 |
| **Categoría de la app** | Salud y bienestar (Health & fitness) o Medicina (Medical) — suele ir mejor **Salud y bienestar** si no ofreces diagnóstico clínico |
| **Etiquetas / tags** | salud mental, bienestar, apoyo emocional, terapia, ánimo, mindfulness |
| **Correo de contacto** | Un correo real de soporte (ej. `soporte@tudominio.com`) — **obligatorio** |
| **Sitio web** | URL pública del producto o landing (recomendado) |
| **Política de privacidad** | URL **obligatoria** (página web pública) |
| **Número de teléfono** | Opcional, pero útil para soporte |

### Gráficos obligatorios / recomendados

| Asset | Tamaño | Notas |
| --- | --- | --- |
| **Ícono de la app** | 512 × 512 px (PNG, 32-bit) | Sin transparencia excesiva; legible en pequeño |
| **Feature graphic** | 1024 × 500 px | Banner de la ficha |
| **Capturas de pantalla teléfono** | Mín. 2 (mejor 4–8), JPEG/PNG 16:9 o 9:16 | Home, chat, mascota, ánimo, matching, comunidad |
| **Capturas tablet** | Opcional | Si soportas tablets |
| **Trailer de YouTube** | Opcional | Enlace a video corto de la app |

### Contenido de la app (cuestionarios)

Responde según el producto real. Orientación típica para PsicoRapport:

| Pregunta / área | Orientación |
| --- | --- |
| **Target audience / edad** | 18+ recomendado (salud mental + consentimiento) |
| **Contenido sensible** | Puede tocar temas de bienestar emocional; no es contenido sexual, violencia, etc. |
| **¿Es app de salud?** | Sí — bienestar / apoyo emocional |
| **¿Diagnostica o trata?** | No — apoyo, no diagnóstico ni tratamiento clínico |
| **¿Recoge datos personales?** | Sí (cuenta Google, preferencias, ánimo, chat, etc.) |
| **¿Datos de salud?** | Posible (registros de ánimo / bienestar) → declarar en **Data safety** |
| **Ads / publicidad** | Indicar si hay o no |
| **Compras in-app** | Indicar si hay o no |
| **Acceso restringido** | Si hay roles (terapeuta/admin), explicar |

### Data safety (seguridad de datos) — lo más revisado

Declara de forma honesta lo que realmente usas (Firebase Auth, Firestore, FCM, S3, Google Sign-In, etc.):

**Datos que probablemente debas marcar:**

- Nombre / correo / ID de usuario (Google Auth)
- Fotos de perfil (si aplica)
- Mensajes del chat / publicaciones de comunidad
- Preferencias (edad, motivo de consulta, estilo terapéutico)
- Registros de estado de ánimo
- Tokens de notificaciones push (FCM)
- Identificadores del dispositivo / analytics (si usas)

**Para cada tipo indica:**

- ¿Se recopila?
- ¿Se comparte con terceros?
- ¿Se usa para funcionalidad de la app / analytics / publicidad?
- ¿Se cifra en tránsito? (HTTPS → sí)
- ¿El usuario puede pedir eliminación?

### Política de privacidad (checklist mínimo)

Debe cubrir, en español o bilingüe:

1. Quién es el responsable del tratamiento  
2. Qué datos se recogen y para qué  
3. Base legal / consentimiento  
4. Que **no es terapia profesional**  
5. Terceros (Firebase/Google, AWS S3, etc.)  
6. Retención y eliminación de cuenta/datos  
7. Contacto para ejercer derechos  
8. Aviso de crisis / emergencias  

### Declaraciones de salud mental (recomendado en la ficha)

Incluye siempre un disclaimer claro (ya está en la descripción completa):

> No reemplaza atención psicológica o psiquiátrica. En crisis, busca ayuda profesional o servicios de emergencia.

### Acceso a apps (App access)

Si hay login obligatorio (Google):

- Proporciona **cuenta de prueba** a Google para revisión, o  
- Explica cómo crear cuenta en segundos con Google.

Si hay panel admin o terapeutas pendientes de aprobación, documenta el flujo.

### Clasificación de contenido (IARC / cuestionario)

Responde el cuestionario de Play; con uso típico de esta app suele salir **PEGI 3 / Everyone** o similar, pero si hablas de crisis/suicidio en textos, el cuestionario puede subir la clasificación. Sé consistente con lo que muestra la UI.

### Países / precios

- Distribución: países donde quieras publicar ( LatAm + España es lo más natural )
- Precio: gratis (o freemium si luego habrá IAP)

### Novedades de la versión (What’s new)

Para el primer release:

```
Primera versión de PsicoRapport en Google Play.
Chat de apoyo, mascota virtual, seguimiento de ánimo, comunidad y matching con terapeutas verificados.
```

---

## 5. Checklist pre-publicación (técnico)

- [ ] Cambiar `appId` de `com.uwu` a un ID definitivo (`com.tudominio.psicorapport`)
- [ ] VersionCode / versionName en `android/app/build.gradle`
- [ ] Ícono 512, feature graphic 1024×500, capturas
- [ ] Política de privacidad publicada (URL HTTPS)
- [ ] Correo de soporte válido
- [ ] Cuenta de prueba para revisión de Google
- [ ] Consentimiento informado alineado con la política
- [ ] Data safety completado
- [ ] Firmar release (keystore AAB), no APK debug
- [ ] Probar build `release` en dispositivo real
- [ ] Verificar Google Sign-In en build de producción (SHA-1/SHA-256 de release en Firebase/Google Cloud)
- [ ] Push FCM funcionando en release
- [ ] Texto de crisis / “no es terapia” visible en la app

---

## 6. Textos cortos útiles (copy extra)

**Eslogan (ya en la app):**  
Tu espacio seguro para sanar.

**Keywords internos (no campo oficial, útil para SEO de ficha):**  
salud mental, apoyo emocional, bienestar, terapia, psicólogo, estado de ánimo, mascota virtual, comunidad, autocuidado

**Categorías secundarias sugeridas al redactar:**  
bienestar emocional · acompañamiento · matching terapéutico

---

*Documento generado para la publicación de PsicoRapport en Google Play. Revisa URLs, correo, package ID y Data safety con los datos reales de tu proyecto antes de enviar a revisión.*
