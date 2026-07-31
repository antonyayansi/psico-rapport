<script setup>
import { computed } from 'vue'
import { getPetColor, getPetAccessory, getMoodFace } from '../pet'

const props = defineProps({
  name: { type: String, default: 'PsicoRapport' },
  color: { type: String, default: 'amber' },
  accessory: { type: String, default: 'none' },
  moodLevel: { type: Number, default: 0 },
  size: { type: String, default: 'md' }, // sm | md | lg
  showName: { type: Boolean, default: false },
  animate: { type: Boolean, default: true }
})

const colorMeta = computed(() => getPetColor(props.color))
const accessoryMeta = computed(() => getPetAccessory(props.accessory))
const face = computed(() => getMoodFace(props.moodLevel))

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'w-16 h-16 text-3xl'
  if (props.size === 'lg') return 'w-40 h-40 text-7xl'
  return 'w-28 h-28 text-5xl'
})
</script>

<template>
  <div class="flex flex-col items-center">
    <div
      class="relative rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-sm"
      :class="[sizeClass, colorMeta.bg, animate ? 'pet-bob' : '']"
      :style="{ boxShadow: `0 8px 24px ${colorMeta.hex}33` }"
    >
      <span class="select-none leading-none" :class="face.pulse">{{ face.emoji }}</span>
      <span
        v-if="accessoryMeta.emoji"
        class="absolute -top-1 -right-1 text-xl drop-shadow"
        aria-hidden="true"
      >{{ accessoryMeta.emoji }}</span>
      <!-- Orejas -->
      <span
        class="absolute -top-1 left-2 w-4 h-4 rounded-full border-2 border-white/80"
        :class="colorMeta.face"
      />
      <span
        class="absolute -top-1 right-2 w-4 h-4 rounded-full border-2 border-white/80"
        :class="colorMeta.face"
      />
    </div>
    <p v-if="showName" class="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">{{ name }}</p>
  </div>
</template>

<style scoped>
.pet-bob {
  animation: petBob 3s ease-in-out infinite;
}
@keyframes petBob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
</style>
