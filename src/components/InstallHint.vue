<script setup>
import { Download } from 'lucide-vue-next'
import { useInstallPrompt } from '../composables/useInstallPrompt'

const { canInstall, showIosHint, install } = useInstallPrompt()
</script>

<template>
  <div v-if="canInstall || showIosHint" class="w-full text-center">
    <button
      v-if="canInstall"
      type="button"
      class="w-full py-3.5 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900 active:scale-[0.98] transition-transform"
      @click="install"
    >
      <span class="inline-flex items-center justify-center gap-2">
        <Download class="w-4 h-4" />
        Instalar en este dispositivo
      </span>
    </button>
    <p v-else class="text-xs text-slate-400 leading-relaxed px-4">
      En Safari: toca Compartir y luego Añadir a pantalla de inicio.
    </p>
  </div>
</template>
