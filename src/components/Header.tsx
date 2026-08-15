import React from 'react';
import { UnitSystem } from '../types';
import { Dumbbell, Flame, Sparkles, Download, Database, RotateCcw } from 'lucide-react';
import { BENCHMARK_DATASETS } from '../data/benchmarkDatasets';

interface HeaderProps {
  unit: UnitSystem;
  onToggleUnit: (unit: UnitSystem) => void;
  onLoadDataset: (datasetId: string) => void;
  onExportData: () => void;
  onReset: () => void;
  activeTab: 'calculator' | 'growth' | 'nutrition' | 'volume' | 'workout' | 'data' | 'ai';
  onSelectTab: (tab: 'calculator' | 'growth' | 'nutrition' | 'volume' | 'workout' | 'data' | 'ai') => void;
  logCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  unit,
  onToggleUnit,
  onLoadDataset,
  onExportData,
  onReset,
  activeTab,
  onSelectTab,
  logCount,
}) => {
  return (
    <header className="bg-zinc-900/95 border-b border-zinc-800 sticky top-0 z-50 text-white shadow-2xl backdrop-blur-md">
      {/* Top Banner / Brand */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-3.5 gap-3">
          
          {/* Logo & Identity */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-lime-400 text-black flex items-center justify-center font-black shadow-lg shadow-lime-400/20">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-lg text-white tracking-tight">Hypertrophy & Macro Engine</h1>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/30">
                    Evidence-Based
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Muscle Growth Velocity • Periodized Nutrition • Data Integration
                </p>
              </div>
            </div>

            {/* Mobile Controls quick toggle */}
            <div className="flex md:hidden items-center gap-2">
              <div className="flex bg-zinc-800 rounded-lg p-0.5 border border-zinc-700">
                <button
                  onClick={() => onToggleUnit('metric')}
                  className={`px-2 py-1 text-xs font-bold rounded ${unit === 'metric' ? 'bg-lime-400 text-black' : 'text-zinc-400'}`}
                >
                  KG
                </button>
                <button
                  onClick={() => onToggleUnit('imperial')}
                  className={`px-2 py-1 text-xs font-bold rounded ${unit === 'imperial' ? 'bg-lime-400 text-black' : 'text-zinc-400'}`}
                >
                  LBS
                </button>
              </div>
            </div>
          </div>

          {/* Action Bar (Desktop) */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            
            {/* Quick Benchmark Dataset Loader */}
            <div className="flex items-center gap-1.5 bg-zinc-800/90 border border-zinc-700/80 rounded-xl px-2.5 py-1 text-xs">
              <Database className="w-3.5 h-3.5 text-lime-400" />
              <span className="text-zinc-400 hidden sm:inline">Load Case Study:</span>
              <select
                onChange={(e) => {
                  if (e.target.value) onLoadDataset(e.target.value);
                }}
                defaultValue=""
                className="bg-transparent text-zinc-200 text-xs font-medium focus:outline-none cursor-pointer pr-2"
              >
                <option value="" disabled className="bg-zinc-900 text-zinc-400">Select Dataset...</option>
                {BENCHMARK_DATASETS.map((ds) => (
                  <option key={ds.id} value={ds.id} className="bg-zinc-900 text-zinc-200">
                    {ds.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Metric/Imperial Switcher */}
            <div className="hidden md:flex bg-zinc-800 rounded-xl p-0.5 border border-zinc-700 text-xs">
              <button
                onClick={() => onToggleUnit('metric')}
                className={`px-2.5 py-1 rounded-lg transition-all font-bold ${
                  unit === 'metric' ? 'bg-lime-400 text-black shadow' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Metric (kg / cm)
              </button>
              <button
                onClick={() => onToggleUnit('imperial')}
                className={`px-2.5 py-1 rounded-lg transition-all font-bold ${
                  unit === 'imperial' ? 'bg-lime-400 text-black shadow' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Imperial (lbs / in)
              </button>
            </div>

            {/* Export Button */}
            <button
              onClick={onExportData}
              title="Export Current Progress Logs to CSV"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 rounded-xl text-xs font-medium transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Reset */}
            <button
              onClick={onReset}
              title="Reset to default baseline"
              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-rose-400 border border-zinc-700 rounded-xl transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-zinc-800/80 pt-1 overflow-x-auto no-scrollbar text-xs font-medium">
          <button
            onClick={() => onSelectTab('calculator')}
            className={`px-3.5 py-2 rounded-t-lg transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'calculator'
                ? 'border-lime-400 text-lime-400 bg-zinc-800/60 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            Profile & Setup
          </button>

          <button
            onClick={() => onSelectTab('growth')}
            className={`px-3.5 py-2 rounded-t-lg transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'growth'
                ? 'border-lime-400 text-lime-400 bg-zinc-800/60 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
            }`}
          >
            <span>📈</span>
            Muscle Growth Potential
          </button>

          <button
            onClick={() => onSelectTab('nutrition')}
            className={`px-3.5 py-2 rounded-t-lg transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'nutrition'
                ? 'border-lime-400 text-lime-400 bg-zinc-800/60 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            Nutritional Intake & Macros
          </button>

          <button
            onClick={() => onSelectTab('volume')}
            className={`px-3.5 py-2 rounded-t-lg transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'volume'
                ? 'border-lime-400 text-lime-400 bg-zinc-800/60 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
            }`}
          >
            <span>🎯</span>
            Volume Landmarks (RP)
          </button>

          <button
            onClick={() => onSelectTab('workout')}
            className={`px-3.5 py-2 rounded-t-lg transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'workout'
                ? 'border-lime-400 text-lime-400 bg-zinc-800/60 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5 text-lime-400" />
            Workout Routine Generator
          </button>

          <button
            onClick={() => onSelectTab('data')}
            className={`px-3.5 py-2 rounded-t-lg transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'data'
                ? 'border-lime-400 text-lime-400 bg-zinc-800/60 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            Progress Logs & Data Integration
            {logCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] text-lime-400 font-bold border border-zinc-700">
                {logCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('ai')}
            className={`px-3.5 py-2 rounded-t-lg transition border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ai'
                ? 'border-lime-400 text-lime-400 bg-zinc-800/60 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-lime-400" />
            AI Coach & Analysis
          </button>
        </nav>
      </div>
    </header>
  );
};
