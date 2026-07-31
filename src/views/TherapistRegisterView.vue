<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth'
import { ArrowLeft, Send, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const step = ref(1)
const isSubmitting = ref(false)
const submitted = ref(false)
const errorMsg = ref('')

const form = ref({
  displayName: authStore.user?.displayName || '',
  email: authStore.user?.email || '',
  title: '',
  licenseNumber: '',
  mainSpecialty: '',
  subspecialty: '',
  focusAreas: [''],
  experience: [{ period: '', role: '', institution: '' }],
  education: [{ degree: '', institution: '', year: '' }],
  certifications: [''],
  bio: '',
  agreeTerms: false
})

// Focus areas helpers
const addFocusArea = () => form.value.focusAreas.push('')
const removeFocusArea = (i) => {
  if (form.value.focusAreas.length > 1) form.value.focusAreas.splice(i, 1)
}

// Experience helpers
const addExperience = () => form.value.experience.push({ period: '', role: '', institution: '' })
const removeExperience = (i) => {
  if (form.value.experience.length > 1) form.value.experience.splice(i, 1)
}

// Education helpers
const addEducation = () => form.value.education.push({ degree: '', institution: '', year: '' })
const removeEducation = (i) => {
  if (form.value.education.length > 1) form.value.education.splice(i, 1)
}

// Certifications helpers
const addCertification = () => form.value.certifications.push('')
const removeCertification = (i) => {
  if (form.value.certifications.length > 1) form.value.certifications.splice(i, 1)
}

const isStep1Valid = () =>
  form.value.displayName.trim() &&
  form.value.email.trim() &&
  form.value.title.trim() &&
  form.value.licenseNumber.trim()

const isStep2Valid = () =>
  form.value.mainSpecialty.trim() &&
  form.value.focusAreas.some(f => f.trim())

const isStep3Valid = () =>
  form.value.experience.some(e => e.period.trim() && e.role.trim()) &&
  form.value.education.some(e => e.degree.trim() && e.institution.trim())

const submitApplication = async () => {
  if (!form.value.agreeTerms) {
    errorMsg.value = 'Debes aceptar los términos para enviar tu solicitud.'
    return
  }
  isSubmitting.value = true
  errorMsg.value = ''
  try {
    const uid = authStore.user.uid
    await setDoc(doc(db, 'therapist_applications', uid), {
      uid,
      displayName: form.value.displayName.trim(),
      email: form.value.email.trim(),
      title: form.value.title.trim(),
      licenseNumber: form.value.licenseNumber.trim(),
      mainSpecialty: form.value.mainSpecialty.trim(),
      subspecialty: form.value.subspecialty.trim(),
      focusAreas: form.value.focusAreas.filter(f => f.trim()),
      experience: form.value.experience.filter(e => e.period.trim() || e.role.trim()),
      education: form.value.education.filter(e => e.degree.trim() || e.institution.trim()),
      certifications: form.value.certifications.filter(c => c.trim()),
      bio: form.value.bio.trim(),
      status: 'pending',
      submittedAt: serverTimestamp(),
      reviewedAt: null
    })
    submitted.value = true
  } catch (e) {
    console.error(e)
    errorMsg.value = 'Ocurrió un error al enviar tu solicitud. Intenta de nuevo.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div dir="ltr" class="h-full flex flex-col bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-y-auto">
    <!-- Header -->
    <header class="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center p-4 px-6 sticky top-0 z-10">
      <button @click="router.back()" class="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
        <ArrowLeft class="w-6 h-6 text-slate-600 dark:text-slate-400" />
      </button>
      <div class="flex-1 ml-2">
        <h1 class="font-bold text-lg leading-tight">Registro de Terapeuta</h1>
        <p class="text-xs text-slate-500">Paso {{ step }} de 4</p>
      </div>
    </header>

    <!-- Barra de progreso -->
    <div class="flex-none px-6 pt-4 pb-2 flex space-x-2">
      <div v-for="i in 4" :key="i" class="h-1.5 flex-1 rounded-full transition-colors duration-500"
        :class="i <= step ? 'bg-green-500' : 'bg-slate-100 dark:bg-slate-800'"></div>
    </div>

    <!-- Éxito -->
    <div v-if="submitted" class="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-5">
      <div class="w-20 h-20 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
        <CheckCircle2 class="w-10 h-10 text-green-600" />
      </div>
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">¡Solicitud enviada!</h2>
        <p class="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
          Tu solicitud ha sido recibida y será revisada por nuestro equipo. Te notificaremos por email cuando
          sea aprobada.
        </p>
      </div>
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-4 w-full max-w-xs text-left">
        <p class="text-sm text-blue-800 dark:text-blue-300">
          📧 Se notificará al equipo en <strong>antonyayansi@gmail.com</strong> para revisión.
        </p>
      </div>
      <button @click="router.replace('/therapists')"
        class="w-full max-w-xs bg-green-600 text-white py-3.5 rounded-2xl font-bold active:scale-95 transition-all">
        Volver a Terapeutas
      </button>
    </div>

    <!-- Form -->
    <div v-else class="flex-1 px-6 py-4 space-y-5 pb-8">

      <!-- STEP 1: Información Personal -->
      <div v-if="step === 1" class="space-y-4 animate-fade-in-up">
        <div>
          <h2 class="text-xl font-bold mb-1">Información personal</h2>
          <p class="text-sm text-slate-500">Datos básicos de identificación profesional.</p>
        </div>

        <label class="block">
          <span class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Nombre completo *</span>
          <input v-model="form.displayName" type="text" placeholder="Dr. Nombre Apellido"
            class="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500/30" />
        </label>

        <label class="block">
          <span class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Email de contacto *</span>
          <input v-model="form.email" type="email" placeholder="tu@email.com"
            class="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500/30" />
        </label>

        <label class="block">
          <span class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Título profesional *</span>
          <input v-model="form.title" type="text" placeholder="Ej: Psicólogo Clínico, Neuropsicólogo..."
            class="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500/30" />
        </label>

        <label class="block">
          <span class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Número de colegiatura / licencia *</span>
          <input v-model="form.licenseNumber" type="text" placeholder="Ej: CPsp 12345"
            class="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500/30" />
        </label>

        <button @click="step = 2" :disabled="!isStep1Valid()"
          class="w-full bg-green-600 text-white py-3.5 rounded-2xl font-bold disabled:opacity-40 active:scale-95 transition-all">
          Continuar
        </button>
      </div>

      <!-- STEP 2: Especialidad -->
      <div v-if="step === 2" class="space-y-4 animate-fade-in-up">
        <div>
          <h2 class="text-xl font-bold mb-1">Especialidad</h2>
          <p class="text-sm text-slate-500">Define tu área de práctica profesional.</p>
        </div>

        <label class="block">
          <span class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Especialidad principal *</span>
          <input v-model="form.mainSpecialty" type="text" placeholder="Ej: Neuropsicología Clínica"
            class="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500/30" />
        </label>

        <label class="block">
          <span class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Subespecialidad</span>
          <input v-model="form.subspecialty" type="text" placeholder="Ej: Daño cerebral adquirido"
            class="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500/30" />
        </label>

        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Áreas específicas de enfoque</span>
            <button @click="addFocusArea" class="text-green-600 text-xs font-bold flex items-center space-x-1">
              <Plus class="w-3 h-3" /> <span>Agregar</span>
            </button>
          </div>
          <div v-for="(area, i) in form.focusAreas" :key="i" class="flex items-center space-x-2 mb-2">
            <input v-model="form.focusAreas[i]" type="text" :placeholder="`Área ${i + 1}`"
              class="flex-1 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500/30" />
            <button v-if="form.focusAreas.length > 1" @click="removeFocusArea(i)"
              class="p-2 text-red-400 hover:text-red-600">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <label class="block">
          <span class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Presentación breve</span>
          <textarea v-model="form.bio" rows="3" placeholder="Cuéntale a los usuarios sobre tu enfoque..."
            class="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500/30 resize-none"></textarea>
        </label>

        <div class="flex space-x-3">
          <button @click="step = 1" class="flex-1 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-3.5 rounded-2xl font-semibold active:scale-95 transition-all">
            Atrás
          </button>
          <button @click="step = 3" :disabled="!isStep2Valid()"
            class="flex-1 bg-green-600 text-white py-3.5 rounded-2xl font-bold disabled:opacity-40 active:scale-95 transition-all">
            Continuar
          </button>
        </div>
      </div>

      <!-- STEP 3: Historial Profesional -->
      <div v-if="step === 3" class="space-y-5 animate-fade-in-up">
        <div>
          <h2 class="text-xl font-bold mb-1">Historial Profesional</h2>
          <p class="text-sm text-slate-500">Experiencia y formación académica.</p>
        </div>

        <!-- Experience -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-bold text-slate-700 dark:text-slate-300">Experiencia clínica</span>
            <button @click="addExperience" class="text-green-600 text-xs font-bold flex items-center space-x-1">
              <Plus class="w-3 h-3" /> <span>Agregar</span>
            </button>
          </div>
          <div v-for="(exp, i) in form.experience" :key="i"
            class="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-3 mb-3 relative">
            <button v-if="form.experience.length > 1" @click="removeExperience(i)"
              class="absolute top-3 right-3 text-red-400 hover:text-red-600">
              <Trash2 class="w-4 h-4" />
            </button>
            <input v-model="exp.period" type="text" placeholder="Período (ej: 2020 – actual)"
              class="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500/30" />
            <input v-model="exp.role" type="text" placeholder="Cargo / Rol"
              class="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500/30" />
            <input v-model="exp.institution" type="text" placeholder="Institución"
              class="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500/30" />
          </div>
        </div>

        <!-- Education -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-bold text-slate-700 dark:text-slate-300">Formación académica</span>
            <button @click="addEducation" class="text-green-600 text-xs font-bold flex items-center space-x-1">
              <Plus class="w-3 h-3" /> <span>Agregar</span>
            </button>
          </div>
          <div v-for="(edu, i) in form.education" :key="i"
            class="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-3 mb-3 relative">
            <button v-if="form.education.length > 1" @click="removeEducation(i)"
              class="absolute top-3 right-3 text-red-400 hover:text-red-600">
              <Trash2 class="w-4 h-4" />
            </button>
            <input v-model="edu.degree" type="text" placeholder="Grado obtenido"
              class="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500/30" />
            <input v-model="edu.institution" type="text" placeholder="Institución"
              class="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500/30" />
            <input v-model="edu.year" type="text" placeholder="Año"
              class="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500/30" />
          </div>
        </div>

        <div class="flex space-x-3">
          <button @click="step = 2" class="flex-1 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-3.5 rounded-2xl font-semibold active:scale-95 transition-all">
            Atrás
          </button>
          <button @click="step = 4" :disabled="!isStep3Valid()"
            class="flex-1 bg-green-600 text-white py-3.5 rounded-2xl font-bold disabled:opacity-40 active:scale-95 transition-all">
            Continuar
          </button>
        </div>
      </div>

      <!-- STEP 4: Acreditaciones y Envío -->
      <div v-if="step === 4" class="space-y-5 animate-fade-in-up">
        <div>
          <h2 class="text-xl font-bold mb-1">Acreditaciones</h2>
          <p class="text-sm text-slate-500">Certificaciones y membresías profesionales.</p>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-bold text-slate-700 dark:text-slate-300">Certificaciones / Membresías</span>
            <button @click="addCertification" class="text-green-600 text-xs font-bold flex items-center space-x-1">
              <Plus class="w-3 h-3" /> <span>Agregar</span>
            </button>
          </div>
          <div v-for="(cert, i) in form.certifications" :key="i" class="flex items-center space-x-2 mb-2">
            <input v-model="form.certifications[i]" type="text" :placeholder="`Acreditación ${i + 1}`"
              class="flex-1 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500/30" />
            <button v-if="form.certifications.length > 1" @click="removeCertification(i)"
              class="p-2 text-red-400 hover:text-red-600">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Términos -->
        <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
          <label class="flex items-start space-x-3 cursor-pointer">
            <input type="checkbox" v-model="form.agreeTerms" class="mt-1 w-4 h-4 accent-green-600" />
            <span class="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              Declaro que la información proporcionada es verídica y que soy profesional habilitado. Entiendo que mi
              solicitud será revisada por el equipo de PsicoRapport antes de ser aprobada.
            </span>
          </label>
        </div>

        <div v-if="errorMsg" class="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl">
          <AlertCircle class="w-4 h-4 flex-shrink-0" />
          <span>{{ errorMsg }}</span>
        </div>

        <div class="flex space-x-3">
          <button @click="step = 3" class="flex-1 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-3.5 rounded-2xl font-semibold active:scale-95 transition-all">
            Atrás
          </button>
          <button @click="submitApplication" :disabled="isSubmitting"
            class="flex-1 bg-green-600 text-white py-3.5 rounded-2xl font-bold disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center space-x-2">
            <Send class="w-4 h-4" v-if="!isSubmitting" />
            <span>{{ isSubmitting ? 'Enviando...' : 'Enviar solicitud' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up { animation: fadeInUp 0.3s ease forwards; }
</style>
