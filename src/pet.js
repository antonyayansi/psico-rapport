import { db } from './firebase'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

export const DEFAULT_PET_NAME = 'Uwu'

export const PET_COLORS = [
  { id: 'amber', label: 'Ámbar', hex: '#f59e0b', bg: 'bg-amber-100', face: 'bg-amber-200' },
  { id: 'green', label: 'Andes', hex: '#10b981', bg: 'bg-emerald-100', face: 'bg-emerald-200' },
  { id: 'sky', label: 'Cielo', hex: '#0ea5e9', bg: 'bg-sky-100', face: 'bg-sky-200' },
  { id: 'rose', label: 'Rosa', hex: '#f43f5e', bg: 'bg-rose-100', face: 'bg-rose-200' },
  { id: 'violet', label: 'Violeta', hex: '#8b5cf6', bg: 'bg-violet-100', face: 'bg-violet-200' },
  { id: 'slate', label: 'Piedra', hex: '#64748b', bg: 'bg-slate-200', face: 'bg-slate-300' }
]

export const PET_ACCESSORIES = [
  { id: 'none', label: 'Ninguno', emoji: '' },
  { id: 'bow', label: 'Moño', emoji: '🎀' },
  { id: 'hat', label: 'Gorro', emoji: '🎩' },
  { id: 'glasses', label: 'Anteojos', emoji: '👓' },
  { id: 'scarf', label: 'Bufanda', emoji: '🧣' },
  { id: 'flower', label: 'Flor', emoji: '🌸' }
]

export const PET_EMOTIONS = {
  triste: {
    id: 'triste',
    src: '/emociones/triste.png',
    label: 'Triste',
    level: 1,
    happiness: 35,
    pulse: true
  },
  enojado: {
    id: 'enojado',
    src: '/emociones/enojado.png',
    label: 'Enojado',
    level: 2,
    happiness: 40,
    pulse: false
  },
  temeroso: {
    id: 'temeroso',
    src: '/emociones/temeroso.png',
    label: 'Temeroso',
    level: 2,
    happiness: 45,
    pulse: true
  },
  calma: {
    id: 'calma',
    src: '/emociones/calma.png',
    label: 'Calma',
    level: 3,
    happiness: 75,
    pulse: false
  },
  motivado: {
    id: 'motivado',
    src: '/emociones/motivado.png',
    label: 'Motivado',
    level: 4,
    happiness: 90,
    pulse: false
  },
  feliz: {
    id: 'feliz',
    src: '/emociones/feliz.png',
    label: 'Feliz',
    level: 5,
    happiness: 95,
    pulse: false
  }
}

export const PET_EMOTION_LIST = [
  PET_EMOTIONS.triste,
  PET_EMOTIONS.enojado,
  PET_EMOTIONS.temeroso,
  PET_EMOTIONS.calma,
  PET_EMOTIONS.motivado,
  PET_EMOTIONS.feliz
]

const LEVEL_TO_EMOTION = {
  0: 'calma',
  1: 'triste',
  2: 'enojado',
  3: 'calma',
  4: 'motivado',
  5: 'feliz'
}

export const CHART_MOOD_LABELS = ['', 'Triste', 'Enojado', 'Calma', 'Motivado', 'Feliz']

export function resolveEmotion({ moodKey, moodLevel } = {}) {
  if (moodKey && PET_EMOTIONS[moodKey]) return PET_EMOTIONS[moodKey]
  const fromLevel = LEVEL_TO_EMOTION[moodLevel]
  return PET_EMOTIONS[fromLevel] || PET_EMOTIONS.calma
}

export function getMoodFace(levelOrKey) {
  if (typeof levelOrKey === 'string') return resolveEmotion({ moodKey: levelOrKey })
  return resolveEmotion({ moodLevel: levelOrKey })
}

export function isPetAuthorName(name = '') {
  return /psico\s?rapport|uwu/i.test(String(name))
}

export function defaultPet(uid, name = DEFAULT_PET_NAME) {
  return {
    uid,
    name: name || DEFAULT_PET_NAME,
    color: 'amber',
    accessory: 'none',
    hunger: 80,
    happiness: 80,
    energy: 80,
    lastCareAt: null,
    moodLevel: 3,
    moodKey: 'calma',
    createdAt: new Date()
  }
}

export function getPetColor(colorId) {
  return PET_COLORS.find(c => c.id === colorId) || PET_COLORS[0]
}

export function getPetAccessory(id) {
  return PET_ACCESSORIES.find(a => a.id === id) || PET_ACCESSORIES[0]
}

export async function ensurePet(uid, name) {
  const ref = doc(db, 'pets', uid)
  const snap = await getDoc(ref)
  if (snap.exists()) return { id: snap.id, ...snap.data() }
  const pet = defaultPet(uid, name)
  await setDoc(ref, pet)
  return pet
}

export async function savePetCustomization(uid, { name, color, accessory }) {
  const ref = doc(db, 'pets', uid)
  await setDoc(ref, {
    name: (name || DEFAULT_PET_NAME).trim().slice(0, 24),
    color: color || 'amber',
    accessory: accessory || 'none',
    updatedAt: serverTimestamp()
  }, { merge: true })
}

export async function updatePetMood(uid, moodKeyOrLevel) {
  const emotion = typeof moodKeyOrLevel === 'string'
    ? resolveEmotion({ moodKey: moodKeyOrLevel })
    : resolveEmotion({ moodLevel: moodKeyOrLevel })

  await setDoc(doc(db, 'pets', uid), {
    moodLevel: emotion.level,
    moodKey: emotion.id,
    happiness: emotion.happiness,
    updatedAt: serverTimestamp()
  }, { merge: true })

  return emotion
}

/**
 * Cuidado tipo Pou: feed | play | rest
 */
export async function careForPet(uid, action) {
  const ref = doc(db, 'pets', uid)
  const snap = await getDoc(ref)
  const data = snap.exists() ? snap.data() : defaultPet(uid)
  let { hunger = 80, happiness = 80, energy = 80 } = data

  if (action === 'feed') {
    hunger = Math.min(100, hunger + 25)
    happiness = Math.min(100, happiness + 5)
  } else if (action === 'play') {
    happiness = Math.min(100, happiness + 20)
    energy = Math.max(0, energy - 15)
    hunger = Math.max(0, hunger - 10)
  } else if (action === 'rest') {
    energy = Math.min(100, energy + 30)
    hunger = Math.max(0, hunger - 5)
  }

  const patch = {
    hunger,
    happiness,
    energy,
    lastCareAt: Date.now(),
    updatedAt: serverTimestamp()
  }
  if (snap.exists()) await updateDoc(ref, patch)
  else await setDoc(ref, { ...defaultPet(uid), ...patch })

  return { hunger, happiness, energy }
}

/** Decaimiento pasivo si no se cuida (cliente, al abrir) */
export function decayStats(pet) {
  if (!pet?.lastCareAt) return pet
  const hours = (Date.now() - pet.lastCareAt) / (1000 * 60 * 60)
  if (hours < 4) return pet
  const steps = Math.min(5, Math.floor(hours / 4))
  return {
    ...pet,
    hunger: Math.max(10, (pet.hunger ?? 80) - steps * 8),
    happiness: Math.max(10, (pet.happiness ?? 80) - steps * 6),
    energy: Math.max(10, (pet.energy ?? 80) - steps * 5)
  }
}
