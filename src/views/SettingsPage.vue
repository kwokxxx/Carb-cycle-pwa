<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProfile } from '../composables/useProfile'
import { calcBMR, calcTDEE, calcTargetCalories, calcWeeklyAverage, calcDeficitFromAvg } from '../services/calculator'
import { db } from '../db/schema'

const router = useRouter()
const { profile, load, save } = useProfile()

const form = ref(null)
const saved = ref(false)
const editingName = ref(false)
const nameInput = ref('')

onMounted(async () => {
  await load()
  if (profile.value) form.value = { ...profile.value }
})

const bmr = computed(() => form.value ? calcBMR(form.value.gender, form.value.currentWeight, form.value.height, form.value.age) : 0)
const tdee = computed(() => calcTDEE(bmr.value, form.value?.activityFactor || 1.55))
const targetCal = computed(() => calcTargetCalories(tdee.value, form.value?.goalType || 'standard_cut', form.value?.deficitPercent || 17))

const weeklyAvg = computed(() => {
  if (!form.value) return { avgDailyCarb: 0, avgDailyCal: 0 }
  return calcWeeklyAverage(form.value)
})

const actualDeficit = computed(() => calcDeficitFromAvg(weeklyAvg.value.avgDailyCal, tdee.value))

const initials = computed(() => {
  const name = form.value?.nickname
  if (!name) return '我'
  return name.slice(0, 1)
})

const carbSuggestion = computed(() => {
  if (!form.value) return { refeed: 0, regular: 0, low: 0 }
  const w = form.value.currentWeight
  return {
    refeed: Math.round(w * 3.5),
    regular: Math.round(w * 3.0),
    low: Math.round(w * 1.8)
  }
})

function startEditName() {
  nameInput.value = form.value?.nickname || ''
  editingName.value = true
}

async function saveName() {
  form.value.nickname = nameInput.value.trim() || ''
  editingName.value = false
  await save(form.value)
}

async function saveSettings() {
  await save(form.value)
  saved.value = true
  setTimeout(() => { saved.value = false }, 1500)
}

async function exportData() {
  const data = {
    profile: await db.userProfile.toCollection().first(),
    dailyLogs: await db.dailyLog.toArray(),
    foodLibrary: await db.foodLibrary.toArray(),
    weeklyReviews: await db.weeklyReview.toArray(),
    exportedAt: new Date().toISOString()
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `carb-cycle-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="px-5 pt-4 pb-28 bg-[#f6f6f6] min-h-screen" v-if="form">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-5">
      <button @click="router.push('/')" class="btn-press w-9 h-9 rounded-full bg-white flex items-center justify-center" style="box-shadow: 0 1px 3px rgba(0,0,0,0.06)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <h1 class="text-[17px] font-semibold tracking-tight text-neutral-800">设置</h1>
    </div>

    <!-- Avatar Card -->
    <div class="card p-5 mb-3 flex items-center gap-4">
      <div class="w-14 h-14 rounded-full bg-neutral-800 flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
        {{ initials }}
      </div>
      <div class="flex-1 min-w-0" v-if="!editingName">
        <p class="text-[16px] font-semibold text-neutral-800 truncate">{{ form.nickname || '点击设置昵称' }}</p>
        <p class="text-[12px] text-neutral-400 mt-0.5">{{ form.currentWeight }}kg · {{ form.gender === 'male' ? '男' : '女' }} · {{ form.age }}岁</p>
      </div>
      <div class="flex-1 min-w-0" v-else>
        <input v-model="nameInput" type="text" maxlength="8" placeholder="输入昵称" @keyup.enter="saveName" @blur="saveName"
          class="input-field text-[15px] py-2" autofocus />
      </div>
      <button v-if="!editingName" @click="startEditName" class="btn-press text-neutral-300 hover:text-neutral-500 transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </button>
    </div>

    <div class="space-y-3">
      <!-- Stats Card -->
      <div class="card p-4">
        <h2 class="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-3">能量概览</h2>
        <div class="space-y-2.5">
          <div class="flex justify-between text-[13px]">
            <span class="text-neutral-400">每日消耗 TDEE</span>
            <span class="font-semibold text-neutral-800">{{ Math.round(tdee) }} <span class="font-normal text-neutral-400">kcal</span></span>
          </div>
          <div class="flex justify-between text-[13px]">
            <span class="text-neutral-400">周均热量</span>
            <span class="font-semibold text-neutral-800">{{ weeklyAvg.avgDailyCal }} <span class="font-normal text-neutral-400">kcal/天</span></span>
          </div>
          <div class="h-px bg-neutral-100"></div>
          <div class="flex justify-between text-[13px]">
            <span class="text-neutral-400">实际赤字</span>
            <span class="font-semibold" :class="actualDeficit > 25 ? 'text-red-500' : actualDeficit > 20 ? 'text-amber-500' : 'text-neutral-800'">
              {{ actualDeficit }}%
            </span>
          </div>
          <div v-if="actualDeficit > 25" class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-[11px] text-red-600">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
            赤字较大，可能影响代谢和训练表现
          </div>
        </div>
      </div>

      <!-- Body Data -->
      <div class="card p-4">
        <h2 class="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-3">身体数据</h2>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[11px] text-neutral-400 mb-1 block">体重 (kg)</label>
            <input v-model.number="form.currentWeight" type="number" step="0.1" class="input-field" />
          </div>
          <div>
            <label class="text-[11px] text-neutral-400 mb-1 block">年龄</label>
            <input v-model.number="form.age" type="number" class="input-field" />
          </div>
        </div>
      </div>

      <!-- Carb Targets with Science Tips -->
      <div class="card p-4">
        <h2 class="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-2">三档碳水</h2>
        <p class="text-[11px] text-neutral-400 mb-4 leading-relaxed">基于运动营养学研究，碳水按体重分配：训练日 3.0-3.5g/kg 支撑运动表现，休息日 1.5-2.0g/kg 促进脂肪氧化。</p>

        <div class="space-y-3">
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-neutral-800"></span>
                <span class="text-[12px] font-medium text-neutral-700">补给日</span>
              </div>
              <span class="text-[10px] text-neutral-400">建议 {{ carbSuggestion.refeed }}g (3.5g/kg)</span>
            </div>
            <div class="flex items-center gap-2">
              <input v-model.number="form.carbRefeed" type="number" class="input-field flex-1" />
              <span class="text-[11px] text-neutral-400 w-4">g</span>
            </div>
            <p class="text-[10px] text-neutral-300 mt-1">连续训练日，高碳水补充肌糖原储备</p>
          </div>

          <div class="h-px bg-neutral-50"></div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-neutral-400"></span>
                <span class="text-[12px] font-medium text-neutral-700">常规日</span>
              </div>
              <span class="text-[10px] text-neutral-400">建议 {{ carbSuggestion.regular }}g (3.0g/kg)</span>
            </div>
            <div class="flex items-center gap-2">
              <input v-model.number="form.carbRegular" type="number" class="input-field flex-1" />
              <span class="text-[11px] text-neutral-400 w-4">g</span>
            </div>
            <p class="text-[10px] text-neutral-300 mt-1">普通训练日，保证训练能量供应</p>
          </div>

          <div class="h-px bg-neutral-50"></div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-neutral-200"></span>
                <span class="text-[12px] font-medium text-neutral-700">低碳日</span>
              </div>
              <span class="text-[10px] text-neutral-400">建议 {{ carbSuggestion.low }}g (1.8g/kg)</span>
            </div>
            <div class="flex items-center gap-2">
              <input v-model.number="form.carbLow" type="number" class="input-field flex-1" />
              <span class="text-[11px] text-neutral-400 w-4">g</span>
            </div>
            <p class="text-[10px] text-neutral-300 mt-1">休息日，降低碳水促进脂肪代谢</p>
          </div>
        </div>
      </div>

      <!-- Deficit Slider with Explanation -->
      <div class="card p-4">
        <div class="flex justify-between items-center mb-1">
          <h2 class="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">热量赤字</h2>
          <span class="text-[13px] font-bold text-neutral-800">{{ form.deficitPercent }}%</span>
        </div>
        <p class="text-[11px] text-neutral-400 mb-3 leading-relaxed">赤字 = 少吃的比例。15-20% 是安全减脂区间，每周约减 0.5-1% 体重；超过 25% 可能导致肌肉流失和代谢适应。</p>
        <input v-model.number="form.deficitPercent" type="range" min="10" max="25" step="1" class="w-full" />
        <div class="flex justify-between text-[10px] mt-1.5">
          <span class="text-neutral-400">10% 温和</span>
          <span class="text-neutral-400">25% 激进</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-2.5 pt-1">
        <button @click="saveSettings" class="btn-primary w-full relative">
          <transition name="fade" mode="out-in">
            <span v-if="!saved" key="save">保存设置</span>
            <span v-else key="done" class="flex items-center justify-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>
              已保存
            </span>
          </transition>
        </button>
        <button @click="exportData" class="btn-secondary w-full">导出数据 (JSON)</button>
      </div>
    </div>
  </div>
</template>
