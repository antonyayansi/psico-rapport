<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Wind, PhoneCall } from 'lucide-vue-next'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth'
import { processUserAction } from '../gamification'
import { updatePetMood, PET_EMOTION_LIST, DEFAULT_PET_NAME, PET_EMOTIONS, resolveEmotion } from '../pet'

const router = useRouter()
const authStore = useAuthStore()
const mood = ref('')
const savedMood = ref(false)
const selectedEmotion = computed(() => PET_EMOTIONS[mood.value] || null)
const previewFace = computed(() => resolveEmotion({
    moodKey: mood.value || authStore.pet?.moodKey,
    moodLevel: authStore.pet?.moodLevel
}))

const privacyNote = computed(() => {
    if (authStore.moodShareConsent && authStore.chosenTherapistId) {
        return `Visible para tu terapeuta, porque así lo autorizaste.`
    }
    if (authStore.moodShareConsent) {
        return 'Se compartirá cuando elijas terapeuta. Mientras, solo tú lo ves.'
    }
    return 'Solo tú ves este registro.'
})

const saveMood = async () => {
    if (!selectedEmotion.value) return
    try {
        const userId = authStore.user.uid
        const emotion = selectedEmotion.value
        await addDoc(collection(db, 'estados_animo'), {
            id_usuario: userId,
            nivel_animo: emotion.level,
            emocion: emotion.id,
            fecha: serverTimestamp(),
            sharedWithTherapist: authStore.moodShareConsent === true,
            therapistId: authStore.moodShareConsent ? (authStore.chosenTherapistId || null) : null
        })

        await updatePetMood(userId, emotion.id)
        await processUserAction(userId, 'mood')
        await authStore.loadUserProfile(userId)

        savedMood.value = true
        setTimeout(() => {
            savedMood.value = false
            mood.value = ''
        }, 3000)
    } catch (error) {
        console.error("Error al guardar estado de ánimo:", error)
        alert("Hubo un error al guardar tu ánimo.")
    }
}

const showCrisisAlert = ref(false)
</script>

<template>
    <div dir="ltr" class="h-full flex flex-col bg-sage-50 dark:bg-slate-950 relative flex-1 text-slate-800 dark:text-slate-100">
        <header
            class="flex items-center justify-between px-5 pt-5 pb-2 bg-transparent">
            <button @click="router.back()" class="p-2 -ml-2 rounded-full text-slate-500 active:bg-white/70 dark:active:bg-slate-800">
                <ArrowLeft class="w-5 h-5" />
            </button>
            <button @click="showCrisisAlert = true"
                class="text-sm text-slate-500 px-3 py-1.5 rounded-full hover:bg-white/70 dark:hover:bg-slate-800">
                Ayuda
            </button>
        </header>

        <div class="px-6 overflow-y-auto pb-10 flex-1">
            <div class="flex flex-col items-center text-center pt-2 pb-2">
                <img
                    :src="previewFace.src"
                    :alt="authStore.pet?.name || DEFAULT_PET_NAME"
                    class="w-40 h-40 object-cover rounded-[2rem] mb-6"
                />
                <p class="text-xs tracking-[0.16em] uppercase text-green-700/70 dark:text-slate-400 font-semibold mb-2">
                    {{ authStore.pet?.name || DEFAULT_PET_NAME }}
                </p>
                <h1 class="font-display text-[1.85rem] text-ink max-w-[16ch] leading-tight">
                    ¿Cómo te sientes ahora?
                </h1>
                <p class="text-slate-500 text-sm mt-2 max-w-[28ch] leading-relaxed">
                    Elige lo que más se parece. No tiene que ser exacto.
                </p>
            </div>

            <div class="flex gap-3 overflow-x-auto py-4 px-1 -mx-1 snap-x">
                <button
                    v-for="emotion in PET_EMOTION_LIST"
                    :key="emotion.id"
                    type="button"
                    @click="mood = emotion.id"
                    class="snap-center flex-none flex flex-col items-center gap-2 min-w-[4.5rem] active:scale-95 transition-transform"
                >
                    <img
                        :src="emotion.src"
                        :alt="emotion.label"
                        class="w-[4.25rem] h-[4.25rem] object-cover rounded-[1.35rem] transition-all"
                        :class="mood === emotion.id
                            ? 'ring-2 ring-green-700/40 dark:ring-slate-400 scale-105'
                            : 'opacity-80'"
                    />
                    <span
                        class="text-[0.7rem] font-medium"
                        :class="mood === emotion.id ? 'text-green-800 dark:text-slate-100' : 'text-slate-400'"
                    >
                        {{ emotion.label }}
                    </span>
                </button>
            </div>

            <button
                :disabled="!mood || savedMood"
                @click="saveMood"
                class="btn-quiet mt-2"
            >
                {{ savedMood ? 'Quedó guardado' : 'Guardar en mi diario' }}
            </button>

            <p class="text-center text-xs text-slate-400 mt-3 leading-relaxed">
                {{ privacyNote }}
                <button @click="router.push('/stats')" class="underline underline-offset-2 ml-1">Privacidad</button>
            </p>

            <section class="mt-10">
                <p class="text-xs tracking-[0.14em] uppercase text-slate-400 mb-3">Si necesitas un respiro</p>
                <div class="card-soft p-5 flex items-center justify-between">
                    <div class="text-left pr-3">
                        <h3 class="font-display text-lg text-ink">Respiración 4-7-8</h3>
                        <p class="text-slate-500 text-sm mt-0.5">Un ejercicio corto para bajar la ansiedad.</p>
                    </div>
                    <div class="w-11 h-11 rounded-full bg-green-50 dark:bg-slate-800 text-green-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0">
                        <Wind class="w-5 h-5" />
                    </div>
                </div>
            </section>
        </div>

        <div v-if="showCrisisAlert"
            class="fixed inset-0 bg-slate-900/25 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
            <div class="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[1.75rem] p-6">
                <h2 class="font-display text-2xl text-center mb-2">Si estás en crisis</h2>
                <p class="text-center text-slate-600 dark:text-slate-300 mb-6 text-sm leading-relaxed">
                    Esto no reemplaza una emergencia. En Perú puedes llamar gratis, las 24 horas.
                </p>
                <a href="tel:113"
                    class="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
                    <div>
                        <span class="block font-semibold text-slate-800">Línea 113 · opción 5</span>
                        <span class="block text-xs text-slate-500 mt-0.5">Minsa · salud mental</span>
                    </div>
                    <PhoneCall class="w-5 h-5 text-green-700" />
                </a>
                <button @click="showCrisisAlert = false"
                    class="w-full text-slate-500 font-medium py-3 mt-3 rounded-xl">
                    Cerrar
                </button>
            </div>
        </div>
    </div>
</template>
