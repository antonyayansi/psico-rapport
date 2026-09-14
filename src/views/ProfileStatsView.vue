<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Award, Flame, User, Info, Camera, MessageCircle, LogOut, Sun, Moon,
  Heart, PawPrint, ShieldCheck, Sparkles, Share2
} from 'lucide-vue-next'
import { db, auth } from '../firebase'
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore'
import { signOut, updateProfile } from 'firebase/auth'
import { useAuthStore } from '../stores/auth'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js'
import { uploadProfileImage, deleteFileFromS3 } from '../aws'
import { processUserAction } from '../gamification'
import { isDark, toggleDark } from '../composables/useDarkMode'
import PetAvatar from '../components/PetAvatar.vue'
import { STAGE_META, STAGE_ORDER } from '../transition'
import { getMoodFace, DEFAULT_PET_NAME, CHART_MOOD_LABELS } from '../pet'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

const router = useRouter()
const authStore = useAuthStore()
const userName = ref('Explorador')
const userPhoto = ref(null)

const awsUrl = import.meta.env.VITE_AWS_URL
const photoInput = ref(null)
const isUploadingPhoto = ref(false)

const currentStreak = ref(0)
const points = ref(0)
const achievements = ref({
    photoUpdated: false,
    forumPostsCount: 0,
    chatMessagesCount: 0,
    moodLogsCount: 0,
    petCareCount: 0,
    reachedIndependence: false
})
const latestMood = ref(0)
const latestEmotion = ref('')
const petLive = ref(null)

const stageMeta = computed(() => STAGE_META[authStore.transitionStage] || STAGE_META.dependency)
const stageProgress = computed(() => {
    const i = STAGE_ORDER.indexOf(authStore.transitionStage)
    return ((i < 0 ? 0 : i) + 1) / STAGE_ORDER.length
})
const moodFace = computed(() => getMoodFace(latestEmotion.value || latestMood.value || petLive.value?.moodKey || petLive.value?.moodLevel || 3))

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            min: 0,
            max: 5,
            ticks: {
                stepSize: 1,
                font: { size: 10 },
                callback: function (value) {
                    return CHART_MOOD_LABELS[value] || ''
                }
            },
            grid: { display: false }
        },
        x: { grid: { display: false } }
    },
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
                label: function (context) {
                    return 'Nivel: ' + context.parsed.y
                }
            }
        }
    }
}

const chartData = ref({
    labels: [],
    datasets: [{
        label: 'Mi Ánimo',
        data: [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderWidth: 3,
        pointBackgroundColor: '#10b981',
        pointRadius: 4,
        fill: true,
        tension: 0.4
    }]
})

onMounted(() => {
    if (authStore.user?.displayName) {
        userName.value = authStore.user.displayName.split(' ')[0]
    }
    if (authStore.user?.photoURL) {
        userPhoto.value = authStore.user.photoURL
    }

    const userId = authStore.user.uid

    onSnapshot(doc(db, 'user_gamification', userId), (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data()
            currentStreak.value = data.currentStreak || 0
            points.value = data.points || 0
            achievements.value = {
                photoUpdated: data.photoUpdated || false,
                forumPostsCount: data.forumPostsCount || 0,
                chatMessagesCount: data.chatMessagesCount || 0,
                moodLogsCount: data.moodLogsCount || 0,
                petCareCount: data.petCareCount || 0,
                reachedIndependence: data.reachedIndependence || false
            }
        }
    })

    onSnapshot(doc(db, 'pets', userId), (snap) => {
        if (snap.exists()) petLive.value = snap.data()
    })

    const q = query(collection(db, 'estados_animo'), orderBy('fecha', 'asc'))
    onSnapshot(q, (snapshot) => {
        const labels = []
        const dataPoints = []
        let lastEmotion = ''

        snapshot.forEach((docItem) => {
            const data = docItem.data()
            if (data.id_usuario === userId) {
                if (data.fecha) {
                    const dateStr = new Date(data.fecha.toDate()).toLocaleDateString([], { month: 'short', day: 'numeric' })
                    labels.push(dateStr)
                } else {
                    labels.push('Hoy')
                }
                dataPoints.push(data.nivel_animo)
                lastEmotion = data.emocion || lastEmotion
            }
        })

        latestMood.value = dataPoints.length ? dataPoints[dataPoints.length - 1] : 0
        latestEmotion.value = lastEmotion

        chartData.value = {
            labels: labels.slice(-7),
            datasets: [{
                ...chartData.value.datasets[0],
                data: dataPoints.slice(-7)
            }]
        }
    })
})

const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    isUploadingPhoto.value = true

    try {
        const previousPhotoUrl = authStore.user?.photoURL
        if (previousPhotoUrl && previousPhotoUrl.includes('uwuapp/profiles')) {
            try {
                await deleteFileFromS3(previousPhotoUrl)
            } catch (s3Err) {
                console.warn('No se pudo eliminar la foto anterior de S3:', s3Err)
            }
        }

        const fileName = `${authStore.user.uid}_${Date.now()}_${file.name}`
        const s3Key = await uploadProfileImage(fileName, file)
        const newPhotoUrl = `${awsUrl}${s3Key}`

        await updateProfile(auth.currentUser, { photoURL: newPhotoUrl })

        userPhoto.value = newPhotoUrl
        authStore.user.photoURL = newPhotoUrl

        await processUserAction(authStore.user.uid, 'photo')
    } catch (error) {
        console.error('Error uploading profile photo:', error)
    } finally {
        isUploadingPhoto.value = false
        if (photoInput.value) photoInput.value.value = ''
    }
}

const medals = computed(() => [
    {
        id: 1,
        title: 'Identidad Creada',
        desc: 'Subiste tu foto de perfil.',
        icon: Camera,
        unlocked: achievements.value.photoUpdated,
        color: achievements.value.photoUpdated ? 'text-amber-500' : 'text-slate-400',
        bg: achievements.value.photoUpdated ? 'bg-amber-100' : 'bg-slate-100'
    },
    {
        id: 2,
        title: 'Voz de la Comunidad',
        desc: 'Hiciste tu primera publicación.',
        icon: Award,
        unlocked: achievements.value.forumPostsCount >= 1,
        color: achievements.value.forumPostsCount >= 1 ? 'text-blue-500' : 'text-slate-400',
        bg: achievements.value.forumPostsCount >= 1 ? 'bg-blue-100' : 'bg-slate-100'
    },
    {
        id: 3,
        title: 'Bestie de PsicoRapport',
        desc: 'Charlaste 10 veces con tu ODT.',
        icon: MessageCircle,
        unlocked: achievements.value.chatMessagesCount >= 10,
        color: achievements.value.chatMessagesCount >= 10 ? 'text-pink-500' : 'text-slate-400',
        bg: achievements.value.chatMessagesCount >= 10 ? 'bg-pink-100' : 'bg-slate-100'
    },
    {
        id: 4,
        title: 'Diario vivo',
        desc: 'Registraste tu ánimo 3 veces.',
        icon: Heart,
        unlocked: achievements.value.moodLogsCount >= 3,
        color: achievements.value.moodLogsCount >= 3 ? 'text-red-500' : 'text-slate-400',
        bg: achievements.value.moodLogsCount >= 3 ? 'bg-red-100' : 'bg-slate-100'
    },
    {
        id: 5,
        title: 'Cuidador ODT',
        desc: 'Cuidaste a tu mascota 5 veces.',
        icon: PawPrint,
        unlocked: achievements.value.petCareCount >= 5,
        color: achievements.value.petCareCount >= 5 ? 'text-emerald-500' : 'text-slate-400',
        bg: achievements.value.petCareCount >= 5 ? 'bg-emerald-100' : 'bg-slate-100'
    },
    {
        id: 6,
        title: 'Hacia la autonomía',
        desc: 'Pasaste a la etapa de independencia.',
        icon: Sparkles,
        unlocked: achievements.value.reachedIndependence || authStore.transitionStage !== 'dependency',
        color: (achievements.value.reachedIndependence || authStore.transitionStage !== 'dependency') ? 'text-violet-500' : 'text-slate-400',
        bg: (achievements.value.reachedIndependence || authStore.transitionStage !== 'dependency') ? 'bg-violet-100' : 'bg-slate-100'
    }
])

const handleLogout = async () => {
    try {
        await signOut(auth)
        router.push('/login')
    } catch (error) {
        console.error('Error cerrando sesión:', error)
    }
}

const toggleMoodShare = async () => {
    await authStore.setMoodShareConsent(!authStore.moodShareConsent)
}
</script>

<template>
    <div dir="ltr"
        class="h-full flex flex-col bg-slate-50 dark:bg-slate-950 relative flex-1 text-slate-800 dark:text-slate-100 overflow-y-auto">
        <div class="p-6 space-y-6 pb-24">
            <!-- Profile Header -->
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div @click="photoInput?.click()"
                        class="relative w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center border border-green-200 dark:border-green-800 cursor-pointer overflow-hidden group">
                        <img v-if="userPhoto" :src="userPhoto" class="w-full h-full object-cover" />
                        <User v-else class="w-8 h-8 text-green-600" />
                        <div
                            class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera class="w-5 h-5 text-white" />
                        </div>
                        <div v-if="isUploadingPhoto"
                            class="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <span
                                class="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></span>
                        </div>
                        <input @change="handlePhotoUpload" ref="photoInput" type="file" accept="image/*"
                            class="hidden" />
                    </div>
                    <div>
                        <div class="flex items-center space-x-2">
                            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ userName }}</h1>
                            <div v-if="currentStreak > 0"
                                class="flex items-center space-x-1 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full"
                                title="Tu racha diaria">
                                <Flame class="w-4 h-4 text-orange-500" />
                                <span class="text-xs font-bold text-orange-600 dark:text-orange-400">{{ currentStreak }}</span>
                            </div>
                        </div>
                        <p class="text-slate-500 dark:text-slate-400 text-sm">{{ points }} pts · Tu espacio seguro</p>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button @click="toggleDark()"
                        class="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title="Cambiar Tema">
                        <Moon v-if="!isDark" class="w-5 h-5" />
                        <Sun v-else class="w-5 h-5 text-amber-500" />
                    </button>
                    <button @click="handleLogout"
                        class="p-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        title="Cerrar sesión">
                        <LogOut class="w-5 h-5" />
                    </button>
                </div>
            </div>

            <!-- Pet reflects mood -->
            <section
                class="bg-gradient-to-br from-amber-50 to-green-50 dark:from-slate-900 dark:to-slate-900 p-5 rounded-3xl border border-amber-100/80 dark:border-slate-800 flex items-center gap-4">
                <PetAvatar
                    :name="petLive?.name || authStore.pet?.name || DEFAULT_PET_NAME"
                    :color="petLive?.color || authStore.pet?.color || 'amber'"
                    :accessory="petLive?.accessory || authStore.pet?.accessory || 'none'"
                    :mood-key="latestEmotion || petLive?.moodKey"
                    :mood-level="latestMood || petLive?.moodLevel || 3"
                    size="md"
                />
                <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">Tu ODT hoy</p>
                    <h2 class="font-bold text-slate-900 dark:text-white truncate">
                        {{ petLive?.name || authStore.pet?.name || DEFAULT_PET_NAME }}
                    </h2>
                    <p class="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                        {{ moodFace.label }} · refleja tu último estado de ánimo
                    </p>
                    <button
                        @click="router.push('/pet')"
                        class="mt-2 text-xs font-bold text-green-700 dark:text-green-400 hover:underline"
                    >
                        Personalizar / cuidar →
                    </button>
                </div>
            </section>

            <!-- Transition stage -->
            <section class="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div class="flex justify-between items-center mb-2">
                    <h2 class="font-bold text-slate-800 dark:text-slate-100">Camino de transición</h2>
                    <span class="text-xs font-bold text-green-700 dark:text-green-400">{{ stageMeta.label }}</span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">{{ stageMeta.description }}</p>
                <div class="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-3">
                    <div class="h-full bg-green-500 rounded-full transition-all" :style="{ width: `${stageProgress * 100}%` }" />
                </div>
                <div class="flex justify-between text-[0.65rem] font-semibold text-slate-400">
                    <span>Dependencia</span>
                    <span>Independencia</span>
                    <span>Terapeuta</span>
                </div>
                <button
                    v-if="authStore.transitionStage === 'independence' && !authStore.chosenTherapistId"
                    @click="router.push('/matching')"
                    class="mt-4 w-full bg-green-600 text-white py-2.5 rounded-xl text-sm font-bold"
                >
                    Elegir terapeuta
                </button>
            </section>

            <!-- Mood share consent -->
            <section class="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div class="flex items-start gap-3">
                    <div class="p-2 rounded-xl bg-sky-50 dark:bg-sky-900/30 text-sky-600">
                        <Share2 class="w-5 h-5" />
                    </div>
                    <div class="flex-1">
                        <h2 class="font-bold text-slate-800 dark:text-slate-100 text-sm">Compartir estados de ánimo</h2>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            Por defecto tu diario es privado. Si lo activas, tu terapeuta elegido podrá ver tus registros de ánimo.
                        </p>
                        <button
                            @click="toggleMoodShare"
                            class="mt-3 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors"
                            :class="authStore.moodShareConsent
                                ? 'bg-green-600 text-white border-green-600'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'"
                        >
                            {{ authStore.moodShareConsent ? 'Consentimiento activo' : 'Activar consentimiento' }}
                        </button>
                    </div>
                </div>
            </section>

            <!-- Admin shortcut -->
            <button
                v-if="authStore.isAdmin"
                @click="router.push('/admin')"
                class="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 py-3 rounded-2xl font-bold text-sm"
            >
                <ShieldCheck class="w-4 h-4" /> Autorizar psicólogos
            </button>

            <!-- Chart -->
            <section class="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="font-bold text-slate-800 dark:text-slate-100 text-lg">Tu Ánimo en la Semana</h2>
                    <div class="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400">
                        <Info class="w-4 h-4" />
                    </div>
                </div>
                <div class="h-48 w-full">
                    <Line v-if="chartData.labels.length > 0" :data="chartData" :options="chartOptions" />
                    <div v-else
                        class="h-full w-full flex items-center justify-center text-slate-400 text-sm text-center px-4">
                        Aún no hay datos suficientes.<br>¡Registra tu ánimo en el diario!
                    </div>
                </div>
            </section>

            <!-- Medals -->
            <section>
                <h2 class="font-bold text-slate-800 dark:text-slate-100 text-lg mb-4 px-1">Logros & Medallas</h2>
                <div class="grid grid-cols-2 gap-4">
                    <div v-for="m in medals" :key="m.id" :class="m.unlocked ? '' : 'opacity-60 grayscale'"
                        class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center transition-all">
                        <div :class="[isDark ? m.bg.replace('100', '900/30') : m.bg, m.color]"
                            class="w-12 h-12 rounded-full flex items-center justify-center mb-3">
                            <component :is="m.icon" class="w-6 h-6" />
                        </div>
                        <h3 class="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">{{ m.title }}</h3>
                        <p class="text-[0.65rem] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">{{ m.desc }}</p>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>
