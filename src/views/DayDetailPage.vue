<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProfile } from '../composables/useProfile'
import { useDailyLog } from '../composables/useDailyLog'
import { getDayType, calcProteinGrams, calcFatGrams, carbsFromFood } from '../services/calculator'
import { db } from '../db/schema'
import FoodIcon from '../components/FoodIcon.vue'

const route = useRoute()
const router = useRouter()
const { profile, load: loadProfile } = useProfile()
const { log, ensure, addEntry, removeEntry, updateWeighIn } = useDailyLog()

const dateStr = computed(() => route.params.date)
const foods = ref([])
const showAddForm = ref(false)
const selectedFood = ref(null)
const unitCount = ref(1)
const inputMode = ref('unit')
const manualGrams = ref('')
const weighInInput = ref('')

onMounted(async () => {
  await loadProfile()
  foods.value = await db.foodLibrary.where('isActive').equals(1).toArray()
  await initDay()
})

async function initDay() {
  const date = new Date(dateStr.value + 'T00:00:00')
  const dayType = getDayType(date, profile.value.trainingDays)
  let carb = profile.value.carbRegular
  if (dayType === 'refeed') carb = profile.value.carbRefeed
  else if (dayType === 'low') carb = profile.value.carbLow

  await ensure(dateStr.value, dayType, {
    carb,
    protein: calcProteinGrams(profile.value.currentWeight, profile.value.proteinPerKg),
    fat: calcFatGrams(profile.value.currentWeight, profile.value.fatPerKg)
  })
  if (log.value?.weighIn) weighInInput.value = log.value.weighIn
}

const dayType = computed(() => log.value?.dayType || 'regular')
const targetCarb = computed(() => log.value?.targetCarb || 0)
const targetProtein = computed(() => log.value?.targetProtein || 0)
const targetFat = computed(() => log.value?.targetFat || 0)

const totalCarb = computed(() => {
  if (!log.value) return 0
  return log.value.entries.reduce((sum, e) => sum + (e.carb || 0), 0)
})
const totalProtein = computed(() => {
  if (!log.value) return 0
  return log.value.entries.reduce((sum, e) => sum + (e.protein || 0), 0)
})
const totalCal = computed(() => {
  if (!log.value) return 0
  return log.value.entries.reduce((sum, e) => {
    return sum + (e.carb || 0) * 4 + (e.protein || 0) * 4 + (e.fat || 0) * 9
  }, 0)
})

const carbPercent = computed(() => {
  if (!targetCarb.value) return 0
  return Math.min(100, (totalCarb.value / targetCarb.value) * 100)
})

const currentFood = computed(() => foods.value.find(f => f.id === selectedFood.value))

const effectiveGrams = computed(() => {
  if (inputMode.value === 'manual') return Number(manualGrams.value) || 0
  if (!currentFood.value) return 0
  return unitCount.value * (currentFood.value.unitGrams || 150)
})

const computedCarb = computed(() => {
  if (!currentFood.value || effectiveGrams.value <= 0) return 0
  return carbsFromFood(effectiveGrams.value, currentFood.value.carbPer100g)
})

const computedProtein = computed(() => {
  if (!currentFood.value || effectiveGrams.value <= 0) return 0
  return Math.round((effectiveGrams.value * (currentFood.value.proteinPer100g || 0)) / 100)
})

function selectFood(id) {
  selectedFood.value = id
  unitCount.value = 1
  manualGrams.value = ''
  inputMode.value = 'unit'
}

function adjustCount(delta) {
  const max = currentFood.value?.maxUnits || 5
  unitCount.value = Math.max(0.5, Math.min(max, unitCount.value + delta))
}

async function submitEntry() {
  if (!currentFood.value || effectiveGrams.value <= 0) return
  const food = currentFood.value

  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    foodId: food.id,
    foodName: food.name,
    amount: effectiveGrams.value,
    unit: 'g',
    servingSize: null,
    carb: computedCarb.value,
    protein: computedProtein.value,
    fat: Math.round((effectiveGrams.value * (food.fatPer100g || 0)) / 100),
    mealType: null,
    timestamp: Date.now()
  }

  await addEntry(dateStr.value, entry)
  showAddForm.value = false
  selectedFood.value = null
  unitCount.value = 1
  manualGrams.value = ''
}

async function deleteEntry(id) {
  await removeEntry(dateStr.value, id)
}

async function saveWeight() {
  const w = Number(weighInInput.value)
  if (w > 0) await updateWeighIn(dateStr.value, w)
}

const dayTypeLabels = { refeed: '补给日', regular: '常规日', low: '低碳日', rest: '休息日' }

const displayDate = computed(() => {
  const d = new Date(dateStr.value + 'T00:00:00')
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getMonth() + 1}月${d.getDate()}日 周${weekdays[d.getDay()]}`
})
</script>

<template>
  <div class="px-5 pt-4 pb-28 bg-[#f6f6f6] min-h-screen" v-if="log">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-5">
      <button @click="router.push('/')" class="btn-press w-9 h-9 rounded-full bg-white flex items-center justify-center" style="box-shadow: 0 1px 3px rgba(0,0,0,0.06)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div class="flex-1">
        <h1 class="text-[17px] font-semibold tracking-tight text-neutral-800">{{ displayDate }}</h1>
      </div>
      <span class="text-xs font-medium px-2.5 py-1 rounded-full"
        :class="{
          'bg-neutral-800 text-white': dayType === 'refeed',
          'bg-amber-100 text-amber-700': dayType === 'regular',
          'bg-sky-50 text-sky-600': dayType === 'low',
          'bg-neutral-100 text-neutral-500': dayType === 'rest'
        }"
      >{{ dayTypeLabels[dayType] }}</span>
    </div>

    <!-- Progress Card -->
    <div class="card p-5 mb-3">
      <div class="flex items-center gap-5">
        <div class="relative w-[76px] h-[76px] flex-shrink-0">
          <svg viewBox="0 0 76 76" class="w-full h-full -rotate-90">
            <circle cx="38" cy="38" r="32" fill="none" stroke="#f0f0f0" stroke-width="5"/>
            <circle cx="38" cy="38" r="32" fill="none"
              :stroke="carbPercent > 100 ? '#888' : '#1d1d1f'"
              stroke-width="5" stroke-linecap="round"
              :stroke-dasharray="201"
              :stroke-dashoffset="201 - (201 * Math.min(carbPercent, 100) / 100)"
              class="transition-all duration-500 ease-out"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-[18px] font-bold leading-none">{{ totalCarb }}</span>
            <span class="text-[9px] text-neutral-400 mt-0.5">/ {{ targetCarb }}g</span>
          </div>
        </div>
        <div class="flex-1 space-y-2">
          <div class="flex justify-between text-xs">
            <span class="text-neutral-400">碳水</span>
            <span class="font-medium text-neutral-700">{{ totalCarb }} / {{ targetCarb }}g</span>
          </div>
          <div class="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500 ease-out bg-neutral-800"
              :style="{ width: Math.min(carbPercent, 100) + '%' }"></div>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-neutral-400">蛋白质</span>
            <span class="text-neutral-600">{{ totalProtein }} / {{ targetProtein }}g</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-neutral-400">总热量</span>
            <span class="text-neutral-600 font-medium">{{ totalCal }} kcal</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Weight Input -->
    <div class="card flex items-center gap-3 px-4 py-3 mb-3">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5" stroke-linecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M12 7V4M8 7V5M16 7V5"/><path d="M7 14h10"/></svg>
      <input v-model="weighInInput" type="number" step="0.1" placeholder="记录今日体重" @blur="saveWeight"
        class="flex-1 text-[14px] focus:outline-none bg-transparent text-neutral-700 placeholder:text-neutral-300" />
      <span class="text-[11px] text-neutral-400">kg</span>
    </div>

    <!-- Food Entries -->
    <div class="card p-4 mb-3">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-xs font-medium text-neutral-400 uppercase tracking-wider">今日记录</h2>
        <span v-if="log.entries.length" class="text-[10px] text-neutral-400">{{ log.entries.length }} 条</span>
      </div>

      <div v-if="log.entries.length === 0" class="py-6 text-center">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#d0d0d0" stroke-width="1.2" class="mx-auto mb-2">
          <circle cx="16" cy="16" r="12"/><path d="M12 16h8M16 12v8" stroke-linecap="round"/>
        </svg>
        <p class="text-xs text-neutral-300">点击下方按钮添加</p>
      </div>

      <TransitionGroup name="list" tag="div">
        <div v-for="entry in log.entries" :key="entry.id"
          class="flex items-center gap-3 py-3 border-b border-neutral-50 last:border-0">
          <div class="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-500">
            <FoodIcon :name="entry.foodName" :size="22" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[14px] font-medium text-neutral-800">{{ entry.foodName }}</p>
            <p class="text-[11px] text-neutral-400">{{ entry.amount }}g · {{ entry.carb }}g碳 · {{ entry.protein || 0 }}g蛋白</p>
          </div>
          <button @click="deleteEntry(entry.id)"
            class="btn-press text-[11px] text-neutral-300 hover:text-neutral-500 px-2 py-1 rounded-lg transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/></svg>
          </button>
        </div>
      </TransitionGroup>
    </div>

    <!-- Add Form -->
    <transition name="slide-fade">
      <div v-if="showAddForm" class="card p-4 mb-3">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-[14px] font-semibold text-neutral-800">添加主食</h3>
          <button @click="showAddForm = false; selectedFood = null" class="btn-press text-xs text-neutral-400">取消</button>
        </div>

        <!-- Food selector with icons -->
        <div class="grid grid-cols-4 gap-2 mb-4">
          <button
            v-for="food in foods" :key="food.id"
            @click="selectFood(food.id)"
            class="flex flex-col items-center gap-1.5 py-3 rounded-xl btn-press transition-all duration-200"
            :class="selectedFood === food.id
              ? 'bg-neutral-800 text-white'
              : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'"
          >
            <FoodIcon :name="food.name" :size="24" />
            <span class="text-[11px] font-medium">{{ food.name }}</span>
          </button>
        </div>

        <transition name="slide-fade">
          <div v-if="currentFood" class="space-y-4">
            <!-- Mode toggle -->
            <div class="flex bg-neutral-100 rounded-lg p-0.5">
              <button @click="inputMode = 'unit'"
                class="flex-1 py-1.5 rounded-md text-xs font-medium transition-all"
                :class="inputMode === 'unit' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-400'"
              >按{{ currentFood.unitLabel }}选</button>
              <button @click="inputMode = 'manual'"
                class="flex-1 py-1.5 rounded-md text-xs font-medium transition-all"
                :class="inputMode === 'manual' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-400'"
              >手动输入克数</button>
            </div>

            <!-- Unit selector -->
            <div v-if="inputMode === 'unit'">
              <p class="text-[11px] text-neutral-400 mb-2">{{ currentFood.unitCapacity }}</p>
              <div class="flex items-center justify-center gap-4">
                <button @click="adjustCount(-0.5)" class="btn-press w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 text-lg font-light">−</button>
                <div class="text-center min-w-[80px]">
                  <span class="text-3xl font-bold text-neutral-800">{{ unitCount }}</span>
                  <span class="text-sm text-neutral-400 ml-1">{{ currentFood.unitLabel }}</span>
                </div>
                <button @click="adjustCount(0.5)" class="btn-press w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-white text-lg font-light">+</button>
              </div>
              <p class="text-[11px] text-neutral-400 text-center mt-1.5">≈ {{ effectiveGrams }}g</p>
            </div>

            <!-- Manual input -->
            <div v-else>
              <label class="text-[11px] text-neutral-400 mb-1 block">
                克数（{{ currentFood.state === 'raw' ? '干重' : '熟重' }}）
              </label>
              <input v-model="manualGrams" type="number" placeholder="输入克数" class="input-field" />
            </div>

            <!-- Result preview -->
            <transition name="fade">
              <div v-if="computedCarb > 0" class="bg-neutral-50 rounded-xl p-3">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-neutral-400">碳水</span>
                  <span class="font-bold text-neutral-800">{{ computedCarb }}g</span>
                </div>
                <div class="flex items-center justify-between text-sm mt-1">
                  <span class="text-neutral-400">蛋白质</span>
                  <span class="text-neutral-600">{{ computedProtein }}g</span>
                </div>
              </div>
            </transition>

            <button @click="submitEntry" class="btn-primary w-full" :disabled="effectiveGrams <= 0">
              添加 · {{ computedCarb }}g 碳水
            </button>
          </div>
        </transition>
      </div>
    </transition>

    <!-- Add Button -->
    <transition name="fade">
      <button v-if="!showAddForm" @click="showAddForm = true"
        class="btn-press card w-full py-3.5 text-[13px] text-neutral-400 font-medium text-center hover:text-neutral-600 transition-colors">
        + 添加主食记录
      </button>
    </transition>
  </div>
</template>
