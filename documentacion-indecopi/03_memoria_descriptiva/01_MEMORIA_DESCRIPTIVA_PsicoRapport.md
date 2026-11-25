# MEMORIA DESCRIPTIVA DEL PROGRAMA DE ORDENADOR

## PsicoRapport

**Tipo de obra:** Programa de ordenador (software de aplicación)  
**Marco de referencia:** Decisión Andina 351 — Derecho de Autor  
**Versión documentada:** build Android de producción (AAB) + código fuente asociado  
**Fecha:** 18 de noviembre de 2026  

| Campo | Dato |
| --- | --- |
| Título / denominación | **PsicoRapport** (nombre comercial también usado: *Psico Rapport*) |
| Nombre técnico de empaquetado | `PsicoRapport` (`capacitor.config.json`) |
| Identificador de aplicación Android | `com.uwu` (identificador técnico interno) |
| Autor(es) / titular(es) | [COMPLETAR: nombres y apellidos completos] |
| Documento de identidad | [COMPLETAR: DNI / CE] |
| Correo de contacto | [COMPLETAR: correo] |
| País | Perú |
| Idioma de la interfaz | Español |
| Soporte de depósito | Código fuente (partes sustanciales) + ejecutable AAB + manual + recursos gráficos |

---

## 1. Objeto de la memoria

La presente memoria descriptiva tiene por finalidad acreditar, ante INDECOPI, la **existencia**, la **organización funcional** y la **expresión programática** del programa PsicoRapport, de modo que pueda evaluarse su originalidad conforme a la Decisión Andina 351.

No se solicita protección sobre ideas genéricas (chat, registro de ánimo o mascotas virtuales en abstracto), sino sobre la **forma concreta** en que el autor ha expresado y organizado dichos componentes en un producto unitario.

---

## 2. Descripción general del programa

PsicoRapport es una aplicación digital de **acompañamiento emocional y bienestar**, orientada a usuarios de habla hispana (con contexto operativo en Perú). Combina:

1. **Interacción conversacional** con un compañero virtual (mascota personalizable).  
2. **Registro y seguimiento** de estados de ánimo.  
3. **Personalización y cuidado** de una mascota virtual concebida como **Objeto Digital Transicional (ODT)**.  
4. **Comunidad** de apoyo entre pares.  
5. **Vinculación (matching)** con profesionales de psicología verificados.  
6. Un modelo de **etapas de transición** inspirado en la teoría del objeto transicional de Winnicott:  
   **dependencia → independencia → puente terapéutico**.

El programa **no** constituye un servicio de diagnóstico, psicoterapia automatizada ni emergencia clínica. Incluye consentimiento informado, disclaimers y recursos de crisis (p. ej. línea 113 en Perú).

---

## 3. Finalidad y usuarios

| Aspecto | Descripción |
| --- | --- |
| Finalidad | Brindar un espacio digital seguro de contención emocional, autocuidado y puente hacia atención profesional humana |
| Usuario final (paciente / consultante) | Personas que buscan apoyo emocional, registro de ánimo y eventual contacto con terapeutas |
| Usuario profesional | Psicólogos / terapeutas que se registran y, tras verificación, aparecen en el directorio / matching |
| Administrador | Rol interno de moderación / aprobación |

---

## 4. Arquitectura técnica

### 4.1 Capas

| Capa | Tecnología | Rol |
| --- | --- | --- |
| Interfaz (UI) | Vue 3 + Vite + Tailwind CSS + PrimeVue | Pantallas, navegación, componentes visuales |
| Estado / cliente | Pinia, Vue Router, Capacitor | Auth, rutas protegidas, app Android / PWA |
| Datos | Firebase Auth + Cloud Firestore | Usuarios, mascota, ánimos, comunidad, terapeutas, gamificación |
| Agente conversacional | Cliente OpenAI (function calling) + tools propias | Chat empático con acceso controlado a datos del usuario |
| Medios | AWS S3 (SDK) | Almacenamiento de archivos / imágenes |
| Notificaciones | Firebase Cloud Messaging + Cloud Functions | Likes, comentarios y eventos |
| Empaquetado móvil | Capacitor (Android) | Generación del ejecutable (AAB/APK) |

### 4.2 Diagrama lógico (texto)

```
[Usuario Android / PWA]
        │
        ▼
[Vue Router + Auth Google]
        │
        ├── Consentimiento informado
        ├── Onboarding (preferencias)
        ├── Chat ODT (agente + tools)
        ├── Mascota (cuidado / personalización)
        ├── Diario de ánimo
        ├── Comunidad
        ├── Matching / terapeutas
        └── Estadísticas / progreso
        │
        ▼
[Firestore + Auth + Functions + S3 + API LLM]
```

---

## 5. Componentes desarrollados y organización funcional

### 5.1 Módulo de autenticación y consentimiento

- Acceso mediante Google Sign-In.  
- Pantalla de **consentimiento informado** con aceptación explícita de puntos clave (naturaleza no clínica, privacidad, crisis, mayoría de edad / autorización).  
- Bloqueo de rutas hasta aceptar consentimiento (`router` + store de auth).

**Archivos representativos:** `LoginView.vue`, `ConsentView.vue`, `stores/auth.js`, `router/index.js`.

### 5.2 Módulo de onboarding / preferencias

- Captura de datos de acompañamiento (p. ej. edad, motivo, estilo terapéutico preferido).  
- Alimenta el perfil usado por el agente y el matching.

**Archivo representativo:** `OnboardingView.vue`.

### 5.3 Módulo Objeto Digital Transicional (ODT) y etapas

Expresión original central del programa:

- Definición de etapas: `dependency`, `independence`, `therapist`.  
- Metadatos por etapa (etiquetas, descripciones, pistas de avance).  
- Umbrales blandos de avance (registros de ánimo, cuidados de mascota, mensajes de chat, racha).  
- Construcción de *system prompts* del agente según la etapa del usuario.

**Archivo representativo:** `transition.js`.

### 5.4 Módulo de mascota virtual (“Qori”)

- Nombre por defecto **Qori** (oso de anteojos / identidad visual del acompañante).  
- Personalización: color y accesorio.  
- Emociones con assets gráficos propios: triste, enojado, temeroso, calma, motivado, feliz.  
- Cuidado tipo “alimentar / jugar / descansar” con barras de hambre, felicidad y energía.  
- Decaimiento pasivo si no se cuida.  
- Sincronización con el estado de ánimo del usuario.

**Archivos representativos:** `pet.js`, `PetView.vue`, `PetAvatar.vue`, carpeta `emociones/`.

### 5.5 Módulo de chat conversacional (agente)

- Interfaz de chat (`UwuChatView.vue`).  
- Motor de agente (`uwuAgent.js`) con hasta varias rondas de *tool calling*.  
- Herramientas propias (`uwuTools.js`): perfil, historial de ánimo, estado de mascota, progreso, listado/ficha de terapeutas, recursos de crisis, guía de respiración, registro de ánimo, propuestas de navegación in-app.  
- Reglas explícitas: no diagnosticar, no inventar datos clínicos, respuestas en español, derivación a línea de crisis cuando corresponde.

### 5.6 Módulo de registro de estados de ánimo

- Captura diaria / frecuente de emociones.  
- Persistencia en colección de estados de ánimo.  
- Integración con mascota, gamificación y tools del agente.

**Archivo representativo:** `TrackingView.vue`.

### 5.7 Módulo de gamificación y progreso

- Puntos por acciones (chat, foro, foto, ánimo, cuidado de mascota, avance de etapa).  
- Rachas diarias.  
- Disparo automático de avance de dependencia → independencia.  
- Vista de estadísticas.

**Archivos:** `gamification.js`, `ProfileStatsView.vue`.

### 5.8 Módulo de comunidad

- Publicaciones, likes y comentarios.  
- Participación asistida de la mascota en ciertos contextos.  
- Notificaciones push al autor ante interacción de terceros.

**Archivos:** `CommunityView.vue`, `functions/index.js`.

### 5.9 Módulo de terapeutas y matching

- Registro de profesionales con datos de perfil.  
- Listado y ficha de terapeuta.  
- Flujo de matching / preferencias de estilo.  
- Etapa “puente terapéutico” cuando el usuario se vincula a un profesional.

**Archivos:** `MatchingView.vue`, `TherapistsView.vue`, `TherapistRegisterView.vue`, `TherapistProfileView.vue`.

### 5.10 Módulo administrativo

- Vista restringida por rol/correo administrador para gestión interna.

**Archivo:** `AdminView.vue` (existe en el repositorio completo; no es indispensable para acreditar la originalidad del producto de usuario final).

---

## 6. Modelo de datos (resumen)

Principales colecciones / documentos en Firestore (nombres usados en el código):

| Colección / documento | Contenido principal |
| --- | --- |
| `users` | Perfil, consentimiento, etapa de transición, token FCM, rol |
| `preferencias` | Preferencias de onboarding |
| `pets` | Estado y personalización de la mascota ODT |
| `estados_animo` | Registros de emoción del usuario |
| `user_gamification` | Puntos, rachas, contadores |
| `community_posts` | Publicaciones, likes, comentarios |
| Colecciones de terapeutas / vínculos | Perfiles profesionales y matching |

---

## 7. Aportes creativos propios (fundamento de originalidad)

Sin perjuicio de que existan aplicaciones de la misma *categoría* funcional, se identifican como aportes de expresión propia, entre otros:

1. **Diseño conceptual unitario** del acompañamiento en tres etapas (dependencia / independencia / puente terapéutico) implementado en código (`transition.js`) y reflejado en UI y en el comportamiento del agente.  
2. **Objeto Digital Transicional (ODT)** como mascota personalizable (“Qori”) con emociones propias, cuidado y vínculo con el ánimo del usuario.  
3. **Agente conversacional con herramientas específicas del dominio** (ánimo, mascota, terapeutas, crisis, respiración, atajos de navegación), no un chatbot genérico desconectado.  
4. **Organización funcional integrada**: consentimiento → onboarding → chat/mascota/ánimo → comunidad → matching profesional, con guards y reglas de privacidad.  
5. **Expresión visual e interfaz** (pantallas Vue, tipografía/estilos, avatares de emoción, navegación inferior).  
6. **Denominaciones propias** del producto: *PsicoRapport*, *Qori*, *Objeto Digital Transicional (ODT)* en el sentido implementado en la app.

Las teorías psicológicas de referencia (p. ej. Winnicott) son **inspiración conceptual** de dominio público; la protección reclamada recae sobre la **implementación y expresión** en el programa, no sobre la teoría en sí.

---

## 8. Recursos de terceros (lo que NO se reclama como código propio)

| Recurso | Uso |
| --- | --- |
| Vue 3, Vite, Pinia, Vue Router | Framework y tooling |
| Tailwind CSS, PrimeVue, Lucide | UI / iconografía de librería |
| Firebase / Google Auth / FCM | Backend como servicio |
| Capacitor | Contenedor nativo |
| OpenAI API | Motor de lenguaje (el diseño de prompts, tools y orquestación sí es propio) |
| AWS S3 | Almacenamiento de archivos |
| Chart.js | Gráficos de estadísticas |

---

## 9. Materiales que acompañan esta memoria

1. **Código fuente — partes sustanciales** (`01_codigo_fuente_partes_sustanciales/`).  
2. **Ejecutable** Android App Bundle: `PsicoRapport-app-release.aab`.  
3. **Manual de usuario** formal.  
4. **Recursos gráficos** de emociones e íconos.  
5. **Aclaración** de denominaciones y gráficos.  
6. Referencia al repositorio GitHub (versionado), sin sustituir el depósito.

---

## 10. Declaración del titular

Declaro que la información contenida en esta memoria descriptiva es veraz y corresponde al programa de ordenador denominado **PsicoRapport**, cuya autoría / titularidad invoco conforme a la legislación aplicable y a la Decisión Andina 351.

**Nombre:** [COMPLETAR]  
**Documento:** [COMPLETAR]  
**Firma:** _______________________________  
**Lugar y fecha:** ____________________
