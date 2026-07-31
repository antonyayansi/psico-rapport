import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { STAGES } from '../transition'
import { ensurePet } from '../pet'
import { isAdminEmail } from '../adminEmails'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const userRole = ref('user')        // 'user' | 'therapist' | 'admin'
  const consentAccepted = ref(false)
  const therapistData = ref(null)
  const profileLoaded = ref(false)
  const transitionStage = ref(STAGES.dependency)
  const moodShareConsent = ref(false)
  const chosenTherapistId = ref(null)
  const chosenTherapistName = ref(null)
  const pet = ref(null)

  const isTherapist = computed(() => userRole.value === 'therapist' || userRole.value === 'admin')
  const isAdmin = computed(() => userRole.value === 'admin' || isAdminEmail(user.value?.email))

  async function setUser(newUser) {
    if (newUser instanceof Object && 'uid' in newUser) {
      user.value = newUser
      await loadUserProfile(newUser.uid)
    } else {
      user.value = null
      userRole.value = 'user'
      consentAccepted.value = false
      therapistData.value = null
      profileLoaded.value = false
      transitionStage.value = STAGES.dependency
      moodShareConsent.value = false
      chosenTherapistId.value = null
      chosenTherapistName.value = null
      pet.value = null
    }
  }

  async function loadUserProfile(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      const email = user.value?.email || null

      if (userDoc.exists()) {
        const data = userDoc.data()
        let role = data.role || 'user'

        // Whitelist: elevar y persistir admin para correos autorizados
        if (isAdminEmail(email) && role !== 'admin') {
          role = 'admin'
          await setDoc(doc(db, 'users', uid), { role: 'admin' }, { merge: true })
        }

        userRole.value = role
        consentAccepted.value = data.consentAccepted || false
        transitionStage.value = data.transitionStage || STAGES.dependency
        moodShareConsent.value = data.moodShareConsent === true
        chosenTherapistId.value = data.chosenTherapistId || null
        chosenTherapistName.value = data.chosenTherapistName || null
        if (role === 'therapist' || role === 'admin') {
          const tDoc = await getDoc(doc(db, 'therapists', uid))
          if (tDoc.exists()) therapistData.value = tDoc.data()
        }
      } else {
        const role = isAdminEmail(email) ? 'admin' : 'user'
        await setDoc(doc(db, 'users', uid), {
          role,
          consentAccepted: false,
          transitionStage: STAGES.dependency,
          moodShareConsent: false,
          email,
          displayName: user.value?.displayName || null,
          photoURL: user.value?.photoURL || null,
          createdAt: new Date()
        })
        userRole.value = role
        consentAccepted.value = false
        transitionStage.value = STAGES.dependency
        moodShareConsent.value = false
      }

      try {
        pet.value = await ensurePet(uid)
      } catch (petErr) {
        console.warn('Pet load skipped:', petErr)
      }
    } catch (e) {
      console.error('Error loading user profile:', e)
      // Fallback: si el correo está whitelisted, no perder acceso admin
      if (isAdminEmail(user.value?.email)) {
        userRole.value = 'admin'
      } else {
        userRole.value = 'user'
      }
    } finally {
      profileLoaded.value = true
    }
  }

  async function acceptConsent() {
    if (!user.value) return
    consentAccepted.value = true
    await setDoc(doc(db, 'users', user.value.uid), {
      consentAccepted: true,
      consentDate: new Date(),
      transitionStage: transitionStage.value || STAGES.dependency
    }, { merge: true })
  }

  async function setMoodShareConsent(accepted) {
    if (!user.value) return
    moodShareConsent.value = !!accepted
    await setDoc(doc(db, 'users', user.value.uid), {
      moodShareConsent: !!accepted,
      moodShareConsentDate: accepted ? new Date() : null
    }, { merge: true })
  }

  async function setTransitionStage(stage) {
    if (!user.value || !Object.values(STAGES).includes(stage)) return
    transitionStage.value = stage
    await setDoc(doc(db, 'users', user.value.uid), {
      transitionStage: stage,
      transitionStageUpdatedAt: new Date()
    }, { merge: true })
  }

  async function refreshPet() {
    if (!user.value) return
    pet.value = await ensurePet(user.value.uid)
  }

  return {
    user,
    userRole,
    consentAccepted,
    therapistData,
    profileLoaded,
    transitionStage,
    moodShareConsent,
    chosenTherapistId,
    chosenTherapistName,
    pet,
    isTherapist,
    isAdmin,
    setUser,
    loadUserProfile,
    acceptConsent,
    setMoodShareConsent,
    setTransitionStage,
    refreshPet
  }
})
