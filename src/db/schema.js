import Dexie from 'dexie'

export const db = new Dexie('CarbCycleDB')

db.version(1).stores({
  userProfile: '++id',
  dailyLog: 'date',
  foodLibrary: '++id, name, isBuiltIn',
  weeklyReview: 'weekStart'
})

db.version(2).stores({
  userProfile: '++id',
  dailyLog: 'date',
  foodLibrary: '++id, name, isBuiltIn, isActive',
  weeklyReview: 'weekStart'
})

db.version(3).stores({
  userProfile: '++id',
  dailyLog: 'date',
  foodLibrary: '++id, name, isBuiltIn, isActive',
  weeklyReview: 'weekStart'
}).upgrade(tx => {
  return tx.table('foodLibrary').toCollection().modify(food => {
    if (food.name === '米饭') {
      food.unitType = 'bowl'
      food.unitLabel = '碗'
      food.unitCapacity = '约300ml家用碗'
      food.unitGrams = 150
      food.maxUnits = 5
    } else if (food.name === '面条') {
      food.unitType = 'bowl'
      food.unitLabel = '碗'
      food.unitCapacity = '约400ml面碗'
      food.unitGrams = 220
      food.maxUnits = 4
    } else if (food.name === '馒头') {
      food.unitType = 'piece'
      food.unitLabel = '个'
      food.unitCapacity = '中等大小约80g/个'
      food.unitGrams = 80
      food.maxUnits = 5
    } else if (food.name === '燕麦片') {
      food.unitType = 'bowl'
      food.unitLabel = '碗'
      food.unitCapacity = '约250ml碗，干燕麦'
      food.unitGrams = 40
      food.maxUnits = 4
    }
  })
})

export async function seedFoodLibrary() {
  const count = await db.foodLibrary.where('isBuiltIn').equals(1).count()
  if (count > 0) return

  await db.foodLibrary.bulkAdd([
    {
      name: '米饭',
      carbPer100g: 26,
      proteinPer100g: 2.6,
      fatPer100g: 0.3,
      state: 'cooked',
      unitType: 'bowl',
      unitLabel: '碗',
      unitCapacity: '约300ml家用碗',
      unitGrams: 150,
      maxUnits: 5,
      servings: { small: 100, medium: 150, large: 200 },
      isBuiltIn: 1,
      isActive: 1
    },
    {
      name: '面条',
      carbPer100g: 25,
      proteinPer100g: 4.5,
      fatPer100g: 0.6,
      state: 'cooked',
      unitType: 'bowl',
      unitLabel: '碗',
      unitCapacity: '约400ml面碗',
      unitGrams: 220,
      maxUnits: 4,
      servings: { small: 150, medium: 220, large: 300 },
      isBuiltIn: 1,
      isActive: 1
    },
    {
      name: '馒头',
      carbPer100g: 47,
      proteinPer100g: 7,
      fatPer100g: 1.1,
      state: 'cooked',
      unitType: 'piece',
      unitLabel: '个',
      unitCapacity: '中等大小约80g/个',
      unitGrams: 80,
      maxUnits: 5,
      servings: { small: 50, medium: 80, large: 100 },
      isBuiltIn: 1,
      isActive: 1
    },
    {
      name: '燕麦片',
      carbPer100g: 66,
      proteinPer100g: 15,
      fatPer100g: 6.7,
      state: 'raw',
      unitType: 'bowl',
      unitLabel: '碗',
      unitCapacity: '约250ml碗，干燕麦',
      unitGrams: 40,
      maxUnits: 4,
      servings: { small: 30, medium: 40, large: 60 },
      isBuiltIn: 1,
      isActive: 1
    }
  ])
}
