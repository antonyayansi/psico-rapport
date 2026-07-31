<script setup>
import { useRouter } from 'vue-router'
import { Sparkles, HeartPulse } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
    <div dir="ltr"
        class="h-full flex flex-col items-center justify-center bg-gradient-to-br from-green-800 to-green-950 p-6 flex-1 text-white relative">
        <!-- Decoración de fondo -->
        <div class="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
            <div class="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-green-400 blur-3xl"></div>
            <div class="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-emerald-400 blur-3xl"></div>
        </div>

        <div class="flex flex-col items-center z-10 space-y-6">
            <div class="bg-white/10 p-5 rounded-full backdrop-blur-md border border-white/20 animate-fade-in-up">
                <HeartPulse class="w-16 h-16 text-green-300" />
            </div>

            <div class="text-center space-y-2 animate-fade-in-up" style="animation-delay: 100ms;">
                <h1 class="text-4xl font-extrabold tracking-tight">Psico<span class="text-green-300">Rapport</span></h1>
                <p class="text-green-100 text-lg">Tu espacio seguro para sanar.</p>
            </div>

            <div class="pt-8 w-full animate-fade-in-up" style="animation-delay: 200ms;">
                <button @click="router.push('/login')"
                    class="w-full flex items-center justify-center space-x-2 bg-white text-green-900 py-4 px-6 rounded-2xl font-bold text-lg hover:bg-green-50 transition-all hover:scale-105 active:scale-95">
                    <span>Comenzar mi viaje</span>
                    <Sparkles class="w-5 h-5 text-green-600" />
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
    animation: fadeInUp 0.8s ease forwards;
    opacity: 0;
}
</style>
