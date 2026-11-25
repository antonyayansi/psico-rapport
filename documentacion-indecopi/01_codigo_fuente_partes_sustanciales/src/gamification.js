import { db } from './firebase'
import { doc, getDoc, setDoc, updateDoc, increment, collection, query, where, getCountFromServer } from 'firebase/firestore'
import { STAGES, canReachIndependence } from './transition'

export const getGamificationDocRef = (userId) => {
  return doc(db, 'user_gamification', userId)
}

const emptyGamification = (userId, actionType) => ({
  uid: userId,
  photoUpdated: actionType === 'photo',
  forumPostsCount: actionType === 'forum' ? 1 : 0,
  chatMessagesCount: actionType === 'chat' ? 1 : 0,
  moodLogsCount: actionType === 'mood' ? 1 : 0,
  petCareCount: actionType === 'petCare' ? 1 : 0,
  currentStreak: 1,
  lastActionDate: Date.now(),
  points: pointsFor(actionType)
})

function pointsFor(actionType) {
  const map = { chat: 2, forum: 5, photo: 10, mood: 8, petCare: 4, stage: 25 }
  return map[actionType] || 1
}

export const processUserAction = async (userId, actionType) => {
  if (!userId) return null

  const docRef = getGamificationDocRef(userId)
  const docSnap = await getDoc(docRef)

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

  if (!docSnap.exists()) {
    const newData = emptyGamification(userId, actionType)
    await setDoc(docRef, newData)
    await maybeAdvanceStage(userId, newData)
    return newData
  }

  const data = docSnap.data()
  const lastAction = data.lastActionDate || 0
  const lastActionDateObj = new Date(lastAction)
  const lastActionStart = new Date(
    lastActionDateObj.getFullYear(),
    lastActionDateObj.getMonth(),
    lastActionDateObj.getDate()
  ).getTime()

  const msInDay = 24 * 60 * 60 * 1000
  const daysDifference = Math.round((todayStart - lastActionStart) / msInDay)

  const updates = {
    points: increment(pointsFor(actionType))
  }

  if (daysDifference === 1) {
    updates.currentStreak = increment(1)
    updates.lastActionDate = now.getTime()
  } else if (daysDifference > 1) {
    updates.currentStreak = 1
    updates.lastActionDate = now.getTime()
  } else if (daysDifference === 0) {
    updates.lastActionDate = now.getTime()
  }

  if (actionType === 'chat') updates.chatMessagesCount = increment(1)
  if (actionType === 'forum') updates.forumPostsCount = increment(1)
  if (actionType === 'photo') updates.photoUpdated = true
  if (actionType === 'mood') updates.moodLogsCount = increment(1)
  if (actionType === 'petCare') updates.petCareCount = increment(1)

  await updateDoc(docRef, updates)

  const refreshed = await getDoc(docRef)
  const next = refreshed.exists() ? refreshed.data() : data
  await maybeAdvanceStage(userId, next)
  return next
}

async function countMoods(userId) {
  try {
    const q = query(collection(db, 'estados_animo'), where('id_usuario', '==', userId))
    const snap = await getCountFromServer(q)
    return snap.data().count
  } catch {
    return 0
  }
}

async function maybeAdvanceStage(userId, gamification) {
  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) return
    const stage = userSnap.data().transitionStage || STAGES.dependency
    if (stage !== STAGES.dependency) return

    const moodCount = gamification.moodLogsCount || (await countMoods(userId))
    if (
      canReachIndependence({
        moodCount,
        careCount: gamification.petCareCount || 0,
        chatCount: gamification.chatMessagesCount || 0,
        streak: gamification.currentStreak || 0
      })
    ) {
      await setDoc(
        userRef,
        {
          transitionStage: STAGES.independence,
          transitionStageUpdatedAt: new Date()
        },
        { merge: true }
      )
      await updateDoc(getGamificationDocRef(userId), {
        points: increment(pointsFor('stage')),
        reachedIndependence: true
      })
    }
  } catch (e) {
    console.warn('Stage advance skipped:', e)
  }
}
