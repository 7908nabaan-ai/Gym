import React, { useState, useRef } from 'react';
import { ProgressLogEntry, UserProfile, UnitSystem } from '../types';
import { parseCSV, parseJSON, exportToCSV } from '../utils/dataImporter';
import { BENCHMARK_DATASETS } from '../data/benchmarkDatasets';
import { formatWeight, UNIT_CONVERSIONS } from '../utils/calculations';
import {
  Upload,
  FileText,
  Plus,
  Trash2,
  Download,
  Database,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Search,
  Dumbbell,
} from 'lucide-react';

interface DataIntegrationSuiteProps {
  logs: ProgressLogEntry[];
  onUpdateLogs: (newLogs: ProgressLogEntry[]) => void;
  profile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile) => void;
  unit: UnitSystem;
}

export const DataIntegrationSuite: React.FC<DataIntegrationSuiteProps> = ({
  logs,
  onUpdateLogs,
  profile,
  onUpdateProfile,
  unit,
}) => {
  const [pasteContent, setPasteContent] = useState<string>('');
  const [importStatus, setImportStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New entry form state
  const [newEntry, setNewEntry] = useState<Partial<ProgressLogEntry>>({
    date: new Date().toISOString().split('T')[0],
    weightKg: profile.currentWeightKg,
    bodyFatPercentage: profile.bodyFatPercentage,
    caloriesConsumed: 2800,
    proteinGrams: 180,
    armCm: profile.armCircumferenceCm,
    chestCm: profile.chestCircumferenceCm,
    waistCm: profile.waistCircumferenceCm,
    thighCm: profile.thighCircumferenceCm,
  });

  // Handle Drag & Drop / File Upload
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      let result;
      if (file.name.endsWith('.json') || text.trim().startsWith('{') || text.trim().startsWith('[')) {
        result = parseJSON(text);
      } else {
        result = parseCSV(text);
      }

      if (result.success && result.entries.length > 0) {
        onUpdateLogs(result.entries);
        setImportStatus({
          message: `Successfully integrated ${result.entries.length} data rows from ${file.name}!`,
          isError: false,
        });

        // If latest log has weight/bf, offer to update current profile
        const latest = result.entries[result.entries.length - 1];
        if (latest.weightKg) {
          onUpdateProfile({
            ...profile,
            currentWeightKg: latest.weightKg,
            bodyFatPercentage: latest.bodyFatPercentage ?? profile.bodyFatPercentage,
            armCircumferenceCm: latest.armCm ?? profile.armCircumferenceCm,
            chestCircumferenceCm: latest.chestCm ?? profile.chestCircumferenceCm,
            waistCircumferenceCm: latest.waistCm ?? profile.waistCircumferenceCm,
          });
        }
      } else {
        setImportStatus({
          message: `Import Failed: ${result.errors.join(', ')}`,
          isError: true,
        });
      }
    };
    reader.readAsText(file);
  };

  // Handle Raw Text Paste
  const handleProcessPaste = () => {
    if (!pasteContent.trim()) return;

    let result;
    if (pasteContent.trim().startsWith('{') || pasteContent.trim().startsWith('[')) {
      result = parseJSON(pasteContent);
    } else {
      result = parseCSV(pasteContent);
    }

    if (result.success && result.entries.length > 0) {
      onUpdateLogs(result.entries);
      setImportStatus({
        message: `Successfully integrated ${result.entries.length} log entries from pasted text!`,
        isError: false,
      });
      setPasteContent('');

      const latest = result.entries[result.entries.length - 1];
      if (latest.weightKg) {
        onUpdateProfile({
          ...profile,
          currentWeightKg: latest.weightKg,
          bodyFatPercentage: latest.bodyFatPercentage ?? profile.bodyFatPercentage,
        });
      }
    } else {
      setImportStatus({
        message: `Processing Failed: ${result.errors.join(', ')}`,
        isError: true,
      });
    }
  };

  // Load Benchmark Case Study
  const handleLoadDataset = (datasetId: string) => {
    const target = BENCHMARK_DATASETS.find((d) => d.id === datasetId);
    if (!target) return;

    onUpdateLogs(target.logs);
    if (target.lifterProfile) {
      onUpdateProfile({
        ...profile,
        ...target.lifterProfile,
      } as UserProfile);
    }
    setImportStatus({
      message: `Loaded dataset: "${target.title}" with ${target.logs.length} data points.`,
      isError: false,
    });
  };

  // Add single entry manually
  const handleAddEntry = () => {
    if (!newEntry.weightKg || !newEntry.date) return;

    const entry: ProgressLogEntry = {
      id: `manual_${Date.now()}`,
      date: newEntry.date,
      weightKg: Number(newEntry.weightKg),
      bodyFatPercentage: newEntry.bodyFatPercentage ? Number(newEntry.bodyFatPercentage) : undefined,
      leanBodyMassKg: newEntry.bodyFatPercentage
        ? Math.round(Number(newEntry.weightKg) * (1 - Number(newEntry.bodyFatPercentage) / 100) * 10) / 10
        : undefined,
      caloriesConsumed: newEntry.caloriesConsumed ? Number(newEntry.caloriesConsumed) : undefined,
      proteinGrams: newEntry.proteinGrams ? Number(newEntry.proteinGrams) : undefined,
      armCm: newEntry.armCm ? Number(newEntry.armCm) : undefined,
      chestCm: newEntry.chestCm ? Number(newEntry.chestCm) : undefined,
      waistCm: newEntry.waistCm ? Number(newEntry.waistCm) : undefined,
      thighCm: newEntry.thighCm ? Number(newEntry.thighCm) : undefined,
      benchPressKg: newEntry.benchPressKg ? Number(newEntry.benchPressKg) : undefined,
      squatKg: newEntry.squatKg ? Number(newEntry.squatKg) : undefined,
      deadliftKg: newEntry.deadliftKg ? Number(newEntry.deadliftKg) : undefined,
      notes: newEntry.notes,
    };

    const updated = [...logs, entry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    onUpdateLogs(updated);
    setShowAddModal(false);
    setImportStatus({ message: 'New progress log recorded successfully!', isError: false });
  };

  // Delete an entry
  const handleDeleteEntry = (id: string) => {
    const updated = logs.filter((l) => l.id !== id);
    onUpdateLogs(updated);
  };

  // Calculate actual observed growth rate from integrated data
  const calculateHistoricalGrowth = () => {
    if (logs.length < 2) return null;
    const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const firstLbm = first.leanBodyMassKg ?? (first.weightKg * (1 - (first.bodyFatPercentage ?? 15) / 100));
    const lastLbm = last.leanBodyMassKg ?? (last.weightKg * (1 - (last.bodyFatPercentage ?? 15) / 100));

    const totalWeightDelta = Math.round((last.weightKg - first.weightKg) * 10) / 10;
    const totalLbmDelta = Math.round((lastLbm - firstLbm) * 10) / 10;

    const days = Math.max(1, (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24));
    const months = days / 30.4375;
    const monthlyLbmRateKg = months > 0 ? Math.round((totalLbmDelta / months) * 100) / 100 : 0;

    return {
      firstDate: first.date,
      lastDate: last.date,
      days: Math.round(days),
      totalWeightDelta,
      totalLbmDelta,
      monthlyLbmRateKg,
    };
  };

  const hist = calculateHistoricalGrowth();

  const filteredLogs = logs.filter((l) =>
    l.date.includes(searchQuery) ||
    (l.notes && l.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Integration Summary */}
      <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 md:p-6 shadow-2xl space-y-4 backdrop-blur-md">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-lime-400/10 text-lime-400 border border-lime-400/30 font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight">Bodybuilding Data Integration Hub</h2>
              <p className="text-xs text-zinc-400">
                Import, synchronize, and analyze your empirical weigh-ins, body composition, and lifting logs
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-lime-400 hover:bg-lime-300 text-black font-extrabold rounded-xl text-xs transition shadow-lg"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              Add Entry
            </button>

            <button
              onClick={() => {
                const csv = exportToCSV(logs);
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `bodybuilding_progress_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-bold transition"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Import Status feedback */}
        {importStatus && (
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-bold ${
              importStatus.isError
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-lime-400/10 border-lime-400/30 text-lime-300'
            }`}
          >
            {importStatus.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-lime-400" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}

        {/* Historical Progression Analysis Banner if logs exist */}
        {hist && (
          <div className="bg-zinc-950/60 rounded-xl p-4 border border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Observed Duration</span>
              <div className="text-sm font-extrabold text-zinc-200 mt-1 font-mono">
                {hist.days} days ({hist.firstDate} → {hist.lastDate})
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Weight Change</span>
              <div className="text-sm font-black text-white mt-1 font-mono">
                {hist.totalWeightDelta >= 0 ? `+${formatWeight(hist.totalWeightDelta, unit)}` : formatWeight(hist.totalWeightDelta, unit)}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Pure Lean Mass Gained</span>
              <div className="text-sm font-black text-lime-400 mt-1 font-mono">
                {hist.totalLbmDelta >= 0 ? `+${formatWeight(hist.totalLbmDelta, unit)}` : formatWeight(hist.totalLbmDelta, unit)}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Observed Growth Velocity</span>
              <div className="text-sm font-black text-cyan-300 mt-1 font-mono">
                +{formatWeight(hist.monthlyLbmRateKg, unit)} / month
              </div>
            </div>
          </div>
        )}

        {/* 2-Column Import Actions: File Upload & Direct Paste */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          
          {/* Drag & Drop Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-700 hover:border-lime-400/70 bg-zinc-950/40 hover:bg-zinc-950/70 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              accept=".csv,.json,.tsv,.txt"
              className="hidden"
            />
            <div className="p-3 rounded-2xl bg-zinc-800 group-hover:bg-lime-400/20 text-zinc-400 group-hover:text-lime-400 transition">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-zinc-200">
              Drag & Drop your CSV or JSON Dataset
            </div>
            <p className="text-[11px] text-zinc-400">
              Supports CSV headers: <code className="text-lime-400 font-mono">date, weight, bodyfat, calories, protein, arm, chest, bench, squat</code>
            </p>
          </div>

          {/* Direct Paste Box */}
          <div className="bg-zinc-950/40 rounded-2xl p-4 border border-zinc-800 flex flex-col justify-between gap-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-zinc-300">Or Paste Raw CSV / JSON Data:</span>
                <span className="text-[10px] text-zinc-500 font-medium">Auto-detected formatting</span>
              </div>
              <textarea
                rows={3}
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder="Paste CSV rows (e.g. 2025-01-01, 80.5, 14, 2800) or JSON array..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-lime-400"
              />
            </div>
            <button
              onClick={handleProcessPaste}
              disabled={!pasteContent.trim()}
              className="w-full py-2 bg-zinc-800 hover:bg-lime-400 hover:text-black font-bold text-white text-xs rounded-xl transition border border-zinc-700 hover:border-lime-400"
            >
              Parse & Integrate Pasted Data
            </button>
          </div>

        </div>

      </div>

      {/* Integrated Progress Logs Grid */}
      <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 md:p-6 shadow-2xl space-y-4 backdrop-blur-md">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-lime-400" />
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Integrated Records ({logs.length} Data Points)
            </h3>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search date or notes..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-lime-400"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-200 font-bold border-b border-zinc-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Weight</th>
                <th className="py-3 px-3">Body Fat</th>
                <th className="py-3 px-3">Lean Mass</th>
                <th className="py-3 px-3">Energy (kcal)</th>
                <th className="py-3 px-3">Protein (g)</th>
                <th className="py-3 px-3">Arm / Chest</th>
                <th className="py-3 px-3">Key Lifts</th>
                <th className="py-3 px-3">Notes</th>
                <th className="py-3 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 bg-zinc-900/50 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-zinc-500 font-sans">
                    No progress logs found. Upload your data above or load a benchmark case study!
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const lbm = log.leanBodyMassKg ?? (log.bodyFatPercentage ? log.weightKg * (1 - log.bodyFatPercentage / 100) : undefined);
                  return (
                    <tr key={log.id} className="hover:bg-zinc-800/40 transition">
                      <td className="py-2.5 px-3 font-sans font-bold text-zinc-200 whitespace-nowrap">{log.date}</td>
                      <td className="py-2.5 px-3 text-white font-extrabold">{formatWeight(log.weightKg, unit)}</td>
                      <td className="py-2.5 px-3 text-lime-400 font-bold">{log.bodyFatPercentage ? `${log.bodyFatPercentage}%` : '—'}</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">{lbm ? formatWeight(lbm, unit) : '—'}</td>
                      <td className="py-2.5 px-3 text-sky-400 font-bold">{log.caloriesConsumed ? `${log.caloriesConsumed} kcal` : '—'}</td>
                      <td className="py-2.5 px-3 text-lime-300 font-bold">{log.proteinGrams ? `${log.proteinGrams}g` : '—'}</td>
                      <td className="py-2.5 px-3 text-zinc-300 whitespace-nowrap">
                        {log.armCm ? `${log.armCm}cm` : '—'} / {log.chestCm ? `${log.chestCm}cm` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-300 whitespace-nowrap font-sans text-[11px]">
                        {log.benchPressKg ? `B:${log.benchPressKg}k ` : ''}
                        {log.squatKg ? `S:${log.squatKg}k ` : ''}
                        {log.deadliftKg ? `D:${log.deadliftKg}k` : ''}
                        {!log.benchPressKg && !log.squatKg && !log.deadliftKg && '—'}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-zinc-400 text-[11px] max-w-xs truncate">{log.notes || '—'}</td>
                      <td className="py-2.5 px-2 text-right">
                        <button
                          onClick={() => handleDeleteEntry(log.id)}
                          className="p-1 hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 rounded-lg transition"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Manual Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-white">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <h3 className="font-extrabold text-base text-white">Add Progress Log Entry</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-zinc-400 font-bold block mb-1">Date</label>
                <input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2 text-zinc-200 focus:outline-none focus:border-lime-400"
                />
              </div>
              <div>
                <label className="text-zinc-400 font-bold block mb-1">Weight ({unit === 'imperial' ? 'lbs' : 'kg'})</label>
                <input
                  type="number"
                  step={0.1}
                  value={newEntry.weightKg}
                  onChange={(e) => setNewEntry({ ...newEntry, weightKg: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2 text-zinc-200 focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Body Fat (%)</label>
                <input
                  type="number"
                  step={0.1}
                  value={newEntry.bodyFatPercentage || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, bodyFatPercentage: parseFloat(e.target.value) || undefined })}
                  placeholder="e.g. 14.5"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2 text-zinc-200 focus:outline-none focus:border-lime-400"
                />
              </div>
              <div>
                <label className="text-zinc-400 font-bold block mb-1">Calories (kcal)</label>
                <input
                  type="number"
                  value={newEntry.caloriesConsumed || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, caloriesConsumed: parseInt(e.target.value) || undefined })}
                  placeholder="e.g. 2850"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2 text-zinc-200 focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Arm Size (cm)</label>
                <input
                  type="number"
                  step={0.2}
                  value={newEntry.armCm || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, armCm: parseFloat(e.target.value) || undefined })}
                  placeholder="Flexed cm"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2 text-zinc-200 focus:outline-none focus:border-lime-400"
                />
              </div>
              <div>
                <label className="text-zinc-400 font-bold block mb-1">Chest Size (cm)</label>
                <input
                  type="number"
                  step={0.5}
                  value={newEntry.chestCm || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, chestCm: parseFloat(e.target.value) || undefined })}
                  placeholder="cm"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2 text-zinc-200 focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-bold block mb-1">Bench Press 1RM (kg)</label>
                <input
                  type="number"
                  step={2.5}
                  value={newEntry.benchPressKg || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, benchPressKg: parseFloat(e.target.value) || undefined })}
                  placeholder="kg"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2 text-zinc-200 focus:outline-none focus:border-lime-400"
                />
              </div>
              <div>
                <label className="text-zinc-400 font-bold block mb-1">Squat 1RM (kg)</label>
                <input
                  type="number"
                  step={2.5}
                  value={newEntry.squatKg || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, squatKg: parseFloat(e.target.value) || undefined })}
                  placeholder="kg"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2 text-zinc-200 focus:outline-none focus:border-lime-400"
                />
              </div>
            </div>

            <div>
              <label className="text-zinc-400 font-bold text-xs block mb-1">Notes & Milestones</label>
              <input
                type="text"
                value={newEntry.notes || ''}
                onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                placeholder="e.g. End of mesocycle, pump felt great"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-lime-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEntry}
                className="px-4 py-2 bg-lime-400 hover:bg-lime-300 text-black font-extrabold rounded-xl text-xs"
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
