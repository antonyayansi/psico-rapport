<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth, googleProvider, db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth'
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth'
import { Capacitor } from '@capacitor/core'
import { ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const errorMsg = ref('')
const isSigningIn = ref(false)

const handleGoogleLogin = async () => {
    errorMsg.value = ''
    isSigningIn.value = true
    try {
        let result

        if (Capacitor.isNativePlatform()) {
            GoogleAuth.initialize({
                clientId: '339102139400-tf1rv64tn6v1ehjia7fmq2hvetaidigo.apps.googleusercontent.com',
                scopes: ['profile', 'email'],
                grantOfflineAccess: true,
            })

            const googleUser = await GoogleAuth.signIn()
            if (!googleUser?.authentication?.idToken) {
                throw new Error('auth-incomplete')
            }

            const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken)
            result = await signInWithCredential(auth, credential)
        } else {
            const { signInWithPopup } = await import('firebase/auth')
            result = await signInWithPopup(auth, googleProvider)
        }

        if (result && result.user) {
            const userDoc = await getDoc(doc(db, 'users', result.user.uid))
            if (!userDoc.exists() || userDoc.data().consentAccepted === false) {
                router.push('/consent')
                return
            }
            const prefDoc = await getDoc(doc(db, 'preferencias', result.user.uid))
            router.push(prefDoc.exists() ? '/uwu' : '/onboarding')
        }
    } catch (error) {
        const cancelled = error?.code === 'auth/popup-closed-by-user'
            || error?.code === 'auth/cancelled-popup-request'
            || /cancel|closed/i.test(String(error?.message || ''))
        if (cancelled) return
        console.error('Login error:', error)
        errorMsg.value = 'No se pudo entrar. Inténtalo de nuevo.'
    } finally {
        isSigningIn.value = false
    }
}
</script>

<template>
    <div dir="ltr" class="h-full flex flex-col p-6 flex-1 bg-sage-50 dark:bg-slate-950 relative text-slate-800 dark:text-slate-100">
        <button @click="router.back()"
            class="absolute top-6 left-6 p-2 rounded-full text-slate-500">
            <ArrowLeft class="w-5 h-5" />
        </button>

        <div class="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full space-y-8">
            <div class="text-center space-y-3">
                <img src="/emociones/feliz.png" alt="Uwu" class="w-28 h-24 mx-auto rounded-[1.6rem] object-cover" />
                <h2 class="font-display text-3xl text-ink">Hola de nuevo</h2>
                <p class="text-slate-500 text-sm leading-relaxed">
                    Entra con calma. Uwu te espera donde lo dejaste.
                </p>
            </div>

            <div class="space-y-4">
                <button @click="handleGoogleLogin" :disabled="isSigningIn"
                    class="w-full flex items-center justify-center space-x-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100 py-3.5 px-4 rounded-full font-medium shadow-[0_8px_30px_rgba(47,53,48,0.06)] dark:shadow-none active:scale-[0.98] transition-transform disabled:opacity-60">
                    <svg class="h-5 w-5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4" />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853" />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05" />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335" />
                    </svg>
                    <span>Continuar con Google</span>
                </button>
            </div>

            <p v-if="errorMsg" class="text-sm text-center text-slate-500">
                {{ errorMsg }}
            </p>

        </div>
    </div>
</template>
