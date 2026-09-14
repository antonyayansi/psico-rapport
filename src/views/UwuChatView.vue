<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Send, ArrowLeft, HeartPulse, Search, Info, Trash2, ImagePlus, X, Phone, UserCheck, PawPrint } from 'lucide-vue-next'
import { db } from '../firebase'
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc, getDoc } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth'
import { marked } from 'marked'
import { processUserAction } from '../gamification'
import { uploadPostImage } from '../aws'
import PetAvatar from '../components/PetAvatar.vue'
import QuietConfirm from '../components/QuietConfirm.vue'
import { buildStageSystemPrompt, STAGE_META } from '../transition'
import { DEFAULT_PET_NAME, resolveEmotion } from '../pet'
import { runUwuAgent } from '../agent/uwuAgent'

const router = useRouter()
const authStore = useAuthStore()
const showDeleteConfirm = ref(false)
const inputMsg = ref('')
const messages = ref([])
const chatContainer = ref(null)
const isTyping = ref(false)
const agentStatus = ref('')

// Image upload state
const imageInput = ref(null)
const pendingImage = ref(null)       // { file, previewUrl }
const isUploadingImage = ref(false)

const openAIKey = import.meta.env.VITE_OPENAI_API_KEY
const awsUrl = import.meta.env.VITE_AWS_URL

// ── Crisis Detection ──────────────────────────────────────────────────────────
const showCrisisOverlay = ref(false)
const chosenTherapist = ref(null)

const CRISIS_KEYWORDS = [
  'suicidarme', 'suicidio', 'quitarme la vida', 'quiero morir', 'ya no quiero vivir',
  'no quiero existir', 'hacerme daño', 'me quiero matar', 'terminar con todo',
  'no vale la pena vivir', 'mejor muerto', 'mejor muerta', 'acabar con mi vida',
  'quiero desaparecer', 'me voy a suicidar', 'pensamientos de muerte'
]

const detectCrisis = (text) => {
  const lower = text.toLowerCase()
  return CRISIS_KEYWORDS.some(kw => lower.includes(kw))
}

const loadChosenTherapist = async () => {
  try {
    const uid = authStore.user?.uid
    if (!uid) return
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists() && userDoc.data().chosenTherapistId) {
      const tid = userDoc.data().chosenTherapistId
      const tDoc = await getDoc(doc(db, 'therapists', tid))
      if (tDoc.exists()) chosenTherapist.value = { id: tid, ...tDoc.data() }
    }
  } catch (e) {
    console.error('Error loading chosen therapist:', e)
  }
}

const callPanicLine = () => {
  window.open('tel:113', '_self')
}
// ─────────────────────────────────────────────────────────────────────────────

const systemPromptText = computed(() =>
    buildStageSystemPrompt(
      authStore.transitionStage,
      authStore.pet?.name || DEFAULT_PET_NAME
    )
)

const petDisplayName = computed(() => authStore.pet?.name || DEFAULT_PET_NAME)
const petFaceSrc = computed(() => resolveEmotion({
    moodKey: authStore.pet?.moodKey,
    moodLevel: authStore.pet?.moodLevel
}).src)
const stageLabel = computed(() => (STAGE_META[authStore.transitionStage] || STAGE_META.dependency).short)

const getChatHistoryForAPI = () => {
    const recent = messages.value.filter(m => m.sender !== 'system').slice(-12)
    return recent.map(m => ({
        role: m.sender === 'uwu' ? 'assistant' : 'user',
        content: m.imageUrl
            ? [
                { type: 'text', text: m.text || '(imagen)' },
                { type: 'image_url', image_url: { url: m.imageUrl, detail: 'low' } }
              ]
            : m.text
    }))
}

const runAgentAction = (action) => {
    if (action?.tel) {
        window.open(`tel:${action.tel}`, '_self')
        return
    }
    if (action?.route) router.push(action.route)
}

const addSystemMessage = (text) => {
    messages.value.push({ id: Date.now(), text, sender: 'system' })
}

const sendMessageToDB = async (text, sender, imageUrl = null, actions = null) => {
    const userId = authStore.user.uid
    await addDoc(collection(db, 'conversaciones_uwu'), {
        id_usuario: userId,
        mensaje: text,
        sender: sender,
        imageUrl: imageUrl || null,
        actions: actions?.length ? actions : null,
        timestamp: serverTimestamp()
    })
}

// Handle image file selection → store as pending
const onImageSelected = (e) => {
    const file = e.target.files[0]
    if (!file) return
    pendingImage.value = {
        file,
        previewUrl: URL.createObjectURL(file)
    }
    // Reset input so same file can be re-selected
    if (imageInput.value) imageInput.value.value = ''
}

const clearPendingImage = () => {
    if (pendingImage.value?.previewUrl) {
        URL.revokeObjectURL(pendingImage.value.previewUrl)
    }
    pendingImage.value = null
}

const sendMessage = async () => {
    const text = inputMsg.value.trim()
    const hasImage = !!pendingImage.value
    if (!text && !hasImage) return

    inputMsg.value = ''
    const imageToSend = pendingImage.value
    pendingImage.value = null

    let uploadedImageUrl = null

    // 1. Upload image to S3 if present
    if (imageToSend) {
        isUploadingImage.value = true
        try {
            const fileName = `chat_${authStore.user.uid}_${Date.now()}_${imageToSend.file.name}`
            const s3Key = await uploadPostImage(fileName, imageToSend.file)
            uploadedImageUrl = `${awsUrl}${s3Key}`
        } catch (err) {
            console.error('Error subiendo imagen:', err)
        } finally {
            isUploadingImage.value = false
            URL.revokeObjectURL(imageToSend.previewUrl)
        }
    }

    // 2. Save user message with optional image URL
    await sendMessageToDB(text, 'user', uploadedImageUrl)

    // 3. Check for crisis keywords before AI response
    if (text && detectCrisis(text)) {
      showCrisisOverlay.value = true
    }

    isTyping.value = true
    agentStatus.value = 'Pensando…'
    scrollToBottom()

    try {
        const result = await runUwuAgent({
            apiKey: openAIKey,
            uid: authStore.user.uid,
            systemPrompt: systemPromptText.value,
            history: (() => {
                const history = getChatHistoryForAPI()
                const last = history[history.length - 1]
                if (last?.role === 'user') {
                    const lastText = typeof last.content === 'string'
                        ? last.content
                        : last.content?.[0]?.text
                    if (!text || lastText === text || lastText === '(imagen)') history.pop()
                }
                return history
            })(),
            userText: text,
            imageUrl: uploadedImageUrl,
            onStatus: (status) => {
                agentStatus.value = status
            }
        })
        const uwuReply = result.text || 'Estoy aquí. ¿Quieres que mire tu ánimo, tu mascota o los psicólogos disponibles?'
        await sendMessageToDB(uwuReply, 'uwu', null, result.actions)
        await processUserAction(authStore.user.uid, 'chat')
        if (result.wroteMood) await authStore.refreshPet()
    } catch (error) {
        console.error("OpenAI Error:", error)
        await sendMessageToDB("Lo siento, estoy teniendo problemas de conexión. ¿Puedes intentar de nuevo?", 'uwu')
    } finally {
        isTyping.value = false
        agentStatus.value = ''
    }
}

const scrollToBottom = () => {
    nextTick(() => {
        if (chatContainer.value) {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight
        }
    })
}

const deleteChat = () => {
    showDeleteConfirm.value = true
}

const confirmDeleteChat = async () => {
    const deletions = messages.value
        .filter(m => m.sender !== 'system')
        .map(m => deleteDoc(doc(db, 'conversaciones_uwu', m.id)))
    await Promise.all(deletions)
    messages.value = messages.value.filter(m => m.sender === 'system')
}

onMounted(() => {
    addSystemMessage('Hoy')
    loadChosenTherapist()

    const userId = authStore.user.uid
    const q = query(collection(db, 'conversaciones_uwu'), orderBy('timestamp', 'asc'))

    onSnapshot(q, (snapshot) => {
        const loadedMessages = []
        snapshot.forEach((docSnap) => {
            const data = docSnap.data()
            if (data.id_usuario === userId) {
                loadedMessages.push({
                    id: docSnap.id,
                    text: data.mensaje,
                    sender: data.sender,
                    imageUrl: data.imageUrl || null,
                    actions: Array.isArray(data.actions) ? data.actions : [],
                    time: data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'
                })
            }
        })

        messages.value = [messages.value[0], ...loadedMessages]

        if (loadedMessages.length === 0) {
            sendMessageToDB(`¡Hola! Soy ${petDisplayName.value}. Me alegra mucho que estés aquí. Cuéntame, ¿cómo te sientes en este momento?`, 'uwu')
        }

        scrollToBottom()
    })
})
</script>

<template>
    <div dir="ltr" class="h-full flex flex-col bg-sage-50 dark:bg-slate-950 relative flex-1 text-slate-800 dark:text-slate-100">
        <QuietConfirm
            v-model="showDeleteConfirm"
            title="Borrar conversación"
            :message="`¿Quieres borrar todo el historial con ${petDisplayName}?`"
            confirm-label="Sí, borrar"
            @confirm="confirmDeleteChat"
        />

        <!-- ── Crisis Overlay ────────────────────────────────────── -->
        <Transition name="fade">
            <div v-if="showCrisisOverlay"
                class="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end p-4 pb-8">
                <div class="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 space-y-4 shadow-xl">
                    <div class="text-center">
                        <img src="/emociones/temeroso.png" :alt="petDisplayName" class="w-16 h-16 mx-auto mb-3 rounded-[28%] object-cover" />
                        <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ petDisplayName }} está aquí contigo</h3>
                        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            Noto que estás pasando por un momento muy difícil. Tu vida importa, y mereces apoyo real ahora mismo.
                        </p>
                    </div>

                    <!-- Línea de Crisis -->
                    <button @click="callPanicLine"
                        class="w-full flex items-center justify-center space-x-3 bg-red-500 text-white py-4 rounded-2xl font-bold active:scale-95 transition-all">
                        <Phone class="w-5 h-5" />
                        <div class="text-left">
                            <p class="text-sm font-bold">Llamar línea de crisis</p>
                            <p class="text-xs text-red-100">MINSA — 113 (Perú, gratuito 24/7)</p>
                        </div>
                    </button>

                    <!-- Terapeuta asignado -->
                    <button v-if="chosenTherapist" @click="router.push(`/therapists/${chosenTherapist.id}`)"
                        class="w-full flex items-center justify-center space-x-3 bg-green-600 dark:bg-slate-700 text-white py-4 rounded-2xl font-bold active:scale-95 transition-all">
                        <UserCheck class="w-5 h-5" />
                        <div class="text-left">
                            <p class="text-sm font-bold">Contactar a mi terapeuta</p>
                            <p class="text-xs text-green-100 dark:text-slate-300">{{ chosenTherapist.displayName }}</p>
                        </div>
                    </button>

                    <button v-else @click="router.push('/therapists')"
                        class="w-full flex items-center justify-center space-x-3 bg-green-600 dark:bg-slate-700 text-white py-4 rounded-2xl font-bold active:scale-95 transition-all">
                        <UserCheck class="w-5 h-5" />
                        <span>Buscar un terapeuta ahora</span>
                    </button>

                    <button @click="showCrisisOverlay = false"
                        class="w-full py-3 text-slate-500 dark:text-slate-400 text-sm font-medium">
                        Continuar con {{ petDisplayName }}
                    </button>
                </div>
            </div>
        </Transition>
        <!-- ─────────────────────────────────────────────────────── -->
        <!-- Header -->
        <header
            class="bg-sage-50/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-between p-4 px-5 z-10 sticky top-0">
            <div class="flex items-center space-x-3">
                <button @click="router.back()" class="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <ArrowLeft class="w-6 h-6 text-slate-600 dark:text-slate-300" />
                </button>
                <div class="flex items-center space-x-3">
                    <button @click="router.push('/pet')" class="relative" title="Personalizar mascota">
                        <PetAvatar
                            :name="petDisplayName"
                            :color="authStore.pet?.color || 'amber'"
                            :accessory="authStore.pet?.accessory || 'none'"
                            :mood-key="authStore.pet?.moodKey"
                            :mood-level="authStore.pet?.moodLevel || 3"
                            size="sm"
                            :animate="false"
                        />
                        <span
                            class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </button>
                    <div>
                        <h1 class="font-display text-lg leading-tight">{{ petDisplayName }}</h1>
                        <p class="text-xs text-green-700/80 dark:text-slate-400 font-medium">{{ stageLabel }}</p>
                    </div>
                </div>
            </div>
            <div class="flex space-x-2">
                <button @click="router.push('/pet')"
                    class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                    title="Mi mascota">
                    <PawPrint class="w-5 h-5" />
                </button>
                <button @click="deleteChat"
                    class="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    title="Borrar Chat">
                    <Trash2 class="w-5 h-5" />
                </button>
                <button @click="router.push('/tracking')"
                    class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                    title="Seguimiento y SOS">
                    <HeartPulse class="w-5 h-5" />
                </button>
                <button @click="router.push('/matching')"
                    class="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                    title="Buscar Terapeuta">
                    <Search class="w-5 h-5" />
                </button>
            </div>
        </header>

        <!-- Chat Area -->
        <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            <div v-for="msg in messages" :key="msg.id" class="w-full flex" :class="{
                'justify-center': msg.sender === 'system',
                'justify-end': msg.sender === 'user',
                'justify-start': msg.sender === 'uwu'
            }">

                <!-- System Message -->
                <span v-if="msg.sender === 'system'"
                    class="text-xs font-semibold text-slate-400 bg-slate-200/50 px-3 py-1 rounded-full uppercase tracking-wider">
                    {{ msg.text }}
                </span>

                <!-- Uwu Message -->
                <div v-else-if="msg.sender === 'uwu'" class="max-w-[85%] flex items-end space-x-2 animate-fade-in-up">
                    <img
                        :src="petFaceSrc"
                        :alt="petDisplayName"
                        class="w-8 h-8 rounded-[28%] object-cover flex-shrink-0 mb-0.5"
                    />
                    <div
                        class="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 p-3.5 rounded-[1.35rem] rounded-bl-md shadow-[0_6px_20px_rgba(47,53,48,0.04)]">
                        <div class="text-[0.95rem] leading-relaxed markdown-body"
                            v-html="marked.parse(msg.text)"></div>
                        <div v-if="msg.actions?.length" class="flex flex-wrap gap-1.5 mt-2.5">
                            <button
                                v-for="(action, idx) in msg.actions"
                                :key="`${msg.id}-${action.action}-${idx}`"
                                type="button"
                                class="px-3 py-1.5 rounded-full text-xs font-medium bg-sage-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-[0.97]"
                                @click="runAgentAction(action)"
                            >
                                {{ action.label }}
                            </button>
                        </div>
                        <p class="text-[0.65rem] text-slate-400 text-right mt-1.5">{{ msg.time }}</p>
                    </div>
                </div>

                <!-- User Message (supports image) -->
                <div v-else-if="msg.sender === 'user'" class="max-w-[85%] animate-fade-in-up">
                    <div class="bg-green-700 dark:bg-slate-700 text-white rounded-[1.35rem] rounded-br-md overflow-hidden">
                        <!-- Image attachment -->
                        <img v-if="msg.imageUrl" :src="msg.imageUrl" alt="Imagen adjunta"
                            class="w-full max-h-52 object-cover" />
                        <!-- Text -->
                        <div v-if="msg.text" class="p-3.5">
                            <p class="text-[0.95rem] leading-relaxed whitespace-pre-wrap" dir="ltr">{{ msg.text }}</p>
                        </div>
                        <div v-else-if="!msg.imageUrl" class="p-3.5">
                            <p class="text-[0.95rem]">(imagen)</p>
                        </div>
                        <p class="text-[0.65rem] text-green-200 text-right px-3.5 pb-2 -mt-1">{{ msg.time }}</p>
                    </div>
                </div>

            </div>

            <!-- Typing indicator -->
            <div v-if="isTyping" class="flex items-end space-x-2 w-full animate-fade-in-up">
                <img :src="petFaceSrc" :alt="petDisplayName" class="w-8 h-8 rounded-[28%] object-cover flex-shrink-0" />
                <div class="bg-white dark:bg-slate-900 border dark:border-slate-800 text-slate-500 px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div class="flex space-x-1.5">
                        <span class="w-2 h-2 rounded-full bg-slate-300 animate-bounce"></span>
                        <span class="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style="animation-delay: 150ms"></span>
                        <span class="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style="animation-delay: 300ms"></span>
                    </div>
                    <p v-if="agentStatus" class="text-[0.65rem] text-slate-400 mt-2 leading-none">{{ agentStatus }}</p>
                </div>
            </div>
        </div>

        <!-- Info Notice -->
        <div v-if="messages.length > 3" class="absolute bottom-[4.5rem] w-full px-4 transform transition-all z-10">
            <div class="bg-white/90 text-slate-600 text-xs p-2.5 rounded-full flex items-center justify-center space-x-2 mx-auto max-w-[90%] cursor-pointer shadow-[0_8px_24px_rgba(47,53,48,0.05)]"
                @click="router.push('/matching')">
                <Info class="w-4 h-4" />
                <span>PsicoRapport encontró terapeutas para ti. Ver ahora.</span>
            </div>
        </div>

        <!-- Input Area -->
        <div class="flex-none bg-sage-50/90 dark:bg-slate-900/90 backdrop-blur-md p-3 px-4 z-10 w-full">

            <!-- Pending image preview -->
            <div v-if="pendingImage" class="mb-2 relative inline-block">
                <img :src="pendingImage.previewUrl" alt="Preview"
                    class="h-20 w-20 rounded-xl object-cover border-2 border-green-400" />
                <button @click="clearPendingImage"
                    class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white">
                    <X class="w-3 h-3" />
                </button>
            </div>

            <!-- Upload spinner -->
            <div v-if="isUploadingImage" class="mb-2 flex items-center space-x-2 text-xs text-slate-400">
                <span class="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></span>
                <span>Subiendo imagen…</span>
            </div>

            <div
                class="flex items-center space-x-2 bg-white dark:bg-slate-900 rounded-full pr-1 shadow-[0_8px_24px_rgba(47,53,48,0.05)]">

                <!-- Image picker button -->
                <button @click="imageInput?.click()"
                    class="p-2 ml-1 rounded-full text-slate-400 hover:text-green-700 transition-colors flex-none"
                    title="Adjuntar imagen">
                    <ImagePlus class="w-5 h-5" />
                </button>
                <input ref="imageInput" type="file" accept="image/*" class="hidden" @change="onImageSelected" />

                <input v-model="inputMsg" @keyup.enter="sendMessage" type="text"
                    placeholder="Escribe con calma..."
                    dir="ltr"
                    class="flex-1 bg-transparent border-none py-3 pr-2 outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 text-sm" />

                <button @click="sendMessage" :disabled="!inputMsg.trim() && !pendingImage"
                    class="p-2 rounded-full bg-green-700 dark:bg-slate-100 dark:text-slate-900 text-white disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 transition-colors flex-none">
                    <Send class="w-5 h-5 -ml-0.5 mt-0.5" />
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in-up {
    animation: fadeInUp 0.3s ease forwards;
}

:deep(.markdown-body p) {
    margin-bottom: 0.5rem;
}

:deep(.markdown-body p:last-child) {
    margin-bottom: 0;
}

:deep(.markdown-body strong) {
    font-weight: 700;
    color: #334155;
}
</style>
