<script setup>
import { Smartphone, Heart } from 'lucide-vue-next'
import { PET_EMOTION_LIST, PET_EMOTIONS, DEFAULT_PET_NAME } from '../pet'

const feliz = PET_EMOTIONS.feliz
</script>

<template>
  <div class="min-h-[100dvh] w-full relative overflow-hidden bg-[#f6f4ef] text-slate-900">
    <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div class="absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-emerald-200/50 blur-3xl" />
      <div class="absolute top-1/3 -right-20 w-[32rem] h-[32rem] rounded-full bg-amber-100/80 blur-3xl" />
      <div class="absolute bottom-0 left-1/3 w-[24rem] h-[24rem] rounded-full bg-sky-100/70 blur-3xl" />
    </div>

    <main class="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-8 py-16">
      <p class="text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-700/80 mb-6">
        PsicoRapport
      </p>

      <div class="relative mb-8">
        <img
          :src="feliz.src"
          :alt="DEFAULT_PET_NAME"
          class="w-56 h-56 object-cover rounded-[2rem] shadow-[0_24px_60px_rgba(16,185,129,0.22)]"
        />
        <span
          class="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-extrabold text-slate-800 shadow-sm border border-white"
        >
          {{ DEFAULT_PET_NAME }}
        </span>
      </div>

      <h1 class="text-4xl xl:text-5xl font-extrabold tracking-tight text-center leading-[1.1] max-w-xl">
        Usa un celular para abrir esta app
      </h1>
      <p class="mt-4 max-w-md text-center text-lg text-slate-600 leading-relaxed">
        PsicoRapport está pensada para el bolsillo: diario, chat con {{ DEFAULT_PET_NAME }}
        y tu espacio seguro se sienten mejor en el teléfono o en una tablet.
      </p>

      <div
        class="mt-8 flex items-center gap-3 bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm rounded-2xl px-5 py-3.5"
      >
        <span class="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
          <Smartphone class="w-5 h-5" />
        </span>
        <div class="text-left">
          <p class="text-sm font-extrabold text-slate-800">Ábrela en tu teléfono o tablet</p>
          <p class="text-sm text-slate-500">Misma cuenta, mismo {{ DEFAULT_PET_NAME }}.</p>
        </div>
      </div>

      <div class="mt-12 flex items-end gap-3">
        <img
          v-for="emotion in PET_EMOTION_LIST"
          :key="emotion.id"
          :src="emotion.src"
          :alt="emotion.label"
          class="w-14 h-14 object-cover rounded-2xl shadow-sm ring-2 ring-white"
          :class="emotion.id === 'feliz' ? 'scale-110' : 'opacity-90'"
        />
      </div>

      <p class="mt-8 flex items-center gap-1.5 text-sm text-slate-400">
        <Heart class="w-3.5 h-3.5 text-rose-400" />
        Tu espacio seguro para sanar
      </p>
    </main>
  </div>
</template>
