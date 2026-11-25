<script setup>
import { computed } from 'vue'
import { DEFAULT_PET_NAME, getPetColor, getPetAccessory, resolveEmotion } from '../pet'

const props = defineProps({
  name: { type: String, default: DEFAULT_PET_NAME },
  color: { type: String, default: 'amber' },
  accessory: { type: String, default: 'none' },
  moodLevel: { type: Number, default: 3 },
  moodKey: { type: String, default: '' },
  size: { type: String, default: 'md' }, // sm | md | lg
  showName: { type: Boolean, default: false },
  animate: { type: Boolean, default: true }
})

const colorMeta = computed(() => getPetColor(props.color))
const accessoryMeta = computed(() => getPetAccessory(props.accessory))
const face = computed(() => resolveEmotion({
  moodKey: props.moodKey,
  moodLevel: props.moodLevel
}))

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'w-11 h-11'
  if (props.size === 'lg') return 'w-44 h-44'
  return 'w-28 h-28'
})

const accessoryClass = computed(() => {
  if (props.size === 'sm') return 'text-sm -top-0.5 -right-0.5'
  if (props.size === 'lg') return 'text-3xl -top-1 -right-1'
  return 'text-xl -top-1 -right-1'
})
</script>

<template>
  <div class="flex flex-col items-center">
    <div
      class="relative"
      :class="[sizeClass, animate ? 'pet-bob' : '']"
    >
      <img
        :src="face.src"
        :alt="`${name} · ${face.label}`"
        class="w-full h-full object-cover rounded-[22%] select-none pointer-events-none"
        :class="face.pulse ? 'animate-pulse' : ''"
        draggable="false"
      />
      <span
        class="absolute inset-0 rounded-[22%] pointer-events-none ring-2 ring-white/80 dark:ring-slate-800"
        :style="{ boxShadow: `0 10px 28px ${colorMeta.hex}40` }"
      />
      <span
        v-if="accessoryMeta.emoji"
        class="absolute drop-shadow"
        :class="accessoryClass"
        aria-hidden="true"
      >{{ accessoryMeta.emoji }}</span>
    </div>
    <p v-if="showName" class="mt-2 text-sm font-medium text-slate-600 dark:text-slate-200">
      {{ name }}
    </p>
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
@media (prefers-reduced-motion: reduce) {
  .pet-bob { animation: none; }
}
</style>
