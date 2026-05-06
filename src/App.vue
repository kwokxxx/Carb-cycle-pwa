<script setup>
import { onMounted } from 'vue'
import { seedFoodLibrary } from './db/schema'

onMounted(() => {
  seedFoodLibrary()
})
</script>

<template>
  <div class="min-h-screen max-w-lg mx-auto bg-[#e8e8ed]">
    <router-view v-slot="{ Component }">
      <transition name="slide-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>
