<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuthStore } from '../stores/auth'
import PetAvatar from '../components/PetAvatar.vue'
import {
  PET_COLORS, PET_ACCESSORIES, savePetCustomization, careForPet, decayStats, DEFAULT_PET_NAME
} from '../pet'
import { processUserAction } from '../gamification'
import { STAGE_META } from '../transition'
import {
  ArrowLeft, Utensils, Gamepad2, Moon, Save
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const name = ref(DEFAULT_PET_NAME)
const color = ref('amber')
const accessory = ref('none')
const hunger = ref(80)
const happiness = ref(80)
const energy = ref(80)
const moodLevel = ref(3)
const moodKey = ref('calma')
const saving = ref(false)
const caring = ref(null)
const savedFlash = ref(false)

const stageMeta = computed(() => STAGE_META[authStore.transitionStage] || STAGE_META.dependency)

const applyPet = (raw) => {
  const pet = decayStats(raw || {})
  name.value = pet.name || DEFAULT_PET_NAME
  color.value = pet.color || 'amber'
  accessory.value = pet.accessory || 'none'
  hunger.value = pet.hunger ?? 80
  happiness.value = pet.happiness ?? 80
  energy.value = pet.energy ?? 80
  moodLevel.value = pet.moodLevel ?? 3
  moodKey.value = pet.moodKey || ''
}

onMounted(() => {
  const uid = authStore.user?.uid
  if (!uid) return
  onSnapshot(doc(db, 'pets', uid), (snap) => {
    if (snap.exists()) applyPet(snap.data())
    else if (authStore.pet) applyPet(authStore.pet)
  })
})

const save = async () => {
  saving.value = true
  try {
    await savePetCustomization(authStore.user.uid, {
      name: name.value,
      color: color.value,
      accessory: accessory.value
    })
    await authStore.refreshPet()
    savedFlash.value = true
    setTimeout(() => { savedFlash.value = false }, 2000)
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

const care = async (action) => {
  caring.value = action
  try {
    const stats = await careForPet(authStore.user.uid, action)
    hunger.value = stats.hunger
    happiness.value = stats.happiness
    energy.value = stats.energy
    await processUserAction(authStore.user.uid, 'petCare')
    await authStore.loadUserProfile(authStore.user.uid)
  } catch (e) {
    console.error(e)
  } finally {
    caring.value = null
  }
}

const barClass = (v) => {
  if (v >= 70) return 'bg-green-600'
  if (v >= 40) return 'bg-amber-300'
  return 'bg-rose-300'
}
</script>

<template>
  <div dir="ltr" class="h-full flex flex-col bg-sage-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-y-auto">
    <header class="flex items-center p-4 px-5">
      <button @click="router.back()" class="p-2 -ml-2 rounded-full text-slate-500">
        <ArrowLeft class="w-5 h-5" />
      </button>
      <h1 class="font-display text-xl ml-1">{{ name }}</h1>
    </header>

    <div class="p-5 space-y-5 pb-24">
      <div class="card-soft p-4">
        <p class="text-xs tracking-[0.14em] uppercase text-green-700/70 dark:text-slate-400 font-semibold mb-1">
          Etapa: {{ stageMeta.label }}
        </p>
        <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{{ stageMeta.description }}</p>
        <p v-if="stageMeta.nextHint" class="text-xs text-slate-400 mt-2">{{ stageMeta.nextHint }}</p>
      </div>

      <div class="flex flex-col items-center py-2">
        <PetAvatar
          :name="name"
          :color="color"
          :accessory="accessory"
          :mood-level="moodLevel"
          :mood-key="moodKey"
          size="lg"
          show-name
        />
        <p class="text-xs text-slate-400 mt-1">Refleja cómo te sientes hoy</p>
      </div>

      <section class="card-soft p-5 space-y-3">
        <h2 class="font-display text-lg text-ink">Cuidado</h2>
        <div v-for="stat in [
          { key: 'Hambre', val: hunger },
          { key: 'Felicidad', val: happiness },
          { key: 'Energía', val: energy }
        ]" :key="stat.key" class="space-y-1">
          <div class="flex justify-between text-xs font-medium text-slate-500">
            <span>{{ stat.key }}</span><span>{{ Math.round(stat.val) }}%</span>
          </div>
          <div class="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500" :class="barClass(stat.val)" :style="{ width: `${stat.val}%` }" />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2 pt-2">
          <button
            :disabled="!!caring"
            @click="care('feed')"
            class="flex flex-col items-center gap-1 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium active:scale-95 disabled:opacity-50"
          >
            <Utensils class="w-5 h-5" /> Alimentar
          </button>
          <button
            :disabled="!!caring"
            @click="care('play')"
            class="flex flex-col items-center gap-1 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium active:scale-95 disabled:opacity-50"
          >
            <Gamepad2 class="w-5 h-5" /> Jugar
          </button>
          <button
            :disabled="!!caring"
            @click="care('rest')"
            class="flex flex-col items-center gap-1 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium active:scale-95 disabled:opacity-50"
          >
            <Moon class="w-5 h-5" /> Descansar
          </button>
        </div>
      </section>

      <!-- Customize -->
      <section class="card-soft p-5 space-y-4">
        <h2 class="font-display text-lg text-ink">Personalizar</h2>

        <label class="block">
          <span class="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Nombre</span>
          <input
            v-model="name"
            maxlength="24"
            class="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-0 outline-none focus:ring-2 focus:ring-green-600/25"
            placeholder="Nombre de tu compañero"
          />
        </label>

        <div>
          <span class="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 block">Color</span>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="c in PET_COLORS"
              :key="c.id"
              @click="color = c.id"
              class="w-10 h-10 rounded-full border-2 transition-transform active:scale-90"
              :class="color === c.id ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'"
              :style="{ backgroundColor: c.hex }"
              :title="c.label"
            />
          </div>
        </div>

        <div>
          <span class="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 block">Accesorio</span>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="a in PET_ACCESSORIES"
              :key="a.id"
              @click="accessory = a.id"
              class="py-2.5 rounded-xl border-2 text-xs font-bold transition-all"
              :class="accessory === a.id
                ? 'border-green-600/30 bg-green-50 text-green-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'
                : 'border-transparent bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'"
            >
              <span class="text-base">{{ a.emoji || '—' }}</span>
              <span class="block mt-0.5">{{ a.label }}</span>
            </button>
          </div>
        </div>

        <button
          :disabled="saving"
          @click="save"
          class="btn-quiet flex items-center justify-center gap-2"
        >
          <Save class="w-5 h-5" />
          {{ savedFlash ? '¡Guardado!' : 'Guardar look' }}
        </button>
      </section>
    </div>
  </div>
</template>
