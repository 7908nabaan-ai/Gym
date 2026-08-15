import { UserProfile, CalculationResults, UnitSystem } from '../types';

export const UNIT_CONVERSIONS = {
  kgToLbs: 2.20462262,
  lbsToKg: 0.45359237,
  cmToInches: 0.393700787,
  inchesToCm: 2.54,
};

export function formatWeight(kg: number, unit: UnitSystem, decimals: number = 1): string {
  if (unit === 'imperial') {
    return `${(kg * UNIT_CONVERSIONS.kgToLbs).toFixed(decimals)} lbs`;
  }
  return `${kg.toFixed(decimals)} kg`;
}

export function formatLength(cm: number, unit: UnitSystem, decimals: number = 1): string {
  if (unit === 'imperial') {
    return `${(cm * UNIT_CONVERSIONS.cmToInches).toFixed(decimals)} in`;
  }
  return `${cm.toFixed(decimals)} cm`;
}

export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female',
  bodyFatPercentage?: number
): { katchMcArdle: number; mifflinStJeor: number; recommended: number } {
  // Mifflin-St Jeor
  const s = gender === 'male' ? 5 : -161;
  const mifflinStJeor = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + s);

  // Katch-McArdle (if body fat is known)
  let katchMcArdle = mifflinStJeor;
  if (bodyFatPercentage !== undefined && bodyFatPercentage > 0 && bodyFatPercentage < 60) {
    const lbmKg = weightKg * (1 - bodyFatPercentage / 100);
    katchMcArdle = Math.round(370 + 21.6 * lbmKg);
  }

  // Recommended for bodybuilders is Katch-McArdle when body fat is known
  const recommended = bodyFatPercentage && bodyFatPercentage > 0 ? katchMcArdle : mifflinStJeor;

  return { katchMcArdle, mifflinStJeor, recommended };
}

export function getActivityMultiplier(
  activityLevel: string,
  trainingDaysPerWeek: number
): number {
  let baseMultiplier = 1.2;
  switch (activityLevel) {
    case 'sedentary':
      baseMultiplier = 1.2;
      break;
    case 'light':
      baseMultiplier = 1.375;
      break;
    case 'moderate':
      baseMultiplier = 1.55;
      break;
    case 'very_active':
      baseMultiplier = 1.725;
      break;
    case 'extreme':
      baseMultiplier = 1.9;
      break;
    default:
      baseMultiplier = 1.45;
  }

  // Slight fine-tuning if heavy resistance training frequency is high
  const frequencyBonus = Math.max(0, (trainingDaysPerWeek - 3) * 0.025);
  return Math.min(2.1, baseMultiplier + frequencyBonus);
}

export function calculateCaseyButtGeneticLimit(
  heightCm: number,
  wristCm: number,
  ankleCm: number,
  targetBfPercent: number = 10
): {
  maxLeanMassKg: number;
  maxTotalWeightKg: number;
  maxChestCm: number;
  maxArmCm: number;
  maxThighCm: number;
  maxCalfCm: number;
} {
  const heightInches = heightCm * UNIT_CONVERSIONS.cmToInches;
  const wristInches = wristCm * UNIT_CONVERSIONS.cmToInches;
  const ankleInches = ankleCm * UNIT_CONVERSIONS.cmToInches;
  const targetBfFrac = targetBfPercent / 100;

  // Casey Butt formula:
  // Max LBM (lbs) = H^1.5 * ( (sqrt(W)/22.6670) + (sqrt(A)/17.0104) ) * ( (BF%/224) + 1 )
  const term1 = Math.pow(heightInches, 1.5);
  const term2 = Math.sqrt(wristInches) / 22.667 + Math.sqrt(ankleInches) / 17.0104;
  const term3 = (targetBfPercent / 224) + 1;

  const maxLbmLbs = term1 * term2 * term3;
  const maxLeanMassKg = Math.round((maxLbmLbs * UNIT_CONVERSIONS.lbsToKg) * 10) / 10;
  const maxTotalWeightKg = Math.round((maxLeanMassKg / (1 - targetBfFrac)) * 10) / 10;

  // Circumference calculations in inches:
  const chestInches = 1.6817 * wristInches + 1.3759 * ankleInches + 0.3314 * heightInches;
  const armInches = 1.2033 * wristInches + 0.1236 * heightInches;
  const thighInches = 1.3868 * ankleInches + 0.1805 * heightInches;
  const calfInches = 0.9298 * ankleInches + 0.1210 * heightInches;

  return {
    maxLeanMassKg,
    maxTotalWeightKg,
    maxChestCm: Math.round(chestInches * UNIT_CONVERSIONS.inchesToCm * 10) / 10,
    maxArmCm: Math.round(armInches * UNIT_CONVERSIONS.inchesToCm * 10) / 10,
    maxThighCm: Math.round(thighInches * UNIT_CONVERSIONS.inchesToCm * 10) / 10,
    maxCalfCm: Math.round(calfInches * UNIT_CONVERSIONS.inchesToCm * 10) / 10,
  };
}

export function calculateFFMI(weightKg: number, heightCm: number, bodyFatPercentage: number): {
  lbmKg: number;
  fatKg: number;
  ffmi: number;
  normalizedFfmi: number;
  category: string;
} {
  const heightM = heightCm / 100;
  const lbmKg = weightKg * (1 - bodyFatPercentage / 100);
  const fatKg = weightKg - lbmKg;

  const ffmi = lbmKg / (heightM * heightM);
  // Normalized to 1.8m height (standard Kouri et al.)
  const normalizedFfmi = ffmi + 6.1 * (1.8 - heightM);

  let category = 'Average';
  if (normalizedFfmi < 18) category = 'Below Average (Untrained)';
  else if (normalizedFfmi < 20) category = 'Average / Beginner';
  else if (normalizedFfmi < 22) category = 'Above Average / Trained';
  else if (normalizedFfmi < 23.5) category = 'Excellent / Advanced Lifter';
  else if (normalizedFfmi < 25) category = 'Elite Natural Bodybuilder';
  else category = 'Genetic Apex / Exceptional';

  return {
    lbmKg: Math.round(lbmKg * 10) / 10,
    fatKg: Math.round(fatKg * 10) / 10,
    ffmi: Math.round(ffmi * 10) / 10,
    normalizedFfmi: Math.round(normalizedFfmi * 10) / 10,
    category,
  };
}

export function calculateMuscleGrowthVelocity(
  experienceLevel: string,
  weightKg: number,
  _trainingYears: number
): {
  monthlyRatePercent: number;
  monthlyGainKg: number;
  annualGainKg: number;
} {
  // Alan Aragon model
  let monthlyRatePercent = 1.0; // % bodyweight per month
  let annualGainKg = 8.0;

  switch (experienceLevel) {
    case 'novice':
      // 1.0% - 1.5% per month
      monthlyRatePercent = 1.25;
      annualGainKg = 10.0;
      break;
    case 'intermediate':
      // 0.5% - 1.0% per month
      monthlyRatePercent = 0.75;
      annualGainKg = 5.0;
      break;
    case 'advanced':
      // 0.25% - 0.5% per month
      monthlyRatePercent = 0.35;
      annualGainKg = 2.5;
      break;
    case 'elite':
      // < 0.25% per month
      monthlyRatePercent = 0.15;
      annualGainKg = 1.2;
      break;
    default:
      monthlyRatePercent = 0.75;
      annualGainKg = 5.0;
  }

  const monthlyGainKg = (weightKg * (monthlyRatePercent / 100));

  return {
    monthlyRatePercent,
    monthlyGainKg: Math.round(monthlyGainKg * 100) / 100,
    annualGainKg: Math.round(annualGainKg * 10) / 10,
  };
}

export function calculateComprehensiveMetrics(profile: UserProfile): CalculationResults {
  const { katchMcArdle } = calculateBMR(
    profile.currentWeightKg,
    profile.heightCm,
    profile.age,
    profile.gender,
    profile.bodyFatPercentage
  );

  const multiplier = getActivityMultiplier(profile.activityLevel, profile.trainingDaysPerWeek);
  const tdee = Math.round(katchMcArdle * multiplier);

  // Caloric delta from goal percentage
  const deltaFactor = profile.surplusDeficitPercent / 100;
  const targetCalories = Math.round(tdee * (1 + deltaFactor));
  const caloricDelta = targetCalories - tdee;

  // FFMI & Body Comp
  const bodyComp = calculateFFMI(profile.currentWeightKg, profile.heightCm, profile.bodyFatPercentage);
  const lbmKg = bodyComp.lbmKg;

  // Macronutrient calculation tailored for bodybuilders
  let proteinPerKgLbm = 2.6; // default 2.6g/kg LBM (~1.2g/lb LBM)

  if (profile.goal === 'aggressive_cut' || profile.goal === 'contest_prep') {
    proteinPerKgLbm = 2.9; // Higher protein in deep deficit to preserve lean mass
  } else if (profile.goal === 'moderate_cut') {
    proteinPerKgLbm = 2.7;
  } else if (profile.goal === 'maintenance_recomp') {
    proteinPerKgLbm = 2.5;
  } else if (profile.goal === 'lean_bulk') {
    proteinPerKgLbm = 2.4;
  } else if (profile.goal === 'aggressive_bulk') {
    proteinPerKgLbm = 2.2;
  }

  const proteinGrams = Math.round(lbmKg * proteinPerKgLbm);
  const proteinCalories = proteinGrams * 4;
  const proteinPerKgTotal = Math.round((proteinGrams / profile.currentWeightKg) * 10) / 10;

  // Fat calculation (minimum 0.7g/kg or 20-25% of calories)
  let fatPercentage = 22; // 22% of total calories
  if (profile.goal === 'aggressive_cut' || profile.goal === 'contest_prep') {
    fatPercentage = 18; // Keep fat slightly lower to leave room for glycogen carbs
  } else if (profile.goal === 'aggressive_bulk') {
    fatPercentage = 25;
  }

  let fatCalories = Math.round(targetCalories * (fatPercentage / 100));
  let fatGrams = Math.round(fatCalories / 9);

  // Ensure minimum hormonal threshold (0.6g/kg)
  const minFatGrams = Math.round(profile.currentWeightKg * 0.65);
  if (fatGrams < minFatGrams) {
    fatGrams = minFatGrams;
    fatCalories = fatGrams * 9;
    fatPercentage = Math.round((fatCalories / targetCalories) * 100);
  }

  // Carbohydrates fill remainder
  const carbCalories = Math.max(0, targetCalories - (proteinCalories + fatCalories));
  const carbGrams = Math.round(carbCalories / 4);
  const carbPercentage = Math.round((carbCalories / targetCalories) * 100);

  // Muscle Growth Projections
  const growthVel = calculateMuscleGrowthVelocity(
    profile.experienceLevel,
    profile.currentWeightKg,
    profile.trainingYears
  );

  // Surplus modifier on growth rate:
  // In a deficit, pure muscle gain is low/recomp only; in lean bulk, rate is optimal.
  let surplusEfficiency = 1.0;
  if (caloricDelta > 150 && caloricDelta <= 400) {
    surplusEfficiency = 1.0; // Sweet spot
  } else if (caloricDelta > 400) {
    surplusEfficiency = 1.1; // Slightly faster total weight, higher fat gain
  } else if (caloricDelta >= -150 && caloricDelta <= 150) {
    surplusEfficiency = 0.45; // Recomp velocity
  } else {
    surplusEfficiency = 0.15; // Cut preservation
  }

  const projected12WeekMuscleGainKg = Math.round((growthVel.monthlyGainKg * 3 * surplusEfficiency) * 100) / 100;
  
  // Total weight change over 12 weeks: (Caloric delta * 84 days) / 7700 kcal per kg of tissue
  const totalCaloricChange12W = caloricDelta * 84;
  const projected12WeekTotalDeltaKg = Math.round((totalCaloricChange12W / 7700) * 10) / 10;
  const projected12WeekFatGainKg = Math.round(Math.max(-10, projected12WeekTotalDeltaKg - projected12WeekMuscleGainKg) * 10) / 10;
  const projected12WeekWeightKg = Math.round((profile.currentWeightKg + projected12WeekTotalDeltaKg) * 10) / 10;

  // Casey Butt Genetic Muscular Limit
  const geneticLimit = calculateCaseyButtGeneticLimit(
    profile.heightCm,
    profile.wristCircumferenceCm,
    profile.ankleCircumferenceCm,
    profile.bodyFatPercentage
  );

  const potentialRemainingKg = Math.max(0, Math.round((geneticLimit.maxLeanMassKg - lbmKg) * 10) / 10);
  const percentageOfGeneticLimit = Math.min(100, Math.round((lbmKg / geneticLimit.maxLeanMassKg) * 100));

  return {
    bmr: katchMcArdle,
    tdee,
    targetCalories,
    caloricDelta,
    proteinGrams,
    proteinCalories,
    proteinPerKgLbm: Math.round(proteinPerKgLbm * 10) / 10,
    proteinPerKgTotal,
    fatGrams,
    fatCalories,
    fatPercentage,
    carbGrams,
    carbCalories,
    carbPercentage,
    leanBodyMassKg: lbmKg,
    fatMassKg: bodyComp.fatKg,
    ffmi: bodyComp.ffmi,
    normalizedFfmi: bodyComp.normalizedFfmi,
    ffmiCategory: bodyComp.category,
    aragonMonthlyRatePercent: growthVel.monthlyRatePercent,
    aragonMonthlyGainKg: growthVel.monthlyGainKg,
    mcdonaldAnnualPotentialKg: growthVel.annualGainKg,
    projected12WeekMuscleGainKg,
    projected12WeekFatGainKg,
    projected12WeekWeightKg,
    maxLeanMassKg: geneticLimit.maxLeanMassKg,
    maxTotalWeightAtCurrentBfKg: geneticLimit.maxTotalWeightKg,
    potentialRemainingKg,
    percentageOfGeneticLimit,
    maxChestCm: geneticLimit.maxChestCm,
    maxArmCm: geneticLimit.maxArmCm,
    maxThighCm: geneticLimit.maxThighCm,
    maxCalfCm: geneticLimit.maxCalfCm,
  };
}

export function generateTrajectoryTimeline(
  currentWeightKg: number,
  currentBfPercent: number,
  targetCalories: number,
  tdee: number,
  monthlyMuscleGainRateKg: number,
  weeks: number = 24
) {
  const dailyDelta = targetCalories - tdee;
  const initialLbm = currentWeightKg * (1 - currentBfPercent / 100);
  const initialFat = currentWeightKg - initialLbm;

  const timeline = [];

  for (let w = 0; w <= weeks; w += 2) {
    const days = w * 7;
    // Total tissue mass change from calorie surplus/deficit
    const netKcal = dailyDelta * days;
    const netWeightDelta = netKcal / 7700; // ~7700 kcal per kg of tissue

    // Muscle growth accumulated over w weeks (with plateau curve)
    const months = w / 4.33;
    let expectedMuscleGain = 0;
    if (dailyDelta > 0) {
      expectedMuscleGain = monthlyMuscleGainRateKg * months * Math.pow(0.96, months);
    } else if (dailyDelta >= -200) {
      expectedMuscleGain = monthlyMuscleGainRateKg * 0.4 * months;
    } else {
      expectedMuscleGain = 0; // Cut phase - maintain LBM
    }

    const currentLbm = Math.round((initialLbm + expectedMuscleGain) * 10) / 10;
    const totalWeight = Math.round((currentWeightKg + netWeightDelta) * 10) / 10;
    const currentFat = Math.max(2, Math.round((totalWeight - currentLbm) * 10) / 10);
    const bfPct = Math.max(4, Math.round((currentFat / totalWeight) * 1000) / 10);

    timeline.push({
      week: `Wk ${w}`,
      weekNum: w,
      weightKg: totalWeight,
      leanMassKg: currentLbm,
      fatMassKg: currentFat,
      bodyFatPct: bfPct,
    });
  }

  return timeline;
}
