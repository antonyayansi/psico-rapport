<script setup>
import { onMounted } from 'vue'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import '@/composables/useDarkMode' // inicializa useDark al arrancar la app
import { initFCM } from './composables/useFCM'

const router = useRouter()

onMounted(() => {
    // Listen for auth state changes
    onAuthStateChanged(auth, async (user) => {
        const authStore = useAuthStore()
        authStore.setUser(user)
        // Inicializar FCM si hay sesión activa (solicita permiso silenciosamente)
        if (user) {
            initFCM(user.uid)
        }
    })
})
</script>

<template>
    <div dir="ltr"
        class="h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased overflow-hidden flex flex-col items-center">
        <div
            class="w-full max-w-md bg-white dark:bg-slate-900 dark:border-x dark:border-slate-800 h-[100dvh] relative flex flex-col">
            <div class="flex-1 overflow-hidden relative flex flex-col">
                <router-view v-slot="{ Component }">
                    <transition name="fade" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </router-view>
            </div>

            <!-- Bottom Navigation Bar -->
            <nav v-if="!['Home', 'Login', 'Onboarding', 'Consent'].includes($route.name)"
                class="flex-none bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-1 py-2 flex justify-between items-center text-[0.65rem] font-medium pb-safe-area z-20">
                <button @click="router.push('/tracking')"
                    :class="$route.name === 'Tracking' ? 'text-green-600' : 'text-slate-400 hover:text-slate-600'"
                    class="flex flex-col items-center p-1.5 transition-colors flex-1">
                    <svg class="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z">
                        </path>
                    </svg>
                    Diario
                </button>
                <button @click="router.push('/uwu')"
                    :class="$route.name === 'UwuChat' ? 'text-green-600' : 'text-slate-400 hover:text-slate-600'"
                    class="flex flex-col items-center p-1.5 transition-colors flex-1">
                    <svg class="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z">
                        </path>
                    </svg>
                    Chat
                </button>
                <button @click="router.push('/pet')"
                    :class="$route.name === 'Pet' ? 'text-green-600' : 'text-slate-400 hover:text-slate-600'"
                    class="flex flex-col items-center p-1.5 transition-colors flex-1">
                    <svg class="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 21c4-3.5 7-6.2 7-10a4 4 0 00-7-2.7A4 4 0 005 11c0 3.8 3 6.5 7 10z" />
                        <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
                        <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
                    </svg>
                    Mascota
                </button>
                <button @click="router.push('/community')"
                    :class="$route.name === 'Community' ? 'text-green-600' : 'text-slate-400 hover:text-slate-600'"
                    class="flex flex-col items-center p-1.5 transition-colors flex-1 relative">
                    <svg class="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z">
                        </path>
                    </svg>
                    Foro
                </button>
                <button @click="router.push('/therapists')"
                    :class="['Therapists', 'TherapistProfile', 'TherapistRegister', 'Admin'].includes($route.name) ? 'text-green-600' : 'text-slate-400 hover:text-slate-600'"
                    class="flex flex-col items-center p-1.5 transition-colors flex-1">
                    <svg class="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01">
                        </path>
                    </svg>
                    Terapeutas
                </button>
                <button @click="router.push('/stats')"
                    :class="$route.name === 'Stats' ? 'text-green-600' : 'text-slate-400 hover:text-slate-600'"
                    class="flex flex-col items-center p-1.5 transition-colors flex-1">
                    <svg class="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z">
                        </path>
                    </svg>
                    Logros
                </button>
            </nav>
        </div>
    </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
}
</style>
