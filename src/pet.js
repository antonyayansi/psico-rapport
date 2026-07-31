import { db } from './firebase'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

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

export const PET_MOOD_FACES = {
  1: { emoji: '😢', label: 'Triste', pulse: 'animate-pulse' },
  3: { emoji: '😐', label: 'Neutral', pulse: '' },
  5: { emoji: '😊', label: 'Feliz', pulse: '' },
  0: { emoji: '🐻', label: 'En espera', pulse: '' }
}

export function defaultPet(uid, name = 'PsicoRapport') {
  return {
    uid,
    name,
    color: 'amber',
    accessory: 'none',
    hunger: 80,
    happiness: 80,
    energy: 80,
    lastCareAt: null,
    moodLevel: 0,
    createdAt: new Date()
  }
}

export function getPetColor(colorId) {
  return PET_COLORS.find(c => c.id === colorId) || PET_COLORS[0]
}

export function getPetAccessory(id) {
  return PET_ACCESSORIES.find(a => a.id === id) || PET_ACCESSORIES[0]
}

export function getMoodFace(level) {
  return PET_MOOD_FACES[level] || PET_MOOD_FACES[0]
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
    name: (name || 'PsicoRapport').trim().slice(0, 24),
    color: color || 'amber',
    accessory: accessory || 'none',
    updatedAt: serverTimestamp()
  }, { merge: true })
}

export async function updatePetMood(uid, moodLevel) {
  await setDoc(doc(db, 'pets', uid), {
    moodLevel,
    happiness: moodLevel === 5 ? 95 : moodLevel === 3 ? 70 : 40,
    updatedAt: serverTimestamp()
  }, { merge: true })
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
