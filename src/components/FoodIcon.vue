<script setup>
defineProps({ name: String, size: { type: Number, default: 28 } })
</script>

<template>
  <!-- 米饭 -->
  <svg v-if="name === '米饭'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 16c0 6 4.5 10 10 10s10-4 10-10"/><path d="M4 16h24"/>
    <path d="M10 12c0-2.5 2-4 3.5-4.5M16 7c1 0 3 .5 3.5 3M21 11c.5-1.5 1.5-2 2.5-2"/>
  </svg>

  <!-- 面条 -->
  <svg v-else-if="name === '面条'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 16c0 6 4.5 10 10 10s10-4 10-10"/><path d="M4 16h24"/>
    <path d="M10 10c2 2 1 4 3 6M16 8c1 2 0 5 2 8M22 10c-2 2-1 4-3 6"/>
  </svg>

  <!-- 馒头 -->
  <svg v-else-if="name === '馒头'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 22c0 2 4.5 4 10 4s10-2 10-4"/><path d="M6 22c0-7 4.5-14 10-14s10 7 10 14"/>
    <path d="M13 14c1.5-1 3.5-1 5 0"/>
  </svg>

  <!-- 燕麦片 -->
  <svg v-else-if="name === '燕麦片'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 16c0 6 4.5 10 10 10s10-4 10-10"/><path d="M4 16h24"/>
    <circle cx="11" cy="14" r="1.5"/><circle cx="16" cy="13" r="1.5"/><circle cx="21" cy="14" r="1.5"/><circle cx="13.5" cy="10" r="1.2"/>
  </svg>

  <!-- 红薯 -->
  <svg v-else-if="name === '红薯'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="16" cy="17" rx="10" ry="7"/><path d="M14 10c-1-3 0-5 2-6 1 2 0 4-1 6"/>
  </svg>

  <!-- 面包 -->
  <svg v-else-if="name === '面包'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M7 14c0-4 4-7 9-7s9 3 9 7"/><rect x="7" y="14" width="18" height="10" rx="2"/>
    <path d="M12 18v2M16 17v3M20 18v2"/>
  </svg>

  <!-- 鸡胸肉 -->
  <svg v-else-if="name === '鸡胸肉'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 20c-1-5 2-10 8-12 6 2 9 7 8 12-1 3-4 5-8 5s-7-2-8-5z"/>
    <path d="M13 16c2-1 4-1 6 0"/>
  </svg>

  <!-- 牛肉 -->
  <svg v-else-if="name === '牛肉'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 16c0-4 4-8 10-8s10 4 10 8-2 8-10 8-10-4-10-8z"/>
    <path d="M10 14c3 0 4 4 6 4s3-4 6-4"/><path d="M12 20c2-1 6-1 8 0"/>
  </svg>

  <!-- 鸡蛋 -->
  <svg v-else-if="name === '鸡蛋'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 5c-5 0-8 6-8 12 0 5 3.5 9 8 9s8-4 8-9c0-6-3-12-8-12z"/>
  </svg>

  <!-- 鱼肉 -->
  <svg v-else-if="name === '鱼肉'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 16c4-6 10-8 16-6 2-3 5-4 7-4-1 3-1 5 0 8-1 3-1 5 0 8-2 0-5-1-7-4-6 2-12 0-16-6z"/>
    <circle cx="22" cy="14" r="1"/>
  </svg>

  <!-- 虾 -->
  <svg v-else-if="name === '虾'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 12c2-4 6-5 10-4 3 1 5 3 6 6 0 3-2 6-5 7-4 1-7 0-9-2l-4 5"/>
    <path d="M18 10l2-4M21 11l3-3"/><circle cx="20" cy="14" r="1"/>
  </svg>

  <!-- 西兰花 -->
  <svg v-else-if="name === '西兰花'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="4"/><circle cx="20" cy="12" r="4"/><circle cx="16" cy="9" r="4"/>
    <path d="M14 16l-2 10M18 16l2 10M16 13v13"/>
  </svg>

  <!-- 青菜 -->
  <svg v-else-if="name === '青菜'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 26c-2-4-6-6-8-10 0-4 3-7 8-7s8 3 8 7c-2 4-6 6-8 10z"/>
    <path d="M16 12v14M12 15c2 1 2 4 0 6M20 15c-2 1-2 4 0 6"/>
  </svg>

  <!-- 番茄 -->
  <svg v-else-if="name === '番茄'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="16" cy="18" r="8"/><path d="M12 10c2-2 6-2 8 0"/>
    <path d="M16 10V7M14 8l-2-3M18 8l2-3"/>
  </svg>

  <!-- 黄瓜 -->
  <svg v-else-if="name === '黄瓜'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 24c-1-1-2-4 0-8l10-10c4-2 7-1 8 0s2 4 0 8L16 24c-4 2-7 1-8 0z"/>
    <path d="M13 15l1 1M16 12l1 1M19 9l1 1"/>
  </svg>

  <!-- 玉米 -->
  <svg v-else-if="name === '玉米'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="16" cy="16" rx="5" ry="10"/><path d="M12 10h8M12 14h8M12 18h8M12 22h8"/>
    <path d="M11 8c-2-2-4-2-5-1M21 8c2-2 4-2 5-1"/>
  </svg>

  <!-- 牛奶 -->
  <svg v-else-if="name === '牛奶'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 8h12l2 18H8L10 8z"/><path d="M10 8l-1-4h14l-1 4"/><path d="M8 18h16"/>
  </svg>

  <!-- 豆浆 -->
  <svg v-else-if="name === '豆浆'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 10h14v14a3 3 0 01-3 3H12a3 3 0 01-3-3V10z"/><path d="M7 10h18"/>
    <circle cx="13" cy="18" r="1.5"/><circle cx="19" cy="17" r="1.2"/><circle cx="16" cy="21" r="1"/>
  </svg>

  <!-- 可乐 -->
  <svg v-else-if="name === '可乐'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="10" y="6" width="12" height="20" rx="3"/><path d="M10 11h12M10 14h12"/>
    <path d="M14 4h4v2h-4z"/>
  </svg>

  <!-- 果汁 -->
  <svg v-else-if="name === '果汁'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 8h12l-1 18H11L10 8z"/><path d="M8 8h16"/><path d="M22 14h4"/>
    <circle cx="16" cy="17" r="3"/><path d="M16 14v-2"/>
  </svg>

  <!-- 酸奶 -->
  <svg v-else-if="name === '酸奶'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 10h12v13a3 3 0 01-3 3h-6a3 3 0 01-3-3V10z"/><path d="M9 10h14"/>
    <path d="M10 7h12v3H10z"/><path d="M13 16c0 2 1.5 3 3 3s3-1 3-3"/>
  </svg>

  <!-- Fallback -->
  <svg v-else :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5">
    <circle cx="16" cy="16" r="12"/><path d="M12 16h8M16 12v8" stroke-linecap="round"/>
  </svg>
</template>
