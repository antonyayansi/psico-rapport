/** Solo para capturas del manual (VITE_MANUAL_SHOTS=1). No usar en producción. */
export const MANUAL_SHOT = import.meta.env.VITE_MANUAL_SHOTS === '1'

export const mockUser = {
  uid: 'manual-demo-uid',
  displayName: 'Ana Demo',
  email: 'ana.demo@psicorapport.app',
  photoURL: null,
}

export const mockPet = {
  name: 'Qori',
  color: 'amber',
  accessory: 'scarf',
  hunger: 88,
  happiness: 92,
  energy: 78,
  moodKey: 'feliz',
  moodLevel: 4,
}

export const demoChatMessages = [
  {
    id: '1',
    text: 'Hola Ana. Estoy aquí contigo. ¿Cómo te sientes hoy?',
    sender: 'uwu',
    time: '10:02',
    actions: [
      { action: 'mood', label: 'Registrar ánimo' },
      { action: 'pet', label: 'Cuidar a Qori' },
    ],
  },
  {
    id: '2',
    text: 'Un poco ansiosa, pero quiero registrar cómo me siento.',
    sender: 'user',
    time: '10:03',
  },
  {
    id: '3',
    text: 'Gracias por contármelo. Podemos registrar tu ánimo o cuidar un rato juntos. Tú decides el ritmo.',
    sender: 'uwu',
    time: '10:03',
    actions: [
      { action: 'mood', label: 'Registrar ánimo' },
      { action: 'crisis', label: 'Línea 113' },
    ],
  },
]

export const demoCommunityPosts = [
  {
    id: 'demo-1',
    content: 'Hoy di un pequeño paso: salí a caminar aunque no tenía ganas. Gracias por este espacio.',
    authorId: 'u1',
    authorName: 'Lucía',
    authorPhotoUrl: null,
    likedBy: ['a', 'b', 'c'],
    comments: [
      { authorId: 't1', authorName: 'Qori', text: 'Qué valiente. Cada paso cuenta.', isPet: true, date: new Date().toISOString() },
    ],
    time: 'Hoy, 09:40',
    isTherapistPost: false,
  },
  {
    id: 'demo-2',
    content: 'Recordatorio amable: pedir ayuda también es cuidarse. Si estás en crisis en Perú, puedes llamar a la línea 113.',
    authorId: 't2',
    authorName: 'Dra. Sofía',
    authorPhotoUrl: null,
    likedBy: ['a'],
    comments: [],
    time: 'Ayer, 18:12',
    isTherapistPost: true,
  },
]

export const demoStats = {
  currentStreak: 5,
  points: 240,
  achievements: {
    photoUpdated: true,
    forumPostsCount: 2,
    chatMessagesCount: 18,
    moodLogsCount: 7,
    petCareCount: 12,
    reachedIndependence: false,
  },
  chartLabels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
  chartData: [2, 3, 2, 4, 3, 4, 4],
  latestMood: 4,
  latestEmotion: 'feliz',
}

export function seedAuthStore(authStore) {
  authStore.user = mockUser
  authStore.userRole = 'user'
  authStore.consentAccepted = true
  authStore.profileLoaded = true
  authStore.transitionStage = 'dependency'
  authStore.moodShareConsent = false
  authStore.chosenTherapistId = null
  authStore.chosenTherapistName = null
  authStore.pet = { ...mockPet }
  authStore.therapistData = null
}
