/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, ProgressLogEntry, UnitSystem } from './types';
import { calculateComprehensiveMetrics, formatWeight, UNIT_CONVERSIONS } from './utils/calculations';
import { BENCHMARK_DATASETS } from './data/benchmarkDatasets';
import { exportToCSV } from './utils/dataImporter';
import { Header } from './components/Header';
import { UserProfileForm } from './components/UserProfileForm';
import { MuscleGrowthSection } from './components/MuscleGrowthSection';
import { NutritionIntakeSection } from './components/NutritionIntakeSection';
import { VolumeLandmarksMatrix } from './components/VolumeLandmarksMatrix';
import { WorkoutPlanGenerator } from './components/WorkoutPlanGenerator';
import { DataIntegrationSuite } from './components/DataIntegrationSuite';
import { AiCoachInsights } from './components/AiCoachInsights';
import { Dumbbell, Flame, TrendingUp, Sparkles, Database, Target, ArrowRight, ShieldCheck } from 'lucide-react';

const DEFAULT_PROFILE: UserProfile = {
  id: 'user_default',
  name: 'Marcus Vance',
  gender: 'male',
  age: 26,
  heightCm: 180,
  currentWeightKg: 82.5,
  bodyFatPercentage: 14.0,
  trainingYears: 3,
  experienceLevel: 'intermediate',
  activityLevel: 'very_active',
  goal: 'lean_bulk',
  surplusDeficitPercent: 10,
  trainingDaysPerWeek: 5,
  wristCircumferenceCm: 17.8,
  ankleCircumferenceCm: 22.8,
  armCircumferenceCm: 39.5,
  chestCircumferenceCm: 110.0,
  waistCircumferenceCm: 81.5,
  thighCircumferenceCm: 62.0,
  calfCircumferenceCm: 38.5,
  neckCircumferenceCm: 40.0,
};

export default function App() {
  const [unit, setUnit] = useState<UnitSystem>(() => {
    const saved = localStorage.getItem('hypertrophy_unit');
    return (saved as UnitSystem) || 'metric';
  });

  const [activeTab, setActiveTab] = useState<'calculator' | 'growth' | 'nutrition' | 'volume' | 'workout' | 'data' | 'ai'>('calculator');

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('hypertrophy_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_PROFILE;
  });

  const [logs, setLogs] = useState<ProgressLogEntry[]>(() => {
    const saved = localStorage.getItem('hypertrophy_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    // Default to intermediate clean bulk benchmark dataset
    return BENCHMARK_DATASETS[1].logs;
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('hypertrophy_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('hypertrophy_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('hypertrophy_unit', unit);
  }, [unit]);

  // Recalculate metrics on profile changes
  const metrics = useMemo(() => {
    return calculateComprehensiveMetrics(profile);
  }, [profile]);

  const handleLoadDataset = (datasetId: string) => {
    const target = BENCHMARK_DATASETS.find((d) => d.id === datasetId);
    if (!target) return;
    setLogs(target.logs);
    if (target.lifterProfile) {
      setProfile((prev) => ({
        ...prev,
        ...target.lifterProfile,
      } as UserProfile));
    }
  };

  const handleExportData = () => {
    const csv = exportToCSV(logs);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bodybuilding_progress_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleReset = () => {
    if (window.confirm('Reset profile and logs to default baseline?')) {
      setProfile(DEFAULT_PROFILE);
      setLogs(BENCHMARK_DATASETS[1].logs);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-lime-400 selection:text-black">
      
      {/* Top Application Header & Navigation */}
      <Header
        unit={unit}
        onToggleUnit={setUnit}
        onLoadDataset={handleLoadDataset}
        onExportData={handleExportData}
        onReset={handleReset}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        logCount={logs.length}
      />

      {/* Persistent Quick HUD Overview Strip */}
      <div className="bg-zinc-900/80 border-b border-zinc-800/80 py-2.5 px-4 sm:px-6 lg:px-8 backdrop-blur-md sticky top-[65px] z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Weight:</span>
              <strong className="text-white font-mono font-bold">{formatWeight(profile.currentWeightKg, unit)}</strong>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Body Fat:</span>
              <strong className="text-amber-400 font-mono font-bold">{profile.bodyFatPercentage}%</strong>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Lean Mass:</span>
              <strong className="text-lime-400 font-mono font-bold">{formatWeight(metrics.leanBodyMassKg, unit)}</strong>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Normalized FFMI:</span>
              <strong className="text-cyan-400 font-mono font-bold">{metrics.normalizedFfmi}</strong>
            </div>

            <div className="flex items-center gap-1.5 hidden md:flex">
              <span className="text-zinc-400">Target Calories:</span>
              <strong className="text-lime-300 font-mono font-bold">{metrics.targetCalories} kcal</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400">Phase:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-lime-400/10 text-lime-400 font-bold uppercase text-[10px] border border-lime-400/30">
              {profile.goal.replace('_', ' ')}
            </span>
          </div>

        </div>
      </div>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        
        {/* Tab 1: Profile & Calculator Setup */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <UserProfileForm
              profile={profile}
              onChange={setProfile}
              unit={unit}
            />

            {/* Quick Next Step Action Cards with Vibrant Palette Accents */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <button
                onClick={() => setActiveTab('growth')}
                className="bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-lime-400/60 p-5 rounded-2xl text-left transition-all duration-200 flex flex-col justify-between group shadow-xl hover:shadow-lime-400/5 hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between text-lime-400 mb-2">
                    <TrendingUp className="w-5 h-5" />
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="font-bold text-sm text-white">Muscle Growth Potential</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Check your Casey Butt genetic limit, FFMI gauge, and 52-week curve.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('nutrition')}
                className="bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-orange-400/60 p-5 rounded-2xl text-left transition-all duration-200 flex flex-col justify-between group shadow-xl hover:shadow-orange-400/5 hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between text-orange-400 mb-2">
                    <Flame className="w-5 h-5" />
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="font-bold text-sm text-white">ISSN Macro & Nutrition</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Daily protein, carb, fat targets and scientific protein source yields.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('workout')}
                className="bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-lime-400/60 p-5 rounded-2xl text-left transition-all duration-200 flex flex-col justify-between group shadow-xl hover:shadow-lime-400/5 hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between text-lime-400 mb-2">
                    <Dumbbell className="w-5 h-5" />
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="font-bold text-sm text-white">Personalized Routine</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Weekly schedule with sets, reps, suggested loads, and live rest timer.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('data')}
                className="bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-cyan-400/60 p-5 rounded-2xl text-left transition-all duration-200 flex flex-col justify-between group shadow-xl hover:shadow-cyan-400/5 hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between text-cyan-400 mb-2">
                    <Database className="w-5 h-5" />
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="font-bold text-sm text-white">Integrate Progress Data</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Upload your CSV/JSON weigh-ins or compare with natural bodybuilding case studies.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Muscle Growth Potential */}
        {activeTab === 'growth' && (
          <MuscleGrowthSection
            metrics={metrics}
            profile={profile}
            unit={unit}
          />
        )}

        {/* Tab 3: Nutritional Intake & Macros */}
        {activeTab === 'nutrition' && (
          <NutritionIntakeSection
            metrics={metrics}
            profile={profile}
            unit={unit}
          />
        )}

        {/* Tab 4: Volume Landmarks (RP) */}
        {activeTab === 'volume' && (
          <VolumeLandmarksMatrix />
        )}

        {/* Tab 5: Personalized Workout Plan Generator */}
        {activeTab === 'workout' && (
          <WorkoutPlanGenerator
            profile={profile}
            logs={logs}
            unit={unit}
            onNavigateToAi={() => setActiveTab('ai')}
          />
        )}

        {/* Tab 6: Data Integration & Progress Logs */}
        {activeTab === 'data' && (
          <DataIntegrationSuite
            logs={logs}
            onUpdateLogs={setLogs}
            profile={profile}
            onUpdateProfile={setProfile}
            unit={unit}
          />
        )}

        {/* Tab 6: AI Coach & Hypertrophy Analysis */}
        {activeTab === 'ai' && (
          <AiCoachInsights
            metrics={metrics}
            profile={profile}
            logs={logs}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-lime-400" />
            <span className="font-semibold text-zinc-300">Hypertrophy & Macro Engine</span>
            <span className="text-zinc-500">— Evidence-Based Exercise Physiology & Sports Nutrition</span>
          </div>
          <div className="text-[11px] text-zinc-600">
            Formulas: Katch-McArdle • Casey Butt MMP • Alan Aragon • Lyle McDonald • Renaissance Periodization
          </div>
        </div>
      </footer>

    </div>
  );
}
