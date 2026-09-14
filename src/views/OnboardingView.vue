<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Check, ChevronRight, User, HeartHandshake, SmilePlus } from 'lucide-vue-next'
import { db } from '../firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth'
import { ensurePet, savePetCustomization, PET_COLORS, DEFAULT_PET_NAME } from '../pet'
import { STAGES } from '../transition'
import PetAvatar from '../components/PetAvatar.vue'

const router = useRouter()
const authStore = useAuthStore()
const step = ref(1)
const preferences = ref({
    age: '',
    reason: '',
    therapyStyle: ''
})
const petName = ref(DEFAULT_PET_NAME)
const petColor = ref('amber')

onMounted(async () => {
    const userId = authStore.user?.uid
    if (userId) {
        const prefDoc = await getDoc(doc(db, 'preferencias', userId))
        if (prefDoc.exists()) {
            router.push('/uwu')
        }
    }
})

const nextStep = async () => {
    if (step.value < 4) {
        step.value++
    } else {
        try {
            const userId = authStore.user.uid

            await setDoc(doc(db, 'preferencias', userId), {
                id_usuario: userId,
                edad: Number(preferences.value.age),
                motivo_consulta: preferences.value.reason,
                estilo_terapeuta: preferences.value.therapyStyle,
                fecha_registro: new Date()
            }, { merge: true })

            await ensurePet(userId, petName.value)
            await savePetCustomization(userId, {
                name: petName.value,
                color: petColor.value,
                accessory: 'none'
            })

            await setDoc(doc(db, 'users', userId), {
                transitionStage: STAGES.dependency,
                moodShareConsent: false
            }, { merge: true })

            await authStore.refreshPet()
            authStore.transitionStage = STAGES.dependency

            router.push('/uwu')
        } catch (e) {
            console.error("Error saving preferences: ", e)
        }
    }
}

const therapyStyles = [
    { id: 'directivo', label: 'Estructurado y práctico', icon: Check },
    { id: 'exploratorio', label: 'Profundo y reflexivo', icon: User },
    { id: 'empatico', label: 'Cálido y de contención', icon: HeartHandshake }
]

const colorOptions = PET_COLORS.map(c => ({ id: c.id, hex: c.hex }))
</script>

<template>
    <div dir="ltr" class="h-full flex flex-col p-6 flex-1 bg-sage-50 dark:bg-slate-950 relative text-slate-800 dark:text-slate-100">
        <div class="w-full flex space-x-2 mb-8 mt-4">
            <div v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full transition-colors duration-500"
                :class="i <= step ? 'bg-green-600' : 'bg-slate-200/80'"></div>
        </div>

        <!-- Step 1: Consent -->
        <div v-if="step === 1" class="flex-1 flex flex-col pt-4 animate-fade-in-up">
            <h2 class="font-display text-2xl mb-4">Antes de empezar</h2>
            <p class="text-slate-600 mb-6 leading-relaxed">
                Este es un espacio para tu salud mental. {{ DEFAULT_PET_NAME }} te acompaña,
                pero no reemplaza a un profesional.
            </p>
            <div class="card-soft p-4 mb-auto">
                <p class="text-sm text-slate-600 leading-relaxed">Tu privacidad importa. Lo que escribes queda entre tú y la app.</p>
            </div>
            <button @click="nextStep"
                class="btn-quiet mt-6 flex items-center justify-center space-x-2">
                <span>Acepto y entiendo</span>
                <ChevronRight class="w-5 h-5" />
            </button>
        </div>

        <!-- Step 2: Info -->
        <div v-if="step === 2" class="flex-1 flex flex-col pt-4 animate-fade-in-up">
            <h2 class="font-display text-2xl mb-2">Cuéntanos un poco de ti</h2>
            <p class="text-slate-500 text-sm mb-8">Esto ayuda a {{ DEFAULT_PET_NAME }} a conocerte mejor.</p>

            <div class="space-y-6 mb-auto">
                <label class="block">
                    <span class="text-slate-700 font-semibold mb-2 block">¿Cuál es tu edad?</span>
                    <input v-model="preferences.age" type="number" placeholder="Ej. 25"
                        class="w-full p-4 bg-white dark:bg-slate-900 dark:text-slate-100 border-0 rounded-2xl focus:ring-2 focus:ring-green-600/25 outline-none transition-all placeholder:text-slate-400" />
                </label>

                <label class="block">
                    <span class="text-slate-700 font-semibold mb-2 block">¿Cuál es tu principal motivo de
                        consulta?</span>
                    <textarea v-model="preferences.reason" rows="3" placeholder="Siento ansiedad por las noches..."
                        class="w-full p-4 bg-white dark:bg-slate-900 dark:text-slate-100 border-0 rounded-2xl focus:ring-2 focus:ring-green-600/25 outline-none transition-all placeholder:text-slate-400 resize-none"></textarea>
                </label>
            </div>

            <button :disabled="!preferences.age || !preferences.reason" @click="nextStep"
                class="btn-quiet mt-6">
                Continuar
            </button>
        </div>

        <!-- Step 3: Preferences -->
        <div v-if="step === 3" class="flex-1 flex flex-col pt-4 animate-fade-in-up">
            <h2 class="font-display text-2xl mb-2">¿Qué buscas en tu terapeuta?</h2>
            <p class="text-slate-500 text-sm mb-6">Elige el estilo con el que te sentirías más cómodo.</p>

            <div class="space-y-4 mb-auto">
                <button v-for="style in therapyStyles" :key="style.id" @click="preferences.therapyStyle = style.id"
                    class="w-full flex items-center p-5 rounded-xl border-2 transition-all"
                    :class="preferences.therapyStyle === style.id ? 'border-green-600/30 bg-green-50 dark:border-slate-600 dark:bg-slate-800' : 'border-transparent bg-white dark:bg-slate-900'">
                    <div :class="preferences.therapyStyle === style.id ? 'bg-green-700 dark:bg-slate-100 dark:text-slate-900 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'"
                        class="p-3 rounded-full mr-4 transition-colors">
                        <component :is="style.icon" class="w-5 h-5" />
                    </div>
                    <span class="font-medium text-lg text-slate-700">{{ style.label }}</span>
                </button>
            </div>

            <button :disabled="!preferences.therapyStyle" @click="nextStep"
                class="btn-quiet mt-6">
                Continuar
            </button>
        </div>

        <!-- Step 4: Pet / ODT Intro -->
        <div v-if="step === 4"
            class="flex-1 flex flex-col items-center text-center pt-4 animate-fade-in-up overflow-y-auto">
            <PetAvatar :name="petName" :color="petColor" mood-key="feliz" :mood-level="5" size="lg" show-name />
            <h2 class="font-display text-2xl mb-2 mt-4">Conoce a {{ petName || DEFAULT_PET_NAME }}</h2>
            <p class="text-slate-600 text-sm mb-4 max-w-[300px] leading-relaxed">
                Inspirado en Winnicott: tu mascota te sostiene al inicio (dependencia), te ayuda a ganar autonomía y luego te acerca a un terapeuta.
            </p>

            <label class="w-full text-left mb-3">
                <span class="text-sm font-semibold text-slate-700 mb-1.5 block">Ponle un nombre propio</span>
                <input v-model="petName" maxlength="24"
                    class="w-full p-3 bg-white dark:bg-slate-900 dark:text-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-green-600/25"
                    placeholder="Ej. Uwu, Andesito, Nube" />
            </label>

            <div class="w-full text-left mb-6">
                <span class="text-sm font-semibold text-slate-700 mb-2 block">Color</span>
                <div class="flex gap-2">
                    <button
                        v-for="c in colorOptions"
                        :key="c.id"
                        type="button"
                        @click="petColor = c.id"
                        class="w-10 h-10 rounded-full border-2"
                        :class="petColor === c.id ? 'border-slate-900 scale-110' : 'border-transparent'"
                        :style="{ backgroundColor: c.hex }"
                    />
                </div>
            </div>

            <button @click="nextStep"
                class="btn-quiet mt-auto flex items-center justify-center gap-2">
                <SmilePlus class="w-5 h-5" />
                Empezar con {{ petName || DEFAULT_PET_NAME }}
            </button>
        </div>

    </div>
</template>

<style scoped>
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(15px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in-up {
    animation: fadeInUp 0.4s ease forwards;
}
</style>
