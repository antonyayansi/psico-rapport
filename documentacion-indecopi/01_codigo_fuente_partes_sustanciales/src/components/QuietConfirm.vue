<script setup>
import { Trash2 } from 'lucide-vue-next'

defineProps({
  title: { type: String, default: 'Confirmar' },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Borrar' },
  cancelLabel: { type: String, default: 'Cancelar' }
})

const visible = defineModel({ type: Boolean, default: false })
const emit = defineEmits(['confirm'])

const close = () => { visible.value = false }
const accept = () => {
  visible.value = false
  emit('confirm')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="quiet-confirm">
      <div
        v-if="visible"
        class="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4"
      >
        <button
          type="button"
          class="absolute inset-0 bg-zinc-950/50 backdrop-blur-[6px]"
          aria-label="Cerrar"
          @click="close"
        />
        <div
          role="dialog"
          aria-modal="true"
          class="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[1.75rem] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
        >
          <div class="w-11 h-11 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-300 flex items-center justify-center mx-auto mb-4">
            <Trash2 class="w-5 h-5" />
          </div>
          <h2 class="font-display text-xl text-center text-ink mb-2">{{ title }}</h2>
          <p class="text-center text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {{ message }}
          </p>
          <div class="mt-6 flex flex-col gap-2">
            <button
              type="button"
              class="w-full py-3.5 rounded-full font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 active:scale-[0.98] transition-transform"
              @click="accept"
            >
              {{ confirmLabel }}
            </button>
            <button
              type="button"
              class="w-full py-3 rounded-full font-medium text-zinc-500 dark:text-zinc-400"
              @click="close"
            >
              {{ cancelLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.quiet-confirm-enter-active,
.quiet-confirm-leave-active {
  transition: opacity 0.2s ease;
}
.quiet-confirm-enter-active > div:last-child,
.quiet-confirm-leave-active > div:last-child {
  transition: transform 0.22s ease;
}
.quiet-confirm-enter-from,
.quiet-confirm-leave-to {
  opacity: 0;
}
.quiet-confirm-enter-from > div:last-child,
.quiet-confirm-leave-to > div:last-child {
  transform: translateY(12px);
}
</style>
