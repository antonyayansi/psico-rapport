<script setup>
import { useRouter } from 'vue-router'
import { DEFAULT_PET_NAME } from '../pet'
import InstallHint from '../components/InstallHint.vue'

const router = useRouter()
</script>

<template>
    <div dir="ltr"
        class="h-full flex flex-col items-center justify-between bg-sage-50 dark:bg-slate-950 p-8 flex-1 text-ink relative">
        <div class="flex-1 flex flex-col items-center justify-center z-10">
            <img
                src="/emociones/calma.png"
                :alt="DEFAULT_PET_NAME"
                class="w-44 h-44 object-cover rounded-[2.2rem] mb-8"
            />
            <p class="text-xs tracking-[0.2em] uppercase text-green-700/70 dark:text-slate-400 font-semibold mb-3">PsicoRapport</p>
            <h1 class="font-display text-[2.15rem] text-center leading-[1.15] max-w-[14ch]">
                Respira.<br />Este es un espacio seguro.
            </h1>
            <p class="text-slate-500 text-base text-center mt-4 max-w-[28ch] leading-relaxed">
                {{ DEFAULT_PET_NAME }} te acompaña a registrar cómo te sientes, sin prisa y sin juicio.
            </p>
        </div>

        <div class="w-full z-10 pb-4 space-y-3">
            <button @click="router.push('/login')"
                class="w-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 py-4 rounded-full font-semibold text-base active:scale-[0.98] transition-transform">
                Empezar
            </button>
            <InstallHint />
        </div>
    </div>
</template>
