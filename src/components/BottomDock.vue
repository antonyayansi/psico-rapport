<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Heart, MessageCircle, Plus, User, Users, PawPrint, Stethoscope } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const plusOpen = ref(false)

const tabs = [
  { name: 'Chat', to: '/uwu', icon: MessageCircle, match: ['UwuChat'] },
  { name: 'Diario', to: '/tracking', icon: Heart, match: ['Tracking'] },
  { name: 'Foro', to: '/community', icon: Users, match: ['Community', 'PostDetail'] },
  { name: 'Tú', to: '/stats', icon: User, match: ['Stats'] }
]

const plusItems = [
  { name: 'Cuidar a Uwu', to: '/pet', icon: PawPrint },
  { name: 'Terapeutas', to: '/matching', icon: Stethoscope }
]

const plusActive = computed(() =>
  ['Pet', 'Matching', 'Therapists', 'TherapistProfile', 'TherapistRegister', 'Admin'].includes(route.name)
)

const isTabActive = (tab) => tab.match.includes(route.name)

const go = (to) => {
  plusOpen.value = false
  if (route.path !== to) router.push(to)
}

watch(() => route.fullPath, () => {
  plusOpen.value = false
})
</script>

<template>
  <nav
    class="relative flex-none z-20 px-4 pt-1 pb-[max(0.7rem,env(safe-area-inset-bottom))] bg-sage-50 dark:bg-slate-950"
    aria-label="Navegación principal"
  >
    <button
      v-if="plusOpen"
      type="button"
      class="fixed inset-0 z-10 cursor-default"
      aria-label="Cerrar menú"
      @click="plusOpen = false"
    />

    <div class="relative z-20 flex items-center justify-center gap-3">
      <div
        class="flex items-center gap-0.5 rounded-full bg-white dark:bg-zinc-900 px-1.5 py-1.5 shadow-[0_10px_32px_rgba(47,53,48,0.08)] dark:shadow-[0_10px_32px_rgba(0,0,0,0.4)]"
      >
        <button
          v-for="tab in tabs"
          :key="tab.to"
          type="button"
          :aria-label="tab.name"
          :aria-current="isTabActive(tab) ? 'page' : undefined"
          class="w-11 h-11 rounded-full flex items-center justify-center active:scale-[0.94] transition-transform duration-150"
          :class="isTabActive(tab)
            ? 'bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950'
            : 'text-zinc-400 dark:text-zinc-500'"
          @click="go(tab.to)"
        >
          <component
            :is="tab.icon"
            class="w-[22px] h-[22px]"
            :stroke-width="isTabActive(tab) ? 2 : 1.8"
            :fill="isTabActive(tab) ? 'currentColor' : 'none'"
          />
        </button>
      </div>

      <div class="relative">
        <Transition name="dock-sheet">
          <div
            v-if="plusOpen"
            class="absolute bottom-[calc(100%+0.7rem)] right-0 w-52 rounded-[1.35rem] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-1.5 shadow-[0_12px_40px_rgba(47,53,48,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
          >
            <button
              v-for="item in plusItems"
              :key="item.to"
              type="button"
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-[1.05rem] text-sm text-zinc-700 dark:text-zinc-200 active:bg-zinc-100 dark:active:bg-zinc-800"
              @click="go(item.to)"
            >
              <component :is="item.icon" class="w-4 h-4" :stroke-width="1.8" />
              <span>{{ item.name }}</span>
            </button>
          </div>
        </Transition>

        <button
          type="button"
          aria-label="Más"
          :aria-expanded="plusOpen"
          class="w-14 h-14 rounded-full flex items-center justify-center text-zinc-800 active:scale-[0.94] transition-transform duration-150 shadow-[0_8px_24px_rgba(168,197,90,0.28)]"
          :class="plusOpen || plusActive ? 'bg-[#b6e85a]' : 'bg-[#c8f06c]'"
          @click="plusOpen = !plusOpen"
        >
          <Plus
            class="w-7 h-7 transition-transform duration-200"
            :class="plusOpen ? 'rotate-45' : ''"
            :stroke-width="2.4"
          />
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.dock-sheet-enter-active,
.dock-sheet-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}
.dock-sheet-enter-from,
.dock-sheet-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .dock-sheet-enter-active,
  .dock-sheet-leave-active,
  button {
    transition: none;
  }
}
</style>
