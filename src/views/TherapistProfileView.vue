<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { ArrowLeft, GraduationCap, Briefcase, Award, MapPin, Phone } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const therapist = ref(null)
const isLoading = ref(true)

// Perfil de ejemplo del Dr. Daniel Hachircana Mendez
const exampleProfile = {
  id: 'daniel-hachircana',
  displayName: 'Dr. Daniel Hachircana Mendez',
  title: 'Neuropsicólogo Clínico y de Rehabilitación',
  photoURL: null,
  mainSpecialty: 'Neuropsicología Clínica y de Rehabilitación',
  subspecialty: 'Subespecialidad en daño cerebral adquirido y neuropsicología infantil',
  focusAreas: [
    'Evaluación y diagnóstico diferencial de trastornos cognitivos (demencias, TDAH, TEA, trastornos del aprendizaje).',
    'Rehabilitación neuropsicológica postraumática y post-ACV.',
    'Intervención en dificultades de memoria, funciones ejecutivas y atención.',
    'Peritaje neuropsicológico forense.'
  ],
  experience: [
    { period: '2020 – actual', role: 'Neuropsicólogo jefe', institution: 'Centro de Rehabilitación Cognitiva Integra, Santiago.' },
    { period: '2015 – 2020', role: 'Neuropsicólogo clínico', institution: 'Hospital Clínico Universidad de Los Andes.' },
    { period: '2007 – 2015', role: 'Evaluador e investigador', institution: 'Laboratorio de Neurociencias Cognitivas, Universidad de España.' }
  ],
  education: [
    { degree: 'Doctorado en Neurociencias', institution: 'Universidad de Barcelona', year: '2012' },
    { degree: 'Magíster en Neuropsicología Clínica', institution: 'Universidad Autónoma de Madrid', year: '2008' },
    { degree: 'Psicólogo', institution: 'Pontificia Universidad Católica de Chile', year: '2005' }
  ],
  certifications: [
    'Certificado en Evaluación Neuropsicológica (ABN, España).',
    'Miembro activo de la Sociedad Latinoamericana de Neuropsicología (SLAN).'
  ],
  approved: true
}

onMounted(async () => {
  const id = route.params.id
  if (id === 'daniel-hachircana') {
    therapist.value = exampleProfile
    isLoading.value = false
    return
  }
  try {
    const docSnap = await getDoc(doc(db, 'therapists', id))
    if (docSnap.exists()) {
      therapist.value = { id: docSnap.id, ...docSnap.data() }
    } else {
      router.replace('/therapists')
    }
  } catch (e) {
    console.error(e)
    router.replace('/therapists')
  } finally {
    isLoading.value = false
  }
})

const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?'
</script>

<template>
  <div dir="ltr" class="h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-y-auto">
    <!-- Header -->
    <header class="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center p-4 px-6 sticky top-0 z-10">
      <button @click="router.back()" class="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
        <ArrowLeft class="w-6 h-6" />
      </button>
      <h1 class="font-bold text-xl ml-2 flex-1">Perfil del Terapeuta</h1>
    </header>

    <!-- Loading -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <div class="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="therapist" class="p-4 space-y-5 pb-24">
      <!-- Hero Card -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div class="h-24 bg-gradient-to-br from-green-500 to-teal-600"></div>
        <div class="px-5 pb-5 -mt-10">
          <div class="flex items-end space-x-4">
            <img v-if="therapist.photoURL" :src="therapist.photoURL"
              class="w-20 h-20 rounded-2xl object-cover border-4 border-white dark:border-slate-900" />
            <div v-else
              class="w-20 h-20 rounded-2xl bg-green-100 dark:bg-green-900/60 border-4 border-white dark:border-slate-900 flex items-center justify-center text-green-700 dark:text-green-300 text-3xl font-bold">
              {{ getInitial(therapist.displayName) }}
            </div>
            <span class="mb-2 text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-semibold">
              ✓ Verificado
            </span>
          </div>
          <h2 class="text-xl font-bold mt-3 text-slate-900 dark:text-slate-100">{{ therapist.displayName }}</h2>
          <p class="text-green-600 dark:text-green-400 font-semibold text-sm mt-0.5">{{ therapist.title }}</p>
        </div>
      </div>

      <!-- Especialidad principal -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5">
        <h3 class="font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center space-x-2">
          <Award class="w-5 h-5 text-green-600" />
          <span>Especialidad principal</span>
        </h3>
        <p class="text-slate-700 dark:text-slate-300 font-semibold">{{ therapist.mainSpecialty }}</p>
        <p v-if="therapist.subspecialty" class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ therapist.subspecialty }}</p>

        <div v-if="therapist.focusAreas && therapist.focusAreas.length" class="mt-4">
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Áreas específicas de enfoque:
          </p>
          <ul class="space-y-2">
            <li v-for="area in therapist.focusAreas" :key="area"
              class="flex items-start space-x-2 text-sm text-slate-600 dark:text-slate-300">
              <span class="text-green-500 mt-0.5 flex-shrink-0">•</span>
              <span>{{ area }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Historial Profesional -->
      <div v-if="therapist.experience && therapist.experience.length"
        class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5">
        <h3 class="font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
          <Briefcase class="w-5 h-5 text-green-600" />
          <span>Historial Profesional</span>
        </h3>
        <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Experiencia clínica
        </p>
        <div class="space-y-3">
          <div v-for="exp in therapist.experience" :key="exp.period"
            class="flex space-x-3 border-l-2 border-green-200 dark:border-green-800 pl-3">
            <div class="flex-1">
              <p class="text-xs font-bold text-green-700 dark:text-green-400">{{ exp.period }}</p>
              <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ exp.role }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ exp.institution }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Formación Académica -->
      <div v-if="therapist.education && therapist.education.length"
        class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5">
        <h3 class="font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
          <GraduationCap class="w-5 h-5 text-green-600" />
          <span>Formación Académica</span>
        </h3>
        <div class="space-y-3">
          <div v-for="edu in therapist.education" :key="edu.degree" class="flex items-start space-x-3">
            <div class="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
            <div>
              <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ edu.degree }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ edu.institution }}
                <span v-if="edu.year"> — {{ edu.year }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Acreditaciones -->
      <div v-if="therapist.certifications && therapist.certifications.length"
        class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5">
        <h3 class="font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center space-x-2">
          <Award class="w-5 h-5 text-green-600" />
          <span>Acreditaciones</span>
        </h3>
        <ul class="space-y-2">
          <li v-for="cert in therapist.certifications" :key="cert"
            class="flex items-start space-x-2 text-sm text-slate-600 dark:text-slate-300">
            <span class="text-amber-500 mt-0.5">🏅</span>
            <span>{{ cert }}</span>
          </li>
        </ul>
      </div>

      <!-- Contactar -->
      <div class="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-3xl p-5 text-center">
        <p class="text-sm text-green-800 dark:text-green-300 mb-3 font-medium">
          ¿Quieres agendar una sesión con {{ therapist.displayName.split(' ')[1] }}?
        </p>
        <button @click="router.push('/matching')"
          class="bg-green-600 text-white px-6 py-3 rounded-full font-bold text-sm active:scale-95 transition-all">
          Ver disponibilidad
        </button>
      </div>
    </div>
  </div>
</template>
