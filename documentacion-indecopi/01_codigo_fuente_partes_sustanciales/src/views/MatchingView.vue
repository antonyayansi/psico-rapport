<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../firebase'
import { collection, getDocs, query, where, doc, getDoc, setDoc } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth'
import { ArrowLeft, ChevronRight, UserCheck, Stethoscope, CheckCircle2, Share2 } from 'lucide-vue-next'
import { STAGES } from '../transition'
import { processUserAction } from '../gamification'

const router = useRouter()
const authStore = useAuthStore()

const therapists = ref([])
const isLoading = ref(true)
const chosenTherapistId = ref(null)
const savingId = ref(null)
const shareMoodWithChoice = ref(authStore.moodShareConsent)

const exampleTherapist = {
    id: 'daniel-hachircana',
    displayName: 'Dr. Daniel Hachircana Mendez',
    title: 'Neuropsicólogo Clínico y de Rehabilitación',
    mainSpecialty: 'Neuropsicología Clínica',
    subspecialty: 'Daño cerebral adquirido y neuropsicología infantil',
    photoURL: null,
    approved: true
}

const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?'

onMounted(async () => {
    try {
        const [snap, userDoc] = await Promise.all([
            getDocs(query(collection(db, 'therapists'), where('approved', '==', true))),
            getDoc(doc(db, 'users', authStore.user.uid))
        ])
        const loaded = []
        snap.forEach(d => loaded.push({ id: d.id, ...d.data() }))
        therapists.value = loaded.length ? loaded : [exampleTherapist]
        if (userDoc.exists()) {
            chosenTherapistId.value = userDoc.data().chosenTherapistId || null
            shareMoodWithChoice.value = userDoc.data().moodShareConsent === true
        }
    } catch (e) {
        console.error('Error loading therapists:', e)
        therapists.value = [exampleTherapist]
    } finally {
        isLoading.value = false
    }
})

const chooseTherapist = async (therapist) => {
    savingId.value = therapist.id
    try {
        await setDoc(doc(db, 'users', authStore.user.uid), {
            chosenTherapistId: therapist.id,
            chosenTherapistName: therapist.displayName,
            moodShareConsent: shareMoodWithChoice.value === true,
            moodShareConsentDate: shareMoodWithChoice.value ? new Date() : null,
            transitionStage: STAGES.therapist,
            transitionStageUpdatedAt: new Date()
        }, { merge: true })
        chosenTherapistId.value = therapist.id
        authStore.chosenTherapistId = therapist.id
        authStore.chosenTherapistName = therapist.displayName
        authStore.moodShareConsent = shareMoodWithChoice.value === true
        await authStore.setTransitionStage(STAGES.therapist)
        await processUserAction(authStore.user.uid, 'stage')
    } catch (e) {
        console.error('Error eligiendo terapeuta:', e)
    } finally {
        savingId.value = null
    }
}
</script>

<template>
    <div dir="ltr" class="h-full flex flex-col bg-slate-50 dark:bg-slate-950 relative flex-1 text-slate-800 dark:text-slate-100 overflow-y-auto">
        <header class="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center p-4 px-6 sticky top-0 z-10">
            <button @click="router.back()" class="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
                <ArrowLeft class="w-6 h-6" />
            </button>
            <h1 class="font-bold text-xl ml-2">Terapeutas para ti</h1>
        </header>

        <div class="p-4 space-y-4 pb-24">
            <!-- Banner -->
            <div class="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 p-4 rounded-2xl flex space-x-3 items-start">
                <div class="text-2xl">🎯</div>
                <div>
                    <h3 class="font-bold text-green-900 dark:text-green-300 text-sm">Puente hacia el terapeuta</h3>
                    <p class="text-xs text-green-800 dark:text-green-400 mt-0.5 leading-relaxed">
                        Etapa final del objeto transicional: tu ODT te acompañó; ahora eliges un profesional verificado.
                    </p>
                </div>
            </div>

            <!-- Mood share consent at matching -->
            <label
                class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-start gap-3 cursor-pointer"
            >
                <input v-model="shareMoodWithChoice" type="checkbox" class="mt-1 accent-green-600" />
                <div>
                    <div class="flex items-center gap-1.5">
                        <Share2 class="w-4 h-4 text-sky-600" />
                        <span class="text-sm font-bold text-slate-800 dark:text-slate-100">Compartir mi ánimo</span>
                    </div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Autorizo que el terapeuta que elija pueda ver mis registros de estado de ánimo. Puedes cambiarlo después en Logros.
                    </p>
                </div>
            </label>

            <!-- Chosen therapist banner -->
            <div v-if="chosenTherapistId"
                class="bg-white dark:bg-slate-900 border border-green-200 dark:border-green-800 rounded-2xl p-4 flex items-center space-x-3">
                <CheckCircle2 class="w-5 h-5 text-green-600 flex-shrink-0" />
                <div class="flex-1">
                    <p class="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide">Tu terapeuta actual</p>
                    <p class="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                        {{ therapists.find(t => t.id === chosenTherapistId)?.displayName || '—' }}
                    </p>
                </div>
            </div>

            <!-- Loading skeleton -->
            <div v-if="isLoading" class="space-y-3">
                <div v-for="i in 3" :key="i"
                    class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 animate-pulse">
                    <div class="flex items-center space-x-4">
                        <div class="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                        <div class="flex-1 space-y-2">
                            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4"></div>
                            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-1/2"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Therapist cards -->
            <div v-else class="space-y-4">
                <div v-if="!therapists.length" class="text-center py-12 text-slate-400">
                    <Stethoscope class="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p class="font-medium">No hay terapeutas disponibles</p>
                </div>

                <div v-for="t in therapists" :key="t.id"
                    class="bg-white dark:bg-slate-900 border rounded-3xl p-5 transition-all"
                    :class="chosenTherapistId === t.id
                        ? 'border-green-400 dark:border-green-600 ring-2 ring-green-200 dark:ring-green-900'
                        : 'border-slate-100 dark:border-slate-800'">

                    <div class="flex items-start space-x-4">
                        <!-- Avatar -->
                        <div class="flex-shrink-0">
                            <img v-if="t.photoURL" :src="t.photoURL"
                                class="w-16 h-16 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700" />
                            <div v-else
                                class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 border-2 border-green-200 dark:border-green-800 flex items-center justify-center text-green-700 dark:text-green-400 text-xl font-bold">
                                {{ getInitial(t.displayName) }}
                            </div>
                        </div>

                        <!-- Info -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-start justify-between">
                                <h3 class="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight pr-2">{{ t.displayName }}</h3>
                                <span v-if="chosenTherapistId === t.id"
                                    class="flex-shrink-0 text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-semibold">
                                    ✓ Elegido
                                </span>
                                <span v-else class="flex-shrink-0 text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-semibold">
                                    ✓ Verificado
                                </span>
                            </div>
                            <p class="text-xs text-green-600 dark:text-green-400 font-semibold mt-0.5">{{ t.title }}</p>
                            <p v-if="t.mainSpecialty" class="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                                <strong>Especialidad:</strong> {{ t.mainSpecialty }}
                            </p>
                            <p v-if="t.subspecialty" class="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-2">{{ t.subspecialty }}</p>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center space-x-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button @click="router.push(`/therapists/${t.id}`)"
                            class="flex-1 flex items-center justify-center space-x-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-2.5 rounded-2xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all">
                            <span>Ver perfil</span>
                            <ChevronRight class="w-3.5 h-3.5" />
                        </button>

                        <button v-if="chosenTherapistId !== t.id"
                            @click="chooseTherapist(t)"
                            :disabled="savingId === t.id"
                            class="flex-1 flex items-center justify-center space-x-1 bg-green-600 text-white py-2.5 rounded-2xl text-xs font-bold active:scale-95 transition-all disabled:opacity-60">
                            <span v-if="savingId === t.id">Guardando…</span>
                            <template v-else>
                                <UserCheck class="w-3.5 h-3.5" />
                                <span>Elegir terapeuta</span>
                            </template>
                        </button>

                        <button v-else
                            class="flex-1 flex items-center justify-center space-x-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 py-2.5 rounded-2xl text-xs font-bold cursor-default">
                            <CheckCircle2 class="w-3.5 h-3.5" />
                            <span>Mi terapeuta</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
