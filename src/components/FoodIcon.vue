<script setup>
defineProps({ name: String, size: { type: Number, default: 28 } })
</script>

<template>
  <!-- 米饭: bowl with rice -->
  <svg v-if="name === '米饭'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 16c0 6 4.5 10 10 10s10-4 10-10"/>
    <path d="M4 16h24"/>
    <path d="M10 12c0-2.5 2-4 3.5-4.5M16 7c1 0 3 .5 3.5 3M21 11c.5-1.5 1.5-2 2.5-2"/>
  </svg>

  <!-- 面条: noodle bowl -->
  <svg v-else-if="name === '面条'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 16c0 6 4.5 10 10 10s10-4 10-10"/>
    <path d="M4 16h24"/>
    <path d="M10 10c2 2 1 4 3 6M16 8c1 2 0 5 2 8M22 10c-2 2-1 4-3 6"/>
  </svg>

  <!-- 馒头: steamed bun -->
  <svg v-else-if="name === '馒头'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 22c0 2 4.5 4 10 4s10-2 10-4"/>
    <path d="M6 22c0-7 4.5-14 10-14s10 7 10 14"/>
    <path d="M13 14c1.5-1 3.5-1 5 0"/>
  </svg>

  <!-- 燕麦片: oat bowl -->
  <svg v-else-if="name === '燕麦片'" :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 16c0 6 4.5 10 10 10s10-4 10-10"/>
    <path d="M4 16h24"/>
    <circle cx="11" cy="14" r="1.5"/><circle cx="16" cy="13" r="1.5"/><circle cx="21" cy="14" r="1.5"/><circle cx="13.5" cy="10" r="1.2"/>
  </svg>

  <!-- Fallback -->
  <svg v-else :width="size" :height="size" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5">
    <circle cx="16" cy="16" r="12"/>
    <path d="M12 16h8M16 12v8" stroke-linecap="round"/>
  </svg>
</template>
