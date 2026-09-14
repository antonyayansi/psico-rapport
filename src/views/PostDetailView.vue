<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Send, Sparkles, X, Heart, Search, Lock } from 'lucide-vue-next'
import { db } from '../firebase'
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { useAuthStore } from '../stores/auth'
import { isPetAuthorName } from '../pet'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const postId = route.params.id
const post = ref(null)
const newComment = ref('')
const isPublishing = ref(false)
const showGifDrawer = ref(false)
const gifSearchQuery = ref('')
const isSearchingGifs = ref(false)

// Límite de comentarios para usuarios normales: máximo 3 por post
const MAX_USER_COMMENTS_PER_POST = 3
const myCommentCount = computed(() => {
    if (authStore.isTherapist) return 0
    if (!post.value?.comments || !authStore.user) return 0
    return post.value.comments.filter(c => c.authorId === authStore.user.uid).length
})
const canComment = computed(() => authStore.isTherapist || myCommentCount.value < MAX_USER_COMMENTS_PER_POST)

// Prototipo de estampas curadas estilo Instagram sin usar API externa por ahora
const emotionalGifs = [
    'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjR6ZnYzaXJ4N3ZqYnd3OHMxeWV6ZW52ZnBteW02czlpeHlzaGR0aSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/EFenCRE0j0H6M/giphy.gif',
    'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdvNHdzNWxmaDFxMnJ2bThzc3V3NjBvdG5wbndhNzJvdG5wMmcwayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Vz58J8shFW6BvqnYTm/giphy.gif',
    'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcXB2ZmxtMnB2d3A3YXlxOW1qOWxrcWNsaHBoYWNpcGV4eGxmbGV6OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/KL7xA3fLx7bna/giphy.gif'
]

const currentGifs = ref([...emotionalGifs])

const searchGifs = async () => {
    const query = gifSearchQuery.value.trim()
    if (!query) {
        currentGifs.value = [...emotionalGifs]
        return
    }

    const apiKey = import.meta.env.VITE_GIPHY_API_KEY
    if (!apiKey) {
        console.warn("No Giphy API Key found in .env")
        return
    }

    isSearchingGifs.value = true
    try {
        const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=12&rating=g`)
        const data = await res.json()
        if (data.data) {
            currentGifs.value = data.data.map(g => g.images.downsized_medium.url)
        }
    } catch (error) {
        console.error("Error searching gifs", error)
    } finally {
        isSearchingGifs.value = false
    }
}

let searchTimeout = null
watch(gifSearchQuery, (newVal) => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        searchGifs()
    }, 500)
})

let unsubscribe = null

onMounted(() => {
    const postRef = doc(db, 'community_posts', postId)
    unsubscribe = onSnapshot(postRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data()
            post.value = {
                id: docSnap.id,
                ...data,
                likedBy: data.likedBy || [],
                time: data.timestamp ? new Date(data.timestamp.toDate()).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '...'
            }
        } else {
            router.push('/community')
        }
    })
})

onUnmounted(() => {
    if (unsubscribe) unsubscribe()
})

const sendComment = async (type = 'text', content = '') => {
    const finalContent = type === 'text' ? newComment.value.trim() : content
    if (!finalContent) return
    if (!canComment.value) return

    isPublishing.value = true
    if (type === 'gif') showGifDrawer.value = false

    try {
        const postRef = doc(db, 'community_posts', postId)
        await updateDoc(postRef, {
            comments: arrayUnion({
                id: Date.now(),
                type: type,
                text: type === 'text' ? finalContent : '',
                gifUrl: type === 'gif' ? finalContent : '',
                authorId: authStore.user.uid,
                authorName: authStore.user.displayName ? authStore.user.displayName.split(' ')[0] : 'Explorador',
                authorPhotoUrl: authStore.user.photoURL || null,
                date: new Date().toISOString()
            })
        })

        if (type === 'text') {
            newComment.value = ''
        }
    } catch (e) {
        console.error("Error sending comment", e)
    } finally {
        isPublishing.value = false
    }
}

const toggleLike = async () => {
    if (!post.value) return
    try {
        const postRef = doc(db, 'community_posts', post.value.id)
        const activeUid = authStore.user.uid
        const likesArray = post.value.likedBy || []

        if (likesArray.includes(activeUid)) {
            await updateDoc(postRef, { likedBy: arrayRemove(activeUid) })
        } else {
            await updateDoc(postRef, { likedBy: arrayUnion(activeUid) })
        }
    } catch (e) {
        console.error(e)
    }
}

const isLikedByUser = () => {
    return post.value?.likedBy?.includes(authStore.user?.uid)
}

</script>

<template>
    <div dir="ltr" class="h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
        <!-- Header -->
        <header
            class="flex-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 p-4 px-6 z-20 flex items-center">
            <button @click="router.back()"
                class="p-2 -ml-2 rounded-full hover:bg-slate-100/50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 transition-colors">
                <ArrowLeft class="w-6 h-6" />
            </button>
            <div class="ml-3">
                <h1 class="font-bold text-lg leading-tight text-slate-900 dark:text-slate-100">Comunidad</h1>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">Hilo de Conversación</p>
            </div>
        </header>

        <!-- Main Scrollable Area -->
        <div class="flex-1 overflow-y-auto w-full smooth-scrollbar pb-32">
            <!-- Skeleton Loading -->
            <div v-if="!post" class="p-6 space-y-4 animate-pulse">
                <div class="h-24 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
            </div>

            <!-- Actual Content -->
            <div v-else class="p-4 sm:p-6 space-y-6">
                <!-- Main Post Hero Card -->
                <div
                    class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/50 dark:border-slate-800/50 relative overflow-hidden group">

                    <div class="relative z-10 flex space-x-3 items-center mb-6">
                        <img v-if="post.authorPhotoUrl" :src="post.authorPhotoUrl"
                            class="w-10 h-10 rounded-full object-cover border-2 border-white flex-shrink-0" />
                        <div v-else
                            class="w-10 h-10 bg-green-100 dark:bg-green-900/40 border-2 border-white dark:border-slate-700 rounded-full flex items-center justify-center text-green-700 dark:text-green-400 text-sm font-bold uppercase flex-shrink-0">
                            {{ post.authorName.charAt(0) }}</div>
                        <div>
                            <span class="font-extrabold text-slate-900 dark:text-slate-100 block text-base">{{ post.authorName }}</span>
                            <span class="text-xs text-slate-400 dark:text-slate-500 font-medium">{{ post.time }}</span>
                        </div>
                    </div>

                    <h2
                        class="relative z-10 text-slate-800 dark:text-slate-100 text-lg sm:text-xl font-medium leading-relaxed tracking-tight whitespace-pre-wrap mb-6">
                        {{ post.content }}</h2>

                    <!-- Image if present -->
                    <div v-if="post.imageUrl"
                        class="relative z-10 w-full mb-6 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
                        <img :src="post.imageUrl" class="w-full h-auto object-contain max-h-[40vh]" loading="lazy" />
                    </div>

                    <div class="relative z-10 flex items-center mt-2">
                        <button @click="toggleLike"
                            class="flex items-center space-x-2 group-hover:scale-105 transition-all text-sm px-4 py-2 bg-slate-50/50 dark:bg-slate-800/50 rounded-full border border-slate-100 dark:border-slate-700">
                            <Heart class="w-5 h-5 transition-all"
                                :class="isLikedByUser() ? 'fill-red-500 text-red-500 scale-110' : 'text-slate-400 group-hover:text-red-400'" />
                            <span class="font-bold" :class="isLikedByUser() ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'">{{
                                post.likedBy?.length || 0 }}</span>
                        </button>
                    </div>
                </div>

                <!-- Comments Section -->
                <div class="space-y-4 pt-2">
                    <h3 class="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center px-2">
                        <span>Comentarios y Respuestas</span>
                        <span class="ml-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-[0.65rem]">{{
                            post.comments?.length
                            || 0}}</span>
                    </h3>

                    <div v-for="c in post.comments" :key="c.id" class="flex space-x-3 px-1 animate-fade-in-up">
                        <img
                            v-if="c.isPet || isPetAuthorName(c.authorName)"
                            src="/emociones/calma.png"
                            :alt="c.authorName"
                            class="w-8 h-8 rounded-[28%] object-cover mt-1 flex-shrink-0"
                        />
                        <img v-else-if="c.authorPhotoUrl" :src="c.authorPhotoUrl"
                            class="w-8 h-8 rounded-full object-cover mt-1 flex-shrink-0 border border-slate-200 dark:border-slate-700" />
                        <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 text-xs mt-1 flex-shrink-0 font-bold uppercase"
                            v-else>{{ c.authorName.charAt(0) }}</div>

                        <div class="flex-1 bg-white dark:bg-slate-900 p-4 rounded-3xl rounded-tl-sm border border-slate-100 dark:border-slate-800 relative">
                            <!-- Si es de la IA -->
                            <Sparkles v-if="c.isPet || isPetAuthorName(c.authorName)"
                                class="w-3 h-3 text-amber-400 absolute top-3 right-4 opacity-50" />

                            <span class="text-xs font-bold block text-slate-800 dark:text-slate-200 mb-1"
                                :class="{ 'text-amber-700 dark:text-amber-400': c.isPet || isPetAuthorName(c.authorName) }">{{ c.authorName }}</span>

                            <div v-if="c.type === 'gif'"
                                class="mt-2 text-center rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                                <img :src="c.gifUrl"
                                    class="max-w-[200px] h-auto rounded-xl mx-auto inline-block dark:mix-blend-normal mix-blend-multiply" />
                            </div>
                            <p v-else class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{{ c.text }}</p>
                        </div>
                    </div>

                    <div v-if="!post.comments || post.comments.length === 0"
                        class="text-center text-slate-400 dark:text-slate-500 py-8 text-sm">
                        Nadie ha respondido aún. ¡Sé el primero!
                    </div>
                </div>
            </div>
        </div>

        <!-- GIF Drawer (Flotante) -->
        <div :class="showGifDrawer ? 'translate-y-0 opacity-100 visible' : 'translate-y-full opacity-0 invisible'"
            class="absolute bottom-[4.5rem] left-0 w-full z-10 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <div class="mx-auto max-w-sm w-[95%] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 mb-2">
                <div class="flex justify-between items-center mb-3">
                    <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Enviar GIF de Apoyo</span>
                    <button @click="showGifDrawer = false"
                        class="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 p-1.5 rounded-full text-slate-500 dark:text-slate-400 transition-colors">
                        <X class="w-4 h-4" />
                    </button>
                </div>

                <div class="mb-3 relative">
                    <input v-model="gifSearchQuery" type="text" placeholder="Buscar GIFs..."
                        class="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2 pl-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-green-500/20 text-slate-700 dark:text-slate-200 placeholder:text-slate-400" />
                    <Search class="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                    <div v-if="isSearchingGifs" class="absolute right-9 top-2.5 flex items-center h-5">
                        <span
                            class="w-3 h-3 border-2 border-slate-200 border-t-green-500 rounded-full animate-spin block"></span>
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 smooth-scrollbar">
                    <button v-for="(gif, i) in currentGifs" :key="i" @click="sendComment('gif', gif)"
                        class="rounded-xl overflow-hidden active:scale-95 transition-transform bg-slate-100 dark:bg-slate-800 border border-transparent hover:border-green-200 dark:hover:border-green-700">
                        <img :src="gif" class="w-full h-24 object-cover mix-blend-multiply dark:mix-blend-normal" loading="lazy" />
                    </button>
                </div>
            </div>
        </div>

        <!-- Input Footer Constrained -->
        <div
            class="absolute bottom-0 left-0 w-full flex-none bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-800/50 p-3 px-4 z-20">

            <!-- Límite alcanzado para usuarios normales -->
            <div v-if="!canComment"
                class="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                <Lock class="w-4 h-4 flex-shrink-0" />
                <span>Has alcanzado el límite de {{ MAX_USER_COMMENTS_PER_POST }} comentarios en esta publicación.</span>
            </div>

            <div v-else
                class="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-full pr-1.5 focus-within:ring-2 focus-within:ring-green-500/20 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
                <!-- Botón de Sticker/GIF -->
                <button @click="showGifDrawer = !showGifDrawer"
                    class="ml-2 p-2 rounded-full cursor-pointer text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                    title="Enviar Estampa GIF">
                    <Sparkles class="w-5 h-5" />
                </button>

                <input v-model="newComment" @keyup.enter="sendComment('text')" type="text"
                    placeholder="Escribe una respuesta amable..."
                    class="flex-1 bg-transparent border-none py-3.5 px-2 outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 text-sm" />

                <button @click="sendComment('text')" :disabled="!newComment.trim() || isPublishing"
                    class="p-2.5 rounded-full text-white bg-green-500 disabled:bg-slate-300 disabled:text-slate-100 hover:bg-green-600 transition-colors ">
                    <Send class="w-4 h-4 -ml-0.5 mt-0.5" />
                </button>
            </div>
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
    animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.smooth-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.smooth-scrollbar::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 9999px;
}
</style>
