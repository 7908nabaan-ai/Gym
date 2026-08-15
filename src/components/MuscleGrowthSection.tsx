import React, { useState } from 'react';
import { CalculationResults, UnitSystem, UserProfile } from '../types';
import { formatWeight, formatLength, generateTrajectoryTimeline, UNIT_CONVERSIONS } from '../utils/calculations';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Line,
  ComposedChart,
} from 'recharts';
import { Trophy, TrendingUp, Zap, ShieldCheck, Info, BarChart3 } from 'lucide-react';

interface MuscleGrowthSectionProps {
  metrics: CalculationResults;
  profile: UserProfile;
  unit: UnitSystem;
}

export const MuscleGrowthSection: React.FC<MuscleGrowthSectionProps> = ({
  metrics,
  profile,
  unit,
}) => {
  const [projectionWeeks, setProjectionWeeks] = useState<number>(24);

  // Generate trajectory timeline data for chart
  const timelineData = generateTrajectoryTimeline(
    profile.currentWeightKg,
    profile.bodyFatPercentage,
    metrics.targetCalories,
    metrics.tdee,
    metrics.aragonMonthlyGainKg,
    projectionWeeks
  ).map((item) => ({
    ...item,
    displayWeight: unit === 'imperial' ? Math.round(item.weightKg * UNIT_CONVERSIONS.kgToLbs * 10) / 10 : item.weightKg,
    displayLeanMass: unit === 'imperial' ? Math.round(item.leanMassKg * UNIT_CONVERSIONS.kgToLbs * 10) / 10 : item.leanMassKg,
    displayFatMass: unit === 'imperial' ? Math.round(item.fatMassKg * UNIT_CONVERSIONS.kgToLbs * 10) / 10 : item.fatMassKg,
  }));

  // Helper for progress bar
  const limitPercent = Math.min(100, Math.max(0, metrics.percentageOfGeneticLimit));

  return (
    <div className="space-y-6">
      
      {/* Top Banner Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* FFMI Card */}
        <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 shadow-2xl flex flex-col justify-between relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy className="w-16 h-16 text-lime-400" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Normalized FFMI</span>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/30">
                Natural Index
              </span>
            </div>
            <div className="text-3xl font-black text-white mt-2 font-mono tracking-tight">
              {metrics.normalizedFfmi}
            </div>
            <p className="text-xs text-lime-400 font-bold mt-1">
              {metrics.ffmiCategory}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800">
            <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
              <span>Natural Ceiling (25.0)</span>
              <span className="font-mono text-white font-bold">{((metrics.normalizedFfmi / 25.0) * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-lime-500 to-emerald-400 rounded-full"
                style={{ width: `${Math.min(100, (metrics.normalizedFfmi / 25.0) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Casey Butt Muscular Potential */}
        <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 shadow-2xl flex flex-col justify-between relative overflow-hidden backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Casey Butt MMP Limit</span>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/30">
                Genetic Max
              </span>
            </div>
            <div className="text-3xl font-black text-emerald-400 mt-2 font-mono tracking-tight">
              {formatWeight(metrics.maxLeanMassKg, unit)}
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Max Drug-Free Lean Mass at your frame
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800">
            <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
              <span>Current Lean Mass: {formatWeight(metrics.leanBodyMassKg, unit)}</span>
              <span className="font-bold text-emerald-400">{limitPercent}% Reached</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full"
                style={{ width: `${limitPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Monthly Hypertrophy Velocity */}
        <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 shadow-2xl flex flex-col justify-between backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Aragon Growth Rate</span>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/30">
                Monthly
              </span>
            </div>
            <div className="text-3xl font-black text-cyan-300 mt-2 font-mono tracking-tight">
              +{formatWeight(metrics.aragonMonthlyGainKg, unit)}
              <span className="text-xs font-normal text-zinc-400 ml-1">/mo</span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              ~{metrics.aragonMonthlyRatePercent}% bodyweight lean tissue/mo
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-400 flex justify-between">
            <span>Annual Potential:</span>
            <span className="font-bold text-white font-mono">+{formatWeight(metrics.mcdonaldAnnualPotentialKg, unit)}/yr</span>
          </div>
        </div>

        {/* 12-Week Projection Summary */}
        <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 shadow-2xl flex flex-col justify-between backdrop-blur-md">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">12-Week Net Projection</span>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-fuchsia-400/10 text-fuchsia-400 border border-fuchsia-400/30">
                Phase Outcome
              </span>
            </div>
            <div className="text-3xl font-black text-fuchsia-300 mt-2 font-mono tracking-tight">
              +{formatWeight(metrics.projected12WeekMuscleGainKg, unit)}
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Pure Lean Mass under {metrics.caloricDelta >= 0 ? `+${metrics.caloricDelta}` : metrics.caloricDelta} kcal/day
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-400 flex justify-between">
            <span>Projected Total Weight:</span>
            <span className="font-bold text-white font-mono">{formatWeight(metrics.projected12WeekWeightKg, unit)}</span>
          </div>
        </div>

      </div>

      {/* Casey Butt Maximum Bone-Structure Girth Projections */}
      <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 md:p-6 shadow-2xl space-y-4 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-lime-400/10 text-lime-400 border border-lime-400/30 font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Casey Butt Natural Muscle Circumference Limits</h3>
              <p className="text-xs text-zinc-400">Calculated from your wrist ({formatLength(profile.wristCircumferenceCm, unit)}) and ankle ({formatLength(profile.ankleCircumferenceCm, unit)}) skeletal frame</p>
            </div>
          </div>
          <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-400/10 px-2.5 py-1 rounded-xl border border-emerald-400/30">
            Target Body Fat: 8-10% (Contest/Lean)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Flexed Arm Limit */}
          <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-300">Max Flexed Arm</span>
              <span className="text-xs font-mono font-bold text-lime-400">
                {formatLength(metrics.maxArmCm, unit)}
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 flex justify-between">
              <span>Current Arm:</span>
              <span className="font-bold text-white font-mono">
                {profile.armCircumferenceCm ? formatLength(profile.armCircumferenceCm, unit) : 'Not measured'}
              </span>
            </div>
            {profile.armCircumferenceCm && (
              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-lime-400 rounded-full"
                  style={{ width: `${Math.min(100, (profile.armCircumferenceCm / metrics.maxArmCm) * 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Chest Limit */}
          <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-300">Max Chest Girth</span>
              <span className="text-xs font-mono font-bold text-lime-400">
                {formatLength(metrics.maxChestCm, unit)}
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 flex justify-between">
              <span>Current Chest:</span>
              <span className="font-bold text-white font-mono">
                {profile.chestCircumferenceCm ? formatLength(profile.chestCircumferenceCm, unit) : 'Not measured'}
              </span>
            </div>
            {profile.chestCircumferenceCm && (
              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-lime-400 rounded-full"
                  style={{ width: `${Math.min(100, (profile.chestCircumferenceCm / metrics.maxChestCm) * 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Thigh Limit */}
          <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-300">Max Thigh Girth</span>
              <span className="text-xs font-mono font-bold text-lime-400">
                {formatLength(metrics.maxThighCm, unit)}
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 flex justify-between">
              <span>Current Thigh:</span>
              <span className="font-bold text-white font-mono">
                {profile.thighCircumferenceCm ? formatLength(profile.thighCircumferenceCm, unit) : 'Not measured'}
              </span>
            </div>
            {profile.thighCircumferenceCm && (
              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-lime-400 rounded-full"
                  style={{ width: `${Math.min(100, (profile.thighCircumferenceCm / metrics.maxThighCm) * 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Calf Limit */}
          <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-300">Max Calf Girth</span>
              <span className="text-xs font-mono font-bold text-lime-400">
                {formatLength(metrics.maxCalfCm, unit)}
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 flex justify-between">
              <span>Current Calf:</span>
              <span className="font-bold text-white font-mono">
                {profile.calfCircumferenceCm ? formatLength(profile.calfCircumferenceCm, unit) : 'Not measured'}
              </span>
            </div>
            {profile.calfCircumferenceCm && (
              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-lime-400 rounded-full"
                  style={{ width: `${Math.min(100, (profile.calfCircumferenceCm / metrics.maxCalfCm) * 100)}%` }}
                />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Interactive Hypertrophy & Fat Mass Trajectory Timeline Chart */}
      <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 md:p-6 shadow-2xl space-y-4 backdrop-blur-md">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Hypertrophy & Body Composition Projection</h3>
              <p className="text-xs text-zinc-400">
                Modeled under {metrics.targetCalories} kcal/day ({metrics.caloricDelta >= 0 ? `+${metrics.caloricDelta}` : metrics.caloricDelta} kcal delta)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium">Horizon:</span>
            <div className="flex bg-zinc-800 rounded-xl p-0.5 border border-zinc-700 text-xs font-bold">
              {[12, 24, 52].map((w) => (
                <button
                  key={w}
                  onClick={() => setProjectionWeeks(w)}
                  className={`px-3 py-1 rounded-lg transition ${
                    projectionWeeks === w ? 'bg-lime-400 text-black shadow' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {w} Wks
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart View */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timelineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="leanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a3e635" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a3e635" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="fatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} />
              <XAxis dataKey="week" stroke="#71717a" fontSize={11} />
              <YAxis
                yAxisId="mass"
                stroke="#71717a"
                fontSize={11}
                domain={['auto', 'auto']}
                unit={unit === 'imperial' ? ' lbs' : ' kg'}
              />
              <YAxis
                yAxisId="bf"
                orientation="right"
                stroke="#38bdf8"
                fontSize={11}
                domain={[0, 35]}
                unit="%"
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '1rem', fontSize: '12px', color: '#fff', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                labelStyle={{ fontWeight: 'bold', color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area
                yAxisId="mass"
                type="monotone"
                dataKey="displayLeanMass"
                name={`Lean Mass (${unit === 'imperial' ? 'lbs' : 'kg'})`}
                stroke="#a3e635"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#leanGrad)"
              />
              <Area
                yAxisId="mass"
                type="monotone"
                dataKey="displayFatMass"
                name={`Fat Mass (${unit === 'imperial' ? 'lbs' : 'kg'})`}
                stroke="#f97316"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#fatGrad)"
              />
              <Line
                yAxisId="mass"
                type="monotone"
                dataKey="displayWeight"
                name={`Total Weight (${unit === 'imperial' ? 'lbs' : 'kg'})`}
                stroke="#ffffff"
                strokeWidth={2}
                dot={{ r: 3, fill: '#ffffff' }}
              />
              <Line
                yAxisId="bf"
                type="monotone"
                dataKey="bodyFatPct"
                name="Body Fat %"
                stroke="#38bdf8"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Evidence-Based Guidance Note */}
        <div className="bg-zinc-950/70 rounded-xl p-3.5 border border-zinc-800 flex items-start gap-2.5 text-xs text-zinc-300">
          <Info className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
          <p>
            <span className="font-bold text-white">P-Ratio & Nutrient Partitioning:</span> Novice lifters synthesize ~70-80% of weight gain as lean tissue during a moderate caloric surplus, while advanced lifters synthesize ~35-50%. Setting a surplus between +150 to +300 kcal/day prevents unwanted adipose tissue accumulation.
          </p>
        </div>

      </div>

    </div>
  );
};
