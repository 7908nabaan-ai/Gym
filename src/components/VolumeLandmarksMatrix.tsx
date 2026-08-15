import React, { useState } from 'react';
import { MuscleVolumeLandmark } from '../types';
import { DEFAULT_VOLUME_LANDMARKS } from '../data/benchmarkDatasets';
import { Target, AlertTriangle, CheckCircle2, Plus, Minus, RotateCcw, Info } from 'lucide-react';

export const VolumeLandmarksMatrix: React.FC = () => {
  const [landmarks, setLandmarks] = useState<MuscleVolumeLandmark[]>(DEFAULT_VOLUME_LANDMARKS);

  const updateSets = (index: number, delta: number) => {
    setLandmarks((prev) => {
      const copy = [...prev];
      const target = copy[index];
      const newSets = Math.max(0, Math.min(40, target.currentSets + delta));
      
      let capacity: 'low' | 'moderate' | 'optimal' | 'overreaching' = 'optimal';
      if (newSets < target.mev) capacity = 'low';
      else if (newSets >= target.mev && newSets < target.mavMin) capacity = 'moderate';
      else if (newSets >= target.mavMin && newSets <= target.mavMax) capacity = 'optimal';
      else capacity = 'overreaching';

      copy[index] = { ...target, currentSets: newSets, recoveryCapacity: capacity };
      return copy;
    });
  };

  const totalWeeklySets = landmarks.reduce((sum, l) => sum + l.currentSets, 0);
  const overreachingMuscles = landmarks.filter((l) => l.currentSets > l.mrv);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 md:p-6 shadow-2xl space-y-4 backdrop-blur-md">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-lime-400/10 text-lime-400 border border-lime-400/30 font-bold">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight">Hypertrophy Volume Landmarks (MEV / MAV / MRV)</h2>
              <p className="text-xs text-zinc-400">Scientific set prescription matrix per muscle group to prevent junk volume & overtraining</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-zinc-800 px-3.5 py-1.5 rounded-xl border border-zinc-700 text-xs">
              <span className="text-zinc-400 font-medium">Total Working Sets:</span>
              <span className="font-mono font-black text-lime-400 ml-1.5">{totalWeeklySets} sets/wk</span>
            </div>
            <button
              onClick={() => setLandmarks(DEFAULT_VOLUME_LANDMARKS)}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border border-zinc-700 rounded-xl transition"
              title="Reset Volume to RP Defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Volume status alert if overreaching */}
        {overreachingMuscles.length > 0 && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 flex items-center gap-3 text-xs text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <strong className="text-rose-200">Systemic MRV Exceeded:</strong> You have {overreachingMuscles.length} muscle group(s) exceeding Maximum Recoverable Volume ({overreachingMuscles.map(m => m.muscleGroup).join(', ')}). Consider reducing direct sets or scheduling a deload week.
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
            <div className="font-extrabold text-amber-400">MEV (Min. Effective Volume)</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Threshold of direct working sets (RIR 1-3) required to initiate hypertrophy.</div>
          </div>
          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
            <div className="font-extrabold text-lime-400">MAV (Max. Adaptive Volume)</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">The sweet-spot window producing the highest rate of muscle hypertrophy.</div>
          </div>
          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
            <div className="font-extrabold text-rose-400">MRV (Max. Recoverable Volume)</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Upper ceiling where cumulative fatigue overpowers adaptive response.</div>
          </div>
        </div>

      </div>

      {/* Muscle Group Matrix Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {landmarks.map((l, index) => {
          const isOver = l.currentSets > l.mrv;
          const isOptimal = l.currentSets >= l.mavMin && l.currentSets <= l.mavMax;
          const isLow = l.currentSets < l.mev;

          return (
            <div
              key={l.muscleGroup}
              className={`bg-zinc-900/90 rounded-2xl border p-5 shadow-2xl flex flex-col justify-between transition backdrop-blur-md ${
                isOver ? 'border-rose-500/50 bg-rose-950/20' :
                isOptimal ? 'border-lime-400/40 bg-zinc-900/90' :
                'border-zinc-800'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-start pb-3 border-b border-zinc-800">
                  <div>
                    <h3 className="font-extrabold text-sm text-white">{l.muscleGroup}</h3>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      Rec. Freq: <span className="text-zinc-200 font-bold">{l.frequencyDaysPerWeek}x / week</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      isOver ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                      isOptimal ? 'bg-lime-400/10 text-lime-400 border-lime-400/30' :
                      isLow ? 'bg-amber-400/10 text-amber-400 border-amber-400/30' :
                      'bg-cyan-400/10 text-cyan-400 border-cyan-400/30'
                    }`}
                  >
                    {isOver ? 'Over MRV' : isOptimal ? 'Optimal MAV' : isLow ? 'Below MEV' : 'Moderate'}
                  </span>
                </div>

                {/* Counter controls */}
                <div className="flex items-center justify-between py-4">
                  <div className="text-xs text-zinc-400 font-medium">Weekly Working Sets:</div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateSets(index, -1)}
                      className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center border border-zinc-700 transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-2xl font-black font-mono text-lime-400 w-8 text-center">
                      {l.currentSets}
                    </span>
                    <button
                      onClick={() => updateSets(index, 1)}
                      className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center border border-zinc-700 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                    <span>MEV: {l.mev}</span>
                    <span className="text-lime-400 font-bold">MAV: {l.mavMin}-{l.mavMax}</span>
                    <span className="text-rose-400">MRV: {l.mrv}</span>
                  </div>

                  <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden relative">
                    {/* MEV marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                      style={{ left: `${(l.mev / 30) * 100}%` }}
                    />
                    {/* MRV marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10"
                      style={{ left: `${(l.mrv / 30) * 100}%` }}
                    />

                    <div
                      className={`h-full rounded-full transition-all ${
                        isOver ? 'bg-rose-500' :
                        isOptimal ? 'bg-lime-400' :
                        isLow ? 'bg-amber-400' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${Math.min(100, (l.currentSets / 30) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Status footer */}
              <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-1.5">
                {isOptimal ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                    <span className="text-lime-300 font-bold">Maximal hypertrophic stimulus</span>
                  </>
                ) : isOver ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="text-rose-300 font-bold">Excess fatigue accumulation</span>
                  </>
                ) : (
                  <>
                    <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Maintenance to moderate stimulus</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
