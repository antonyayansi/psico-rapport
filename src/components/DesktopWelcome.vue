<script setup>
import { Smartphone } from 'lucide-vue-next'
import { PET_EMOTION_LIST, PET_EMOTIONS, DEFAULT_PET_NAME } from '../pet'

const feliz = PET_EMOTIONS.feliz
</script>

<template>
  <div class="min-h-[100dvh] w-full relative overflow-hidden bg-[#f4f6f2] text-ink">
    <main class="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-8 py-16">
      <p class="text-xs font-semibold uppercase tracking-[0.22em] text-green-700/70 mb-8">
        PsicoRapport
      </p>

      <img
        :src="feliz.src"
        :alt="DEFAULT_PET_NAME"
        class="w-48 h-48 object-cover rounded-[2rem] mb-8"
      />

      <h1 class="font-display text-4xl xl:text-[2.75rem] text-center leading-[1.12] max-w-xl">
        Usa un celular para abrir esta app
      </h1>
      <p class="mt-4 max-w-md text-center text-lg text-slate-500 leading-relaxed">
        El espacio de {{ DEFAULT_PET_NAME }} está pensado para el teléfono o una tablet.
      </p>

      <div
        class="mt-10 flex items-center gap-3 bg-white/80 rounded-full px-5 py-3"
      >
        <Smartphone class="w-4 h-4 text-green-700" />
        <p class="text-sm text-slate-600">Ábrela en tu teléfono o tablet</p>
      </div>

      <div class="mt-12 flex items-center gap-2">
        <img
          v-for="emotion in PET_EMOTION_LIST"
          :key="emotion.id"
          :src="emotion.src"
          :alt="emotion.label"
          class="w-12 h-12 object-cover rounded-2xl opacity-90"
        />
      </div>
    </main>
  </div>
</template>
