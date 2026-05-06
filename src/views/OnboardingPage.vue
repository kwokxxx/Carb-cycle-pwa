<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProfile } from '../composables/useProfile'
import {
  calcBMR, calcTDEE, calcTargetCalories,
  calcProteinGrams, calcFatGrams, calcDefaultCarbs
} from '../services/calculator'

const router = useRouter()
const { save } = useProfile()

const step = ref(1)
const totalSteps = 5

const form = ref({
  nickname: '',
  gender: 'male',
  age: 26,
  height: 181,
  currentWeight: 74,
  targetWeight: null,
  goalType: 'standard_cut',
  activityFactor: 1.55,
  trainingType: 'strength',
  trainingDays: [1, 3, 5, 6],
  proteinPerKg: 2.0,
  fatPerKg: 0.8,
  deficitPercent: 17,
  carbRefeed: 0,
  carbRegular: 0,
  carbLow: 0
})

const bmr = computed(() => calcBMR(form.value.gender, form.value.currentWeight, form.value.height, form.value.age))
const tdee = computed(() => calcTDEE(bmr.value, form.value.activityFactor))
const targetCal = computed(() => calcTargetCalories(tdee.value, form.value.goalType, form.value.deficitPercent))
const proteinG = computed(() => calcProteinGrams(form.value.currentWeight, form.value.proteinPerKg))
const fatG = computed(() => calcFatGrams(form.value.currentWeight, form.value.fatPerKg))
const defaultCarbs = computed(() => calcDefaultCarbs(targetCal.value, proteinG.value, fatG.value, form.value.currentWeight))

function initCarbs() {
  if (form.value.carbRefeed === 0) {
    form.value.carbRefeed = defaultCarbs.value.refeed
    form.value.carbRegular = defaultCarbs.value.regular
    form.value.carbLow = defaultCarbs.value.low
  }
}

function next() {
  if (step.value === 4) initCarbs()
  if (step.value < totalSteps) step.value++
}

function prev() {
  if (step.value > 1) step.value--
}

function toggleDay(day) {
  const idx = form.value.trainingDays.indexOf(day)
  if (idx >= 0) form.value.trainingDays.splice(idx, 1)
  else form.value.trainingDays.push(day)
}

async function finish() {
  await save(form.value)
  router.push('/')
}

const dayLabels = ['一', '二', '三', '四', '五', '六', '日']

const activityOptions = [
  { value: 1.2, label: '久坐不动', desc: '基本不运动' },
  { value: 1.375, label: '轻度运动', desc: '每周 1-3 次' },
  { value: 1.55, label: '中度运动', desc: '每周 3-5 次' },
  { value: 1.725, label: '高强度', desc: '每周 6-7 次' },
  { value: 1.9, label: '极高强度', desc: '体力劳动 + 训练' }
]

const goalOptions = [
  { value: 'aesthetic_cut', label: '美型减脂', desc: '追求线条和肌肉分离度' },
  { value: 'standard_cut', label: '标准减脂', desc: '稳健减脂，适合大多数人' },
  { value: 'maintain', label: '维持体重', desc: '保持现有体型' },
  { value: 'diet_break', label: '反弹期', desc: '短期恢复代谢水平' }
]
</script>

<template>
  <div class="px-6 py-10 min-h-screen flex flex-col bg-white">
    <!-- Progress -->
    <div class="flex gap-2 mb-10">
      <div
        v-for="s in totalSteps" :key="s"
        class="h-[3px] flex-1 rounded-full transition-all duration-300"
        :class="s <= step ? 'bg-neutral-800' : 'bg-neutral-200'"
      />
    </div>

    <!-- Steps -->
    <transition name="slide-fade" mode="out-in">
      <!-- Step 1: Basic Info -->
      <div v-if="step === 1" key="step1" class="flex-1">
        <h1 class="text-[22px] font-semibold tracking-tight mb-1">基本信息</h1>
        <p class="text-sm text-neutral-400 mb-7">填写你的身体数据</p>

        <div class="space-y-5">
          <div>
            <label class="text-xs font-medium text-neutral-500 mb-1.5 block">昵称</label>
            <input v-model="form.nickname" type="text" maxlength="8" placeholder="怎么称呼你" class="input-field" />
          </div>

          <div>
            <label class="text-xs font-medium text-neutral-500 mb-2.5 block uppercase tracking-wider">性别</label>
            <div class="flex gap-3">
              <button
                v-for="g in [{ v: 'male', l: '男' }, { v: 'female', l: '女' }]" :key="g.v"
                @click="form.gender = g.v"
                class="flex-1 py-3 rounded-xl text-sm font-medium btn-press transition-all duration-200"
                :class="form.gender === g.v
                  ? 'bg-neutral-800 text-white shadow-md shadow-neutral-800/20'
                  : 'bg-neutral-100 text-neutral-500'"
              >{{ g.l }}</button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-medium text-neutral-500 mb-1.5 block">年龄</label>
              <input v-model.number="form.age" type="number" class="input-field" />
            </div>
            <div>
              <label class="text-xs font-medium text-neutral-500 mb-1.5 block">身高 (cm)</label>
              <input v-model.number="form.height" type="number" class="input-field" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-medium text-neutral-500 mb-1.5 block">当前体重 (kg)</label>
              <input v-model.number="form.currentWeight" type="number" step="0.1" class="input-field" />
            </div>
            <div>
              <label class="text-xs font-medium text-neutral-500 mb-1.5 block">目标体重 (kg)</label>
              <input v-model.number="form.targetWeight" type="number" step="0.1" placeholder="可不填" class="input-field" />
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Goal & Activity -->
      <div v-if="step === 2" key="step2" class="flex-1">
        <h1 class="text-[22px] font-semibold tracking-tight mb-1">目标与活动水平</h1>
        <p class="text-sm text-neutral-400 mb-7">选择适合你的模式</p>

        <div class="space-y-6">
          <div>
            <label class="text-xs font-medium text-neutral-500 mb-2.5 block uppercase tracking-wider">减脂目标</label>
            <div class="space-y-2">
              <button
                v-for="opt in goalOptions" :key="opt.value"
                @click="form.goalType = opt.value"
                class="w-full text-left px-4 py-3.5 rounded-xl text-sm transition-all duration-200 btn-press"
                :class="form.goalType === opt.value
                  ? 'bg-neutral-800 text-white shadow-md shadow-neutral-800/20'
                  : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'"
              >
                <span class="font-medium">{{ opt.label }}</span>
                <span class="block text-xs mt-0.5" :class="form.goalType === opt.value ? 'text-neutral-300' : 'text-neutral-400'">{{ opt.desc }}</span>
              </button>
            </div>
          </div>

          <div>
            <label class="text-xs font-medium text-neutral-500 mb-2.5 block uppercase tracking-wider">活动水平</label>
            <div class="space-y-2">
              <button
                v-for="opt in activityOptions" :key="opt.value"
                @click="form.activityFactor = opt.value"
                class="w-full text-left px-4 py-3.5 rounded-xl text-sm transition-all duration-200 btn-press"
                :class="form.activityFactor === opt.value
                  ? 'bg-neutral-800 text-white shadow-md shadow-neutral-800/20'
                  : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'"
              >
                <span class="font-medium">{{ opt.label }}</span>
                <span class="ml-2 text-xs" :class="form.activityFactor === opt.value ? 'text-neutral-300' : 'text-neutral-400'">{{ opt.desc }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Training Schedule -->
      <div v-if="step === 3" key="step3" class="flex-1">
        <h1 class="text-[22px] font-semibold tracking-tight mb-1">训练安排</h1>
        <p class="text-sm text-neutral-400 mb-7">选择你的训练日</p>

        <div class="space-y-6">
          <div>
            <label class="text-xs font-medium text-neutral-500 mb-2.5 block uppercase tracking-wider">训练类型</label>
            <div class="flex gap-2">
              <button
                v-for="t in [{ v: 'strength', l: '力量' }, { v: 'cardio', l: '有氧' }, { v: 'mixed', l: '混合' }, { v: 'none', l: '不训练' }]"
                :key="t.v"
                @click="form.trainingType = t.v"
                class="flex-1 py-2.5 rounded-xl text-sm font-medium btn-press transition-all duration-200"
                :class="form.trainingType === t.v
                  ? 'bg-neutral-800 text-white shadow-md shadow-neutral-800/20'
                  : 'bg-neutral-100 text-neutral-500'"
              >{{ t.l }}</button>
            </div>
          </div>

          <div>
            <label class="text-xs font-medium text-neutral-500 mb-3 block uppercase tracking-wider">每周训练日</label>
            <div class="grid grid-cols-7 gap-2.5">
              <button
                v-for="(label, idx) in dayLabels" :key="idx"
                @click="toggleDay(idx + 1)"
                class="aspect-square rounded-xl text-sm font-medium flex items-center justify-center btn-press transition-all duration-200"
                :class="form.trainingDays.includes(idx + 1)
                  ? 'bg-neutral-800 text-white shadow-md shadow-neutral-800/20'
                  : 'bg-neutral-100 text-neutral-400'"
              >{{ label }}</button>
            </div>
            <p class="text-xs text-neutral-400 mt-3 text-center">已选 <span class="font-medium text-neutral-600">{{ form.trainingDays.length }}</span> 天</p>
          </div>
        </div>
      </div>

      <!-- Step 4: Macros -->
      <div v-if="step === 4" key="step4" class="flex-1">
        <h1 class="text-[22px] font-semibold tracking-tight mb-1">营养素设定</h1>
        <p class="text-sm text-neutral-400 mb-7">系统已为你计算推荐值</p>

        <div class="space-y-5">
          <div class="card p-4 space-y-2.5">
            <div class="flex justify-between text-sm">
              <span class="text-neutral-400">基础代谢 BMR</span>
              <span class="font-semibold">{{ Math.round(bmr) }} <span class="font-normal text-neutral-400">kcal</span></span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-neutral-400">每日消耗 TDEE</span>
              <span class="font-semibold">{{ Math.round(tdee) }} <span class="font-normal text-neutral-400">kcal</span></span>
            </div>
            <div class="h-px bg-neutral-100"></div>
            <div class="flex justify-between text-sm">
              <span class="text-neutral-400">目标热量</span>
              <span class="font-semibold text-blue-600">{{ Math.round(targetCal) }} <span class="font-normal text-neutral-400">kcal</span></span>
            </div>
          </div>

          <div>
            <div class="flex justify-between mb-1">
              <label class="text-xs font-medium text-neutral-500">热量赤字</label>
              <span class="text-xs font-semibold text-neutral-800">{{ form.deficitPercent }}%</span>
            </div>
            <p class="text-[11px] text-neutral-400 mb-2">即每天少吃的比例。15-20% 为安全区间，约每周减 0.5-1% 体重。</p>
            <input v-model.number="form.deficitPercent" type="range" min="10" max="25" step="1" class="w-full" />
            <div class="flex justify-between text-[10px] text-neutral-400 mt-1"><span>10% 温和</span><span>25% 激进</span></div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-medium text-neutral-500 mb-1.5 block">蛋白质 (g/kg)</label>
              <input v-model.number="form.proteinPerKg" type="number" step="0.1" min="1.6" max="2.4" class="input-field" />
            </div>
            <div>
              <label class="text-xs font-medium text-neutral-500 mb-1.5 block">脂肪 (g/kg)</label>
              <input v-model.number="form.fatPerKg" type="number" step="0.1" min="0.6" max="1.2" class="input-field" />
            </div>
          </div>

          <div class="flex gap-3">
            <div class="flex-1 card p-3 text-center">
              <p class="text-lg font-semibold">{{ proteinG }}g</p>
              <p class="text-[10px] text-neutral-400 mt-0.5">蛋白质/天</p>
            </div>
            <div class="flex-1 card p-3 text-center">
              <p class="text-lg font-semibold">{{ fatG }}g</p>
              <p class="text-[10px] text-neutral-400 mt-0.5">脂肪/天</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 5: Carb Targets -->
      <div v-if="step === 5" key="step5" class="flex-1">
        <h1 class="text-[22px] font-semibold tracking-tight mb-1">三档碳水</h1>
        <p class="text-sm text-neutral-400 mb-3">根据你的数据计算出的建议值，可自由调整</p>
        <div class="bg-neutral-50 rounded-xl px-3.5 py-2.5 mb-5">
          <p class="text-[11px] text-neutral-500 leading-relaxed">训练日碳水 3.0-3.5g/kg 维持肌糖原和运动表现；休息日 1.5-2.0g/kg 促进脂肪氧化。周期性变化避免代谢适应。</p>
        </div>

        <div class="space-y-3.5">
          <div class="card p-4 border-l-[3px] border-l-[#2dd4a8]">
            <div class="flex items-center gap-2 mb-2.5">
              <span class="chip bg-refeed text-refeed-text">补给日</span>
              <span class="text-[10px] text-neutral-400">连续训练第二天</span>
            </div>
            <input v-model.number="form.carbRefeed" type="number" class="input-field text-lg font-semibold" />
            <p class="text-[11px] text-neutral-400 mt-1.5">建议 {{ defaultCarbs.refeed }}g · {{ (defaultCarbs.refeed / form.currentWeight).toFixed(1) }} g/kg</p>
          </div>

          <div class="card p-4 border-l-[3px] border-l-[#f0c644]">
            <div class="flex items-center gap-2 mb-2.5">
              <span class="chip bg-regular text-regular-text">常规日</span>
              <span class="text-[10px] text-neutral-400">普通训练日</span>
            </div>
            <input v-model.number="form.carbRegular" type="number" class="input-field text-lg font-semibold" />
            <p class="text-[11px] text-neutral-400 mt-1.5">建议 {{ defaultCarbs.regular }}g · {{ (defaultCarbs.regular / form.currentWeight).toFixed(1) }} g/kg</p>
          </div>

          <div class="card p-4 border-l-[3px] border-l-[#a0a5ad]">
            <div class="flex items-center gap-2 mb-2.5">
              <span class="chip bg-low text-low-text">低碳日</span>
              <span class="text-[10px] text-neutral-400">休息日</span>
            </div>
            <input v-model.number="form.carbLow" type="number" class="input-field text-lg font-semibold" />
            <p class="text-[11px] text-neutral-400 mt-1.5">建议 {{ defaultCarbs.low }}g · {{ (defaultCarbs.low / form.currentWeight).toFixed(1) }} g/kg</p>
          </div>
        </div>
      </div>
    </transition>

    <!-- Navigation Buttons -->
    <div class="flex gap-3 mt-8 pt-5">
      <button v-if="step > 1" @click="prev" class="btn-secondary px-6">上一步</button>
      <button v-if="step < totalSteps" @click="next" class="btn-primary flex-1">下一步</button>
      <button v-if="step === totalSteps" @click="finish" class="btn-primary flex-1">完成设置</button>
    </div>
  </div>
</template>
