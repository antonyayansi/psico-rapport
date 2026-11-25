<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth'
import { Search, UserCheck, ChevronRight, Stethoscope, Plus, ShieldCheck } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const therapists = ref([])
const searchQuery = ref('')
const isLoading = ref(true)

// Terapeuta ejemplo (Dr. Daniel Hachircana) que se muestra mientras se carga Firestore
const exampleTherapist = {
  id: 'daniel-hachircana',
  displayName: 'Dr. Daniel Hachircana Mendez',
  title: 'Neuropsicólogo Clínico y de Rehabilitación',
  mainSpecialty: 'Neuropsicología Clínica',
  subspecialty: 'Daño cerebral adquirido y neuropsicología infantil',
  photoURL: null,
  approved: true,
  isExample: true
}

onMounted(async () => {
  try {
    const q = query(collection(db, 'therapists'), where('approved', '==', true))
    const snap = await getDocs(q)
    const loaded = []
    snap.forEach(d => loaded.push({ id: d.id, ...d.data() }))
    therapists.value = loaded
  } catch (e) {
    console.error('Error loading therapists:', e)
  } finally {
    isLoading.value = false
  }
})

const filtered = () => {
  const all = [...therapists.value]
  // Siempre incluir el ejemplo como primero si no hay terapeutas reales
  if (all.length === 0) all.unshift(exampleTherapist)

  if (!searchQuery.value.trim()) return all
  const q = searchQuery.value.toLowerCase()
  return all.filter(t =>
    t.displayName?.toLowerCase().includes(q) ||
    t.mainSpecialty?.toLowerCase().includes(q) ||
    t.title?.toLowerCase().includes(q)
  )
}

const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?'
</script>

<template>
  <div dir="ltr" class="h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-y-auto">
    <!-- Header -->
    <header class="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 px-6 sticky top-0 z-10">
      <h1 class="font-bold text-xl text-center text-slate-900 dark:text-slate-100">Nuestros Terapeutas</h1>
      <p class="text-[0.65rem] text-slate-400 dark:text-slate-500 text-center uppercase tracking-wide font-bold mt-0.5">
        Profesionales Verificados
      </p>
    </header>

    <div class="p-4 space-y-4 pb-24">
      <!-- Search -->
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input v-model="searchQuery" type="text" placeholder="Buscar por nombre o especialidad..."
          class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-9 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500/30 placeholder:text-slate-400" />
      </div>

      <!-- CTA para registrarse como terapeuta -->
      <div v-if="authStore.isTherapist"
        class="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-2xl p-4 flex items-center space-x-3">
        <UserCheck class="w-5 h-5 text-green-600 flex-shrink-0" />
        <div class="flex-1">
          <p class="text-sm font-semibold text-green-800 dark:text-green-300">Eres terapeuta verificado</p>
          <p class="text-xs text-green-700 dark:text-green-400">Tu perfil es visible para los usuarios.</p>
        </div>
      </div>

      <div v-else
        class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center space-x-3 cursor-pointer active:scale-95 transition-all"
        @click="router.push('/therapist-register')">
        <div class="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center flex-shrink-0">
          <Stethoscope class="w-5 h-5 text-green-600" />
        </div>
        <div class="flex-1">
          <p class="text-sm font-bold text-slate-900 dark:text-slate-100">¿Eres terapeuta?</p>
          <p class="text-xs text-slate-500">Regístrate y publica en el foro para llegar a más personas.</p>
        </div>
        <ChevronRight class="w-4 h-4 text-slate-400" />
      </div>

      <div v-if="authStore.isAdmin"
        class="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl p-4 flex items-center space-x-3 cursor-pointer active:scale-95"
        @click="router.push('/admin')">
        <ShieldCheck class="w-5 h-5 flex-shrink-0" />
        <div class="flex-1">
          <p class="text-sm font-bold">Panel de autorización</p>
          <p class="text-xs opacity-80">Aprobar o rechazar solicitudes de psicólogos</p>
        </div>
        <ChevronRight class="w-4 h-4 opacity-60" />
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 animate-pulse">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4"></div>
              <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Therapist Cards -->
      <div v-else class="space-y-4">
        <div v-if="filtered().length === 0" class="text-center py-12 text-slate-400">
          <Stethoscope class="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p class="font-medium">No se encontraron terapeutas</p>
          <p class="text-sm">Ajusta tu búsqueda</p>
        </div>

        <div v-for="t in filtered()" :key="t.id"
          @click="router.push(`/therapists/${t.id}`)"
          class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 cursor-pointer active:scale-95 transition-all">
          <div class="flex items-start space-x-4">
            <!-- Avatar -->
            <div class="flex-shrink-0">
              <img v-if="t.photoURL" :src="t.photoURL"
                class="w-16 h-16 rounded-full object-cover border-2 border-slate-100" alt="foto terapeuta" />
              <div v-else
                class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 border-2 border-green-200 dark:border-green-800 flex items-center justify-center text-green-700 dark:text-green-400 text-xl font-bold">
                {{ getInitial(t.displayName) }}
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight">{{ t.displayName }}</h3>
                  <p class="text-xs text-green-600 dark:text-green-400 font-semibold mt-0.5">{{ t.title }}</p>
                </div>
                <span class="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-semibold ml-2 flex-shrink-0">
                  ✓ Verificado
                </span>
              </div>

              <p v-if="t.mainSpecialty" class="text-xs text-slate-500 dark:text-slate-400 mt-2">
                <strong>Especialidad:</strong> {{ t.mainSpecialty }}
              </p>
              <p v-if="t.subspecialty" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                {{ t.subspecialty }}
              </p>

              <div class="flex items-center mt-3">
                <button class="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center space-x-1">
                  <span>Ver perfil completo</span>
                  <ChevronRight class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
