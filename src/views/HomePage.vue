<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProfile } from '../composables/useProfile'
import { getDayType, calcProteinGrams, calcFatGrams } from '../services/calculator'
import { db } from '../db/schema'

const router = useRouter()
const { profile, load } = useProfile()

const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())

const dailyLogs = ref({})

onMounted(async () => {
  await load()
  await loadMonthLogs()
})

async function loadMonthLogs() {
  const start = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-01`
  const endDate = new Date(currentYear.value, currentMonth.value + 1, 0)
  const end = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`
  const logs = await db.dailyLog.where('date').between(start, end, true, true).toArray()
  const map = {}
  for (const l of logs) map[l.date] = l
  dailyLogs.value = map
}

const monthLabel = computed(() => `${currentYear.value}年${currentMonth.value + 1}月`)

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  let startWeekday = firstDay.getDay()
  if (startWeekday === 0) startWeekday = 7
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const days = []
  for (let i = 1; i < startWeekday; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  return days
})

function getDayTypeForDate(day) {
  if (!day || !profile.value) return 'rest'
  return getDayType(new Date(currentYear.value, currentMonth.value, day), profile.value.trainingDays)
}

function getDateStr(day) {
  return `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function isToday(day) {
  return day === today.getDate() && currentMonth.value === today.getMonth() && currentYear.value === today.getFullYear()
}

function hasLog(day) {
  return !!dailyLogs.value[getDateStr(day)]
}

function prevMonth() {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- }
  else currentMonth.value--
  loadMonthLogs()
}

function nextMonth() {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ }
  else currentMonth.value++
  loadMonthLogs()
}

function goToDay(day) {
  if (!day) return
  router.push(`/day/${getDateStr(day)}`)
}

const initials = computed(() => {
  const name = profile.value?.nickname
  if (!name) return '我'
  return name.slice(0, 1)
})

const todayType = computed(() => getDayType(today, profile.value?.trainingDays || []))
const todayTargets = computed(() => {
  if (!profile.value) return { carb: 0, protein: 0, fat: 0 }
  const type = todayType.value
  let carb = profile.value.carbRegular
  if (type === 'refeed') carb = profile.value.carbRefeed
  else if (type === 'low') carb = profile.value.carbLow
  return {
    carb,
    protein: calcProteinGrams(profile.value.currentWeight, profile.value.proteinPerKg),
    fat: calcFatGrams(profile.value.currentWeight, profile.value.fatPerKg)
  }
})

const todayLog = computed(() => dailyLogs.value[getDateStr(today.getDate())])
const todayCarbEaten = computed(() => {
  if (!todayLog.value) return 0
  return todayLog.value.entries.reduce((sum, e) => sum + (e.carb || 0), 0)
})

const carbPercent = computed(() => {
  if (!todayTargets.value.carb) return 0
  return Math.min(100, (todayCarbEaten.value / todayTargets.value.carb) * 100)
})

const dayTypeLabels = { refeed: '补给日', regular: '常规日', low: '低碳日', rest: '休息日' }

const dayTypeChip = {
  refeed: 'bg-neutral-800 text-white',
  regular: 'bg-amber-100 text-amber-700',
  low: 'bg-sky-50 text-sky-600',
  rest: 'bg-neutral-100 text-neutral-500'
}

const calDayColors = {
  refeed: 'bg-neutral-800/15',
  regular: 'bg-amber-100/60',
  low: 'bg-sky-50/60',
  rest: 'bg-white'
}

const legendColors = {
  refeed: 'bg-neutral-800',
  regular: 'bg-amber-300',
  low: 'bg-sky-200'
}
</script>

<template>
  <div class="px-5 pt-5 pb-28 bg-[#f6f6f6] min-h-screen" v-if="profile">
    <!-- Top Bar -->
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-white text-[14px] font-semibold btn-press"
          @click="router.push('/settings')">
          {{ initials }}
        </div>
        <div>
          <p class="text-[15px] font-semibold text-neutral-800 leading-tight">{{ profile.nickname || '设置昵称' }}</p>
          <p class="text-[11px] text-neutral-400">{{ profile.currentWeight }}kg</p>
        </div>
      </div>
      <button @click="router.push('/settings')" class="btn-press w-9 h-9 rounded-full bg-white flex items-center justify-center" style="box-shadow: 0 1px 3px rgba(0,0,0,0.06)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
      </button>
    </div>

    <!-- Today Card -->
    <div class="card p-5 mb-4">
      <div class="flex items-center justify-between mb-4">
        <span class="text-[14px] font-medium text-neutral-800">今天</span>
        <span class="text-[11px] font-medium px-2.5 py-1 rounded-full"
          :class="dayTypeChip[todayType]"
        >{{ dayTypeLabels[todayType] }}</span>
      </div>

      <div class="flex items-center gap-5 mb-4">
        <div class="relative w-[76px] h-[76px] flex-shrink-0">
          <svg viewBox="0 0 76 76" class="w-full h-full -rotate-90">
            <circle cx="38" cy="38" r="32" fill="none" stroke="#f0f0f0" stroke-width="5"/>
            <circle cx="38" cy="38" r="32" fill="none"
              :stroke="carbPercent >= 100 ? '#888' : '#1d1d1f'"
              stroke-width="5" stroke-linecap="round"
              :stroke-dasharray="201"
              :stroke-dashoffset="201 - (201 * Math.min(carbPercent, 100) / 100)"
              class="transition-all duration-500 ease-out"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-[18px] font-bold leading-none">{{ todayCarbEaten }}</span>
            <span class="text-[9px] text-neutral-400 mt-0.5">/ {{ todayTargets.carb }}g</span>
          </div>
        </div>
        <div class="flex-1 space-y-2">
          <div class="flex justify-between text-[12px]">
            <span class="text-neutral-400">碳水</span>
            <span class="font-medium text-neutral-700">{{ todayCarbEaten }} / {{ todayTargets.carb }}g</span>
          </div>
          <div class="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500 ease-out bg-neutral-800"
              :style="{ width: Math.min(carbPercent, 100) + '%' }"></div>
          </div>
          <div class="flex justify-between text-[12px]">
            <span class="text-neutral-400">蛋白质</span>
            <span class="text-neutral-600">{{ todayTargets.protein }}g</span>
          </div>
          <div class="flex justify-between text-[12px]">
            <span class="text-neutral-400">剩余碳水</span>
            <span class="text-neutral-600">{{ Math.max(0, todayTargets.carb - todayCarbEaten) }}g</span>
          </div>
        </div>
      </div>

      <button @click="goToDay(today.getDate())" class="btn-primary w-full">
        记录今日饮食
      </button>
    </div>

    <!-- Calendar -->
    <div class="card p-4">
      <div class="flex items-center justify-between mb-4">
        <button @click="prevMonth" class="btn-press w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <span class="text-[13px] font-medium tracking-tight text-neutral-700">{{ monthLabel }}</span>
        <button @click="nextMonth" class="btn-press w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      <div class="grid grid-cols-7 gap-0.5 text-center text-[10px] text-neutral-400 font-medium mb-1.5">
        <span v-for="d in ['一','二','三','四','五','六','日']" :key="d" class="py-1">{{ d }}</span>
      </div>

      <div class="grid grid-cols-7 gap-1">
        <button
          v-for="(day, idx) in calendarDays" :key="idx"
          @click="goToDay(day)"
          class="aspect-square rounded-[10px] text-[12px] flex items-center justify-center relative btn-press"
          :class="[
            day ? calDayColors[getDayTypeForDate(day)] : '',
            isToday(day) ? 'ring-[1.5px] ring-neutral-800 font-semibold text-neutral-900' : 'text-neutral-600',
            !day ? 'pointer-events-none' : ''
          ]"
        >
          <span v-if="day">{{ day }}</span>
          <span v-if="day && hasLog(day)" class="absolute bottom-[3px] w-[4px] h-[4px] rounded-full bg-neutral-700"></span>
        </button>
      </div>

      <!-- Legend -->
      <div class="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-neutral-100">
        <div v-for="(label, type) in { refeed: '补给', regular: '常规', low: '低碳' }" :key="type" class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full" :class="legendColors[type]"></span>
          <span class="text-[10px] text-neutral-400">{{ label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
