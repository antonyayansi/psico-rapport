/**
 * Momentos difíciles y contexto del usuario.
 * Pensado para cualquier persona mayor de 18 años.
 * No reemplaza terapia ni emergencias.
 */

export const USER_CONTEXTS = [
  {
    id: 'estudios',
    label: 'Estudio o formación',
    short: 'Estudios',
    hint: 'Universidad, instituto, cursos o exámenes'
  },
  {
    id: 'trabajo',
    label: 'Trabajo',
    short: 'Trabajo',
    hint: 'Empleo, búsqueda laboral o carga del día a día'
  },
  {
    id: 'hogar',
    label: 'Hogar o cuidados',
    short: 'Hogar',
    hint: 'Familia, pareja, crianza o cuidar a alguien'
  },
  {
    id: 'otro',
    label: 'Otro / prefiero no decir',
    short: 'General',
    hint: 'Acompañamiento general'
  },
  // Compatibilidad con perfiles antiguos del piloto
  {
    id: 'medicina',
    label: 'Estudiante de medicina',
    short: 'Medicina',
    hint: 'Exámenes, turnos, pacientes y carga académica'
  },
  {
    id: 'ciencias_salud',
    label: 'Otra carrera de salud',
    short: 'Ciencias de la salud',
    hint: 'Enfermería, psicología, odontología, etc.'
  }
]

export const MED_REASON_PRESETS = [
  'Ansiedad o estrés',
  'Me cuesta dormir',
  'Me siento solo/a o agotado/a',
  'Dudas sobre mi camino',
  'Relaciones o familia',
  'Otro'
]

export const MED_MOMENTS = [
  {
    id: 'antes_examen',
    title: 'Antes de algo importante',
    subtitle: 'Bajar la activación en unos minutos',
    icon: 'ClipboardList',
    starter:
      'Tengo algo importante pronto (examen, entrevista, presentación…) y siento mucha presión. Ayúdame a ordenar la cabeza un momento.',
    guide: [
      'Nombra en una frase qué te preocupa (tiempo, resultado, quedar mal).',
      'Elige una sola acción de 10 minutos: prepararte, descansar o comer.',
      'Si la ansiedad sube, usa respiración 4-7-8 una ronda.'
    ]
  },
  {
    id: 'despues_turno',
    title: 'Después de un día pesado',
    subtitle: 'Bajar del modo “alerta”',
    icon: 'Moon',
    starter:
      'Vengo de un día muy pesado. Necesito bajar un poco y no llevarme todo a la cama.',
    guide: [
      'Escribe 3 cosas que sí hiciste (aunque sean pequeñas).',
      'Separa: lo que controlaste vs. lo que no dependía de ti.',
      'Elige un cierre de 5 minutos: agua, comida, ducha o mensaje a alguien de confianza.'
    ]
  },
  {
    id: 'insomnio',
    title: 'No puedo dormir',
    subtitle: 'Cuando la mente no apaga',
    icon: 'BedDouble',
    starter:
      'No puedo dormir: me da vueltas el día o lo que viene. Quiero calmarme sin más presión.',
    guide: [
      'Anota en 2 líneas “para mañana” y cierra la lista.',
      'Baja pantallas y luz si puedes.',
      'Si a los 20 minutos sigues despierto, levántate un rato en silencio y vuelve.'
    ]
  },
  {
    id: 'vocacion',
    title: 'Dudé de mi camino',
    subtitle: 'Normal en etapas de cambio; no decides hoy toda la vida',
    icon: 'Compass',
    starter:
      'Hoy dudé de si estoy en el camino correcto. Quiero hablarlo con calma, sin que me digan que “aguante no más”.',
    guide: [
      'Separa un mal día de una decisión de vida.',
      'Nombra qué parte duele: cansancio, miedo, valores, entorno.',
      'Si la duda se queda semanas, conversarlo con alguien de confianza o un terapeuta ayuda más que decidir solo/a.'
    ]
  },
  {
    id: 'paciente_dificil',
    title: 'Algo me afectó fuerte',
    subtitle: 'Contención emocional sin dramatizar',
    icon: 'HeartPulse',
    starter:
      'Pasó algo que me afectó fuerte. Necesito un espacio seguro para aterrizarlo.',
    guide: [
      'Puedes contar qué pasó sin detalles de otras personas si no quieres.',
      'Nota qué sientes en el cuerpo (pecho, estómago, garganta).',
      'Si reaparece o te invade, busca apoyo humano; no tienes que cargarlo solo/a.'
    ]
  },
  {
    id: 'impostor',
    title: 'Me siento menos que el resto',
    subtitle: 'Cuando la comparación te baja',
    icon: 'Users',
    starter:
      'Siento que los demás van más adelante y que yo no doy la talla. Necesito perspectiva, no un discurso motivacional vacío.',
    guide: [
      'Recuerda: ves el resultado de otros, no su proceso ni su ansiedad.',
      'Elige un indicador tuyo medible de esta semana (algo pequeño que sí hiciste).',
      'Hablarlo con alguien de confianza suele bajar la vergüenza.'
    ]
  }
]

export function getMedMoment(id) {
  return MED_MOMENTS.find((m) => m.id === id) || null
}

export function isHealthStudentContext(rol) {
  return rol === 'medicina' || rol === 'ciencias_salud'
}

/** Contextos visibles en onboarding (sin los IDs legacy del piloto). */
export function getOnboardingContexts() {
  return USER_CONTEXTS.filter((c) => c.id !== 'medicina' && c.id !== 'ciencias_salud')
}

export function buildMedStudentPromptAddendum(prefs = {}) {
  const rol = prefs.rol || prefs.contexto_rol
  if (!isHealthStudentContext(rol)) return ''

  const label =
    USER_CONTEXTS.find((c) => c.id === rol)?.label || 'estudiante de ciencias de la salud'
  const year = prefs.anio_estudio ? ` Año/ciclo aproximado: ${prefs.anio_estudio}.` : ''

  return `
CONTEXTO EXTRA (formación en salud):
El usuario es ${label}.${year}
Puedes adaptar ejemplos a exámenes, prácticas, turnos o carga académica si aparece en la conversación.
No des consejos médicos clínicos. No digas “solo aguanta”. Si hay crisis → get_crisis_resources / 113.`
}
