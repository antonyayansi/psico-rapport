<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../firebase'
import {
  collection, getDocs, doc, setDoc, updateDoc, serverTimestamp
} from 'firebase/firestore'
import { useAuthStore } from '../stores/auth'
import {
  ArrowLeft, ShieldCheck, CheckCircle2, XCircle, Stethoscope, Loader2
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const applications = ref([])
const isLoading = ref(true)
const actingId = ref(null)
const filter = ref('pending') // pending | approved | rejected | all
const toast = ref('')

const filtered = computed(() => {
  if (filter.value === 'all') return applications.value
  return applications.value.filter(a => a.status === filter.value)
})

const load = async () => {
  isLoading.value = true
  try {
    const snap = await getDocs(collection(db, 'therapist_applications'))
    const list = []
    snap.forEach(d => list.push({ id: d.id, ...d.data() }))
    list.sort((a, b) => {
      const ta = a.submittedAt?.toMillis?.() || 0
      const tb = b.submittedAt?.toMillis?.() || 0
      return tb - ta
    })
    applications.value = list
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (!authStore.isAdmin) {
    router.replace('/stats')
    return
  }
  await load()
})

const showToast = (msg) => {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 2800)
}

const approve = async (app) => {
  actingId.value = app.id
  try {
    const uid = app.uid || app.id
    await setDoc(doc(db, 'therapists', uid), {
      displayName: app.displayName,
      title: app.title,
      email: app.email,
      photoURL: app.photoURL || null,
      licenseNumber: app.licenseNumber,
      mainSpecialty: app.mainSpecialty,
      subspecialty: app.subspecialty || '',
      focusAreas: app.focusAreas || [],
      experience: app.experience || [],
      education: app.education || [],
      certifications: app.certifications || [],
      bio: app.bio || '',
      approved: true,
      approvedAt: serverTimestamp(),
      approvedBy: authStore.user.uid
    }, { merge: true })

    await setDoc(doc(db, 'users', uid), {
      role: 'therapist'
    }, { merge: true })

    await updateDoc(doc(db, 'therapist_applications', app.id), {
      status: 'approved',
      reviewedAt: serverTimestamp(),
      reviewedBy: authStore.user.uid
    })

    app.status = 'approved'
    showToast(`Aprobado: ${app.displayName}`)
  } catch (e) {
    console.error(e)
    showToast('Error al aprobar')
  } finally {
    actingId.value = null
  }
}

const reject = async (app) => {
  actingId.value = app.id
  try {
    await updateDoc(doc(db, 'therapist_applications', app.id), {
      status: 'rejected',
      reviewedAt: serverTimestamp(),
      reviewedBy: authStore.user.uid
    })
    app.status = 'rejected'
    showToast(`Rechazado: ${app.displayName}`)
  } catch (e) {
    console.error(e)
    showToast('Error al rechazar')
  } finally {
    actingId.value = null
  }
}

const statusBadge = (status) => {
  if (status === 'approved') return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
  if (status === 'rejected') return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
  return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
}
</script>

<template>
  <div dir="ltr" class="h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-y-auto">
    <header class="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center p-4 px-6 sticky top-0 z-10">
      <button @click="router.back()" class="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
        <ArrowLeft class="w-6 h-6" />
      </button>
      <div class="ml-2 flex items-center space-x-2">
        <ShieldCheck class="w-5 h-5 text-green-600" />
        <h1 class="font-bold text-xl">Autorizar psicólogos</h1>
      </div>
    </header>

    <div class="p-4 space-y-4 pb-24">
      <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        Solo súper usuarios pueden verificar colegiatura y autorizar terapeutas en el directorio.
      </p>

      <div class="flex gap-2 overflow-x-auto pb-1">
        <button
          v-for="f in [
            { id: 'pending', label: 'Pendientes' },
            { id: 'approved', label: 'Aprobados' },
            { id: 'rejected', label: 'Rechazados' },
            { id: 'all', label: 'Todos' }
          ]"
          :key="f.id"
          @click="filter = f.id"
          class="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border"
          :class="filter === f.id
            ? 'bg-green-600 text-white border-green-600'
            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'"
        >
          {{ f.label }}
        </button>
      </div>

      <div v-if="isLoading" class="flex justify-center py-16">
        <Loader2 class="w-8 h-8 animate-spin text-green-600" />
      </div>

      <div v-else-if="!filtered.length" class="text-center py-16 text-slate-400">
        <Stethoscope class="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p class="font-medium">No hay solicitudes</p>
      </div>

      <div v-else class="space-y-4">
        <article
          v-for="app in filtered"
          :key="app.id"
          class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 space-y-3"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="font-bold text-slate-900 dark:text-white">{{ app.displayName }}</h3>
              <p class="text-sm text-slate-500">{{ app.title }}</p>
              <p class="text-xs text-slate-400 mt-1">{{ app.email }}</p>
            </div>
            <span class="text-[0.65rem] font-bold uppercase tracking-wide px-2 py-1 rounded-full" :class="statusBadge(app.status)">
              {{ app.status }}
            </span>
          </div>

          <dl class="text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <div class="flex justify-between"><dt>Colegiatura</dt><dd class="font-semibold">{{ app.licenseNumber }}</dd></div>
            <div class="flex justify-between"><dt>Especialidad</dt><dd class="font-semibold text-right max-w-[60%]">{{ app.mainSpecialty }}</dd></div>
            <div v-if="app.subspecialty" class="flex justify-between"><dt>Subesp.</dt><dd class="font-semibold text-right max-w-[60%]">{{ app.subspecialty }}</dd></div>
          </dl>

          <p v-if="app.bio" class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">{{ app.bio }}</p>

          <div v-if="app.status === 'pending'" class="flex gap-2 pt-1">
            <button
              :disabled="actingId === app.id"
              @click="approve(app)"
              class="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white py-2.5 rounded-2xl text-sm font-bold disabled:opacity-50"
            >
              <CheckCircle2 class="w-4 h-4" /> Aprobar
            </button>
            <button
              :disabled="actingId === app.id"
              @click="reject(app)"
              class="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-2.5 rounded-2xl text-sm font-bold disabled:opacity-50"
            >
              <XCircle class="w-4 h-4" /> Rechazar
            </button>
          </div>
        </article>
      </div>
    </div>

    <div
      v-if="toast"
      class="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg z-50"
    >
      {{ toast }}
    </div>
  </div>
</template>
