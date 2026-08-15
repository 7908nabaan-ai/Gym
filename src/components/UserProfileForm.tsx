import React, { useState } from 'react';
import { UserProfile, UnitSystem, GoalPhase, ExperienceLevel, ActivityLevel } from '../types';
import { UNIT_CONVERSIONS } from '../utils/calculations';
import { User, Activity, Target, Ruler, Sparkles, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface UserProfileFormProps {
  profile: UserProfile;
  onChange: (updated: UserProfile) => void;
  unit: UnitSystem;
}

export const UserProfileForm: React.FC<UserProfileFormProps> = ({
  profile,
  onChange,
  unit,
}) => {
  const [showAdvancedMeasurements, setShowAdvancedMeasurements] = useState(false);

  // Helper for input values in active unit
  const displayWeight = unit === 'imperial'
    ? Math.round(profile.currentWeightKg * UNIT_CONVERSIONS.kgToLbs * 10) / 10
    : profile.currentWeightKg;

  const displayHeight = unit === 'imperial'
    ? Math.round(profile.heightCm * UNIT_CONVERSIONS.cmToInches * 10) / 10
    : profile.heightCm;

  const displayWrist = unit === 'imperial'
    ? Math.round(profile.wristCircumferenceCm * UNIT_CONVERSIONS.cmToInches * 10) / 10
    : profile.wristCircumferenceCm;

  const displayAnkle = unit === 'imperial'
    ? Math.round(profile.ankleCircumferenceCm * UNIT_CONVERSIONS.cmToInches * 10) / 10
    : profile.ankleCircumferenceCm;

  const handleWeightChange = (val: number) => {
    const kg = unit === 'imperial' ? val * UNIT_CONVERSIONS.lbsToKg : val;
    onChange({ ...profile, currentWeightKg: Math.max(30, Math.min(250, kg)) });
  };

  const handleHeightChange = (val: number) => {
    const cm = unit === 'imperial' ? val * UNIT_CONVERSIONS.inchesToCm : val;
    onChange({ ...profile, heightCm: Math.max(120, Math.min(240, cm)) });
  };

  const handleWristChange = (val: number) => {
    const cm = unit === 'imperial' ? val * UNIT_CONVERSIONS.inchesToCm : val;
    onChange({ ...profile, wristCircumferenceCm: Math.max(10, Math.min(30, cm)) });
  };

  const handleAnkleChange = (val: number) => {
    const cm = unit === 'imperial' ? val * UNIT_CONVERSIONS.inchesToCm : val;
    onChange({ ...profile, ankleCircumferenceCm: Math.max(15, Math.min(40, cm)) });
  };

  const handleGoalChange = (newGoal: GoalPhase) => {
    let defaultDelta = 10;
    switch (newGoal) {
      case 'lean_bulk':
        defaultDelta = 10;
        break;
      case 'aggressive_bulk':
        defaultDelta = 20;
        break;
      case 'maintenance_recomp':
        defaultDelta = 0;
        break;
      case 'moderate_cut':
        defaultDelta = -18;
        break;
      case 'aggressive_cut':
        defaultDelta = -25;
        break;
      case 'contest_prep':
        defaultDelta = -22;
        break;
    }
    onChange({ ...profile, goal: newGoal, surplusDeficitPercent: defaultDelta });
  };

  return (
    <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 md:p-7 shadow-2xl space-y-6 text-zinc-100 backdrop-blur-md">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-lime-400/10 text-lime-400 border border-lime-400/30 font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">Athlete Physiological Profile</h2>
            <p className="text-xs text-zinc-400">Baseline parameters for energy expenditure and genetic muscular limits</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-medium">Lifter Name:</span>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => onChange({ ...profile, name: e.target.value })}
            className="bg-zinc-800/90 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400/40 w-36 font-semibold"
            placeholder="Athlete Name"
          />
        </div>
      </div>

      {/* Grid: Core Physiological Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Gender & Age */}
        <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 space-y-3">
          <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Gender & Age</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...profile, gender: 'male' })}
              className={`py-2 text-xs font-bold rounded-xl border transition ${
                profile.gender === 'male'
                  ? 'bg-lime-400 text-black border-lime-400 shadow-md shadow-lime-400/20'
                  : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...profile, gender: 'female' })}
              className={`py-2 text-xs font-bold rounded-xl border transition ${
                profile.gender === 'female'
                  ? 'bg-lime-400 text-black border-lime-400 shadow-md shadow-lime-400/20'
                  : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Female
            </button>
          </div>
          <div>
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>Age</span>
              <span className="font-bold text-white font-mono">{profile.age} yrs</span>
            </div>
            <input
              type="range"
              min={16}
              max={75}
              value={profile.age}
              onChange={(e) => onChange({ ...profile, age: parseInt(e.target.value) || 25 })}
              className="w-full accent-lime-400 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Height & Weight */}
        <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 space-y-3">
          <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Height & Weight</label>
          
          <div>
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>Height</span>
              <span className="font-bold text-white font-mono">
                {displayHeight} {unit === 'imperial' ? 'in' : 'cm'}
                {unit === 'metric' && ` (${(profile.heightCm / 2.54 / 12).toFixed(1)} ft)`}
              </span>
            </div>
            <input
              type="number"
              step={unit === 'imperial' ? 0.5 : 1}
              value={displayHeight}
              onChange={(e) => handleHeightChange(parseFloat(e.target.value) || 175)}
              className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-lime-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>Current Weight</span>
              <span className="font-bold text-white font-mono">
                {displayWeight} {unit === 'imperial' ? 'lbs' : 'kg'}
              </span>
            </div>
            <input
              type="number"
              step={unit === 'imperial' ? 0.5 : 0.2}
              value={displayWeight}
              onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 75)}
              className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-lime-400"
            />
          </div>
        </div>

        {/* Body Fat Percentage & Lean Mass */}
        <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Body Fat %</label>
            <span className="text-xs font-extrabold text-lime-400 bg-lime-400/10 px-2.5 py-0.5 rounded-full border border-lime-400/30 font-mono">
              {profile.bodyFatPercentage}%
            </span>
          </div>

          <input
            type="range"
            min={4}
            max={40}
            step={0.5}
            value={profile.bodyFatPercentage}
            onChange={(e) => onChange({ ...profile, bodyFatPercentage: parseFloat(e.target.value) || 15 })}
            className="w-full accent-lime-400 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
          />

          <div className="text-[11px] text-zinc-400 flex justify-between pt-1 border-t border-zinc-800">
            <span>Est. Lean Mass:</span>
            <span className="font-bold text-lime-400 font-mono">
              {(profile.currentWeightKg * (1 - profile.bodyFatPercentage / 100) * (unit === 'imperial' ? UNIT_CONVERSIONS.kgToLbs : 1)).toFixed(1)} {unit === 'imperial' ? 'lbs' : 'kg'}
            </span>
          </div>

          <div className="text-[10px] text-zinc-500">
            {profile.bodyFatPercentage < 8 ? 'Stage lean / Contest conditioning' :
             profile.bodyFatPercentage <= 12 ? 'Athletic / Visible six-pack' :
             profile.bodyFatPercentage <= 16 ? 'Ideal lean bulking baseline' :
             profile.bodyFatPercentage <= 22 ? 'Moderate body fat' : 'Higher body fat'}
          </div>
        </div>

        {/* Experience Level & Training Age */}
        <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 space-y-3">
          <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Experience Level</label>
          <select
            value={profile.experienceLevel}
            onChange={(e) => onChange({ ...profile, experienceLevel: e.target.value as ExperienceLevel })}
            className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-lime-400 cursor-pointer"
          >
            <option value="novice">Novice (0 - 1 year)</option>
            <option value="intermediate">Intermediate (1 - 3 years)</option>
            <option value="advanced">Advanced (3 - 6 years)</option>
            <option value="elite">Elite Natural (6+ years)</option>
          </select>

          <div>
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>Training Age</span>
              <span className="font-bold text-white font-mono">{profile.trainingYears} yrs</span>
            </div>
            <input
              type="number"
              step={0.5}
              min={0}
              max={30}
              value={profile.trainingYears}
              onChange={(e) => onChange({ ...profile, trainingYears: parseFloat(e.target.value) || 1 })}
              className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-lime-400"
            />
          </div>
        </div>
      </div>

      {/* Goal Phase & Caloric Delta Periodization */}
      <div className="bg-zinc-950/70 p-5 rounded-xl border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-lime-400" />
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Bodybuilding Phase & Energy Delta</h3>
          </div>
          <span className="text-xs text-lime-400 font-bold font-mono">
            {profile.surplusDeficitPercent > 0 ? `+${profile.surplusDeficitPercent}% Surplus (Anabolic)` :
             profile.surplusDeficitPercent < 0 ? `${profile.surplusDeficitPercent}% Deficit (Fat Loss)` : 'Maintenance / Iso-caloric'}
          </span>
        </div>

        {/* Phase Selector Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { id: 'lean_bulk', label: 'Lean Bulk', desc: 'Optimal P-ratio muscle growth', delta: 10, color: 'border-lime-400/50 text-lime-300' },
            { id: 'aggressive_bulk', label: 'Aggressive Bulk', desc: 'Maximum mass surplus', delta: 20, color: 'border-cyan-400/50 text-cyan-300' },
            { id: 'maintenance_recomp', label: 'Body Recomp', desc: 'Iso-caloric recomposition', delta: 0, color: 'border-amber-400/50 text-amber-300' },
            { id: 'moderate_cut', label: 'Moderate Cut', desc: 'Preserve lean mass', delta: -18, color: 'border-orange-400/50 text-orange-300' },
            { id: 'aggressive_cut', label: 'Aggressive Cut', desc: 'Rapid mini-cut', delta: -25, color: 'border-rose-400/50 text-rose-300' },
            { id: 'contest_prep', label: 'Contest Prep', desc: 'Stage conditioning', delta: -22, color: 'border-fuchsia-400/50 text-fuchsia-300' },
          ].map((phase) => {
            const isSelected = profile.goal === phase.id;
            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => handleGoalChange(phase.id as GoalPhase)}
                className={`p-3 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between ${
                  isSelected
                    ? `bg-zinc-800 ${phase.color} shadow-lg ring-1 ring-lime-400/50`
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
                }`}
              >
                <div className="font-bold text-xs text-white">{phase.label}</div>
                <div className="text-[10px] text-zinc-400 mt-1 line-clamp-2">{phase.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Custom Surplus/Deficit Slider */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Fine-Tune Caloric Adjustment:</span>
            <span className="font-mono font-bold text-lime-400">
              {profile.surplusDeficitPercent >= 0 ? `+${profile.surplusDeficitPercent}%` : `${profile.surplusDeficitPercent}%`}
            </span>
          </div>
          <input
            type="range"
            min={-35}
            max={35}
            step={1}
            value={profile.surplusDeficitPercent}
            onChange={(e) => onChange({ ...profile, surplusDeficitPercent: parseInt(e.target.value) || 0 })}
            className="w-full accent-lime-400 bg-zinc-800 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>-35% (Extreme Cut)</span>
            <span>0% (Maintenance)</span>
            <span>+35% (Hyper-Caloric)</span>
          </div>
        </div>

        {/* Training Frequency & Activity Multiplier */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-800">
          <div>
            <label className="text-xs text-zinc-300 font-bold block mb-1">Resistance Training Frequency</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={2}
                max={7}
                value={profile.trainingDaysPerWeek}
                onChange={(e) => onChange({ ...profile, trainingDaysPerWeek: parseInt(e.target.value) || 4 })}
                className="w-full accent-lime-400 bg-zinc-800 h-1.5 rounded cursor-pointer"
              />
              <span className="text-xs font-extrabold text-lime-400 whitespace-nowrap font-mono">{profile.trainingDaysPerWeek} days/wk</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-300 font-bold block mb-1">Daily Activity & NEAT Level</label>
            <select
              value={profile.activityLevel}
              onChange={(e) => onChange({ ...profile, activityLevel: e.target.value as ActivityLevel })}
              className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-lime-400 font-medium"
            >
              <option value="sedentary">Sedentary (Desk Job, minimal steps)</option>
              <option value="light">Light Activity (6,000 - 8,000 steps/day)</option>
              <option value="moderate">Moderate Activity (8,000 - 12,000 steps/day)</option>
              <option value="very_active">Very Active (12,000+ steps or active job)</option>
              <option value="extreme">Extreme (Hard manual labor + 2x/day training)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Casey Butt Maximum Muscular Potential (MMP) Bone Structure Measurements */}
      <div className="bg-zinc-950/70 rounded-xl border border-zinc-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-lime-400" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Bone Structure (Casey Butt Natural Ceiling Inputs)
              </h4>
              <p className="text-[11px] text-zinc-400">
                Accurately estimates drug-free maximum lean body mass based on skeletal frame diameter
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvancedMeasurements(!showAdvancedMeasurements)}
            className="flex items-center gap-1 text-xs text-lime-400 hover:text-lime-300 font-bold transition"
          >
            <span>{showAdvancedMeasurements ? 'Hide Tape Metrics' : 'Detailed Tape Measurements'}</span>
            {showAdvancedMeasurements ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>Wrist Circumference (smallest point at styloid process):</span>
              <span className="font-bold text-white font-mono">{displayWrist} {unit === 'imperial' ? 'in' : 'cm'}</span>
            </div>
            <input
              type="number"
              step={unit === 'imperial' ? 0.1 : 0.2}
              value={displayWrist}
              onChange={(e) => handleWristChange(parseFloat(e.target.value) || 17.5)}
              className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-lime-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>Ankle Circumference (smallest point above malleolus):</span>
              <span className="font-bold text-white font-mono">{displayAnkle} {unit === 'imperial' ? 'in' : 'cm'}</span>
            </div>
            <input
              type="number"
              step={unit === 'imperial' ? 0.1 : 0.2}
              value={displayAnkle}
              onChange={(e) => handleAnkleChange(parseFloat(e.target.value) || 22.5)}
              className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-lime-400"
            />
          </div>
        </div>

        {/* Expandable Body Tape Measurements */}
        {showAdvancedMeasurements && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-zinc-800">
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Flexed Arm</label>
              <input
                type="number"
                step={0.2}
                value={profile.armCircumferenceCm || ''}
                onChange={(e) => onChange({ ...profile, armCircumferenceCm: parseFloat(e.target.value) || undefined })}
                placeholder="cm"
                className="w-full bg-zinc-800/90 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-200 font-mono focus:outline-none focus:border-lime-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Chest (Relaxed)</label>
              <input
                type="number"
                step={0.5}
                value={profile.chestCircumferenceCm || ''}
                onChange={(e) => onChange({ ...profile, chestCircumferenceCm: parseFloat(e.target.value) || undefined })}
                placeholder="cm"
                className="w-full bg-zinc-800/90 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-200 font-mono focus:outline-none focus:border-lime-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Waist (Navel)</label>
              <input
                type="number"
                step={0.5}
                value={profile.waistCircumferenceCm || ''}
                onChange={(e) => onChange({ ...profile, waistCircumferenceCm: parseFloat(e.target.value) || undefined })}
                placeholder="cm"
                className="w-full bg-zinc-800/90 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-200 font-mono focus:outline-none focus:border-lime-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Thigh (Mid)</label>
              <input
                type="number"
                step={0.5}
                value={profile.thighCircumferenceCm || ''}
                onChange={(e) => onChange({ ...profile, thighCircumferenceCm: parseFloat(e.target.value) || undefined })}
                placeholder="cm"
                className="w-full bg-zinc-800/90 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-200 font-mono focus:outline-none focus:border-lime-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Calf (Peak)</label>
              <input
                type="number"
                step={0.2}
                value={profile.calfCircumferenceCm || ''}
                onChange={(e) => onChange({ ...profile, calfCircumferenceCm: parseFloat(e.target.value) || undefined })}
                placeholder="cm"
                className="w-full bg-zinc-800/90 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-200 font-mono focus:outline-none focus:border-lime-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Neck</label>
              <input
                type="number"
                step={0.2}
                value={profile.neckCircumferenceCm || ''}
                onChange={(e) => onChange({ ...profile, neckCircumferenceCm: parseFloat(e.target.value) || undefined })}
                placeholder="cm"
                className="w-full bg-zinc-800/90 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-200 font-mono focus:outline-none focus:border-lime-400"
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
