<script setup>
import { onMounted } from 'vue'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useAuthStore } from './stores/auth'
import '@/composables/useDarkMode' // inicializa useDark al arrancar la app
import { initFCM } from './composables/useFCM'
import { useDesktopGate } from './composables/useDesktopGate'
import DesktopWelcome from './components/DesktopWelcome.vue'
import BottomDock from './components/BottomDock.vue'

const { isDesktop } = useDesktopGate()

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
    <DesktopWelcome v-if="isDesktop" />
    <div v-else dir="ltr"
        class="h-[100dvh] bg-sage-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased overflow-hidden flex flex-col items-center">
        <div
            class="w-full max-w-md md:max-w-2xl lg:max-w-3xl bg-sage-50 dark:bg-slate-950 h-[100dvh] relative flex flex-col">
            <div class="flex-1 overflow-hidden relative flex flex-col">
                <router-view v-slot="{ Component }">
                    <transition name="fade" mode="out-in">
                        <component :is="Component" />
                    </transition>
                </router-view>
            </div>

            <BottomDock v-if="!['Home', 'Login', 'Onboarding', 'Consent'].includes($route.name)" />
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
