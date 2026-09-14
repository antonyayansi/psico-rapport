import { computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { Capacitor } from '@capacitor/core'

/**
 * Escritorio (puntero fino + hover + ≥1024px): landing que pide abrir en celular.
 * Tablets y celulares (incluido iPad) ven la app.
 */
export function useDesktopGate() {
  const desktopPointer = useMediaQuery('(min-width: 1024px) and (hover: hover) and (pointer: fine)')
  const isDesktop = computed(() => !Capacitor.isNativePlatform() && desktopPointer.value)
  return { isDesktop }
}
