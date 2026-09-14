import { onMounted, ref } from 'vue'
import { Capacitor } from '@capacitor/core'

const deferredPrompt = ref(null)
const canInstall = ref(false)
const isInstalled = ref(false)
let listening = false

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true
}

function isIosSafari() {
  const ua = window.navigator.userAgent || ''
  const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const safari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|Chrome/.test(ua)
  return iOS && safari
}

function listenForInstallPrompt() {
  if (listening || typeof window === 'undefined') return
  if (Capacitor.isNativePlatform()) return
  listening = true

  if (isStandalone()) {
    isInstalled.value = true
    return
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt.value = event
    canInstall.value = true
  })

  window.addEventListener('appinstalled', () => {
    canInstall.value = false
    deferredPrompt.value = null
    isInstalled.value = true
  })
}

export function registerPwaWorker() {
  if (typeof window === 'undefined') return
  if (Capacitor.isNativePlatform()) return
  listenForInstallPrompt()
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' }).catch(() => {})
  }
}

export function useInstallPrompt() {
  const showIosHint = ref(false)

  onMounted(() => {
    if (Capacitor.isNativePlatform() || isStandalone()) return
    showIosHint.value = isIosSafari()
  })

  const install = async () => {
    if (!deferredPrompt.value) return
    deferredPrompt.value.prompt()
    await deferredPrompt.value.userChoice
    deferredPrompt.value = null
    canInstall.value = false
  }

  return { canInstall, isInstalled, showIosHint, install }
}
