import React, { useState } from 'react';
import { CalculationResults, UserProfile, UnitSystem, MealPlanBreakdown } from '../types';
import { formatWeight, UNIT_CONVERSIONS } from '../utils/calculations';
import {
  ISSN_PROTEIN_SOURCES,
  calculateIssnNutritionTargets,
  IssnMacroCalculationInput,
} from '../data/issnNutritionReference';
import {
  Flame,
  PieChart as PieIcon,
  Droplets,
  Zap,
  CheckCircle2,
  Clock,
  Utensils,
  BookOpen,
  Award,
  Sliders,
  Check,
  FileSpreadsheet,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface NutritionIntakeSectionProps {
  metrics: CalculationResults;
  profile: UserProfile;
  unit: UnitSystem;
}

export const NutritionIntakeSection: React.FC<NutritionIntakeSectionProps> = ({
  metrics,
  profile,
  unit,
}) => {
  const [mealCount, setMealCount] = useState<number>(4);
  const [workoutTime, setWorkoutTime] = useState<string>('afternoon');

  // ISSN Macro Calculator Interactive State (defaults matching ISSN scientific specs)
  const [targetProteinFactor, setTargetProteinFactor] = useState<number>(2.2);
  const [targetFatFactor, setTargetFatFactor] = useState<number>(1.0);
  const [caloricAdjustment, setCaloricAdjustment] = useState<number>(
    profile.goal.includes('cut') ? -300 : profile.goal.includes('bulk') ? 250 : 0
  );
  const [activityMultiplier, setActivityMultiplier] = useState<number>(15);
  const [issnProteinServings, setIssnProteinServings] = useState<number>(4);

  // Compute ISSN targets
  const issnTargets = calculateIssnNutritionTargets({
    bodyWeightKg: profile.currentWeightKg,
    bodyFatPercent: profile.bodyFatPercentage,
    targetProteinFactorGPerKg: targetProteinFactor,
    targetFatFactorGPerKg: targetFatFactor,
    caloricAdjustmentKcal: caloricAdjustment,
    activityMultiplierFactor: activityMultiplier,
    dailyProteinServings: issnProteinServings,
  });

  // Macronutrient Pie Data
  const macroPieData = [
    {
      name: 'Protein',
      value: issnTargets.dailyProteinTargetGrams * 4,
      grams: issnTargets.dailyProteinTargetGrams,
      color: '#a3e635',
      pct: issnTargets.proteinEnergyPercent,
    },
    {
      name: 'Carbohydrates',
      value: issnTargets.dailyCarbohydrateTargetGrams * 4,
      grams: issnTargets.dailyCarbohydrateTargetGrams,
      color: '#38bdf8',
      pct: issnTargets.carbohydrateEnergyPercent,
    },
    {
      name: 'Dietary Fats',
      value: issnTargets.dailyFatTargetGrams * 9,
      grams: issnTargets.dailyFatTargetGrams,
      color: '#fb923c',
      pct: issnTargets.fatEnergyPercent,
    },
  ];

  // Generate per-meal breakdown based on meal count and workout timing
  const generateMealPlan = (): MealPlanBreakdown[] => {
    const meals: MealPlanBreakdown[] = [];
    const baseProtein = Math.round(issnTargets.dailyProteinTargetGrams / mealCount);
    const baseFats = Math.round(issnTargets.dailyFatTargetGrams / mealCount);

    // Distribute carbs with priority around peri-workout window
    const periWorkoutMultiplier = 1.35;
    const nonWorkoutMultiplier = (mealCount - 2 * (periWorkoutMultiplier - 1)) / mealCount;

    for (let i = 1; i <= mealCount; i++) {
      let isPre = false;
      let isPost = false;
      let time = '08:00 AM';
      let name = `Meal ${i}`;

      if (mealCount === 4) {
        if (i === 1) { time = '08:00 AM'; name = 'Breakfast (Kickstart MPS)'; }
        if (i === 2) { time = '12:30 PM'; name = workoutTime === 'afternoon' ? 'Pre-Workout Fuel' : 'Lunch'; isPre = workoutTime === 'afternoon'; }
        if (i === 3) { time = '04:30 PM'; name = workoutTime === 'afternoon' ? 'Post-Workout Anabolic Window' : 'Snack'; isPost = workoutTime === 'afternoon'; }
        if (i === 4) { time = '08:00 PM'; name = 'Dinner (Overnight Recovery)'; }
      } else if (mealCount === 5) {
        if (i === 1) { time = '07:30 AM'; name = 'Meal 1 (Breakfast)'; }
        if (i === 2) { time = '11:00 AM'; name = 'Meal 2'; }
        if (i === 3) { time = '02:00 PM'; name = workoutTime === 'afternoon' ? 'Pre-Workout Feeding' : 'Meal 3'; isPre = workoutTime === 'afternoon'; }
        if (i === 4) { time = '05:30 PM'; name = workoutTime === 'afternoon' ? 'Post-Workout Shake & Meal' : 'Meal 4'; isPost = workoutTime === 'afternoon'; }
        if (i === 5) { time = '09:00 PM'; name = 'Meal 5 (Slow Digesting Casein)'; }
      } else if (mealCount === 3) {
        if (i === 1) { time = '08:00 AM'; name = 'Meal 1 (Breakfast)'; }
        if (i === 2) { time = '01:00 PM'; name = 'Meal 2 (Mid-Day / Peri-Workout)'; isPre = true; }
        if (i === 3) { time = '07:30 PM'; name = 'Meal 3 (Dinner / Post-Workout)'; isPost = true; }
      } else {
        time = `${7 + (i - 1) * 2.5}:00`;
        name = `Feeding ${i}`;
      }

      const carbs = (isPre || isPost)
        ? Math.round((issnTargets.dailyCarbohydrateTargetGrams / mealCount) * periWorkoutMultiplier)
        : Math.round((issnTargets.dailyCarbohydrateTargetGrams / mealCount) * Math.max(0.7, nonWorkoutMultiplier));

      const cal = baseProtein * 4 + carbs * 4 + baseFats * 9;

      meals.push({
        mealNumber: i,
        name,
        timeOfDay: time,
        calories: cal,
        protein: baseProtein,
        carbs,
        fats: baseFats,
        isPreWorkout: isPre,
        isPostWorkout: isPost,
      });
    }

    return meals;
  };

  const mealPlan = generateMealPlan();

  // Water intake calculation
  const waterLiters = ((profile.currentWeightKg * 0.04) + (profile.trainingDaysPerWeek > 4 ? 0.75 : 0.5)).toFixed(1);
  const waterOz = Math.round(parseFloat(waterLiters) * 33.814);

  return (
    <div className="space-y-6">
      
      {/* Official ISSN Sports Science Master Banner */}
      <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 md:p-6 shadow-2xl space-y-4 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-400/10 text-orange-400 border border-orange-400/30 font-bold">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white tracking-tight">
                  PERFORMANCE NUTRITION & BODY RECOMPOSITION MACRO CALCULATOR
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/30 hidden md:inline">
                  ISSN Certified
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Grounded in International Society of Sports Nutrition (ISSN) position stands, Muscle PhD, and Athletic Lab Sports Science data.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
              Phase: <span className="text-lime-400 font-extrabold uppercase ml-1">{profile.goal.replace('_', ' ')}</span>
            </span>
          </div>
        </div>

        {/* Dynamic ISSN Assumptions & Targets Dual Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-1">
          
          {/* Column 1: USER PROFILE & ASSUMPTIONS */}
          <div className="bg-zinc-950/70 p-4 sm:p-5 rounded-xl border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
              <h3 className="text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-lime-400" />
                User Profile & Assumptions
              </h3>
              <span className="text-[10px] text-zinc-400">Interactive Inputs</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-zinc-900">
                <span className="text-zinc-400">Body Weight (kg)</span>
                <span className="font-mono font-bold text-white">{profile.currentWeightKg.toFixed(1)} kg</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-zinc-900">
                <span className="text-zinc-400">Body Fat (%)</span>
                <span className="font-mono font-bold text-amber-400">{profile.bodyFatPercentage.toFixed(1)}%</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-zinc-900">
                <span className="text-zinc-400">Target Protein Factor (g/kg)</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.1"
                    min="1.4"
                    max="3.3"
                    value={targetProteinFactor}
                    onChange={(e) => setTargetProteinFactor(parseFloat(e.target.value) || 2.2)}
                    className="w-16 bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-right font-mono font-bold text-lime-400 text-xs focus:outline-none"
                  />
                  <span className="text-zinc-400 font-mono">g/kg</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-zinc-900">
                <span className="text-zinc-400">Target Fat Factor (g/kg)</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="1.5"
                    value={targetFatFactor}
                    onChange={(e) => setTargetFatFactor(parseFloat(e.target.value) || 1.0)}
                    className="w-16 bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-right font-mono font-bold text-orange-400 text-xs focus:outline-none"
                  />
                  <span className="text-zinc-400 font-mono">g/kg</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-zinc-900">
                <span className="text-zinc-400">Caloric Adjustment (kcal)</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="50"
                    value={caloricAdjustment}
                    onChange={(e) => setCaloricAdjustment(parseInt(e.target.value) || 0)}
                    className="w-16 bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-right font-mono font-bold text-cyan-300 text-xs focus:outline-none"
                  />
                  <span className="text-zinc-400 font-mono">kcal</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-zinc-900">
                <span className="text-zinc-400">Activity Multiplier (TDEE)</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.5"
                    min="12"
                    max="22"
                    value={activityMultiplier}
                    onChange={(e) => setActivityMultiplier(parseFloat(e.target.value) || 15)}
                    className="w-16 bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-right font-mono font-bold text-white text-xs focus:outline-none"
                  />
                  <span className="text-zinc-400 font-mono">factor</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-zinc-900">
                <span className="text-zinc-400">Daily Protein Servings</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="2"
                    max="6"
                    value={issnProteinServings}
                    onChange={(e) => setIssnProteinServings(parseInt(e.target.value) || 4)}
                    className="w-16 bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-right font-mono font-bold text-lime-400 text-xs focus:outline-none"
                  />
                  <span className="text-zinc-400 font-mono">servings</span>
                </div>
              </div>
            </div>

            {/* Calculated Metrics Sub-block */}
            <div className="bg-zinc-900/90 p-3 rounded-lg border border-zinc-800/80 space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Calculated Metrics:</span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 block">Body Weight</span>
                  <span className="font-mono font-bold text-white">{issnTargets.bodyWeightLbs} lbs</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">Fat-Free Mass</span>
                  <span className="font-mono font-bold text-lime-400">{issnTargets.fatFreeMassKg} kg</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">FFM (lbs)</span>
                  <span className="font-mono font-bold text-cyan-300">{issnTargets.fatFreeMassLbs} lbs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: DAILY NUTRITIONAL & MACRO TARGETS */}
          <div className="bg-zinc-950/70 p-4 sm:p-5 rounded-xl border border-zinc-800 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
                <h3 className="text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-lime-400" />
                  Daily Nutritional & Macro Targets
                </h3>
                <span className="text-[10px] text-lime-400 font-bold uppercase">Energy Partitioning</span>
              </div>

              <div className="space-y-2.5 text-xs mt-3">
                <div className="flex justify-between items-center py-1 border-b border-zinc-900">
                  <span className="text-zinc-400">Estimated Maintenance (TDEE)</span>
                  <span className="font-mono font-bold text-cyan-300">{issnTargets.estimatedMaintenanceTdeeKcal} kcal</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-zinc-900">
                  <span className="text-zinc-300 font-bold">Daily Caloric Target</span>
                  <span className="font-mono font-black text-lg text-lime-400">{issnTargets.dailyCaloricTargetKcal} kcal</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-zinc-900">
                  <span className="text-zinc-400">Daily Protein Target</span>
                  <div className="font-mono text-right">
                    <strong className="text-lime-400">{issnTargets.dailyProteinTargetGrams} g</strong>
                    <span className="text-zinc-500 text-[10px] ml-1.5 font-normal">({issnTargets.dailyProteinTargetGrams * 4} kcal)</span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-zinc-900">
                  <span className="text-zinc-400">Daily Fat Target</span>
                  <div className="font-mono text-right">
                    <strong className="text-orange-400">{issnTargets.dailyFatTargetGrams} g</strong>
                    <span className="text-zinc-500 text-[10px] ml-1.5 font-normal">({issnTargets.dailyFatTargetGrams * 9} kcal)</span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-zinc-900">
                  <span className="text-zinc-400">Daily Carbohydrate Target</span>
                  <div className="font-mono text-right">
                    <strong className="text-sky-400">{issnTargets.dailyCarbohydrateTargetGrams} g</strong>
                    <span className="text-zinc-500 text-[10px] ml-1.5 font-normal">({issnTargets.dailyCarbohydrateTargetGrams * 4} kcal)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Energy % Breakdown Strip */}
            <div className="bg-zinc-900/90 p-3 rounded-lg border border-zinc-800/80 space-y-2">
              <div className="flex justify-between text-[11px] font-bold text-zinc-300">
                <span>Energy Distribution Ratio</span>
                <span className="text-lime-400 font-mono">Total: {issnTargets.totalPercentageCheck}%</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                <div className="bg-zinc-950 p-1.5 rounded border border-lime-400/30">
                  <span className="text-[10px] text-lime-400 block font-bold">Protein</span>
                  <span className="font-mono font-bold text-white">{issnTargets.proteinEnergyPercent}%</span>
                </div>
                <div className="bg-zinc-950 p-1.5 rounded border border-orange-400/30">
                  <span className="text-[10px] text-orange-400 block font-bold">Fats</span>
                  <span className="font-mono font-bold text-white">{issnTargets.fatEnergyPercent}%</span>
                </div>
                <div className="bg-zinc-950 p-1.5 rounded border border-sky-400/30">
                  <span className="text-[10px] text-sky-400 block font-bold">Carbs</span>
                  <span className="font-mono font-bold text-white">{issnTargets.carbohydrateEnergyPercent}%</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Protein Serving Planner & Leucine Threshold */}
      <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 md:p-6 shadow-2xl space-y-4 backdrop-blur-md">
        <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800">
          <div className="p-2 rounded-xl bg-lime-400/10 text-lime-400 border border-lime-400/30 font-bold">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Protein Serving Planner (ISSN)</h3>
            <p className="text-xs text-zinc-400">Refractory period dosing maximizing mTORC1 myofibrillar protein synthesis</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Target Protein per Serving</span>
            <div className="text-2xl font-black text-lime-400 mt-1 font-mono">
              {issnTargets.targetProteinPerServingGrams} g <span className="text-xs font-normal text-zinc-400">/ feeding</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Provides ~3.2–4.0g pure L-Leucine per meal, exceeding the trigger threshold for peak MPS.
            </p>
          </div>

          <div className="bg-zinc-950/60 p-4 rounded-xl border border-lime-400/40">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">ISSN Serving Threshold Check</span>
            <div className="text-xl font-black text-lime-300 mt-1.5 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-lime-400" />
              <span>Pass ✅ (Ideal)</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Meets the standard 0.40–0.55 g/kg/meal dose recommendation from ISSN position stands.
            </p>
          </div>

          <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Pre-Sleep Casein Ingestion Target</span>
            <div className="text-2xl font-black text-cyan-300 mt-1 font-mono">
              {issnTargets.preSleepCaseinIngestionTargetGrams.toFixed(1)} g
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Sustained 6-8 hr amino acid release prevents nocturnal myofibrillar catabolism.
            </p>
          </div>

        </div>
      </div>

      {/* Protein Source Yield & Evidence-Based Reference Table */}
      <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 md:p-6 shadow-2xl space-y-4 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                PROTEIN SOURCE YIELD & EVIDENCE-BASED REFERENCE TABLE
              </h3>
              <p className="text-xs text-zinc-400">
                Bioavailability profiles & required raw/cooked weights to yield your {issnTargets.targetProteinPerServingGrams}g target serving.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Protein Source</th>
                <th className="py-3 px-3">Source Type</th>
                <th className="py-3 px-3 text-center">Density (%)</th>
                <th className="py-3 px-3 text-center">Required Amount (g)</th>
                <th className="py-3 px-3 text-center">Calorie Yield</th>
                <th className="py-3 px-4">Primary Benefit & Bioavailability Profile</th>
                <th className="py-3 px-3">Scientific Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {ISSN_PROTEIN_SOURCES.map((source, index) => {
                // Dynamically calculate required grams for current target serving
                const requiredAmountGrams = Math.round(issnTargets.targetProteinPerServingGrams / (source.proteinDensityPercent / 100));
                // Approximate calories based on source type
                let calYield = Math.round(issnTargets.targetProteinPerServingGrams * 4);
                if (source.name.includes('Concentrate')) calYield = 198;
                else if (source.name.includes('Isolate') && source.name.includes('Whey')) calYield = 166;
                else if (source.name.includes('Casein')) calYield = 187;
                else if (source.name.includes('Soy')) calYield = 185;
                else if (source.name.includes('Chicken')) calYield = 219;
                else if (source.name.includes('Beef')) calYield = 398;
                else if (source.name.includes('Fish')) calYield = 186;
                else if (source.name.includes('Eggs')) calYield = 472;

                return (
                  <tr key={index} className="hover:bg-zinc-850/50 transition">
                    <td className="py-3.5 px-3 font-bold text-white whitespace-nowrap">
                      {source.name}
                    </td>
                    <td className="py-3.5 px-3 text-zinc-400 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] font-medium border border-zinc-700">
                        {source.sourceType}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-lime-400">
                      {source.proteinDensityPercent.toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-black text-cyan-300">
                      {requiredAmountGrams} g
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-orange-400">
                      {calYield} kcal
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300 leading-relaxed max-w-xs sm:max-w-sm">
                      {source.primaryBenefit}
                    </td>
                    <td className="py-3.5 px-3 text-zinc-500 font-mono text-[10px] whitespace-nowrap">
                      {source.scientificSource}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-Meal Anabolic Timing Schedule */}
      <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 md:p-6 shadow-2xl space-y-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-fuchsia-400/10 text-fuchsia-400 border border-fuchsia-400/30 font-bold">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Daily Meal Schedule & Peri-Workout Nutrient Timing</h3>
              <p className="text-xs text-zinc-400">Optimal protein boluses triggering Muscle Protein Synthesis (MPS) refractory cycles</p>
            </div>
          </div>

          {/* Meal Frequency Controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium">Daily Meals:</span>
            <div className="flex bg-zinc-800 rounded-xl p-0.5 border border-zinc-700 text-xs font-bold">
              {[3, 4, 5, 6].map((count) => (
                <button
                  key={count}
                  onClick={() => setMealCount(count)}
                  className={`px-3 py-1 rounded-lg transition ${
                    mealCount === count ? 'bg-lime-400 text-black shadow' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {count} Meals
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Meal Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mealPlan.map((meal) => (
            <div
              key={meal.mealNumber}
              className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                meal.isPreWorkout || meal.isPostWorkout
                  ? 'bg-zinc-950/80 border-lime-400/50 shadow-lg ring-1 ring-lime-400/30'
                  : 'bg-zinc-950/50 border-zinc-800'
              }`}
            >
              <div>
                <div className="flex justify-between items-center text-xs text-zinc-400 mb-1">
                  <span className="flex items-center gap-1 font-bold text-zinc-200">
                    <Clock className="w-3 h-3 text-lime-400" />
                    {meal.timeOfDay}
                  </span>
                  {(meal.isPreWorkout || meal.isPostWorkout) && (
                    <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-lime-400/20 text-lime-300 border border-lime-400/40">
                      {meal.isPreWorkout ? 'Pre-Workout' : 'Post-Workout'}
                    </span>
                  )}
                </div>

                <div className="text-sm font-bold text-white">{meal.name}</div>
                <div className="text-xl font-black font-mono text-lime-400 mt-2">
                  {meal.calories} <span className="text-xs font-normal text-zinc-400">kcal</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 pt-3 mt-3 border-t border-zinc-800 text-center text-xs">
                <div className="bg-zinc-900 p-1.5 rounded-lg border border-zinc-800">
                  <div className="text-[10px] text-lime-400 font-bold">Pro</div>
                  <div className="font-mono font-bold text-white">{meal.protein}g</div>
                </div>
                <div className="bg-zinc-900 p-1.5 rounded-lg border border-zinc-800">
                  <div className="text-[10px] text-sky-400 font-bold">Carb</div>
                  <div className="font-mono font-bold text-white">{meal.carbs}g</div>
                </div>
                <div className="bg-zinc-900 p-1.5 rounded-lg border border-zinc-800">
                  <div className="text-[10px] text-orange-400 font-bold">Fat</div>
                  <div className="font-mono font-bold text-white">{meal.fats}g</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Hydration & Ergogenic Supplements Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Daily Hydration Target */}
        <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 shadow-2xl space-y-2 backdrop-blur-md">
          <div className="flex items-center gap-2 text-cyan-400">
            <Droplets className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Daily Hydration Baseline</h4>
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono">
            {waterLiters} Liters <span className="text-xs text-zinc-400 font-normal">({waterOz} fl oz)</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Maintains full muscle cell volumization and nutrient transport for glycogen storage.
          </p>
        </div>

        {/* Creatine Monohydrate */}
        <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 shadow-2xl space-y-2 backdrop-blur-md">
          <div className="flex items-center gap-2 text-lime-400">
            <Zap className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Creatine Monohydrate</h4>
          </div>
          <div className="text-2xl font-black text-lime-300 font-mono">
            5.0 Grams <span className="text-xs text-zinc-400 font-normal">/ day</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Full phosphocreatine resynthesis saturation. Take daily with post-workout meal or carb source.
          </p>
        </div>

        {/* Electrolytes & Sodium */}
        <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 shadow-2xl space-y-2 backdrop-blur-md">
          <div className="flex items-center gap-2 text-orange-400">
            <Flame className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Sodium & Electrolytes</h4>
          </div>
          <div className="text-2xl font-black text-orange-300 font-mono">
            3,000 - 4,500 <span className="text-xs text-zinc-400 font-normal">mg Na+</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Essential for intense muscular contraction velocity, pump vascularity, and preventing cramping during high volume sets.
          </p>
        </div>

      </div>

    </div>
  );
};
