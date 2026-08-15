import React, { useState } from 'react';
import { CalculationResults, ProgressLogEntry, UserProfile } from '../types';
import { Sparkles, Send, Bot, Loader2, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface AiCoachInsightsProps {
  metrics: CalculationResults;
  profile: UserProfile;
  logs: ProgressLogEntry[];
}

export const AiCoachInsights: React.FC<AiCoachInsightsProps> = ({
  metrics,
  profile,
  logs,
}) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState<string>('');

  const runAnalysis = async (question?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gemini/analyze-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userData: profile,
          progressLogs: logs,
          calculationResults: metrics,
          question: question || customQuestion,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success' && data.analysis) {
        setAnalysis(data.analysis);
      } else {
        throw new Error(data.error || 'Failed to retrieve analysis');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to AI Sports Science Coach');
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'Analyze my current muscle growth velocity and P-ratio efficiency',
    'Am I bulking too fast or accumulating unwanted visceral fat?',
    'How should I structure a 4-week mini-cut or deload week?',
    'Optimize my macronutrient timing around my afternoon lifting session',
  ];

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 md:p-6 shadow-2xl space-y-4 backdrop-blur-md">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-lime-400/10 text-lime-400 border border-lime-400/30 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight">AI Sports Scientist & Hypertrophy Coach</h2>
              <p className="text-xs text-zinc-400">
                Powered by Gemini 2.5 Flash — analyzing your physiological parameters, progress logs, and macro partition
              </p>
            </div>
          </div>

          <button
            onClick={() => runAnalysis()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-lime-400 hover:bg-lime-300 text-black font-extrabold rounded-xl text-xs transition shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Progress...
              </>
            ) : (
              <>
                <Bot className="w-4 h-4" />
                Generate Deep Hypertrophy Audit
              </>
            )}
          </button>
        </div>

        {/* Quick Consultation Chips */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
            Quick Inquiry Topics:
          </span>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCustomQuestion(q);
                  runAnalysis(q);
                }}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-zinc-950/60 hover:bg-zinc-800 text-zinc-300 hover:text-lime-400 border border-zinc-800 text-xs text-left transition disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input Bar */}
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customQuestion.trim()) {
                runAnalysis(customQuestion);
              }
            }}
            placeholder="Ask your coach anything about hypertrophy, macro distribution, or progress..."
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
          />
          <button
            onClick={() => runAnalysis(customQuestion)}
            disabled={loading || !customQuestion.trim()}
            className="px-4 py-2 bg-lime-400 hover:bg-lime-300 disabled:opacity-40 text-black font-extrabold rounded-xl text-xs transition flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask Coach</span>
          </button>
        </div>

      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center gap-3 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Analysis Output Container */}
      {analysis && (
        <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-6 md:p-8 shadow-2xl space-y-4 backdrop-blur-md">
          <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800 text-lime-400">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="text-base font-extrabold text-white">Coach's Evidence-Based Assessment</h3>
          </div>

          <div className="prose prose-invert prose-sm max-w-none space-y-3 text-zinc-300 leading-relaxed font-sans">
            {analysis.split('\n').map((paragraph, index) => {
              if (paragraph.startsWith('###') || paragraph.startsWith('##')) {
                return (
                  <h4 key={index} className="text-lime-400 font-black text-sm mt-4 mb-2 uppercase tracking-wide">
                    {paragraph.replace(/^#+\s*/, '')}
                  </h4>
                );
              }
              if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return (
                  <div key={index} className="text-white font-extrabold text-sm mt-2">
                    {paragraph.replace(/\*\*/g, '')}
                  </div>
                );
              }
              if (paragraph.startsWith('* ') || paragraph.startsWith('- ')) {
                return (
                  <div key={index} className="flex items-start gap-2 ml-2 my-1 text-xs">
                    <span className="text-lime-400 mt-1">•</span>
                    <span>{paragraph.replace(/^[-*]\s*/, '')}</span>
                  </div>
                );
              }
              if (!paragraph.trim()) {
                return <div key={index} className="h-1" />;
              }
              return (
                <p key={index} className="text-xs text-zinc-300 leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
      )}

      {!analysis && !loading && (
        <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800/80 p-8 text-center space-y-3">
          <Bot className="w-10 h-10 text-zinc-600 mx-auto" />
          <h4 className="text-sm font-bold text-zinc-300">Ready for Evidence-Based Coaching Analysis</h4>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Click "Generate Deep Hypertrophy Audit" to evaluate your growth trajectory against Lyle McDonald and Alan Aragon benchmarks, analyze caloric efficiency, and optimize weekly volume landmarks.
          </p>
        </div>
      )}

    </div>
  );
};
