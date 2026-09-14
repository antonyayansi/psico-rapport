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
  <div dir="ltr" class="h-full flex flex-col bg-sage-50 dark:bg-slate-950 text-ink overflow-hidden">
    <header class="flex-none px-6 pt-8 pb-4 text-center">
      <h1 class="font-display text-2xl mb-1">Consentimiento informado</h1>
      <p class="text-slate-500 dark:text-slate-400 text-sm">Léelo con calma. No hay prisa.</p>
    </header>

    <div class="flex-1 overflow-y-auto px-6 pb-6 space-y-6 text-sm" @scroll="onScroll">
      <div class="card-soft p-4 flex space-x-3">
        <Lock class="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
        <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
          Antes de comenzar, es necesario que leas y aceptes los siguientes términos. Esta información es fundamental
          para que puedas usar PsicoRapport de forma segura e informada.
        </p>
      </div>

      <section>
        <h2 class="font-semibold text-ink text-base mb-3 flex items-center space-x-2">
          <span class="w-6 h-6 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
          <span>¿Qué es PsicoRapport?</span>
        </h2>
        <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
          PsicoRapport es una plataforma digital de apoyo emocional y salud mental. Cuenta con
          <strong class="text-ink font-medium">Uwu</strong>, una mascota personalizable que actúa como
          <strong class="text-ink font-medium">Objeto Digital Transicional (ODT)</strong>,
          inspirado en la teoría de Donald Winnicott: te acompaña en la dependencia emocional inicial, fomenta tu
          independencia y facilita el puente hacia un terapeuta humano verificado.
        </p>
      </section>

      <section>
        <h2 class="font-semibold text-ink text-base mb-3 flex items-center space-x-2">
          <span class="w-6 h-6 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
          <span>Naturaleza del servicio</span>
        </h2>
        <div class="card-soft p-4 mb-3">
          <div class="flex items-start space-x-2">
            <AlertTriangle class="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p class="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              <strong class="text-ink font-medium">Importante:</strong> PsicoRapport no es un terapeuta, psicólogo ni profesional de salud mental.
              Las conversaciones con Uwu <strong class="text-ink font-medium">no reemplazan</strong> la atención psicológica o psiquiátrica profesional.
            </p>
          </div>
        </div>
        <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
          PsicoRapport tiene como objetivo ser un puente para conectarte con profesionales de la salud mental. Si
          presentas una crisis de salud mental, deberás contactar a un profesional o servicio de emergencias de
          inmediato.
        </p>
      </section>

      <section>
        <h2 class="font-semibold text-ink text-base mb-3 flex items-center space-x-2">
          <span class="w-6 h-6 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
          <span>Privacidad y confidencialidad</span>
        </h2>
        <ul class="space-y-2 text-slate-600 dark:text-slate-400">
          <li class="flex items-start space-x-2">
            <span class="text-slate-400 mt-0.5">•</span>
            <span>Tus conversaciones con Uwu se almacenan de forma encriptada y solo son accesibles por ti.</span>
          </li>
          <li class="flex items-start space-x-2">
            <span class="text-slate-400 mt-0.5">•</span>
            <span>Tus estados de ánimo son privados por defecto. Solo se comparten con tu terapeuta si das
              <strong class="text-ink font-medium">consentimiento explícito</strong> (en Logros o al elegir terapeuta). Puedes revocarlo cuando quieras.</span>
          </li>
          <li class="flex items-start space-x-2">
            <span class="text-slate-400 mt-0.5">•</span>
            <span>No compartimos tu información personal con terceros sin tu consentimiento expreso.</span>
          </li>
          <li class="flex items-start space-x-2">
            <span class="text-slate-400 mt-0.5">•</span>
            <span>Utilizamos modelos de inteligencia artificial de OpenAI para procesar tus mensajes. Sus políticas de privacidad aplican.</span>
          </li>
          <li class="flex items-start space-x-2">
            <span class="text-slate-400 mt-0.5">•</span>
            <span>Puedes eliminar tu historial de conversación en cualquier momento desde la aplicación.</span>
          </li>
        </ul>
      </section>

      <section>
        <h2 class="font-semibold text-ink text-base mb-3 flex items-center space-x-2">
          <span class="w-6 h-6 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 rounded-full flex items-center justify-center text-xs font-semibold">4</span>
          <span>Situaciones de crisis</span>
        </h2>
        <div class="card-soft p-4 space-y-3">
          <div class="flex items-start space-x-2">
            <Heart class="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p class="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Si en algún momento tienes pensamientos de hacerte daño o de suicidio, la aplicación te guiará
              a recursos de ayuda inmediata.
            </p>
          </div>
          <div class="rounded-xl bg-sage-50 dark:bg-slate-800 p-3 space-y-1 text-xs">
            <p class="font-medium text-ink">Líneas de crisis disponibles 24/7</p>
            <p class="text-slate-600 dark:text-slate-400">MINSA — Línea 113 (Perú)</p>
            <p class="text-slate-600 dark:text-slate-400">SISOL — 0800-1-5200 (gratuito)</p>
            <p class="text-slate-600 dark:text-slate-400">Emergencias — 105 o 911</p>
          </div>
        </div>
      </section>

      <section>
        <h2 class="font-semibold text-ink text-base mb-3 flex items-center space-x-2">
          <span class="w-6 h-6 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 rounded-full flex items-center justify-center text-xs font-semibold">5</span>
          <span>Uso del foro comunitario</span>
        </h2>
        <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
          El foro "El Refugio" es un espacio de apoyo mutuo. Las publicaciones son realizadas por terapeutas
          verificados. Los usuarios pueden interactuar mediante comentarios respetando las normas de convivencia
          de la comunidad. Se prohíbe contenido ofensivo, discriminatorio o que ponga en riesgo la seguridad
          de otros usuarios.
        </p>
      </section>

      <section>
        <h2 class="font-semibold text-ink text-base mb-3 flex items-center space-x-2">
          <span class="w-6 h-6 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 rounded-full flex items-center justify-center text-xs font-semibold">6</span>
          <span>Menores de edad</span>
        </h2>
        <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
          Si eres menor de 18 años, debes contar con la autorización de un padre, madre o tutor legal para
          utilizar esta aplicación. Al aceptar este consentimiento, declaras tener 18 años o más, o contar con
          dicha autorización.
        </p>
      </section>

      <section>
        <h2 class="font-semibold text-ink text-base mb-3 flex items-center space-x-2">
          <span class="w-6 h-6 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 rounded-full flex items-center justify-center text-xs font-semibold">7</span>
          <span>Revocación del consentimiento</span>
        </h2>
        <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
          Puedes revocar este consentimiento y solicitar la eliminación de tus datos contactando a nuestro equipo.
          La revocación no afecta los tratamientos previos realizados con tu consentimiento. Para ejercer tus
          derechos ARCO, contáctanos en: <strong class="text-ink font-medium">soporte@psicorapport.app</strong>
        </p>
      </section>

      <div v-if="!scrolled" class="flex justify-center py-2 text-slate-400 text-xs items-center space-x-1">
        <ChevronDown class="w-4 h-4" />
        <span>Desplázate para leer todo</span>
      </div>

      <div class="space-y-4 pt-2">
        <h3 class="font-semibold text-ink">Para continuar, confirma que:</h3>

        <label class="flex items-start space-x-3 cursor-pointer group">
          <div class="mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors"
            :class="checks.understand ? 'bg-zinc-900 border-zinc-900 dark:bg-zinc-100 dark:border-zinc-100' : 'border-slate-300 dark:border-zinc-600'">
            <CheckCircle2 v-if="checks.understand" class="w-4 h-4 text-white dark:text-zinc-900" />
          </div>
          <input type="checkbox" v-model="checks.understand" class="hidden" />
          <span class="text-slate-600 dark:text-slate-300 text-sm leading-snug">He leído y comprendido el presente Consentimiento Informado.</span>
        </label>

        <label class="flex items-start space-x-3 cursor-pointer group">
          <div class="mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors"
            :class="checks.notTherapy ? 'bg-zinc-900 border-zinc-900 dark:bg-zinc-100 dark:border-zinc-100' : 'border-slate-300 dark:border-zinc-600'">
            <CheckCircle2 v-if="checks.notTherapy" class="w-4 h-4 text-white dark:text-zinc-900" />
          </div>
          <input type="checkbox" v-model="checks.notTherapy" class="hidden" />
          <span class="text-slate-600 dark:text-slate-300 text-sm leading-snug">Entiendo que PsicoRapport <strong class="text-ink font-medium">no reemplaza</strong> a un profesional de salud mental.</span>
        </label>

        <label class="flex items-start space-x-3 cursor-pointer group">
          <div class="mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors"
            :class="checks.dataPrivacy ? 'bg-zinc-900 border-zinc-900 dark:bg-zinc-100 dark:border-zinc-100' : 'border-slate-300 dark:border-zinc-600'">
            <CheckCircle2 v-if="checks.dataPrivacy" class="w-4 h-4 text-white dark:text-zinc-900" />
          </div>
          <input type="checkbox" v-model="checks.dataPrivacy" class="hidden" />
          <span class="text-slate-600 dark:text-slate-300 text-sm leading-snug">Acepto el tratamiento de mis datos personales conforme a la política de privacidad.</span>
        </label>

        <label class="flex items-start space-x-3 cursor-pointer group">
          <div class="mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors"
            :class="checks.crisisAware ? 'bg-zinc-900 border-zinc-900 dark:bg-zinc-100 dark:border-zinc-100' : 'border-slate-300 dark:border-zinc-600'">
            <CheckCircle2 v-if="checks.crisisAware" class="w-4 h-4 text-white dark:text-zinc-900" />
          </div>
          <input type="checkbox" v-model="checks.crisisAware" class="hidden" />
          <span class="text-slate-600 dark:text-slate-300 text-sm leading-snug">En caso de crisis, contactaré a los servicios de emergencia o líneas de ayuda disponibles.</span>
        </label>
      </div>

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
