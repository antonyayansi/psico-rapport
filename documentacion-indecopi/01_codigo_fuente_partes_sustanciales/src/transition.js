/**
 * Etapas de transición inspiradas en el objeto transicional de Winnicott:
 * dependencia → independencia → terapeuta
 *
 * La mascota (ODT) sostiene al usuario mientras gana autonomía emocional
 * y luego facilita el puente hacia un profesional humano.
 */

import { DEFAULT_PET_NAME } from './pet'

export const STAGES = {
  dependency: 'dependency',
  independence: 'independence',
  therapist: 'therapist'
}

export const STAGE_ORDER = [STAGES.dependency, STAGES.independence, STAGES.therapist]

export const STAGE_META = {
  dependency: {
    id: STAGES.dependency,
    label: 'Dependencia',
    short: 'Acompañamiento cercano',
    description:
      'Tu mascota es tu objeto de transición: te sostiene, escucha y reduce la ansiedad inicial.',
    color: 'amber',
    nextHint: 'Cuida a tu mascota y registra tu ánimo varios días para ganar autonomía.'
  },
  independence: {
    id: STAGES.independence,
    label: 'Independencia',
    short: 'Autonomía emocional',
    description:
      'Ya puedes regularte mejor. La mascota acompaña, pero tú lideras tu cuidado.',
    color: 'emerald',
    nextHint: 'Cuando te sientas listo, elige un terapeuta verificado.'
  },
  therapist: {
    id: STAGES.therapist,
    label: 'Puente terapéutico',
    short: 'Con terapeuta',
    description:
      'Has dado el paso hacia un profesional. La mascota sigue siendo apoyo entre sesiones.',
    color: 'sky',
    nextHint: null
  }
}

export function stageIndex(stage) {
  const i = STAGE_ORDER.indexOf(stage)
  return i >= 0 ? i : 0
}

export function canAdvanceTo(from, to) {
  return stageIndex(to) === stageIndex(from) + 1
}

/** Umbrales blandos para avanzar de dependencia → independencia */
export function canReachIndependence({ moodCount = 0, careCount = 0, chatCount = 0, streak = 0 }) {
  return moodCount >= 3 || (careCount >= 5 && chatCount >= 5) || streak >= 3
}

export function buildStageSystemPrompt(stage, petName = DEFAULT_PET_NAME) {
  const name = petName || DEFAULT_PET_NAME
  const agentRules = `
Eres un agente con herramientas (function calling). No inventes datos clínicos, emociones pasadas, ni psicólogos.
Usa tools ANTES de afirmar:
- cómo se ha sentido → get_mood_history
- su edad, motivo o estilo → get_patient_profile
- estado de la mascota → get_pet_state
- puntos, racha, logros → get_progress
- psicólogos disponibles o recomendaciones → list_therapists (y get_therapist_profile si pide detalle)
- “mi terapeuta” → get_my_therapist
- crisis, desesperanza, hacerse daño → get_crisis_resources (y propose_app_action call_crisis)
- ansiedad aguda o “ayúdame a calmarme” → get_breathing_guide
- no sabe qué hacer → suggest_next_step + propose_app_action
Si describe con claridad cómo se siente HOY, puedes log_mood con la emoción más cercana (triste, enojado, temeroso, calma, motivado, feliz) y confirma que quedó anotado.
Si un tool falla o viene vacío, dilo con honestidad. Nunca fabriques nombres de terapeutas.
No eres psicólogo ni das diagnósticos. Respuestas cortas (2–6 frases), cálidas, en español. Si listas profesionales, máximo 3 y ofrece el botón de la app.
Privacidad: no pidas ni repitas correos, teléfonos ni datos de otros usuarios.`

  const base =
    `Eres ${name}, un oso de anteojos y Objeto Digital Transicional (ODT) en la app PsicoRapport (Perú), inspirado en la teoría de Winnicott. Eres empático, conciso y cercano. Tu nombre es ${name}, no el de la app.`

  if (stage === STAGES.independence) {
    return `${base} El usuario está en etapa de independencia: refuerza su autonomía, valida logros de autocuidado y menciona con suavidad que un terapeuta humano puede acompañarlo cuando se sienta listo. No fuerces el matching.${agentRules}`
  }
  if (stage === STAGES.therapist) {
    return `${base} El usuario ya eligió o está en puente con un terapeuta. Sé apoyo entre sesiones, no sustituyas la terapia, y anima a llevar temas importantes a su profesional.${agentRules}`
  }
  return `${base} El usuario está en dependencia emocional inicial: sé un sostén cálido, reduce ansiedad y construye confianza. Tu misión es ser el puente hacia la autonomía y, más adelante, hacia terapia profesional.${agentRules}`
}
