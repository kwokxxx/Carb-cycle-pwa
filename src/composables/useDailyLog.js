import { ref } from 'vue'
import { db } from '../db/schema'

export function useDailyLog() {
  const log = ref(null)

  async function load(dateStr) {
    log.value = await db.dailyLog.get(dateStr) || null
  }

  async function ensure(dateStr, dayType, targets) {
    let existing = await db.dailyLog.get(dateStr)
    if (!existing) {
      existing = {
        date: dateStr,
        dayType,
        targetCarb: targets.carb,
        targetProtein: targets.protein,
        targetFat: targets.fat,
        weighIn: null,
        trainingDone: false,
        trainingNote: '',
        entries: []
      }
      await db.dailyLog.add(existing)
    }
    log.value = existing
    return existing
  }

  async function addEntry(dateStr, entry) {
    const record = await db.dailyLog.get(dateStr)
    if (!record) return
    record.entries.push(entry)
    await db.dailyLog.put(record)
    log.value = { ...record }
  }

  async function removeEntry(dateStr, entryId) {
    const record = await db.dailyLog.get(dateStr)
    if (!record) return
    record.entries = record.entries.filter(e => e.id !== entryId)
    await db.dailyLog.put(record)
    log.value = { ...record }
  }

  async function updateWeighIn(dateStr, weight) {
    const record = await db.dailyLog.get(dateStr)
    if (!record) return
    record.weighIn = weight
    await db.dailyLog.put(record)
    log.value = { ...record }
  }

  return { log, load, ensure, addEntry, removeEntry, updateWeighIn }
}
