import { ProteinSourceReference } from '../types';

export const ISSN_PROTEIN_SOURCES: ProteinSourceReference[] = [
  {
    name: 'Whey Protein Isolate',
    sourceType: 'Supplement (Dairy)',
    proteinDensityPercent: 90.0,
    primaryBenefit: 'Rapid digestion & absorption; exceptionally high in BCAAs/Leucine; ideal post-workout.',
    scientificSource: 'Athletic Lab [5, 7]; ISSN Position Stand [11, 21]',
  },
  {
    name: 'Whey Protein Concentrate',
    sourceType: 'Supplement (Dairy)',
    proteinDensityPercent: 80.0,
    primaryBenefit: 'Highly bioavailable, rich in essential amino acids, excellent and cost-effective daily option.',
    scientificSource: 'VPA Australia [2, 262]; Myprotein UK [9, 361]',
  },
  {
    name: 'Micellar Casein',
    sourceType: 'Supplement (Dairy)',
    proteinDensityPercent: 80.0,
    primaryBenefit: 'Sustained-release; prevents muscle breakdown; highly recommended pre-sleep.',
    scientificSource: 'Athletic Lab [5, 8]; ISSN Position Stand [11, 1006]',
  },
  {
    name: 'Soy Protein Isolate',
    sourceType: 'Supplement (Plant)',
    proteinDensityPercent: 83.0,
    primaryBenefit: 'Complete plant-based option; lowers LDL cholesterol; improves bone density.',
    scientificSource: 'Athletic Lab [5, 10]; ISSN Position Stand [11, 604]',
  },
  {
    name: 'Chicken Breast (Cooked)',
    sourceType: 'Whole Food (Animal)',
    proteinDensityPercent: 31.0,
    primaryBenefit: 'Ultra-lean, high-satiety whole food protein; triggers natural fullness and satiety hormones.',
    scientificSource: 'VPA Australia [2, 257]; Evolv Journal [6, 309]',
  },
  {
    name: 'Lean Beef (Cooked)',
    sourceType: 'Whole Food (Animal)',
    proteinDensityPercent: 26.0,
    primaryBenefit: 'Rich in micronutrients, iron, zinc, and natural creatine; highly bioavailable.',
    scientificSource: 'Myprotein UK [9, 363]; ISSN Exercise Review [15, 604]',
  },
  {
    name: 'White Fish (Cooked)',
    sourceType: 'Whole Food (Animal)',
    proteinDensityPercent: 20.0,
    primaryBenefit: 'Extremely low-fat, high-purity protein; ideal for managing calories during a deficit.',
    scientificSource: 'Evolv Journal [6, 309]; ISSN Exercise Review [15, 604]',
  },
  {
    name: 'Whole Eggs',
    sourceType: 'Whole Food (Animal)',
    proteinDensityPercent: 12.5,
    primaryBenefit: 'Gold standard of bioavailability; rich in healthy fats, choline, and micronutrients.',
    scientificSource: 'Athletic Lab [5, 11]; Myprotein UK [9, 365]',
  },
];

export interface IssnMacroCalculationInput {
  bodyWeightKg: number;
  bodyFatPercent: number;
  targetProteinFactorGPerKg: number; // e.g. 2.2
  targetFatFactorGPerKg: number; // e.g. 1.0
  caloricAdjustmentKcal: number; // e.g. -300 or +250
  activityMultiplierFactor: number; // e.g. 15 (multiplier for bodyweight in lbs or formula)
  dailyProteinServings: number; // e.g. 4
}

export interface IssnMacroCalculationResult {
  bodyWeightKg: number;
  bodyWeightLbs: number;
  bodyFatPercent: number;
  fatFreeMassKg: number;
  fatFreeMassLbs: number;
  estimatedMaintenanceTdeeKcal: number;
  dailyCaloricTargetKcal: number;
  dailyProteinTargetGrams: number;
  dailyFatTargetGrams: number;
  dailyCarbohydrateTargetGrams: number;
  totalEnergyCheckKcal: number;
  proteinEnergyPercent: number;
  fatEnergyPercent: number;
  carbohydrateEnergyPercent: number;
  totalPercentageCheck: number;
  targetProteinPerServingGrams: number;
  issnServingThresholdPass: boolean;
  preSleepCaseinIngestionTargetGrams: number;
}

export function calculateIssnNutritionTargets(input: IssnMacroCalculationInput): IssnMacroCalculationResult {
  const bodyWeightLbs = input.bodyWeightKg * 2.20462262;
  const fatFreeMassKg = input.bodyWeightKg * (1 - input.bodyFatPercent / 100);
  const fatFreeMassLbs = fatFreeMassKg * 2.20462262;

  // Maintenance calculation based on standard athletic formula (BW lbs * Activity factor or Katch-McArdle)
  // Standard ISSN / Muscle PhD convention: BW in lbs * activity factor (e.g. 165.3 lbs * 15 = ~2480 kcal)
  const estimatedMaintenanceTdeeKcal = Math.round(bodyWeightLbs * input.activityMultiplierFactor);
  const dailyCaloricTargetKcal = Math.max(1200, estimatedMaintenanceTdeeKcal + input.caloricAdjustmentKcal);

  const dailyProteinTargetGrams = Math.round(input.bodyWeightKg * input.targetProteinFactorGPerKg);
  const dailyFatTargetGrams = Math.round(input.bodyWeightKg * input.targetFatFactorGPerKg);

  const proteinKcal = dailyProteinTargetGrams * 4;
  const fatKcal = dailyFatTargetGrams * 9;
  const remainingCarbKcal = Math.max(0, dailyCaloricTargetKcal - proteinKcal - fatKcal);
  const dailyCarbohydrateTargetGrams = Math.round(remainingCarbKcal / 4);

  const totalEnergyCheckKcal = proteinKcal + fatKcal + (dailyCarbohydrateTargetGrams * 4);
  const proteinEnergyPercent = Number(((proteinKcal / totalEnergyCheckKcal) * 100).toFixed(1));
  const fatEnergyPercent = Number(((fatKcal / totalEnergyCheckKcal) * 100).toFixed(1));
  const carbohydrateEnergyPercent = Number((100 - proteinEnergyPercent - fatEnergyPercent).toFixed(1));
  const totalPercentageCheck = Number((proteinEnergyPercent + fatEnergyPercent + carbohydrateEnergyPercent).toFixed(1));

  const servings = Math.max(1, input.dailyProteinServings);
  const targetProteinPerServingGrams = Number((dailyProteinTargetGrams / servings).toFixed(1));
  // ISSN threshold check: at least 0.4g/kg/meal or ~30-45g per serving for maximal leucine trigger
  const issnServingThresholdPass = targetProteinPerServingGrams >= 25 && targetProteinPerServingGrams <= 55;
  const preSleepCaseinIngestionTargetGrams = 35.0;

  return {
    bodyWeightKg: input.bodyWeightKg,
    bodyWeightLbs: Number(bodyWeightLbs.toFixed(1)),
    bodyFatPercent: input.bodyFatPercent,
    fatFreeMassKg: Number(fatFreeMassKg.toFixed(1)),
    fatFreeMassLbs: Number(fatFreeMassLbs.toFixed(1)),
    estimatedMaintenanceTdeeKcal,
    dailyCaloricTargetKcal,
    dailyProteinTargetGrams,
    dailyFatTargetGrams,
    dailyCarbohydrateTargetGrams,
    totalEnergyCheckKcal,
    proteinEnergyPercent,
    fatEnergyPercent,
    carbohydrateEnergyPercent,
    totalPercentageCheck,
    targetProteinPerServingGrams,
    issnServingThresholdPass,
    preSleepCaseinIngestionTargetGrams,
  };
}
