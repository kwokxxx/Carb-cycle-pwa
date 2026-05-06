import { createRouter, createWebHistory } from 'vue-router'
import { db } from '../db/schema'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomePage.vue')
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('../views/OnboardingPage.vue')
    },
    {
      path: '/day/:date',
      name: 'dayDetail',
      component: () => import('../views/DayDetailPage.vue'),
      props: true
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsPage.vue')
    }
  ]
})

router.beforeEach(async (to) => {
  if (to.name === 'onboarding') return true
  const profile = await db.userProfile.toCollection().first()
  if (!profile) return { name: 'onboarding' }
  return true
})

export default router
