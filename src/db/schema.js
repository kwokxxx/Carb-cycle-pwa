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

db.version(4).stores({
  userProfile: '++id',
  dailyLog: 'date',
  foodLibrary: '++id, name, isBuiltIn, isActive, category',
  weeklyReview: 'weekStart'
}).upgrade(tx => {
  return tx.table('foodLibrary').toCollection().modify(food => {
    if (!food.category) food.category = 'staple'
  })
})

export async function seedFoodLibrary() {
  const existing = await db.foodLibrary.where('isBuiltIn').equals(1).toArray()
  const existingNames = new Set(existing.map(f => f.name))

  const allFoods = [
    // 主食
    {
      name: '米饭', category: 'staple',
      carbPer100g: 26, proteinPer100g: 2.6, fatPer100g: 0.3,
      state: 'cooked', unitType: 'bowl', unitLabel: '碗',
      unitCapacity: '约300ml家用碗', unitGrams: 150, maxUnits: 5,
      isBuiltIn: 1, isActive: 1
    },
    {
      name: '面条', category: 'staple',
      carbPer100g: 25, proteinPer100g: 4.5, fatPer100g: 0.6,
      state: 'cooked', unitType: 'bowl', unitLabel: '碗',
      unitCapacity: '约400ml面碗', unitGrams: 220, maxUnits: 4,
      isBuiltIn: 1, isActive: 1
    },
    {
      name: '馒头', category: 'staple',
      carbPer100g: 47, proteinPer100g: 7, fatPer100g: 1.1,
      state: 'cooked', unitType: 'piece', unitLabel: '个',
      unitCapacity: '中等大小约80g/个', unitGrams: 80, maxUnits: 5,
      isBuiltIn: 1, isActive: 1
    },
    {
      name: '燕麦片', category: 'staple',
      carbPer100g: 66, proteinPer100g: 15, fatPer100g: 6.7,
      state: 'raw', unitType: 'bowl', unitLabel: '碗',
      unitCapacity: '约250ml碗，干燕麦', unitGrams: 40, maxUnits: 4,
      isBuiltIn: 1, isActive: 1
    },
    {
      name: '红薯', category: 'staple',
      carbPer100g: 20, proteinPer100g: 1.6, fatPer100g: 0.1,
      state: 'cooked', unitType: 'piece', unitLabel: '个',
      unitCapacity: '中等大小约200g/个', unitGrams: 200, maxUnits: 3,
      isBuiltIn: 1, isActive: 1
    },
    {
      name: '面包', category: 'staple',
      carbPer100g: 49, proteinPer100g: 9, fatPer100g: 3.2,
      state: 'cooked', unitType: 'piece', unitLabel: '片',
      unitCapacity: '普通吐司约30g/片', unitGrams: 30, maxUnits: 6,
      isBuiltIn: 1, isActive: 1
    },
    // 肉蛋
    {
      name: '鸡胸肉', category: 'meat',
      carbPer100g: 0, proteinPer100g: 23.3, fatPer100g: 1.2,
      state: 'cooked', unitType: 'piece', unitLabel: '块',
      unitCapacity: '一块约130g', unitGrams: 130, maxUnits: 4,
      isBuiltIn: 1, isActive: 1
    },
    {
      name: '牛肉', category: 'meat',
      carbPer100g: 0, proteinPer100g: 20, fatPer100g: 10,
      state: 'cooked', unitType: 'weight', unitLabel: '份',
      unitCapacity: '一份约150g', unitGrams: 150, maxUnits: 4,
      isBuiltIn: 1, isActive: 1
    },
    {
      name: '鸡蛋', category: 'meat',
      carbPer100g: 1.5, proteinPer100g: 13, fatPer100g: 10,
      state: 'cooked', unitType: 'piece', unitLabel: '个',
      unitCapacity: '约50g/个（带壳60g）', unitGrams: 50, maxUnits: 6,
      isBuiltIn: 1, isActive: 1
    },
    {
      name: '鱼肉', category: 'meat',
      carbPer100g: 0, proteinPer100g: 18, fatPer100g: 3,
      state: 'cooked', unitType: 'weight', unitLabel: '份',
      unitCapacity: '一份约150g', unitGrams: 150, maxUnits: 3,
      isBuiltIn: 1, isActive: 1
    },
    {
      name: '虾', category: 'meat',
      carbPer100g: 0, proteinPer100g: 19, fatPer100g: 1,
      state: 'cooked', unitType: 'weight', unitLabel: '份',
      unitCapacity: '去壳约100g/份', unitGrams: 100, maxUnits: 4,
      isBuiltIn: 1, isActive: 1
    },
    // 蔬菜
    {
      name: '西兰花', category: 'veggie',
      carbPer100g: 4.3, proteinPer100g: 4.1, fatPer100g: 0.4,
      state: 'cooked', unitType: 'weight', unitLabel: '份',
      unitCapacity: '一份约150g', unitGrams: 150, maxUnits: 3,
      isBuiltIn: 1, isActive: 1
    },
    {
      name: '青菜', category: 'veggie',
      carbPer100g: 2, proteinPer100g: 1.5, fatPer100g: 0.2,
      state: 'cooked', unitType: 'weight', unitLabel: '份',
      unitCapacity: '一盘约200g', unitGrams: 200, maxUnits: 3,
      isBuiltIn: 1, isActive: 1
    },
    {
      name: '番茄', category: 'veggie',
      carbPer100g: 3.9, proteinPer100g: 0.9, fatPer100g: 0.2,
      state: 'raw', unitType: 'piece', unitLabel: '个',
      unitCapacity: '中等约150g/个', unitGrams: 150, maxUnits: 4,
      isBuiltIn: 1, isActive: 1
    },
    {
      name: '黄瓜', category: 'veggie',
      carbPer100g: 2.9, proteinPer100g: 0.7, fatPer100g: 0.1,
      state: 'raw', unitType: 'piece', unitLabel: '根',
      unitCapacity: '约200g/根', unitGrams: 200, maxUnits: 3,
      isBuiltIn: 1, isActive: 1
    },
    {
      name: '玉米', category: 'veggie',
      carbPer100g: 19, proteinPer100g: 3.3, fatPer100g: 1.2,
      state: 'cooked', unitType: 'piece', unitLabel: '根',
      unitCapacity: '中等约200g可食部分', unitGrams: 200, maxUnits: 3,
      isBuiltIn: 1, isActive: 1
    },
    // 饮料
    {
      name: '牛奶', category: 'drink',
      carbPer100g: 4.8, proteinPer100g: 3.2, fatPer100g: 3.6,
      state: 'liquid', unitType: 'cup', unitLabel: '杯',
      unitCapacity: '一杯约250ml', unitGrams: 250, maxUnits: 3,
      isBuiltIn: 1, isActive: 1
    },
    {
      name: '豆浆', category: 'drink',
      carbPer100g: 1.2, proteinPer100g: 3.3, fatPer100g: 1.8,
      state: 'liquid', unitType: 'cup', unitLabel: '杯',
      unitCapacity: '一杯约300ml', unitGrams: 300, maxUnits: 3,
      isBuiltIn: 1, isActive: 1
    },
    {
      name: '可乐', category: 'drink',
      carbPer100g: 10.6, proteinPer100g: 0, fatPer100g: 0,
      state: 'liquid', unitType: 'can', unitLabel: '罐',
      unitCapacity: '一罐330ml', unitGrams: 330, maxUnits: 3,
      isBuiltIn: 1, isActive: 1
    },
    {
      name: '果汁', category: 'drink',
      carbPer100g: 10, proteinPer100g: 0.4, fatPer100g: 0.1,
      state: 'liquid', unitType: 'cup', unitLabel: '杯',
      unitCapacity: '一杯约250ml', unitGrams: 250, maxUnits: 3,
      isBuiltIn: 1, isActive: 1
    },
    {
      name: '酸奶', category: 'drink',
      carbPer100g: 10, proteinPer100g: 3.1, fatPer100g: 2.7,
      state: 'liquid', unitType: 'cup', unitLabel: '杯',
      unitCapacity: '一杯约200g', unitGrams: 200, maxUnits: 3,
      isBuiltIn: 1, isActive: 1
    }
  ]

  const toAdd = allFoods.filter(f => !existingNames.has(f.name))
  if (toAdd.length > 0) await db.foodLibrary.bulkAdd(toAdd)
}
