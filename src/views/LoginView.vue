<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth, googleProvider, db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth'
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth'
import { Capacitor } from '@capacitor/core'
import { ArrowLeft, LogIn } from 'lucide-vue-next'

const router = useRouter()
const errorMsg = ref('')
const debugLogs = ref([])

const addLog = (msg) => {
    console.log(msg)
    debugLogs.value.push(msg)
}

const handleGoogleLogin = async () => {
    errorMsg.value = ''
    debugLogs.value = []
    try {
        let result;
        addLog("Iniciando login...")

        if (Capacitor.isNativePlatform()) {
            addLog("Plataforma Nativa (Android/iOS)")
            GoogleAuth.initialize({
                clientId: '339102139400-tf1rv64tn6v1ehjia7fmq2hvetaidigo.apps.googleusercontent.com', 
                scopes: ['profile', 'email'],
                grantOfflineAccess: true,
            });
            addLog("Llamando a GoogleAuth.signIn()...")
            
            const googleUser = await GoogleAuth.signIn()
            addLog("Éxito en Plugin Native. Validando token...")
            
            if (!googleUser || !googleUser.authentication) {
                throw new Error("No hay data de auth")
            }
            
            const idToken = googleUser.authentication.idToken
            addLog("Token obtenido. Enviando a Firebase...")
            
            const credential = GoogleAuthProvider.credential(idToken)
            result = await signInWithCredential(auth, credential)
            addLog("Autenticado en Firebase exitosamente.")
        } else {
            addLog("Plataforma Web. Usando Popup...")
            const { signInWithPopup } = await import('firebase/auth')
            result = await signInWithPopup(auth, googleProvider)
        }

        if (result && result.user) {
            // Verificar consentimiento y onboarding
            const userDoc = await getDoc(doc(db, 'users', result.user.uid))
            if (!userDoc.exists() || userDoc.data().consentAccepted === false) {
                addLog("Redirigiendo a /consent")
                router.push('/consent')
                return
            }
            const prefDoc = await getDoc(doc(db, 'preferencias', result.user.uid))
            if (prefDoc.exists()) {
                addLog("Redirigiendo a /uwu")
                router.push('/uwu')
            } else {
                addLog("Redirigiendo a /onboarding")
                router.push('/onboarding')
            }
        }
    } catch (error) {
        let errStr = "Parse Error"
        if (error && typeof error === 'object') {
            errStr = `Message: ${error.message} - Code: ${error.code} - Todo: ${JSON.stringify(error)}`
        } else {
            errStr = String(error)
        }
        
        addLog("ERROR ATRAPADO: " + errStr)
        errorMsg.value = `Error: ${errStr}`
    }
}
</script>

<template>
    <div dir="ltr" class="h-full flex flex-col p-6 flex-1 bg-white relative text-slate-800">
        <button @click="router.back()"
            class="absolute top-6 left-6 p-2 rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft class="w-6 h-6 text-slate-600" />
        </button>

        <div class="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full space-y-8">
            <div class="text-center space-y-3">
                <h2 class="text-3xl font-bold text-slate-900">Bienvenido de vuelta</h2>
                <p class="text-slate-500 text-sm">Inicia sesión y continúa tu camino hacia el bienestar mental con PsicoRapport.
                </p>
            </div>

            <div class="space-y-4">
                <button @click="handleGoogleLogin"
                    class="w-full flex items-center justify-center space-x-3 bg-white border-2 border-slate-200 text-slate-700 py-3.5 px-4 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95">
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

            <p v-if="errorMsg" class="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100 break-words">
                {{ errorMsg }}</p>

            <div v-if="debugLogs.length > 0" class="text-left bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-[10px] sm:text-xs overflow-y-auto max-h-48 break-words flex flex-col space-y-1 mt-4">
                <div v-for="(log, idx) in debugLogs" :key="idx">> {{ log }}</div>
            </div>

        </div>
    </div>
</template>
