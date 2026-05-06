import { ref } from 'vue'
import { db } from '../db/schema'

const profile = ref(null)

export function useProfile() {
  async function load() {
    profile.value = await db.userProfile.toCollection().first() || null
  }

  async function save(data) {
    const plain = JSON.parse(JSON.stringify(data))
    if (profile.value?.id) {
      await db.userProfile.update(profile.value.id, { ...plain, updatedAt: Date.now() })
    } else {
      const id = await db.userProfile.add({ ...plain, createdAt: Date.now(), updatedAt: Date.now() })
      plain.id = id
    }
    profile.value = { ...plain }
  }

  return { profile, load, save }
}
