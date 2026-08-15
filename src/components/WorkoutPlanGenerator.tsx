import React, { useState, useEffect, useMemo } from 'react';
import {
  UserProfile,
  ProgressLogEntry,
  UnitSystem,
  WorkoutGoal,
  EquipmentAvailability,
  TrainingSplit,
  PersonalizedWorkoutPlan,
  ExerciseItem,
} from '../types';
import {
  generatePersonalizedWorkoutPlan,
  EXERCISE_DATABASE,
  calculateWorkingWeight,
} from '../data/workoutTemplates';
import { formatWeight, UNIT_CONVERSIONS } from '../utils/calculations';
import {
  Dumbbell,
  Play,
  RotateCcw,
  Sparkles,
  Calendar,
  Clock,
  Flame,
  CheckCircle2,
  ChevronRight,
  Download,
  Copy,
  Printer,
  Sliders,
  Award,
  Layers,
  ArrowRightLeft,
  Timer,
  Volume2,
  TrendingUp,
  Info,
  Check,
  Zap,
} from 'lucide-react';

interface WorkoutPlanGeneratorProps {
  profile: UserProfile;
  logs: ProgressLogEntry[];
  unit: UnitSystem;
  onNavigateToAi?: () => void;
}

export const WorkoutPlanGenerator: React.FC<WorkoutPlanGeneratorProps> = ({
  profile,
  logs,
  unit,
  onNavigateToAi,
}) => {
  // Extract latest strength numbers from logs or fallback defaults
  const latestLifts = useMemo(() => {
    const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latestWithBench = sorted.find((l) => l.benchPressKg && l.benchPressKg > 0);
    const latestWithSquat = sorted.find((l) => l.squatKg && l.squatKg > 0);
    const latestWithDeadlift = sorted.find((l) => l.deadliftKg && l.deadliftKg > 0);
    const latestWithOhp = sorted.find((l) => l.overheadPressKg && l.overheadPressKg > 0);

    return {
      benchPressKg: latestWithBench?.benchPressKg || 100,
      squatKg: latestWithSquat?.squatKg || 140,
      deadliftKg: latestWithDeadlift?.deadliftKg || 180,
      overheadPressKg: latestWithOhp?.overheadPressKg || 65,
    };
  }, [logs]);

  // Generator Configuration State
  const [goal, setGoal] = useState<WorkoutGoal>(() => {
    if (profile.goal === 'lean_bulk' || profile.goal === 'aggressive_bulk') return 'hypertrophy';
    if (profile.goal === 'moderate_cut' || profile.goal === 'aggressive_cut') return 'cutting_density';
    return 'hypertrophy';
  });

  const [split, setSplit] = useState<TrainingSplit>('ppl');
  const [equipment, setEquipment] = useState<EquipmentAvailability>('commercial_gym');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(profile.trainingDaysPerWeek || 5);
  const [musclePriority, setMusclePriority] = useState<string>('balanced');

  // Lift 1RM overrides for working weight calculations
  const [customLifts, setCustomLifts] = useState({
    benchPressKg: latestLifts.benchPressKg,
    squatKg: latestLifts.squatKg,
    deadliftKg: latestLifts.deadliftKg,
    overheadPressKg: latestLifts.overheadPressKg,
  });

  // Active Generated Plan
  const [activePlan, setActivePlan] = useState<PersonalizedWorkoutPlan>(() => {
    const saved = localStorage.getItem('hypertrophy_workout_plan');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return generatePersonalizedWorkoutPlan({
      goal: 'hypertrophy',
      split: 'ppl',
      equipment: 'commercial_gym',
      daysPerWeek: 5,
      experienceLevel: profile.experienceLevel,
      recentLifts: latestLifts,
    });
  });

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [swapModalExercise, setSwapModalExercise] = useState<{ dayIndex: number; exerciseIndex: number; item: ExerciseItem } | null>(null);

  // Active Stopwatch / Rest Timer State
  const [activeTimerSeconds, setActiveTimerSeconds] = useState<number | null>(null);
  const [timerInitial, setTimerInitial] = useState<number>(90);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Rest Timer countdown effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && activeTimerSeconds !== null && activeTimerSeconds > 0) {
      interval = setInterval(() => {
        setActiveTimerSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (activeTimerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, activeTimerSeconds]);

  // Persist plan to local storage
  useEffect(() => {
    localStorage.setItem('hypertrophy_workout_plan', JSON.stringify(activePlan));
  }, [activePlan]);

  const handleGeneratePlan = () => {
    const plan = generatePersonalizedWorkoutPlan({
      goal,
      split,
      equipment,
      daysPerWeek,
      experienceLevel: profile.experienceLevel,
      recentLifts: customLifts,
      priorityMuscleGroup: musclePriority,
    });
    setActivePlan(plan);
    setSelectedDayIndex(0);
  };

  const handleStartRestTimer = (seconds: number) => {
    setTimerInitial(seconds);
    setActiveTimerSeconds(seconds);
    setIsTimerRunning(true);
  };

  const handleToggleSetComplete = (dayIdx: number, exIdx: number, setIdx: number) => {
    setActivePlan((prev) => {
      const updated = { ...prev };
      const currentDay = { ...updated.schedule[dayIdx] };
      const exercises = [...currentDay.exercises];
      const exercise = { ...exercises[exIdx] };
      const completedSets = exercise.completedSets ? [...exercise.completedSets] : new Array(exercise.sets).fill(false);
      
      completedSets[setIdx] = !completedSets[setIdx];
      exercise.completedSets = completedSets;
      exercises[exIdx] = exercise;
      currentDay.exercises = exercises;
      updated.schedule[dayIdx] = currentDay;

      // Auto start rest timer on completing set
      if (completedSets[setIdx]) {
        handleStartRestTimer(exercise.restSeconds || 90);
      }

      return updated;
    });
  };

  const handleUpdateExerciseLog = (dayIdx: number, exIdx: number, setIdx: number, weightKg: number, reps: number) => {
    setActivePlan((prev) => {
      const updated = { ...prev };
      const currentDay = { ...updated.schedule[dayIdx] };
      const exercises = [...currentDay.exercises];
      const exercise = { ...exercises[exIdx] };
      const loggedWeightsKg = exercise.loggedWeightsKg ? [...exercise.loggedWeightsKg] : new Array(exercise.sets).fill(0);
      const loggedReps = exercise.loggedReps ? [...exercise.loggedReps] : new Array(exercise.sets).fill(0);

      loggedWeightsKg[setIdx] = weightKg;
      loggedReps[setIdx] = reps;

      exercise.loggedWeightsKg = loggedWeightsKg;
      exercise.loggedReps = loggedReps;
      exercises[exIdx] = exercise;
      currentDay.exercises = exercises;
      updated.schedule[dayIdx] = currentDay;
      return updated;
    });
  };

  const handleSwapExercise = (replacementEx: any) => {
    if (!swapModalExercise) return;
    const { dayIndex, exerciseIndex } = swapModalExercise;
    
    setActivePlan((prev) => {
      const updated = { ...prev };
      const currentDay = { ...updated.schedule[dayIndex] };
      const exercises = [...currentDay.exercises];
      const old = exercises[exerciseIndex];

      const avgReps = parseInt(old.repRange.split('-')[0]) || 8;
      const calculatedWeightKg = calculateWorkingWeight(replacementEx, avgReps, customLifts);

      exercises[exerciseIndex] = {
        ...old,
        id: `${replacementEx.id}_${Date.now()}`,
        name: replacementEx.name,
        targetMuscle: replacementEx.targetMuscle,
        secondaryMuscles: replacementEx.secondaryMuscles,
        formCue: replacementEx.formCue,
        tempo: replacementEx.tempo,
        equipment: replacementEx.equipment,
        benchmarkLiftKey: replacementEx.benchmarkLiftKey,
        calculatedWeightKg,
        loggedWeightsKg: new Array(old.sets).fill(calculatedWeightKg || 0),
        completedSets: new Array(old.sets).fill(false),
      };

      currentDay.exercises = exercises;
      updated.schedule[dayIndex] = currentDay;
      return updated;
    });

    setSwapModalExercise(null);
  };

  // Export to CSV
  const handleExportCSV = () => {
    let csv = 'Day,Day Name,Exercise,Target Muscle,Sets,Rep Range,Target RIR,Rest (s),Tempo,Calculated Load (kg),Form Cue\n';
    activePlan.schedule.forEach((day) => {
      if (day.isRestDay) {
        csv += `"${day.dayNumber}","${day.dayName}","REST DAY","Active Recovery",0,"-",0,0,"-",0,"Rest and recover"\n`;
      } else {
        day.exercises.forEach((ex) => {
          csv += `"${day.dayNumber}","${day.dayName}","${ex.name}","${ex.targetMuscle}",${ex.sets},"${ex.repRange}",${ex.targetRir},${ex.restSeconds},"${ex.tempo}",${ex.calculatedWeightKg || 0},"${ex.formCue.replace(/"/g, '""')}"\n`;
        });
      }
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workout_plan_${activePlan.split}_${activePlan.goal}.csv`;
    a.click();
  };

  // Copy Markdown
  const handleCopyMarkdown = () => {
    let md = `# ${activePlan.title}\n\n`;
    md += `**Goal:** ${activePlan.goal.toUpperCase()} | **Split:** ${activePlan.split.toUpperCase()} | **Frequency:** ${activePlan.daysPerWeek} Days/Week | **Weekly Sets:** ${activePlan.totalWeeklySets}\n\n`;
    md += `*${activePlan.description}*\n\n`;
    md += `### Progression Strategy\n${activePlan.progressionStrategy}\n\n---\n\n`;

    activePlan.schedule.forEach((day) => {
      md += `## ${day.dayName}\n`;
      if (day.isRestDay) {
        md += `*Focus: ${day.focus}*\n\n`;
      } else {
        md += `*Focus: ${day.focus} | Est. Duration: ${day.estimatedDurationMin} min | Total Sets: ${day.targetVolumeSets}*\n\n`;
        md += `| Exercise | Target Muscle | Sets x Reps | Target RIR | Rest | Suggested Load | Form Cue |\n`;
        md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
        day.exercises.forEach((ex) => {
          const loadStr = ex.calculatedWeightKg ? formatWeight(ex.calculatedWeightKg, unit) : 'RPE Scale';
          md += `| **${ex.name}** | ${ex.targetMuscle} | ${ex.sets} × ${ex.repRange} | ${ex.targetRir} RIR | ${ex.restSeconds}s | ${loadStr} | ${ex.formCue} |\n`;
        });
        md += `\n`;
      }
    });

    navigator.clipboard.writeText(md);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  const currentDay = activePlan.schedule[selectedDayIndex] || activePlan.schedule[0];

  // Calculate day completion percentage and volume tonnage
  const dayStats = useMemo(() => {
    if (!currentDay || currentDay.isRestDay) return { totalSets: 0, completedSets: 0, completionPct: 0, volumeTonnageKg: 0 };
    let total = 0;
    let done = 0;
    let volumeKg = 0;

    currentDay.exercises.forEach((ex) => {
      total += ex.sets;
      ex.completedSets?.forEach((c, idx) => {
        if (c) {
          done += 1;
          const w = ex.loggedWeightsKg?.[idx] || ex.calculatedWeightKg || 0;
          const r = ex.loggedReps?.[idx] || parseInt(ex.repRange.split('-')[0]) || 8;
          volumeKg += w * r;
        }
      });
    });

    return {
      totalSets: total,
      completedSets: done,
      completionPct: total > 0 ? Math.round((done / total) * 100) : 0,
      volumeTonnageKg: Math.round(volumeKg),
    };
  }, [currentDay]);

  return (
    <div className="space-y-6">
      
      {/* Plan Configurator Panel */}
      <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 md:p-6 shadow-2xl space-y-5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-lime-400/10 text-lime-400 border border-lime-400/30 font-bold">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight">Personalized Workout Routine Engine</h2>
              <p className="text-xs text-zinc-400">
                Periodized volume landmark prescriptions customized to your strength baseline, goals, and equipment.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGeneratePlan}
              className="inline-flex items-center gap-2 px-4 py-2 bg-lime-400 hover:bg-lime-300 text-black font-extrabold rounded-xl text-xs transition shadow-lg shadow-lime-400/20 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current" />
              Generate / Re-Optimize Plan
            </button>
          </div>
        </div>

        {/* 4 Configurator Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Goal Selector */}
          <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800 space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Training Goal</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as WorkoutGoal)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs font-bold text-white focus:outline-none focus:border-lime-400 cursor-pointer"
            >
              <option value="hypertrophy">Hypertrophy (Max Muscle Size)</option>
              <option value="strength">Strength & Power (Low Rep Heavy)</option>
              <option value="powerbuilding">Powerbuilding (Hybrid Strength & Size)</option>
              <option value="recomp">Body Recomposition (Tension & Lean Mass)</option>
              <option value="cutting_density">Cutting / Density (Preserve Muscle)</option>
            </select>
          </div>

          {/* Split Selector */}
          <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800 space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Training Split</label>
            <select
              value={split}
              onChange={(e) => setSplit(e.target.value as TrainingSplit)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs font-bold text-white focus:outline-none focus:border-lime-400 cursor-pointer"
            >
              <option value="ppl">Push / Pull / Legs (PPL)</option>
              <option value="upper_lower">Upper / Lower (4-Day Focus)</option>
              <option value="full_body">Full Body (3-Day Frequency)</option>
              <option value="arnold">Arnold Split (Chest/Back, Shoulders/Arms, Legs)</option>
              <option value="bro_split">Bro Split (1 Muscle Group / Day)</option>
            </select>
          </div>

          {/* Equipment Availability */}
          <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800 space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Equipment Access</label>
            <select
              value={equipment}
              onChange={(e) => setEquipment(e.target.value as EquipmentAvailability)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs font-bold text-white focus:outline-none focus:border-lime-400 cursor-pointer"
            >
              <option value="commercial_gym">Commercial Gym (Full Equipment)</option>
              <option value="home_gym">Home Gym (Barbell, Rack, Bench, DBs)</option>
              <option value="dumbbells_only">Dumbbells & Bench Only</option>
              <option value="cables_machines">Cables & Machines Focused</option>
              <option value="bodyweight_calisthenics">Calisthenics & Bodyweight</option>
            </select>
          </div>

          {/* Days Per Week */}
          <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800 space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Weekly Frequency</label>
            <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-700 gap-1 text-xs">
              {[3, 4, 5, 6].map((days) => (
                <button
                  key={days}
                  onClick={() => setDaysPerWeek(days)}
                  className={`flex-1 py-1 font-bold rounded-md transition ${
                    daysPerWeek === days ? 'bg-lime-400 text-black shadow' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Dynamic 1RM & Benchmark Lifts Integration Accordion / Row */}
        <div className="bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="font-bold text-white">1RM Strength Baselines:</span>
              <span className="text-zinc-400 ml-1.5">Used to dynamically calculate suggested working loads for your compound exercises.</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800 flex items-center justify-between gap-2">
              <span className="text-zinc-400 font-medium">Bench:</span>
              <input
                type="number"
                value={customLifts.benchPressKg}
                onChange={(e) => setCustomLifts({ ...customLifts, benchPressKg: parseFloat(e.target.value) || 0 })}
                className="w-14 bg-transparent text-right font-mono font-bold text-lime-400 focus:outline-none"
              />
              <span className="text-[10px] text-zinc-500">kg</span>
            </div>

            <div className="bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800 flex items-center justify-between gap-2">
              <span className="text-zinc-400 font-medium">Squat:</span>
              <input
                type="number"
                value={customLifts.squatKg}
                onChange={(e) => setCustomLifts({ ...customLifts, squatKg: parseFloat(e.target.value) || 0 })}
                className="w-14 bg-transparent text-right font-mono font-bold text-lime-400 focus:outline-none"
              />
              <span className="text-[10px] text-zinc-500">kg</span>
            </div>

            <div className="bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800 flex items-center justify-between gap-2">
              <span className="text-zinc-400 font-medium">Deadlift:</span>
              <input
                type="number"
                value={customLifts.deadliftKg}
                onChange={(e) => setCustomLifts({ ...customLifts, deadliftKg: parseFloat(e.target.value) || 0 })}
                className="w-14 bg-transparent text-right font-mono font-bold text-lime-400 focus:outline-none"
              />
              <span className="text-[10px] text-zinc-500">kg</span>
            </div>

            <div className="bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800 flex items-center justify-between gap-2">
              <span className="text-zinc-400 font-medium">OHP:</span>
              <input
                type="number"
                value={customLifts.overheadPressKg}
                onChange={(e) => setCustomLifts({ ...customLifts, overheadPressKg: parseFloat(e.target.value) || 0 })}
                className="w-14 bg-transparent text-right font-mono font-bold text-lime-400 focus:outline-none"
              />
              <span className="text-[10px] text-zinc-500">kg</span>
            </div>
          </div>
        </div>

      </div>

      {/* Plan Header Info & Action Toolbar */}
      <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 shadow-2xl space-y-4 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">{activePlan.title}</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-lime-400/10 text-lime-400 font-extrabold text-[10px] uppercase border border-lime-400/30">
                {activePlan.goal}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-3xl">{activePlan.description}</p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-semibold transition"
            >
              {copiedNotification ? <Check className="w-3.5 h-3.5 text-lime-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedNotification ? 'Copied Routine!' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {onNavigateToAi && (
              <button
                onClick={onNavigateToAi}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-lime-400/10 hover:bg-lime-400/20 text-lime-400 border border-lime-400/30 rounded-xl text-xs font-bold transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Coach Audit</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Rest Timer Widget (Floating Bar if active) */}
        {activeTimerSeconds !== null && (
          <div className="bg-zinc-950 border border-lime-400/40 rounded-xl p-3 flex items-center justify-between shadow-xl ring-1 ring-lime-400/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-lime-400/20 text-lime-400 animate-pulse">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Inter-Set Rest Stopwatch</span>
                  {activeTimerSeconds === 0 && (
                    <span className="text-[10px] uppercase font-black px-2 py-0.2 bg-lime-400 text-black rounded-full animate-bounce">
                      Ready for Next Set!
                    </span>
                  )}
                </div>
                <div className="text-xl font-mono font-black text-lime-400">
                  {Math.floor(activeTimerSeconds / 60)}:{(activeTimerSeconds % 60).toString().padStart(2, '0')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-3 py-1 text-xs font-bold rounded-lg ${isTimerRunning ? 'bg-zinc-800 text-zinc-200' : 'bg-lime-400 text-black'}`}
              >
                {isTimerRunning ? 'Pause' : 'Resume'}
              </button>
              <button
                onClick={() => {
                  setActiveTimerSeconds(timerInitial);
                  setIsTimerRunning(true);
                }}
                className="p-1.5 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setActiveTimerSeconds(null);
                  setIsTimerRunning(false);
                }}
                className="text-xs text-zinc-500 hover:text-zinc-300 px-2"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Weekly Day Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {activePlan.schedule.map((day, idx) => (
            <button
              key={day.dayNumber}
              onClick={() => setSelectedDayIndex(idx)}
              className={`px-4 py-3 rounded-xl border text-left transition shrink-0 min-w-[150px] ${
                selectedDayIndex === idx
                  ? 'bg-zinc-800/90 border-lime-400 text-white shadow-lg ring-1 ring-lime-400/40'
                  : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider mb-1">
                <span>Day {day.dayNumber}</span>
                {day.isRestDay ? (
                  <span className="text-zinc-500">Rest</span>
                ) : (
                  <span className="text-lime-400 font-mono">{day.targetVolumeSets} sets</span>
                )}
              </div>
              <div className="text-xs font-extrabold text-white truncate">{day.dayName.split(':')[1] || day.dayName}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Day Routine View */}
      {currentDay.isRestDay ? (
        <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-8 text-center space-y-4 backdrop-blur-md shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-lime-400 mx-auto flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">{currentDay.dayName}</h3>
            <p className="text-xs text-zinc-400 mt-2">
              Muscles grow during recovery periods when MPS (Muscle Protein Synthesis) outpaces MPB (Muscle Protein Breakdown).
              Hit your 2.2 g/kg protein target, prioritize 8 hours of sleep, and stay hydrated.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 md:p-6 shadow-2xl space-y-6 backdrop-blur-md">
          
          {/* Day Overview Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-lime-400 uppercase tracking-wider">Workout Execution Matrix</span>
                <span className="text-xs text-zinc-500">•</span>
                <span className="text-xs text-zinc-400">{currentDay.focus}</span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-1">{currentDay.dayName}</h3>
            </div>

            {/* Session Progress HUD */}
            <div className="flex items-center gap-4 bg-zinc-950/80 px-4 py-2 rounded-xl border border-zinc-800">
              <div className="text-right">
                <div className="text-[10px] text-zinc-400 font-bold uppercase">Session Progress</div>
                <div className="text-sm font-mono font-black text-lime-400">
                  {dayStats.completedSets} / {dayStats.totalSets} Sets ({dayStats.completionPct}%)
                </div>
              </div>
              <div className="h-8 w-px bg-zinc-800" />
              <div className="text-right">
                <div className="text-[10px] text-zinc-400 font-bold uppercase">Tonnage Volume</div>
                <div className="text-sm font-mono font-black text-cyan-300">
                  {dayStats.volumeTonnageKg.toLocaleString()} kg
                </div>
              </div>
            </div>
          </div>

          {/* Exercise List */}
          <div className="space-y-4">
            {currentDay.exercises.map((exercise, exIdx) => {
              const allSetsDone = exercise.completedSets?.every(Boolean);

              return (
                <div
                  key={exercise.id}
                  className={`rounded-xl border transition p-4 sm:p-5 space-y-3.5 ${
                    allSetsDone
                      ? 'bg-zinc-950/90 border-lime-400/40 ring-1 ring-lime-400/20'
                      : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {/* Exercise Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-zinc-800 text-lime-400 text-xs font-mono font-black flex items-center justify-center shrink-0">
                        {exIdx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-sm sm:text-base text-white">{exercise.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {exercise.targetMuscle}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-lime-400 border border-zinc-700 capitalize">
                            {exercise.equipment}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Swap Alternative Exercise Button */}
                    <button
                      onClick={() => setSwapModalExercise({ dayIndex: selectedDayIndex, exerciseIndex: exIdx, item: exercise })}
                      className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-lime-400 font-medium transition self-start sm:self-auto"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Swap Alternative</span>
                    </button>
                  </div>

                  {/* Exercise Prescriptions Matrix Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                    
                    <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Volume & Target</span>
                      <span className="font-mono font-bold text-white mt-0.5 block">
                        {exercise.sets} sets × {exercise.repRange}
                      </span>
                    </div>

                    <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Intensity / RIR</span>
                      <span className="font-mono font-bold text-lime-400 mt-0.5 block">
                        {exercise.targetRir} RIR (RPE {10 - exercise.targetRir})
                      </span>
                    </div>

                    <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Suggested Load</span>
                      <span className="font-mono font-bold text-cyan-300 mt-0.5 block">
                        {exercise.calculatedWeightKg
                          ? `${formatWeight(exercise.calculatedWeightKg, unit)} (~${exercise.percentageOf1RM || 75}% 1RM)`
                          : 'Target RPE Scale'}
                      </span>
                    </div>

                    <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Tempo / Cadence</span>
                      <span className="font-mono font-bold text-zinc-200 mt-0.5 block">
                        {exercise.tempo}
                      </span>
                    </div>

                    <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase block">Rest Time</span>
                        <span className="font-mono font-bold text-amber-400 mt-0.5 block">
                          {exercise.restSeconds}s
                        </span>
                      </div>
                      <button
                        onClick={() => handleStartRestTimer(exercise.restSeconds)}
                        title="Start Rest Stopwatch"
                        className="p-1.5 bg-zinc-800 hover:bg-lime-400 hover:text-black text-lime-400 rounded-lg transition"
                      >
                        <Timer className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                  {/* Form Cue */}
                  <div className="bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800/60 flex items-start gap-2 text-xs text-zinc-300">
                    <Info className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Form Cue:</strong> {exercise.formCue}</span>
                  </div>

                  {/* Interactive Set Checkboxes & Weight/Rep Logging */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Interactive Set Tracker (Click set to log completion & launch timer):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {Array.from({ length: exercise.sets }).map((_, setIdx) => {
                        const isDone = exercise.completedSets?.[setIdx] || false;
                        const loggedWeight = exercise.loggedWeightsKg?.[setIdx] ?? (exercise.calculatedWeightKg || 0);
                        const loggedReps = exercise.loggedReps?.[setIdx] ?? (parseInt(exercise.repRange.split('-')[0]) || 8);

                        return (
                          <div
                            key={setIdx}
                            onClick={() => handleToggleSetComplete(selectedDayIndex, exIdx, setIdx)}
                            className={`p-2 rounded-lg border cursor-pointer transition select-none flex flex-col justify-between ${
                              isDone
                                ? 'bg-lime-400/10 border-lime-400/50 text-white shadow-sm ring-1 ring-lime-400/30'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-bold">Set {setIdx + 1}</span>
                              <CheckCircle2 className={`w-3.5 h-3.5 ${isDone ? 'text-lime-400' : 'text-zinc-700'}`} />
                            </div>
                            <div className="mt-1 flex items-center justify-between text-xs font-mono">
                              <span className={isDone ? 'text-lime-300 font-bold' : 'text-zinc-300'}>
                                {loggedWeight > 0 ? `${loggedWeight}kg` : '-'}
                              </span>
                              <span className="text-[10px] text-zinc-400">× {loggedReps}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Exercise Swap Alternative Modal */}
      {swapModalExercise && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <div>
                <h3 className="font-bold text-white text-base">Swap Exercise Alternative</h3>
                <p className="text-xs text-zinc-400">Target Muscle: {swapModalExercise.item.targetMuscle}</p>
              </div>
              <button
                onClick={() => setSwapModalExercise(null)}
                className="text-zinc-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {EXERCISE_DATABASE.filter(
                (e) =>
                  e.targetMuscle.toLowerCase().includes(swapModalExercise.item.targetMuscle.split(' ')[0].toLowerCase()) ||
                  swapModalExercise.item.targetMuscle.toLowerCase().includes(e.targetMuscle.split(' ')[0].toLowerCase())
              ).map((alt) => (
                <button
                  key={alt.id}
                  onClick={() => handleSwapExercise(alt)}
                  className="w-full p-3 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-800 hover:border-lime-400 text-left transition flex justify-between items-center group"
                >
                  <div>
                    <div className="font-bold text-sm text-white group-hover:text-lime-400 transition-colors">{alt.name}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{alt.targetMuscle} • {alt.equipment}</div>
                  </div>
                  <span className="text-xs font-bold text-lime-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Select →
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setSwapModalExercise(null)}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Scientific Hypertrophy & Periodization Notes Footer */}
      <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 shadow-2xl space-y-3 backdrop-blur-md">
        <div className="flex items-center gap-2 text-lime-400">
          <Layers className="w-4 h-4" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
            Periodization Guidelines & Progression Protocol
          </h4>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          <strong className="text-white">{activePlan.progressionStrategy}</strong>
        </p>
        <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-800 flex flex-wrap justify-between gap-2">
          <span>Target Volume: <strong>{activePlan.totalWeeklySets} total working sets / week</strong> (Grounded in Schoenfeld et al. dose-response meta-analyses)</span>
          <span>Deload: Execute a 50% volume deload every 4–6 weeks or when systemic fatigue indicators rise.</span>
        </div>
      </div>

    </div>
  );
};
