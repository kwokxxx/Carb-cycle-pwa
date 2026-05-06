export function calcBMR(gender, weightKg, heightCm, age) {
  if (gender === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161
}

export function calcTDEE(bmr, activityFactor) {
  return bmr * activityFactor
}

export function calcTargetCalories(tdee, goalType, deficitPercent = 17) {
  switch (goalType) {
    case 'aesthetic_cut':
      return tdee * (1 - deficitPercent / 100)
    case 'standard_cut':
      return tdee * (1 - deficitPercent / 100)
    case 'maintain':
      return tdee
    case 'diet_break':
      return tdee * 0.95
    default:
      return tdee
  }
}

export function calcProteinGrams(weightKg, proteinPerKg = 2.0) {
  return Math.round(weightKg * proteinPerKg)
}

export function calcFatGrams(weightKg, fatPerKg = 0.8) {
  return Math.round(weightKg * fatPerKg)
}

export function calcDefaultCarbs(targetCalories, proteinG, fatG, weightKg) {
  const proteinCal = proteinG * 4
  const fatCal = fatG * 9
  const remainingCal = targetCalories - proteinCal - fatCal
  const avgCarbG = Math.max(0, Math.round(remainingCal / 4))

  const refeed = Math.round(weightKg * 3.5)
  const regular = Math.round(weightKg * 3.0)
  const low = Math.round(weightKg * 1.8)

  return { refeed, regular, low, avgCarbG }
}

export function calcWeeklyAverage(profile) {
  const { trainingDays, carbRefeed, carbRegular, carbLow, proteinPerKg, fatPerKg, currentWeight } = profile
  const proteinG = calcProteinGrams(currentWeight, proteinPerKg)
  const fatG = calcFatGrams(currentWeight, fatPerKg)

  const schedule = getWeekSchedule(trainingDays)
  let totalCarb = 0
  for (const dayType of schedule) {
    if (dayType === 'refeed') totalCarb += carbRefeed
    else if (dayType === 'regular') totalCarb += carbRegular
    else totalCarb += carbLow
  }

  const avgDailyCarb = totalCarb / 7
  const avgDailyCal = (avgDailyCarb * 4) + (proteinG * 4) + (fatG * 9)
  return { avgDailyCarb: Math.round(avgDailyCarb), avgDailyCal: Math.round(avgDailyCal) }
}

export function calcDeficitFromAvg(avgDailyCal, tdee) {
  if (tdee <= 0) return 0
  return Math.round(((tdee - avgDailyCal) / tdee) * 100)
}

export function getWeekSchedule(trainingDays) {
  const schedule = []
  for (let d = 1; d <= 7; d++) {
    const isTraining = trainingDays.includes(d)
    if (!isTraining) {
      schedule.push('low')
    } else {
      const prevDay = d === 1 ? 7 : d - 1
      const prevIsTraining = trainingDays.includes(prevDay)
      schedule.push(prevIsTraining ? 'refeed' : 'regular')
    }
  }
  return schedule
}

export function getDayType(date, trainingDays) {
  const jsDay = date.getDay()
  const isoDay = jsDay === 0 ? 7 : jsDay
  const schedule = getWeekSchedule(trainingDays)
  return schedule[isoDay - 1]
}

export function carbsFromFood(amountG, carbPer100g) {
  return Math.round((amountG * carbPer100g) / 100)
}
