import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { useToast } from '../context/ToastContext';
import { formatReadableDate } from '../utils/helpers';
import { Brain, Activity, Calendar } from 'lucide-react';

const EMOTIONS = [
  { name: 'Focused', emoji: '🎯' },
  { name: 'Confident', emoji: '🦁' },
  { name: 'Anxious', emoji: '😰' },
  { name: 'FOMO', emoji: '🚀' },
  { name: 'Revenge', emoji: '😡' },
  { name: 'Calm', emoji: '🧘' },
  { name: 'Tired', emoji: '🥱' },
  { name: 'Greedy', emoji: '🤑' },
  { name: 'Patient', emoji: '🐢' },
  { name: 'Neutral', emoji: '😐' },
];

const Mindset: React.FC = () => {
  const { mindsetLogs, addMindsetLog } = useData();
  const { showToast } = useToast();

  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [mentalNote, setMentalNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSaveMindset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmotion) {
      showToast('Please select your pre-session emotional state first.', 'error');
      return;
    }

    if (!mentalNote.trim()) {
      showToast('Please jot down a brief mental note.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await addMindsetLog({
        emotion: selectedEmotion,
        notes: mentalNote.trim(),
        date: todayStr,
        timestamp: new Date()
      });

      showToast('Pre-session mindset recorded.', 'success');
      
      // Reset form
      setSelectedEmotion('');
      setMentalNote('');
    } catch (err: any) {
      showToast('Failed to record mindset check-in.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-transition flex flex-col gap-8 select-none">
      
      {/* Heading */}
      <header className="flex flex-col gap-1.5">
        <h1 className="font-syne text-[20px] font-bold text-textPrimary uppercase tracking-[0.15em] m-0">
          MINDSET CHECK-IN
        </h1>
        <p className="font-dmsans text-[13px] text-textSecondary font-light">
          Calibrate your psychological state before exposure. Emotional control is the ultimate multiplier.
        </p>
      </header>

      {/* EMOTION GRID FORM - Curved to rounded-2xl */}
      <section className="bg-bgSurface p-6 rounded-2xl border border-customBorder flex flex-col gap-6">
        
        {/* Title */}
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-accent" />
          <h2 className="font-syne text-[14px] font-bold text-textPrimary uppercase tracking-[0.12em]">
            PRE-SESSION EMOTIONAL CALIBRATION
          </h2>
        </div>

        <form onSubmit={handleSaveMindset} className="flex flex-col gap-6">
          
          {/* 5-Column Grid */}
          <div className="flex flex-col gap-2">
            <span className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em]">
              Select Dominant Psychological State:
            </span>
            {/* Emotion cards are curved to rounded-xl */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {EMOTIONS.map((item) => {
                const isSelected = selectedEmotion === item.name;

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setSelectedEmotion(item.name)}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                      isSelected 
                        ? 'border-accent bg-accentDim text-accent shadow-lg shadow-accent/5' 
                        : 'border-customBorder bg-bgSurface hover:bg-bgElevated text-textSecondary hover:text-textPrimary'
                    }`}
                  >
                    <span className="text-[24px] select-none leading-none">
                      {item.emoji}
                    </span>
                    <span className={`font-syne text-[9px] uppercase tracking-wider font-semibold ${
                      isSelected ? 'text-accent' : 'text-textSecondary'
                    }`}>
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Mental Note - Curved to rounded-xl */}
          <div className="flex flex-col gap-1.5">
            <label className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em]" htmlFor="mindset-note">
              Daily Psychological Alignment / Pre-Market Reflection
            </label>
            <textarea
              id="mindset-note"
              rows={3}
              required
              disabled={submitting}
              placeholder="Are you rested? Are you feeling impulsive? What steps will you take to prevent revenge trading today?..."
              value={mentalNote}
              onChange={(e) => setMentalNote(e.target.value)}
              className="w-full px-4 py-3 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary placeholder:text-textMuted outline-none focus:border-accent focus:ring-4 focus:ring-accentGlow transition-all duration-200 resize-y min-h-[72px]"
            />
          </div>

          {/* Save Button - Curved to rounded-xl */}
          <div className="flex justify-end">
            <button
              type="submit"
              id="save-mindset-btn"
              disabled={submitting}
              className="h-10 px-8 bg-accent hover:brightness-110 active:scale-[0.98] text-bgBase font-syne text-[13px] font-semibold uppercase tracking-[0.1em] rounded-xl transition-all duration-150 flex items-center justify-center font-bold"
            >
              {submitting ? 'Recording alignment...' : 'Commit calibration'}
            </button>
          </div>

        </form>
      </section>

      {/* HISTORICAL MINDSET LOGS */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-customBorder pb-2">
          <Activity className="w-4 h-4 text-accent" />
          <h2 className="font-syne text-[13px] uppercase text-textSecondary tracking-[0.15em]">
            Psychological Check-in Archive ({mindsetLogs.length})
          </h2>
        </div>

        {mindsetLogs.length === 0 ? (
          <div className="bg-bgSurface/40 border border-customBorder p-8 rounded-2xl text-center">
            <span className="font-dmsans text-[13px] text-textSecondary font-light">
              No historical emotional checkpoints stored. Check in daily to track performance psychology correlations.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-customBorder/30">
            <table className="w-full text-left border-collapse select-none">
              <thead>
                <tr className="bg-bgElevated border-b border-customBorder text-textSecondary font-syne text-[10px] uppercase tracking-[0.12em]">
                  <th className="py-3 px-4 font-semibold w-[160px]">Session Date</th>
                  <th className="py-3 px-4 font-semibold w-[150px]">State Recorded</th>
                  <th className="py-3 px-4 font-semibold">Psychological Reflection Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-customBorder/30">
                {mindsetLogs.map((log, idx) => {
                  const emoInfo = EMOTIONS.find(e => e.name === log.emotion);
                  const isRedState = ['Revenge', 'Greedy', 'FOMO', 'Anxious'].includes(log.emotion);
                  const isGreenState = ['Focused', 'Patient', 'Calm', 'Confident'].includes(log.emotion);

                  return (
                    <tr 
                      key={log.id || idx}
                      className={`transition-colors duration-150 ${idx % 2 === 0 ? 'bg-bgSurface' : 'bg-transparent'} hover:bg-bgElevated`}
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-[12px] text-textSecondary whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-textMuted" />
                          {formatReadableDate(log.timestamp)}
                        </div>
                      </td>

                      {/* Emotion Badge - Curved to rounded-lg */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-medium tracking-wide uppercase px-2.5 py-0.5 rounded-lg border ${
                          isGreenState
                            ? 'bg-greenPnl/5 text-greenPnl border-greenPnl/20'
                            : isRedState
                              ? 'bg-redPnl/5 text-redPnl border-redPnl/20'
                              : 'bg-accentDim text-accent border-accent/20'
                        }`}>
                          <span className="text-[12px] leading-none shrink-0">
                            {emoInfo?.emoji || '🧠'}
                          </span>
                          {log.emotion}
                        </span>
                      </td>

                      {/* Reflection Notes */}
                      <td className="py-3.5 px-4 font-dmsans text-[13px] text-textPrimary leading-relaxed font-light whitespace-pre-wrap">
                        {log.notes}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
};

export default Mindset;
