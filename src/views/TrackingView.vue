<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Frown, Meh, Smile, Wind, PhoneCall, AlertTriangle, Share2 } from 'lucide-vue-next'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth'
import { processUserAction } from '../gamification'
import { updatePetMood } from '../pet'
import PetAvatar from '../components/PetAvatar.vue'

const router = useRouter()
const authStore = useAuthStore()
const mood = ref(0)
const savedMood = ref(false)

const privacyNote = computed(() => {
    if (authStore.moodShareConsent && authStore.chosenTherapistId) {
        return `Compartido con tu terapeuta (${authStore.chosenTherapistName || 'elegido'}) por tu consentimiento.`
    }
    if (authStore.moodShareConsent) {
        return 'Consentimiento activo: se compartirá cuando elijas terapeuta. Mientras, solo tú lo ves.'
    }
    return 'Tu registro es privado. Puedes autorizar compartir con tu terapeuta en Logros.'
})

const saveMood = async () => {
    if (mood.value > 0) {
        try {
            const userId = authStore.user.uid
            await addDoc(collection(db, 'estados_animo'), {
                id_usuario: userId,
                nivel_animo: mood.value,
                fecha: serverTimestamp(),
                sharedWithTherapist: authStore.moodShareConsent === true,
                therapistId: authStore.moodShareConsent ? (authStore.chosenTherapistId || null) : null
            })

            await updatePetMood(userId, mood.value)
            await processUserAction(userId, 'mood')
            await authStore.loadUserProfile(userId)

            savedMood.value = true
            setTimeout(() => {
                savedMood.value = false
                mood.value = 0
            }, 3000)
        } catch (error) {
            console.error("Error al guardar estado de ánimo:", error)
            alert("Hubo un error al guardar tu ánimo.")
        }
    }
}

const showCrisisAlert = ref(false)
</script>

<template>
    <div dir="ltr" class="h-full flex flex-col bg-slate-50 dark:bg-slate-950 relative flex-1 text-slate-800 dark:text-slate-100">
        <header
            class="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between p-4 px-6 sticky top-0 z-10">
            <div class="flex items-center">
                <button @click="router.back()" class="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600">
                    <ArrowLeft class="w-6 h-6" />
                </button>
                <h1 class="font-bold text-xl ml-2 dark:text-slate-100">Mi Espacio</h1>
            </div>
            <button @click="showCrisisAlert = true"
                class="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-full font-bold text-sm tracking-wide hover:bg-red-100 transition-colors flex items-center space-x-1">
                <AlertTriangle class="w-4 h-4" />
                <span>SOS</span>
            </button>
        </header>

        <div class="p-6 overflow-y-auto space-y-8 pb-20">

            <!-- Mood Tracker -->
            <section
                class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                <div class="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full blur-2xl"></div>
                <div class="flex items-start justify-between gap-3 mb-4 relative z-10">
                    <div>
                        <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">¿Cómo te sientes hoy?</h2>
                        <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{{ privacyNote }}</p>
                    </div>
                    <PetAvatar
                        v-if="authStore.pet || mood"
                        :name="authStore.pet?.name || 'PsicoRapport'"
                        :color="authStore.pet?.color || 'amber'"
                        :accessory="authStore.pet?.accessory || 'none'"
                        :mood-level="mood || authStore.pet?.moodLevel || 0"
                        size="sm"
                        :animate="false"
                    />
                </div>

                <button
                    @click="router.push('/stats')"
                    class="relative z-10 mb-5 flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-400"
                >
                    <Share2 class="w-3.5 h-3.5" /> Gestionar consentimiento de ánimo
                </button>

                <div class="flex justify-between items-center mb-6 relative z-10">
                    <button @click="mood = 1"
                        :class="mood === 1 ? 'scale-110 bg-red-100 border-red-200' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 opacity-70 hover:opacity-100'"
                        class="p-3 rounded-2xl border-2 transition-all">
                        <Frown class="w-10 h-10 text-red-500" />
                        <span
                            class="block text-xs font-bold text-slate-500 dark:text-slate-400 mt-2 text-center">Difícil</span>
                    </button>

                    <button @click="mood = 3"
                        :class="mood === 3 ? 'scale-110 bg-amber-100 border-amber-200' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 opacity-70 hover:opacity-100'"
                        class="p-3 rounded-2xl border-2 transition-all">
                        <Meh class="w-10 h-10 text-amber-500" />
                        <span
                            class="block text-xs font-bold text-slate-500 dark:text-slate-400 mt-2 text-center">Regular</span>
                    </button>

                    <button @click="mood = 5"
                        :class="mood === 5 ? 'scale-110 bg-green-100 border-green-200' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 opacity-70 hover:opacity-100'"
                        class="p-3 rounded-2xl border-2 transition-all">
                        <Smile class="w-10 h-10 text-green-500" />
                        <span
                            class="block text-xs font-bold text-slate-500 dark:text-slate-400 mt-2 text-center">Bien</span>
                    </button>
                </div>

                <button :disabled="mood === 0 || savedMood" @click="saveMood"
                    class="w-full bg-slate-900 dark:bg-slate-100 dark:text-slate-900 disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white disabled:text-slate-400 dark:disabled:text-slate-500 py-3 rounded-xl font-bold transition-all disabled:cursor-not-allowed">
                    {{ savedMood ? '¡Guardado!' : 'Guardar en mi diario' }}
                </button>
            </section>

            <!-- Ejercicios Guiados -->
            <section>
                <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 px-1">Ejercicios Guiados</h2>
                <div class="grid grid-cols-1 gap-4">
                    <div
                        class="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 p-5 rounded-3xl flex items-center justify-between cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                        <div>
                            <h3 class="font-bold text-blue-900 dark:text-blue-200 text-lg mb-1">Respiración 4-7-8</h3>
                            <p class="text-blue-700/80 dark:text-blue-400 text-sm">Para reducir la ansiedad</p>
                        </div>
                        <div class="bg-white dark:bg-slate-800 p-3 rounded-2xl text-blue-500">
                            <Wind class="w-6 h-6" />
                        </div>
                    </div>

                    <!-- Se pueden agregar más pero con fines de prototipo esto basta -->
                </div>
            </section>

        </div>

        <!-- Crisis Modal Backdrop -->
        <div v-if="showCrisisAlert"
            class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
            <div class="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 animate-fade-in-up">
                <div
                    class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-50">
                    <AlertTriangle class="w-8 h-8 text-red-500" />
                </div>
                <h2 class="text-2xl font-bold text-center mb-2 dark:text-slate-100">Botón de Crisis</h2>
                <p class="text-center text-slate-600 dark:text-slate-300 mb-6 text-sm">Si sientes que estás en peligro o
                    necesitas apoyo inmediato, por favor contacta a un profesional en las siguientes líneas de ayuda
                    gratuita (Perú).</p>

                <div class="space-y-3 mb-6">
                    <a href="tel:113"
                        class="flex items-center justify-between bg-red-50 p-4 rounded-xl border border-red-100 hover:bg-red-100 transition-colors">
                        <div>
                            <span class="block font-bold text-red-900">Línea 113 - Opción 5</span>
                            <span class="block text-xs text-red-700">Minsa - Salud Mental (24hrs)</span>
                        </div>
                        <PhoneCall class="w-5 h-5 text-red-500" />
                    </a>
                </div>

                <button @click="showCrisisAlert = false"
                    class="w-full text-slate-500 dark:text-slate-400 font-bold py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    Cerrar
                </button>
            </div>
        </div>

    </div>
</template>

<style scoped>
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in-up {
    animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
