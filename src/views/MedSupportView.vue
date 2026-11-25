<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft, ClipboardList, Moon, BedDouble, Compass, HeartPulse, Users, Phone
} from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { MED_MOMENTS, USER_CONTEXTS } from '../medSupport'

const router = useRouter()
const authStore = useAuthStore()

const icons = { ClipboardList, Moon, BedDouble, Compass, HeartPulse, Users }

const contextLabel = computed(() => {
  const id = authStore.contextoRol
  return USER_CONTEXTS.find((c) => c.id === id)?.label || null
})

const openMoment = (moment) => {
  router.push({ path: '/uwu', query: { moment: moment.id } })
}
</script>

<template>
  <div class="h-full flex flex-col bg-sage-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
    <header class="flex items-center gap-2 px-4 pt-5 pb-3 border-b border-slate-200/60 dark:border-slate-800">
      <button type="button" class="p-2 -ml-1 rounded-full text-slate-500" @click="router.back()">
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div>
        <h1 class="font-display text-xl leading-tight">Momentos difíciles</h1>
        <p class="text-xs text-slate-500">Acompañamiento breve. No reemplaza terapia</p>
      </div>
    </header>

    <div class="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-28">
      <section class="card-soft p-4">
        <p class="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Para cuando el día pesa: estrés, sueño, dudas o algo que te afectó.
          Elige un momento; {{ authStore.pet?.name || 'tu compañero' }} te acompaña con pasos cortos.
        </p>
        <p v-if="contextLabel" class="mt-2 text-xs font-medium text-green-700 dark:text-green-400">
          Contexto: {{ contextLabel }}<span v-if="authStore.anioEstudio"> · {{ authStore.anioEstudio }}</span>
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wide px-1">¿Qué te pesa ahora?</h2>
        <button
          v-for="moment in MED_MOMENTS"
          :key="moment.id"
          type="button"
          class="w-full text-left card-soft p-4 active:scale-[0.99] transition-transform"
          @click="openMoment(moment)"
        >
          <div class="flex gap-3">
            <div class="w-10 h-10 rounded-xl bg-green-50 dark:bg-slate-800 flex items-center justify-center text-green-700 dark:text-green-400 flex-shrink-0">
              <component :is="icons[moment.icon] || ClipboardList" class="w-5 h-5" />
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-ink">{{ moment.title }}</p>
              <p class="text-xs text-slate-500 mt-0.5">{{ moment.subtitle }}</p>
              <ul class="mt-2 space-y-1">
                <li
                  v-for="(tip, idx) in moment.guide.slice(0, 2)"
                  :key="idx"
                  class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed"
                >
                  · {{ tip }}
                </li>
              </ul>
            </div>
          </div>
        </button>
      </section>

      <section class="card-soft p-4">
        <div class="flex items-start gap-3">
          <Phone class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p class="font-semibold text-sm">Si estás en crisis</p>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">
              PsicoRapport no es emergencia. En Perú puedes llamar a la línea <strong>113</strong>.
              También puedes hablar con un terapeuta verificado en la app.
            </p>
            <div class="flex flex-wrap gap-2 mt-3">
              <a href="tel:113" class="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300">
                Llamar 113
              </a>
              <button
                type="button"
                class="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800"
                @click="router.push('/matching')"
              >
                Ver terapeutas
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
