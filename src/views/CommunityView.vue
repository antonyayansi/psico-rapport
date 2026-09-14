<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Heart, Send, MessageCircle, AlertCircle, Paperclip, X, Trash2, Stethoscope, Lock } from 'lucide-vue-next'
import { db } from '../firebase'
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth'
import { uploadPostImage, deleteFileFromS3 } from '../aws'
import { processUserAction } from '../gamification'
import { DEFAULT_PET_NAME, isPetAuthorName } from '../pet'
import QuietConfirm from '../components/QuietConfirm.vue'

const router = useRouter()
const authStore = useAuthStore()
const newPostContent = ref('')
const posts = ref([])
const isPublishing = ref(false)
const showDeleteConfirm = ref(false)
const postToDelete = ref(null)

// Límite de comentarios: usuarios normales pueden comentar máximo 5 posts/día
const MAX_USER_COMMENTS_PER_DAY = 5
const userCommentsToday = computed(() => {
    if (authStore.isTherapist) return 0 // terapeutas sin límite
    const today = new Date().toDateString()
    return posts.value.reduce((count, post) => {
        const myComments = (post.comments || []).filter(c =>
            c.authorId === authStore.user?.uid &&
            c.date && new Date(c.date).toDateString() === today
        )
        return count + myComments.length
    }, 0)
})
const canComment = computed(() => authStore.isTherapist || userCommentsToday.value < MAX_USER_COMMENTS_PER_DAY)

const uploaderInput = ref(null)
const selectedFile = ref(null)
const selectedFilePreview = ref(null)

const openAIKey = import.meta.env.VITE_OPENAI_API_KEY
const awsUrl = import.meta.env.VITE_AWS_URL

const onFileSelected = (e) => {
    const file = e.target.files[0]
    if (file) {
        selectedFile.value = file
        selectedFilePreview.value = URL.createObjectURL(file)
    }
}

const clearFile = () => {
    selectedFile.value = null
    selectedFilePreview.value = null
    if (uploaderInput.value) {
        uploaderInput.value.value = ''
    }
}

const generateUwuComment = async (postText) => {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openAIKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{
                    role: "system",
                    content: `Eres ${authStore.pet?.name || DEFAULT_PET_NAME}, un oso de anteojos y Objeto Digital Transicional en una app de salud mental de Perú. Estás monitoreando el foro de la comunidad. Analiza la publicación proporcionada. Si el usuario muestra tristeza, ansiedad, desesperación o pide ayuda, reescribe SIEMPRE UN MENSAJE de apoyo compasivo muy corto (máximo 2 oraciones) y con cariño. Si el mensaje es neutro o positivo, responde exactamente con la palabra 'IGNORE'.`
                }, {
                    role: "user",
                    content: postText
                }],
                max_tokens: 100,
                temperature: 0.6
            })
        })

        if (!response.ok) return null
        const data = await response.json()
        const content = data.choices[0].message.content.trim()

        return content === 'IGNORE' ? null : content
    } catch (error) {
        console.error("OpenAI Error:", error)
        return null
    }
}

const publishPost = async () => {
    const text = newPostContent.value.trim()
    if (!text && !selectedFile.value) return
    isPublishing.value = true

    let uploadedImageUrl = null

    try {
        if (selectedFile.value) {
            const fileName = `${Date.now()}_${selectedFile.value.name}`
            const s3Key = await uploadPostImage(fileName, selectedFile.value)
            uploadedImageUrl = `${awsUrl}${s3Key}`
        }

        const postRef = await addDoc(collection(db, 'community_posts'), {
            content: text,
            imageUrl: uploadedImageUrl,
            authorId: authStore.user.uid,
            authorName: authStore.user.displayName ? authStore.user.displayName.split(' ')[0] : 'Explorador',
            authorPhotoUrl: authStore.user.photoURL || null,
            isTherapistPost: authStore.isTherapist === true,
            likedBy: [],
            timestamp: serverTimestamp(),
            comments: []
        })

        newPostContent.value = ''
        clearFile()

        await processUserAction(authStore.user.uid, 'forum')

        // Background AI Monitoring
        if (text) {
            const uwuReply = await generateUwuComment(text)
            if (uwuReply) {
                await updateDoc(postRef, {
                    comments: arrayUnion({
                        id: Date.now(),
                        type: 'text',
                        text: uwuReply,
                        authorName: authStore.pet?.name || DEFAULT_PET_NAME,
                        isPet: true
                    })
                })
            }
        }

    } catch (error) {
        console.error("Publish error:", error)
    } finally {
        isPublishing.value = false
    }
}

const toggleLike = async (post) => {
    try {
        const postRef = doc(db, 'community_posts', post.id)
        const activeUid = authStore.user.uid
        // Manejar retrocompatibilidad si venia del array vacio y verificar inclusion
        const likesArray = post.likedBy || []

        if (likesArray.includes(activeUid)) {
            await updateDoc(postRef, {
                likedBy: arrayRemove(activeUid)
            })
        } else {
            await updateDoc(postRef, {
                likedBy: arrayUnion(activeUid)
            })
        }
    } catch (e) {
        console.error(e)
    }
}

onMounted(() => {
    const q = query(collection(db, 'community_posts'), orderBy('timestamp', 'desc'))

    onSnapshot(q, (snapshot) => {
        const loaded = []
        snapshot.forEach((docSnap) => {
            const data = docSnap.data()
            loaded.push({
                id: docSnap.id,
                ...data,
                likedBy: data.likedBy || [],
                time: data.timestamp ? new Date(data.timestamp.toDate()).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Ahora'
            })
        })
        posts.value = loaded
    })
})

const isLikedByUser = (post) => {
    return post.likedBy?.includes(authStore.user?.uid)
}

const deletePost = (post) => {
    postToDelete.value = post
    showDeleteConfirm.value = true
}

const confirmDeletePost = async () => {
    const post = postToDelete.value
    postToDelete.value = null
    if (!post) return
    try {
        if (post.imageUrl) {
            try {
                await deleteFileFromS3(post.imageUrl)
            } catch (s3Err) {
                console.warn('No se pudo eliminar la imagen de S3:', s3Err)
            }
        }
        await deleteDoc(doc(db, 'community_posts', post.id))
    } catch (e) {
        console.error('Error al eliminar publicación:', e)
    }
}

</script>

<template>
    <div dir="ltr"
        class="h-full flex flex-col bg-sage-50 dark:bg-slate-950 relative flex-1 text-slate-800 dark:text-slate-100 overflow-y-auto">
        <QuietConfirm
            v-model="showDeleteConfirm"
            title="Eliminar publicación"
            message="¿Quieres eliminar esta publicación? Esta acción no se puede deshacer."
            confirm-label="Eliminar"
            @confirm="confirmDeletePost"
        />
        <header
            class="px-6 pt-5 pb-3 sticky top-0 z-10 bg-sage-50/90 dark:bg-slate-950/90 backdrop-blur-md">
            <h1 class="font-display text-2xl text-center text-ink">El refugio</h1>
            <p class="text-xs text-slate-400 text-center mt-0.5">
                Un lugar para escribir sin prisa
            </p>
        </header>

        <div class="p-4 space-y-6 pb-24">
            <!-- Create Post: solo terapeutas -->
            <div v-if="authStore.isTherapist"
                class="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 group">
                <div class="flex items-center space-x-2 mb-3">
                    <Stethoscope class="w-4 h-4 text-green-600" />
                    <span class="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide">Publicar como terapeuta</span>
                </div>
                <textarea v-model="newPostContent" placeholder="Comparte un consejo, recurso o mensaje de apoyo para la comunidad..."
                    class="w-full bg-slate-50 dark:bg-slate-950 dark:text-slate-200 border-none rounded-2xl p-4 outline-none resize-none placeholder:text-slate-400 focus:ring-2 focus:ring-green-500/20 text-sm"
                    rows="3"></textarea>

                <div v-if="selectedFilePreview" class="relative mt-3 inline-block">
                    <img :src="selectedFilePreview"
                        class="h-24 w-auto rounded-xl object-cover border border-slate-200" />
                    <button @click="clearFile"
                        class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                        <X class="w-3 h-3" />
                    </button>
                </div>

                <div class="flex justify-between items-center mt-3">
                    <div>
                        <input type="file" ref="uploaderInput" @change="onFileSelected" accept="image/*"
                            class="hidden" />
                        <button @click="uploaderInput?.click()"
                            class="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                            title="Adjuntar foto">
                            <Paperclip class="w-5 h-5" />
                        </button>
                    </div>
                    <button @click="publishPost" :disabled="(!newPostContent.trim() && !selectedFile) || isPublishing"
                        class="bg-green-600 text-white px-5 py-2.5 rounded-full font-bold disabled:opacity-50 flex items-center space-x-2 active:scale-95 transition-all text-sm">
                        <span>{{ isPublishing ? 'Subiendo...' : 'Publicar' }}</span>
                        <Send class="w-4 h-4 ml-1" v-if="!isPublishing" />
                    </button>
                </div>
            </div>

            <!-- Aviso para usuarios normales -->
            <div v-else
                class="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 flex items-start space-x-3">
                <Lock class="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                    <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Solo los terapeutas verificados pueden publicar</p>
                    <p class="text-xs text-slate-500 mt-0.5">Puedes comentar y dar 💙 en las publicaciones. Tienes {{ MAX_USER_COMMENTS_PER_DAY - userCommentsToday }} comentarios disponibles hoy.</p>
                    <button @click="router.push('/therapist-register')"
                        class="mt-2 text-xs text-green-600 dark:text-green-400 font-semibold">¿Eres terapeuta? Regístrate →</button>
                </div>
            </div>

            <div v-if="posts.length === 0" class="text-center text-slate-400 py-10">
                <AlertCircle class="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Sé el primero en compartir algo.</p>
            </div>

            <!-- Feed -->
            <div class="space-y-4">
                <div v-for="post in posts" :key="post.id" @click="router.push(`/community/post/${post.id}`)"
                    class="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col animate-fade-in-up cursor-pointer transition-">
                    <div class="flex justify-between items-center mb-3">
                        <div class="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center space-x-2">
                            <img v-if="post.authorPhotoUrl" :src="post.authorPhotoUrl"
                                class="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                            <div v-else
                                class="w-8 h-8 bg-green-100 dark:bg-green-900/40 border border-green-200 dark:border-green-800 rounded-full flex items-center justify-center text-green-700 dark:text-green-400 text-[0.65rem] uppercase flex-shrink-0">
                                {{ post.authorName.charAt(0) }}</div>
                            <div class="flex flex-col">
                                <span>{{ post.authorName }}</span>
                                <span v-if="post.isTherapistPost" class="text-[0.6rem] text-green-600 dark:text-green-400 font-bold flex items-center space-x-0.5">
                                    <Stethoscope class="w-2.5 h-2.5" />
                                    <span>Terapeuta verificado</span>
                                </span>
                            </div>
                        </div>
                        <span class="text-xs text-slate-400 dark:text-slate-500">{{ post.time }}</span>
                    </div>

                    <p class="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{{
                        post.content }}</p>

                    <div v-if="post.imageUrl" class="mb-4 overflow-hidden rounded-xl bg-slate-100 flex justify-center">
                        <img :src="post.imageUrl" class="max-w-full h-auto object-contain rounded-xl max-h-72"
                            loading="lazy" />
                    </div>

                    <div class="flex items-center space-x-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400"
                        @click.stop>
                        <button @click="toggleLike(post)" class="flex items-center space-x-1.5 transition-colors group">
                            <Heart class="w-4 h-4 transition-all"
                                :class="isLikedByUser(post) ? 'fill-red-500 text-red-500 scale-110' : 'group-hover:text-red-400'" />
                            <span class="text-xs font-semibold" :class="isLikedByUser(post) ? 'text-red-500' : ''">{{
                                post.likedBy?.length || 0 }} Me Importa</span>
                        </button>
                        <div class="flex items-center space-x-1.5">
                            <MessageCircle class="w-4 h-4" />
                            <span class="text-xs font-semibold">{{ post.comments?.length || 0 }}</span>
                        </div>
                        <!-- Delete button — solo visible al autor -->
                        <button v-if="post.authorId === authStore.user?.uid" @click="deletePost(post)"
                            class="ml-auto p-1.5 rounded-full text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Eliminar publicación">
                            <Trash2 class="w-4 h-4" />
                        </button>
                    </div>

                    <!-- Preview 2 Comments max -->
                    <div v-if="post.comments && post.comments.length > 0"
                        class="mt-4 space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                        <div v-for="c in post.comments.slice(-2)" :key="c.id" class="flex space-x-3">
                            <img
                                v-if="c.isPet || isPetAuthorName(c.authorName)"
                                src="/emociones/calma.png"
                                :alt="c.authorName"
                                class="w-6 h-6 rounded-[28%] object-cover mt-1 flex-shrink-0"
                            />
                            <img v-else-if="c.authorPhotoUrl" :src="c.authorPhotoUrl"
                                class="w-6 h-6 rounded-full object-cover mt-1 flex-shrink-0 border border-slate-200" />
                            <div class="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center mt-1 flex-shrink-0 text-[0.5rem] text-slate-500 font-bold uppercase"
                                v-else>{{ c.authorName.charAt(0) }}</div>
                            <div>
                                <span class="text-xs font-bold block text-slate-800 dark:text-slate-200"
                                    :class="{ 'text-amber-700 dark:text-amber-400': c.isPet || isPetAuthorName(c.authorName) }">{{
                                        c.authorName }}</span>
                                <p v-if="c.type === 'gif'"
                                    class="text-xs text-slate-600 leading-relaxed italic border-l-2 border-indigo-200 pl-2 opacity-80">
                                    [Envió una estampa de apoyo]</p>
                                <p v-else class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{{ c.text
                                }}</p>
                            </div>
                        </div>
                        <p v-if="post.comments.length > 2"
                            class="text-[0.65rem] text-center text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide mt-2">
                            Ver hilo completo ({{ post.comments.length }} comentarios)</p>
                    </div>
                </div>
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
    animation: fadeInUp 0.4s ease forwards;
}
</style>
