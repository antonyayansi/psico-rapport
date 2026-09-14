<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth'
import { ChevronDown, CheckCircle2, AlertTriangle, Heart, Lock } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const checks = ref({
  understand: false,
  notTherapy: false,
  dataPrivacy: false,
  crisisAware: false
})

const scrolled = ref(false)
const isLoading = ref(false)

const allChecked = () => Object.values(checks.value).every(v => v)

const onScroll = (e) => {
  const el = e.target
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
    scrolled.value = true
  }
}

const handleAccept = async () => {
  if (!allChecked()) return
  isLoading.value = true
  try {
    await authStore.acceptConsent()
    // Verificar si ya completó onboarding
    const prefDoc = await getDoc(doc(db, 'preferencias', authStore.user.uid))
    if (prefDoc.exists()) {
      router.replace('/uwu')
    } else {
      router.replace('/onboarding')
    }
  } catch (e) {
    console.error('Error aceptando consentimiento:', e)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div dir="ltr" class="h-full flex flex-col bg-sage-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden">
    <!-- Header -->
    <div class="flex-none bg-green-700 dark:bg-slate-900 text-white px-6 py-8 text-center">
      <h1 class="font-display text-2xl mb-1">Consentimiento informado</h1>
      <p class="text-green-100/90 dark:text-slate-400 text-sm">Léelo con calma. No hay prisa.</p>
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto p-6 space-y-6 text-sm" @scroll="onScroll">
      <!-- Intro -->
      <div class="bg-blue-50 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 rounded-2xl p-4 flex space-x-3">
        <Lock class="w-5 h-5 text-blue-600 dark:text-slate-400 flex-shrink-0 mt-0.5" />
        <p class="text-blue-800 dark:text-slate-300 leading-relaxed">
          Antes de comenzar, es necesario que leas y aceptes los siguientes términos. Esta información es fundamental
          para que puedas usar PsicoRapport de forma segura e informada.
        </p>
      </div>

      <!-- Section 1 -->
      <section>
        <h2 class="font-bold text-slate-900 text-base mb-3 flex items-center space-x-2">
          <span class="w-6 h-6 bg-green-100 dark:bg-slate-800 text-green-700 dark:text-slate-200 rounded-full flex items-center justify-center text-xs font-bold">1</span>
          <span>¿Qué es PsicoRapport?</span>
        </h2>
        <p class="text-slate-600 leading-relaxed">
          PsicoRapport es una plataforma digital de apoyo emocional y salud mental. Cuenta con
          <strong class="text-slate-800">Uwu</strong>, una mascota personalizable que actúa como
          <strong class="text-slate-800">Objeto Digital Transicional (ODT)</strong>,
          inspirado en la teoría de Donald Winnicott: te acompaña en la dependencia emocional inicial, fomenta tu
          independencia y facilita el puente hacia un terapeuta humano verificado.
        </p>
      </section>

      <!-- Section 2 -->
      <section>
        <h2 class="font-bold text-slate-900 text-base mb-3 flex items-center space-x-2">
          <span class="w-6 h-6 bg-green-100 dark:bg-slate-800 text-green-700 dark:text-slate-200 rounded-full flex items-center justify-center text-xs font-bold">2</span>
          <span>Naturaleza del servicio</span>
        </h2>
        <div class="bg-amber-50 dark:bg-slate-900 border border-amber-200 dark:border-slate-800 rounded-xl p-4 mb-3">
          <div class="flex items-start space-x-2">
            <AlertTriangle class="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p class="text-amber-800 text-xs leading-relaxed">
              <strong>IMPORTANTE:</strong> PsicoRapport NO es un terapeuta, psicólogo ni profesional de salud mental.
              Las conversaciones con Uwu <strong>no reemplazan</strong> la atención psicológica o psiquiátrica profesional.
            </p>
          </div>
        </div>
        <p class="text-slate-600 leading-relaxed">
          PsicoRapport tiene como objetivo ser un puente para conectarte con profesionales de la salud mental. Si
          presentas una crisis de salud mental, deberás contactar a un profesional o servicio de emergencias de
          inmediato.
        </p>
      </section>

      <!-- Section 3 -->
      <section>
        <h2 class="font-bold text-slate-900 text-base mb-3 flex items-center space-x-2">
          <span class="w-6 h-6 bg-green-100 dark:bg-slate-800 text-green-700 dark:text-slate-200 rounded-full flex items-center justify-center text-xs font-bold">3</span>
          <span>Privacidad y confidencialidad</span>
        </h2>
        <ul class="space-y-2 text-slate-600">
          <li class="flex items-start space-x-2">
            <span class="text-green-500 font-bold mt-0.5">•</span>
            <span>Tus conversaciones con Uwu se almacenan de forma encriptada y solo son accesibles por ti.</span>
          </li>
          <li class="flex items-start space-x-2">
            <span class="text-green-500 font-bold mt-0.5">•</span>
            <span>Tus estados de ánimo son privados por defecto. Solo se comparten con tu terapeuta si das
              <strong class="text-slate-800">consentimiento explícito</strong> (en Logros o al elegir terapeuta). Puedes revocarlo cuando quieras.</span>
          </li>
          <li class="flex items-start space-x-2">
            <span class="text-green-500 font-bold mt-0.5">•</span>
            <span>No compartimos tu información personal con terceros sin tu consentimiento expreso.</span>
          </li>
          <li class="flex items-start space-x-2">
            <span class="text-green-500 font-bold mt-0.5">•</span>
            <span>Utilizamos modelos de inteligencia artificial de OpenAI para procesar tus mensajes. Sus políticas de privacidad aplican.</span>
          </li>
          <li class="flex items-start space-x-2">
            <span class="text-green-500 font-bold mt-0.5">•</span>
            <span>Puedes eliminar tu historial de conversación en cualquier momento desde la aplicación.</span>
          </li>
        </ul>
      </section>

      <!-- Section 4 -->
      <section>
        <h2 class="font-bold text-slate-900 text-base mb-3 flex items-center space-x-2">
          <span class="w-6 h-6 bg-green-100 dark:bg-slate-800 text-green-700 dark:text-slate-200 rounded-full flex items-center justify-center text-xs font-bold">4</span>
          <span>Situaciones de crisis</span>
        </h2>
        <div class="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
          <div class="flex items-start space-x-2">
            <Heart class="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p class="text-red-800 text-xs leading-relaxed">
              Si en algún momento tienes pensamientos de hacerte daño o de suicidio, la aplicación te guiará
              a recursos de ayuda inmediata.
            </p>
          </div>
          <div class="bg-white dark:bg-slate-900 rounded-xl p-3 space-y-1 text-xs">
            <p class="font-bold text-slate-800">🆘 Líneas de crisis disponibles 24/7:</p>
            <p class="text-slate-600">• MINSA — Línea 113 (Perú)</p>
            <p class="text-slate-600">• SISOL — 0800-1-5200 (gratuito)</p>
            <p class="text-slate-600">• Emergencias — 105 o 911</p>
          </div>
        </div>
      </section>

      <!-- Section 5 -->
      <section>
        <h2 class="font-bold text-slate-900 text-base mb-3 flex items-center space-x-2">
          <span class="w-6 h-6 bg-green-100 dark:bg-slate-800 text-green-700 dark:text-slate-200 rounded-full flex items-center justify-center text-xs font-bold">5</span>
          <span>Uso del foro comunitario</span>
        </h2>
        <p class="text-slate-600 leading-relaxed">
          El foro "El Refugio" es un espacio de apoyo mutuo. Las publicaciones son realizadas por terapeutas
          verificados. Los usuarios pueden interactuar mediante comentarios respetando las normas de convivencia
          de la comunidad. Se prohíbe contenido ofensivo, discriminatorio o que ponga en riesgo la seguridad
          de otros usuarios.
        </p>
      </section>

      <!-- Section 6 -->
      <section>
        <h2 class="font-bold text-slate-900 text-base mb-3 flex items-center space-x-2">
          <span class="w-6 h-6 bg-green-100 dark:bg-slate-800 text-green-700 dark:text-slate-200 rounded-full flex items-center justify-center text-xs font-bold">6</span>
          <span>Menores de edad</span>
        </h2>
        <p class="text-slate-600 leading-relaxed">
          Si eres menor de 18 años, debes contar con la autorización de un padre, madre o tutor legal para
          utilizar esta aplicación. Al aceptar este consentimiento, declaras tener 18 años o más, o contar con
          dicha autorización.
        </p>
      </section>

      <!-- Section 7 -->
      <section>
        <h2 class="font-bold text-slate-900 text-base mb-3 flex items-center space-x-2">
          <span class="w-6 h-6 bg-green-100 dark:bg-slate-800 text-green-700 dark:text-slate-200 rounded-full flex items-center justify-center text-xs font-bold">7</span>
          <span>Revocación del consentimiento</span>
        </h2>
        <p class="text-slate-600 leading-relaxed">
          Puedes revocar este consentimiento y solicitar la eliminación de tus datos contactando a nuestro equipo.
          La revocación no afecta los tratamientos previos realizados con tu consentimiento. Para ejercer tus
          derechos ARCO, contáctanos en: <strong class="text-slate-800">soporte@psicorapport.app</strong>
        </p>
      </section>

      <!-- Scroll indicator -->
      <div v-if="!scrolled" class="flex justify-center py-2 text-slate-400 text-xs flex items-center space-x-1 animate-bounce">
        <ChevronDown class="w-4 h-4" />
        <span>Desplázate para leer todo</span>
      </div>

      <!-- Checkboxes -->
      <div class="space-y-4 pt-2">
        <h3 class="font-bold text-slate-900 dark:text-slate-100">Para continuar, confirma que:</h3>

        <label class="flex items-start space-x-3 cursor-pointer group">
          <div class="mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors"
            :class="checks.understand ? 'bg-green-600 border-green-600 dark:bg-slate-100 dark:border-slate-100' : 'border-slate-300 dark:border-slate-600 group-hover:border-green-400'">
            <CheckCircle2 v-if="checks.understand" class="w-4 h-4 text-white dark:text-slate-900" />
          </div>
          <input type="checkbox" v-model="checks.understand" class="hidden" />
          <span class="text-slate-700 dark:text-slate-300 text-sm leading-snug">He leído y comprendido el presente Consentimiento Informado.</span>
        </label>

        <label class="flex items-start space-x-3 cursor-pointer group">
          <div class="mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors"
            :class="checks.notTherapy ? 'bg-green-600 border-green-600 dark:bg-slate-100 dark:border-slate-100' : 'border-slate-300 dark:border-slate-600 group-hover:border-green-400'">
            <CheckCircle2 v-if="checks.notTherapy" class="w-4 h-4 text-white dark:text-slate-900" />
          </div>
          <input type="checkbox" v-model="checks.notTherapy" class="hidden" />
          <span class="text-slate-700 dark:text-slate-300 text-sm leading-snug">Entiendo que PsicoRapport <strong>no reemplaza</strong> a un profesional de salud mental.</span>
        </label>

        <label class="flex items-start space-x-3 cursor-pointer group">
          <div class="mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors"
            :class="checks.dataPrivacy ? 'bg-green-600 border-green-600 dark:bg-slate-100 dark:border-slate-100' : 'border-slate-300 dark:border-slate-600 group-hover:border-green-400'">
            <CheckCircle2 v-if="checks.dataPrivacy" class="w-4 h-4 text-white dark:text-slate-900" />
          </div>
          <input type="checkbox" v-model="checks.dataPrivacy" class="hidden" />
          <span class="text-slate-700 dark:text-slate-300 text-sm leading-snug">Acepto el tratamiento de mis datos personales conforme a la política de privacidad.</span>
        </label>

        <label class="flex items-start space-x-3 cursor-pointer group">
          <div class="mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors"
            :class="checks.crisisAware ? 'bg-green-600 border-green-600 dark:bg-slate-100 dark:border-slate-100' : 'border-slate-300 dark:border-slate-600 group-hover:border-green-400'">
            <CheckCircle2 v-if="checks.crisisAware" class="w-4 h-4 text-white dark:text-slate-900" />
          </div>
          <input type="checkbox" v-model="checks.crisisAware" class="hidden" />
          <span class="text-slate-700 dark:text-slate-300 text-sm leading-snug">En caso de crisis, contactaré a los servicios de emergencia o líneas de ayuda disponibles.</span>
        </label>
      </div>

      <!-- Accept Button -->
      <button @click="handleAccept" :disabled="!allChecked() || isLoading"
        class="btn-quiet">
        <span v-if="isLoading">Un momento…</span>
        <span v-else>Acepto y quiero comenzar</span>
      </button>

      <p class="text-center text-xs text-slate-400 pb-4">
        Fecha de este consentimiento: {{ new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) }}
      </p>
    </div>
  </div>
</template>
