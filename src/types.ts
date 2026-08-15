export type UnitSystem = 'metric' | 'imperial';

export type GoalPhase = 'lean_bulk' | 'aggressive_bulk' | 'maintenance_recomp' | 'moderate_cut' | 'aggressive_cut' | 'contest_prep';

export type ExperienceLevel = 'novice' | 'intermediate' | 'advanced' | 'elite';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extreme';

export type WorkoutGoal = 'hypertrophy' | 'strength' | 'powerbuilding' | 'recomp' | 'cutting_density';

export type EquipmentAvailability = 
  | 'commercial_gym' 
  | 'home_gym' 
  | 'dumbbells_only' 
  | 'cables_machines' 
  | 'bodyweight_calisthenics';

export type TrainingSplit = 'ppl' | 'upper_lower' | 'full_body' | 'arnold' | 'bro_split';

export interface ExerciseItem {
  id: string;
  name: string;
  targetMuscle: string;
  secondaryMuscles?: string[];
  sets: number;
  repRange: string;
  targetRir: number; // 0-4
  restSeconds: number;
  tempo: string; // e.g. '3-0-1-0'
  formCue: string;
  equipment: EquipmentAvailability | 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight';
  benchmarkLiftKey?: 'benchPressKg' | 'squatKg' | 'deadliftKg' | 'overheadPressKg';
  percentageOf1RM?: number; // e.g. 75 for 75%
  calculatedWeightKg?: number;
  completedSets?: boolean[];
  loggedReps?: number[];
  loggedWeightsKg?: number[];
  notes?: string;
}

export interface WorkoutDay {
  dayNumber: number;
  dayName: string; // e.g. "Day 1: Push (Chest, Shoulders & Triceps)"
  focus: string;
  isRestDay: boolean;
  targetVolumeSets: number;
  estimatedDurationMin: number;
  exercises: ExerciseItem[];
}

export interface PersonalizedWorkoutPlan {
  id: string;
  title: string;
  goal: WorkoutGoal;
  split: TrainingSplit;
  equipment: EquipmentAvailability;
  daysPerWeek: number;
  experienceLevel: ExperienceLevel;
  schedule: WorkoutDay[];
  totalWeeklySets: number;
  description: string;
  progressionStrategy: string;
  recoveryGuideline: string;
}

export interface ProteinSourceReference {
  name: string;
  sourceType: 'Supplement (Dairy)' | 'Supplement (Plant)' | 'Whole Food (Animal)' | 'Whole Food (Plant)';
  proteinDensityPercent: number; // e.g. 90.0 for 90%
  primaryBenefit: string;
  scientificSource: string;
}

export interface UserProfile {
  id: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  heightCm: number;
  currentWeightKg: number;
  bodyFatPercentage: number;
  trainingYears: number;
  experienceLevel: ExperienceLevel;
  activityLevel: ActivityLevel;
  goal: GoalPhase;
  surplusDeficitPercent: number; // e.g. 10 for +10% surplus, -20 for -20% deficit
  trainingDaysPerWeek: number;
  // Circumferences for Casey Butt Maximum Muscular Potential (MMP)
  wristCircumferenceCm: number;
  ankleCircumferenceCm: number;
  chestCircumferenceCm?: number;
  armCircumferenceCm?: number;
  thighCircumferenceCm?: number;
  calfCircumferenceCm?: number;
  neckCircumferenceCm?: number;
  waistCircumferenceCm?: number;
}

export interface ProgressLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  bodyFatPercentage?: number;
  leanBodyMassKg?: number;
  caloriesConsumed?: number;
  proteinGrams?: number;
  // Body tape measurements (cm)
  armCm?: number;
  chestCm?: number;
  waistCm?: number;
  thighCm?: number;
  calfCm?: number;
  // Key lifts 1RM or working weight (kg)
  benchPressKg?: number;
  squatKg?: number;
  deadliftKg?: number;
  overheadPressKg?: number;
  notes?: string;
}

export interface CalculationResults {
  bmr: number;
  tdee: number;
  targetCalories: number;
  caloricDelta: number; // +kcal or -kcal
  proteinGrams: number;
  proteinCalories: number;
  proteinPerKgLbm: number;
  proteinPerKgTotal: number;
  fatGrams: number;
  fatCalories: number;
  fatPercentage: number;
  carbGrams: number;
  carbCalories: number;
  carbPercentage: number;
  // Body composition
  leanBodyMassKg: number;
  fatMassKg: number;
  ffmi: number;
  normalizedFfmi: number;
  ffmiCategory: string;
  // Muscle growth projections
  aragonMonthlyRatePercent: number;
  aragonMonthlyGainKg: number;
  mcdonaldAnnualPotentialKg: number;
  projected12WeekMuscleGainKg: number;
  projected12WeekFatGainKg: number;
  projected12WeekWeightKg: number;
  // Casey Butt Genetic Potential
  maxLeanMassKg: number;
  maxTotalWeightAtCurrentBfKg: number;
  potentialRemainingKg: number;
  percentageOfGeneticLimit: number;
  maxChestCm: number;
  maxArmCm: number;
  maxThighCm: number;
  maxCalfCm: number;
}

export interface MuscleVolumeLandmark {
  muscleGroup: string;
  mev: number; // Minimum Effective Volume (sets/week)
  mavMin: number; // Maximum Adaptive Volume (low end)
  mavMax: number; // Maximum Adaptive Volume (high end)
  mrv: number; // Maximum Recoverable Volume
  currentSets: number;
  frequencyDaysPerWeek: number;
  recoveryCapacity: 'low' | 'moderate' | 'optimal' | 'overreaching';
}

export interface MealPlanBreakdown {
  mealNumber: number;
  name: string;
  timeOfDay: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  isPreWorkout?: boolean;
  isPostWorkout?: boolean;
}

export interface IntegratedDataset {
  id: string;
  title: string;
  category: string;
  description: string;
  lifterProfile: Partial<UserProfile>;
  logs: ProgressLogEntry[];
}
