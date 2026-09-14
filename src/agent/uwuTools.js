import { db } from '../firebase'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where
} from 'firebase/firestore'
import { STAGE_META, STAGES, canReachIndependence } from '../transition'
import {
  PET_EMOTIONS,
  decayStats,
  updatePetMood
} from '../pet'
import { processUserAction } from '../gamification'

const THERAPY_STYLE_LABELS = {
  directivo: 'Estructurado y práctico',
  exploratorio: 'Profundo y reflexivo',
  empatico: 'Cálido y de contención'
}

const EXAMPLE_THERAPIST = {
  id: 'daniel-hachircana',
  displayName: 'Dr. Daniel Hachircana Mendez',
  title: 'Neuropsicólogo Clínico y de Rehabilitación',
  mainSpecialty: 'Neuropsicología Clínica',
  subspecialty: 'Daño cerebral adquirido y neuropsicología infantil',
  bio: 'Neuropsicólogo clínico con enfoque en evaluación, rehabilitación y daño cerebral adquirido.',
  focusAreas: [
    'Evaluación de trastornos cognitivos',
    'Rehabilitación neuropsicológica',
    'Neuropsicología infantil'
  ],
  approved: true
}

export const APP_ACTIONS = {
  open_diary: { route: '/tracking', label: 'Registrar ánimo' },
  open_therapists: { route: '/therapists', label: 'Ver psicólogos' },
  open_matching: { route: '/matching', label: 'Encontrar terapeuta' },
  open_pet: { route: '/pet', label: 'Cuidar a Uwu' },
  open_stats: { route: '/stats', label: 'Ver mi progreso' },
  call_crisis: { tel: '113', label: 'Llamar línea 113' }
}

export const TOOL_STATUS = {
  get_patient_profile: 'Revisando tu perfil…',
  get_mood_history: 'Leyendo tu diario de ánimo…',
  get_pet_state: 'Viendo cómo está tu mascota…',
  get_progress: 'Revisando tu progreso…',
  list_therapists: 'Buscando psicólogos disponibles…',
  get_therapist_profile: 'Abriendo ficha del profesional…',
  get_my_therapist: 'Buscando a tu terapeuta…',
  get_crisis_resources: 'Preparando ayuda de crisis…',
  get_breathing_guide: 'Preparando una pausa de respiración…',
  suggest_next_step: 'Pensando el siguiente paso…',
  log_mood: 'Registrando cómo te sientes…',
  propose_app_action: 'Preparando un atajo…'
}

export const OPENAI_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_patient_profile',
      description:
        'Perfil del usuario actual: edad, motivo de consulta, estilo de terapeuta preferido, etapa de transición y consentimiento para compartir ánimo. Úsalo al inicio si el usuario habla de sí mismo, su motivo o su proceso.',
      parameters: { type: 'object', properties: {}, additionalProperties: false }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_mood_history',
      description:
        'Historial reciente de emociones del usuario (diario de ánimo). Obligatorio antes de afirmar cómo se ha sentido, patrones, rachas o cambios de humor.',
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'integer',
            description: 'Cantidad de registros recientes (1-30). Por defecto 14.'
          }
        },
        additionalProperties: false
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_pet_state',
      description:
        'Estado actual de la mascota ODT (nombre, emoción, hambre, felicidad, energía). Úsalo si preguntan por Uwu o por cómo está la mascota.',
      parameters: { type: 'object', properties: {}, additionalProperties: false }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_progress',
      description:
        'Progreso del usuario: puntos, racha, registros de ánimo, chats y cuidados de mascota. Úsalo para logros, motivación o si está listo para avanzar de etapa.',
      parameters: { type: 'object', properties: {}, additionalProperties: false }
    }
  },
  {
    type: 'function',
    function: {
      name: 'list_therapists',
      description:
        'Lista de psicólogos/terapeutas verificados y disponibles en PsicoRapport. Obligatorio antes de nombrar, recomendar o decir que hay (o no hay) profesionales. No inventes nombres.',
      parameters: {
        type: 'object',
        properties: {
          specialty: {
            type: 'string',
            description: 'Filtro opcional por especialidad o enfoque (ej. ansiedad, infantojuvenil, neuropsicología).'
          }
        },
        additionalProperties: false
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_therapist_profile',
      description: 'Detalle de un terapeuta por id (bio, especialidad, áreas de enfoque). Usa el id devuelto por list_therapists o get_my_therapist.',
      parameters: {
        type: 'object',
        properties: {
          therapist_id: { type: 'string', description: 'Id del documento en therapists.' }
        },
        required: ['therapist_id'],
        additionalProperties: false
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_my_therapist',
      description: 'Terapeuta que el usuario ya eligió, si tiene uno. Úsalo si pregunta por “mi psicólogo”, citas o puente terapéutico.',
      parameters: { type: 'object', properties: {}, additionalProperties: false }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_crisis_resources',
      description:
        'Recursos de crisis en Perú (línea 113) y, si aplica, el terapeuta elegido. Úsalo si hay desesperanza, ideación, daño o pedido urgente de ayuda.',
      parameters: { type: 'object', properties: {}, additionalProperties: false }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_breathing_guide',
      description: 'Guía breve de respiración 4-7-8 u otra pausa somática. Úsala si hay ansiedad aguda, pánico o pide calmarse ahora.',
      parameters: {
        type: 'object',
        properties: {
          technique: {
            type: 'string',
            enum: ['4-7-8', 'box', 'grounding'],
            description: 'Técnica. Por defecto 4-7-8.'
          }
        },
        additionalProperties: false
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'suggest_next_step',
      description:
        'Siguiente paso concreto en la app según etapa, historial y si ya tiene terapeuta. Úsalo cuando el usuario no sepa qué hacer o pida orientación.',
      parameters: { type: 'object', properties: {}, additionalProperties: false }
    }
  },
  {
    type: 'function',
    function: {
      name: 'log_mood',
      description:
        'Registra una emoción de HOY en el diario. Solo si el usuario describe claramente cómo se siente ahora o pide anotarlo. Emociones: triste, enojado, temeroso, calma, motivado, feliz.',
      parameters: {
        type: 'object',
        properties: {
          emotion: {
            type: 'string',
            enum: ['triste', 'enojado', 'temeroso', 'calma', 'motivado', 'feliz']
          },
          note: {
            type: 'string',
            description: 'Contexto breve opcional (una frase).'
          }
        },
        required: ['emotion'],
        additionalProperties: false
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'propose_app_action',
      description:
        'Muestra un botón en el chat para abrir una pantalla de la app. Úsalo cuando el siguiente paso sea ir al diario, psicólogos, matching, mascota, progreso o llamar 113.',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: Object.keys(APP_ACTIONS)
          }
        },
        required: ['action'],
        additionalProperties: false
      }
    }
  }
]

function toIso(value) {
  if (!value) return null
  try {
    if (typeof value.toDate === 'function') return value.toDate().toISOString()
    if (value instanceof Date) return value.toISOString()
    if (typeof value === 'number') return new Date(value).toISOString()
    if (typeof value === 'string') return value
  } catch {
    return null
  }
  return null
}

function publicTherapist(id, data = {}) {
  return {
    id,
    displayName: data.displayName || 'Terapeuta',
    title: data.title || null,
    mainSpecialty: data.mainSpecialty || null,
    subspecialty: data.subspecialty || null,
    focusAreas: Array.isArray(data.focusAreas)
      ? data.focusAreas.filter(Boolean).slice(0, 6)
      : [],
    bio: data.bio ? String(data.bio).slice(0, 400) : null
  }
}

async function loadApprovedTherapists() {
  try {
    const snap = await getDocs(query(collection(db, 'therapists'), where('approved', '==', true)))
    const list = []
    snap.forEach((d) => list.push(publicTherapist(d.id, d.data())))
    return list.length ? list : [publicTherapist(EXAMPLE_THERAPIST.id, EXAMPLE_THERAPIST)]
  } catch {
    return [publicTherapist(EXAMPLE_THERAPIST.id, EXAMPLE_THERAPIST)]
  }
}

async function getPatientProfile(uid) {
  const [prefSnap, userSnap] = await Promise.all([
    getDoc(doc(db, 'preferencias', uid)),
    getDoc(doc(db, 'users', uid))
  ])
  const pref = prefSnap.exists() ? prefSnap.data() : {}
  const user = userSnap.exists() ? userSnap.data() : {}
  const stage = user.transitionStage || STAGES.dependency
  const style = pref.estilo_terapeuta

  return {
    edad: pref.edad || null,
    motivo_consulta: pref.motivo_consulta || null,
    estilo_terapeuta: style || null,
    estilo_terapeuta_label: THERAPY_STYLE_LABELS[style] || style || null,
    etapa: stage,
    etapa_label: (STAGE_META[stage] || STAGE_META.dependency).label,
    etapa_descripcion: (STAGE_META[stage] || STAGE_META.dependency).description,
    tiene_terapeuta: Boolean(user.chosenTherapistId),
    terapeuta_elegido_id: user.chosenTherapistId || null,
    terapeuta_elegido_nombre: user.chosenTherapistName || null,
    comparte_animo_con_terapeuta: user.moodShareConsent === true
  }
}

async function getMoodHistory(uid, limit = 14) {
  const cap = Math.min(30, Math.max(1, Number(limit) || 14))
  const snap = await getDocs(query(collection(db, 'estados_animo'), where('id_usuario', '==', uid)))
  const items = []
  snap.forEach((d) => {
    const data = d.data()
    const emotionId = data.emocion || null
    const emotion = emotionId && PET_EMOTIONS[emotionId] ? PET_EMOTIONS[emotionId] : null
    items.push({
      emocion: emotion?.id || emotionId,
      etiqueta: emotion?.label || null,
      nivel: data.nivel_animo ?? emotion?.level ?? null,
      fecha: toIso(data.fecha)
    })
  })
  items.sort((a, b) => String(b.fecha || '').localeCompare(String(a.fecha || '')))
  const recent = items.slice(0, cap)
  const counts = {}
  for (const item of recent) {
    const key = item.emocion || 'desconocida'
    counts[key] = (counts[key] || 0) + 1
  }
  return {
    total_registros: items.length,
    recientes: recent,
    resumen: counts
  }
}

async function getPetState(uid) {
  const snap = await getDoc(doc(db, 'pets', uid))
  const raw = snap.exists() ? snap.data() : {}
  const pet = decayStats(raw)
  const emotion = PET_EMOTIONS[pet.moodKey] || PET_EMOTIONS.calma
  return {
    nombre: pet.name || 'Uwu',
    emocion: emotion.id,
    emocion_etiqueta: emotion.label,
    hambre: Math.round(pet.hunger ?? 80),
    felicidad: Math.round(pet.happiness ?? 80),
    energia: Math.round(pet.energy ?? 80),
    necesita_cuidado: (pet.hunger ?? 80) < 40 || (pet.energy ?? 80) < 40 || (pet.happiness ?? 80) < 40
  }
}

async function getProgress(uid) {
  const snap = await getDoc(doc(db, 'user_gamification', uid))
  const g = snap.exists() ? snap.data() : {}
  const moodCount = g.moodLogsCount || 0
  const careCount = g.petCareCount || 0
  const chatCount = g.chatMessagesCount || 0
  const streak = g.currentStreak || 0
  return {
    puntos: g.points || 0,
    racha_dias: streak,
    registros_animo: moodCount,
    mensajes_chat: chatCount,
    cuidados_mascota: careCount,
    listo_para_independencia: canReachIndependence({
      moodCount,
      careCount,
      chatCount,
      streak
    })
  }
}

async function listTherapists(specialty) {
  const all = await loadApprovedTherapists()
  const q = String(specialty || '').trim().toLowerCase()
  const filtered = q
    ? all.filter((t) => {
        const hay = [t.displayName, t.title, t.mainSpecialty, t.subspecialty, t.bio, ...(t.focusAreas || [])]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return hay.includes(q)
      })
    : all
  return {
    total: filtered.length,
    terapeutas: filtered.map(({ bio, ...rest }) => rest),
    nota: filtered.length
      ? 'Estos son profesionales verificados en la app. No inventes otros.'
      : 'No hay coincidencias con ese filtro. Ofrece ver el listado completo.'
  }
}

async function getTherapistProfile(id) {
  if (!id) return { error: 'Falta therapist_id' }
  if (id === EXAMPLE_THERAPIST.id) return publicTherapist(id, EXAMPLE_THERAPIST)
  const snap = await getDoc(doc(db, 'therapists', id))
  if (!snap.exists()) return { error: 'No se encontró ese terapeuta', id }
  const data = snap.data()
  if (data.approved === false) return { error: 'Ese profesional no está disponible', id }
  return publicTherapist(id, data)
}

async function getMyTherapist(uid) {
  const userSnap = await getDoc(doc(db, 'users', uid))
  const user = userSnap.exists() ? userSnap.data() : {}
  if (!user.chosenTherapistId) {
    return {
      tiene_terapeuta: false,
      mensaje: 'Aún no eligió terapeuta. Puedes listar terapeutas disponibles.'
    }
  }
  const profile = await getTherapistProfile(user.chosenTherapistId)
  return {
    tiene_terapeuta: true,
    terapeuta: profile.error ? { id: user.chosenTherapistId, displayName: user.chosenTherapistName } : profile,
    comparte_animo: user.moodShareConsent === true
  }
}

async function getCrisisResources(uid) {
  const mine = await getMyTherapist(uid)
  return {
    pais: 'Perú',
    linea_crisis: {
      nombre: 'Línea 113 MINSA',
      telefono: '113',
      disponible: '24/7, gratuito'
    },
    terapeuta: mine.tiene_terapeuta ? mine.terapeuta : null,
    instruccion:
      'Valida el malestar, no des consejos de métodos, y prioriza pedir ayuda humana ahora. La app no sustituye emergencias.'
  }
}

function getBreathingGuide(technique = '4-7-8') {
  if (technique === 'box') {
    return {
      tecnica: 'Respiración en caja',
      pasos: ['Inhala 4', 'Sostén 4', 'Exhala 4', 'Sostén 4'],
      repeticiones: 4
    }
  }
  if (technique === 'grounding') {
    return {
      tecnica: 'Tierra 5-4-3-2-1',
      pasos: [
        '5 cosas que ves',
        '4 que puedes tocar',
        '3 que escuchas',
        '2 que hueles',
        '1 que saboreas o un apoyo en los pies'
      ]
    }
  }
  return {
    tecnica: 'Respiración 4-7-8',
    pasos: ['Inhala por la nariz contando 4', 'Sostén 7', 'Exhala por la boca contando 8'],
    repeticiones: 4,
    nota: 'Hazlo sentado. Si mareas, vuelve a una respiración normal.'
  }
}

async function suggestNextStep(uid) {
  const [profile, progress, pet] = await Promise.all([
    getPatientProfile(uid),
    getProgress(uid),
    getPetState(uid)
  ])

  if (profile.etapa === STAGES.therapist && profile.tiene_terapeuta) {
    return {
      paso: 'apoyo_entre_sesiones',
      texto: 'Sostén entre sesiones y anima a llevar temas importantes a su terapeuta.',
      action: 'open_diary'
    }
  }
  if (profile.etapa === STAGES.independence || progress.listo_para_independencia) {
    return {
      paso: 'explorar_terapeutas',
      texto: 'Ya hay autonomía suficiente para mirar profesionales verificados, sin presionar.',
      action: 'open_matching'
    }
  }
  if ((progress.registros_animo || 0) < 3) {
    return {
      paso: 'registrar_animo',
      texto: 'Registrar el ánimo ayuda a verse con más claridad y a avanzar de etapa.',
      action: 'open_diary'
    }
  }
  if (pet.necesita_cuidado) {
    return {
      paso: 'cuidar_mascota',
      texto: 'La mascota está baja de energía o hambre; un cuidado breve regula y da racha.',
      action: 'open_pet'
    }
  }
  return {
    paso: 'continuar_acompanamiento',
    texto: 'Seguir conversando y registrar ánimo. El puente terapéutico puede esperar.',
    action: 'open_diary'
  }
}

async function logMood(uid, emotionId, note) {
  const emotion = PET_EMOTIONS[emotionId]
  if (!emotion) {
    return { ok: false, error: 'Emoción no válida. Usa triste, enojado, temeroso, calma, motivado o feliz.' }
  }
  const userSnap = await getDoc(doc(db, 'users', uid))
  const user = userSnap.exists() ? userSnap.data() : {}
  const payload = {
    id_usuario: uid,
    nivel_animo: emotion.level,
    emocion: emotion.id,
    fecha: serverTimestamp(),
    sharedWithTherapist: user.moodShareConsent === true,
    therapistId: user.moodShareConsent ? user.chosenTherapistId || null : null
  }
  if (note && String(note).trim()) payload.nota = String(note).trim().slice(0, 240)

  await addDoc(collection(db, 'estados_animo'), payload)
  await updatePetMood(uid, emotion.id)
  await processUserAction(uid, 'mood')

  return {
    ok: true,
    emocion: emotion.id,
    etiqueta: emotion.label,
    wroteMood: true
  }
}

function proposeAppAction(action) {
  const meta = APP_ACTIONS[action]
  if (!meta) return { ok: false, error: 'Acción no válida' }
  return {
    ok: true,
    action,
    label: meta.label,
    route: meta.route || null,
    tel: meta.tel || null
  }
}

export async function executeUwuTool(uid, name, args = {}) {
  if (!uid) return { error: 'Usuario no autenticado' }
  try {
    switch (name) {
      case 'get_patient_profile':
        return await getPatientProfile(uid)
      case 'get_mood_history':
        return await getMoodHistory(uid, args.limit)
      case 'get_pet_state':
        return await getPetState(uid)
      case 'get_progress':
        return await getProgress(uid)
      case 'list_therapists':
        return await listTherapists(args.specialty)
      case 'get_therapist_profile':
        return await getTherapistProfile(args.therapist_id)
      case 'get_my_therapist':
        return await getMyTherapist(uid)
      case 'get_crisis_resources':
        return await getCrisisResources(uid)
      case 'get_breathing_guide':
        return getBreathingGuide(args.technique)
      case 'suggest_next_step':
        return await suggestNextStep(uid)
      case 'log_mood':
        return await logMood(uid, args.emotion, args.note)
      case 'propose_app_action':
        return proposeAppAction(args.action)
      default:
        return { error: `Herramienta desconocida: ${name}` }
    }
  } catch (err) {
    console.error(`Uwu tool ${name} failed:`, err)
    return { error: 'No pude consultar ese dato ahora. No lo inventes.' }
  }
}
