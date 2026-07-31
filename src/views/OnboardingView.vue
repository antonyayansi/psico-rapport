<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Check, ChevronRight, User, HeartHandshake, SmilePlus } from 'lucide-vue-next'
import { db } from '../firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth'
import { ensurePet, savePetCustomization } from '../pet'
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
const petName = ref('PsicoRapport')
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

const colorOptions = [
    { id: 'amber', hex: '#f59e0b' },
    { id: 'green', hex: '#10b981' },
    { id: 'sky', hex: '#0ea5e9' },
    { id: 'rose', hex: '#f43f5e' }
]
</script>

<template>
    <div dir="ltr" class="h-full flex flex-col p-6 flex-1 bg-white relative text-slate-800">
        <div class="w-full flex space-x-2 mb-8 mt-4">
            <div v-for="i in 4" :key="i" class="h-1.5 flex-1 rounded-full transition-colors duration-500"
                :class="i <= step ? 'bg-green-500' : 'bg-slate-100'"></div>
        </div>

        <!-- Step 1: Consent -->
        <div v-if="step === 1" class="flex-1 flex flex-col pt-4 animate-fade-in-up">
            <h2 class="text-2xl font-bold mb-4">Antes de empezar</h2>
            <p class="text-slate-600 mb-6 leading-relaxed">
                PsicoRapport es un espacio seguro para tu salud mental. Nuestro compañero virtual "PsicoRapport" te guiará en
                este proceso, pero no reemplaza a la terapia profesional.
            </p>
            <div class="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-auto">
                <p class="text-sm text-blue-800 font-medium">🛡️ Tu privacidad es nuestra prioridad. Todos tus datos
                    están encriptados y son confidenciales.</p>
            </div>
            <button @click="nextStep"
                class="w-full mt-6 bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 active:scale-95 transition-all text-lg flex items-center justify-center space-x-2">
                <span>Acepto y entiendo</span>
                <ChevronRight class="w-5 h-5" />
            </button>
        </div>

        <!-- Step 2: Info -->
        <div v-if="step === 2" class="flex-1 flex flex-col pt-4 animate-fade-in-up">
            <h2 class="text-2xl font-bold mb-2">Cuéntanos un poco de ti</h2>
            <p class="text-slate-500 text-sm mb-8">Esto ayudará a PsicoRapport a conocerte mejor.</p>

            <div class="space-y-6 mb-auto">
                <label class="block">
                    <span class="text-slate-700 font-semibold mb-2 block">¿Cuál es tu edad?</span>
                    <input v-model="preferences.age" type="number" placeholder="Ej. 25"
                        class="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400" />
                </label>

                <label class="block">
                    <span class="text-slate-700 font-semibold mb-2 block">¿Cuál es tu principal motivo de
                        consulta?</span>
                    <textarea v-model="preferences.reason" rows="3" placeholder="Siento ansiedad por las noches..."
                        class="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 resize-none"></textarea>
                </label>
            </div>

            <button :disabled="!preferences.age || !preferences.reason" @click="nextStep"
                class="w-full mt-6 bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold hover:bg-green-700 active:scale-95 transition-all text-lg">
                Continuar
            </button>
        </div>

        <!-- Step 3: Preferences -->
        <div v-if="step === 3" class="flex-1 flex flex-col pt-4 animate-fade-in-up">
            <h2 class="text-2xl font-bold mb-2">¿Qué buscas en tu terapeuta?</h2>
            <p class="text-slate-500 text-sm mb-6">Selecciona el estilo con el que te sentirías más cómodo.</p>

            <div class="space-y-4 mb-auto">
                <button v-for="style in therapyStyles" :key="style.id" @click="preferences.therapyStyle = style.id"
                    class="w-full flex items-center p-5 rounded-xl border-2 transition-all"
                    :class="preferences.therapyStyle === style.id ? 'border-green-500 bg-green-50' : 'border-slate-100 bg-white hover:border-green-200'">
                    <div :class="preferences.therapyStyle === style.id ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'"
                        class="p-3 rounded-full mr-4 transition-colors">
                        <component :is="style.icon" class="w-5 h-5" />
                    </div>
                    <span class="font-medium text-lg text-slate-700">{{ style.label }}</span>
                </button>
            </div>

            <button :disabled="!preferences.therapyStyle" @click="nextStep"
                class="w-full mt-6 bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold hover:bg-green-700 active:scale-95 transition-all text-lg">
                Continuar
            </button>
        </div>

        <!-- Step 4: Pet / ODT Intro -->
        <div v-if="step === 4"
            class="flex-1 flex flex-col items-center text-center pt-4 animate-fade-in-up overflow-y-auto">
            <PetAvatar :name="petName" :color="petColor" :mood-level="5" size="lg" />
            <h2 class="text-2xl font-extrabold mb-2 mt-4">Tu objeto de transición</h2>
            <p class="text-slate-600 text-sm mb-4 max-w-[300px] leading-relaxed">
                Inspirado en Winnicott: tu mascota te sostiene al inicio (dependencia), te ayuda a ganar autonomía y luego te acerca a un terapeuta.
            </p>

            <label class="w-full text-left mb-3">
                <span class="text-sm font-semibold text-slate-700 mb-1.5 block">Nómbrala</span>
                <input v-model="petName" maxlength="24"
                    class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ej. Andesito" />
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
                class="w-full mt-auto bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 active:scale-95 transition-all text-lg flex items-center justify-center gap-2">
                <SmilePlus class="w-5 h-5" />
                Empezar con {{ petName || 'mi mascota' }}
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
