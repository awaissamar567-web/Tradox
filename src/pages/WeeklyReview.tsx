import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { useToast } from '../context/ToastContext';
import { 
  formatCurrency, 
  formatDateOnly, 
  formatReadableDate 
} from '../utils/helpers';
import { Save, Calendar, CheckSquare, TrendingUp } from 'lucide-react';

const WeeklyReview: React.FC = () => {
  const { trades, weeklyReviews, addWeeklyReview } = useData();
  const { showToast } = useToast();

  // Free-text fields
  const [whatWorked, setWhatWorked] = useState('');
  const [whatToImprove, setWhatToImprove] = useState('');
  const [goalNextWeek, setGoalNextWeek] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Compute the current week range (Monday to Sunday)
  const currentWeekDays = useMemo(() => {
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday, 1 is Monday...
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(today.setDate(diff));
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const current = new Date(monday);
      current.setDate(monday.getDate() + i);
      days.push(current);
    }
    return days;
  }, []);

  const weekStartDateStr = formatDateOnly(currentWeekDays[0]);
  const weekEndDateStr = formatDateOnly(currentWeekDays[6]);

  // Aggregate P&L for each day of the current week from actual logged trades
  const pnlData = useMemo(() => {
    const aggregates: { [dateStr: string]: number } = {};
    
    // Initialize days with 0
    currentWeekDays.forEach((day) => {
      aggregates[formatDateOnly(day)] = 0;
    });

    // Sum P&L
    trades.forEach((trade) => {
      const tradeDateStr = formatDateOnly(trade.timestamp);
      if (aggregates[tradeDateStr] !== undefined) {
        aggregates[tradeDateStr] += Number(trade.pnl || 0);
      }
    });

    return aggregates;
  }, [trades, currentWeekDays]);

  const totalWeekPnl = useMemo(() => {
    return Object.values(pnlData).reduce((a, b) => a + b, 0);
  }, [pnlData]);

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!whatWorked.trim() || !whatToImprove.trim() || !goalNextWeek.trim()) {
      showToast('Please complete all reflection textareas.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await addWeeklyReview({
        weekStartDate: weekStartDateStr,
        weekEndDate: weekEndDateStr,
        pnlData,
        whatWorked: whatWorked.trim(),
        whatToImprove: whatToImprove.trim(),
        goalNextWeek: goalNextWeek.trim(),
        timestamp: new Date()
      });

      showToast('Weekly review saved successfully.', 'success');
      
      // Reset inputs
      setWhatWorked('');
      setWhatToImprove('');
      setGoalNextWeek('');
    } catch (err: any) {
      showToast('Failed to save weekly review.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-transition flex flex-col gap-8 select-none">
      
      {/* Heading */}
      <header className="flex flex-col gap-1.5">
        <h1 className="font-syne text-[20px] font-bold text-textPrimary uppercase tracking-[0.15em] m-0">
          WEEKLY AUDIT & REFLECTION
        </h1>
        <p className="font-dmsans text-[13px] text-textSecondary font-light">
          Review daily aggregates, record lessons, and align goals for the upcoming sessions.
        </p>
      </header>

      {/* 7-DAY P&L GRID */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-customBorder pb-2 gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent" />
            <h2 className="font-syne text-[11px] uppercase text-textSecondary tracking-[0.12em]">
              CURRENT WEEK RUN: {formatReadableDate(currentWeekDays[0])} — {formatReadableDate(currentWeekDays[6])}
            </h2>
          </div>
          <span className={`font-mono text-[13px] font-medium ${
            totalWeekPnl > 0 ? 'text-greenPnl' : totalWeekPnl < 0 ? 'text-redPnl' : 'text-textPrimary'
          }`}>
            Weekly Net: {totalWeekPnl > 0 ? '+' : ''}{formatCurrency(totalWeekPnl)}
          </span>
        </div>

        {/* Mobile View: Swipeable horizontal ribbon */}
        <div className="flex md:hidden overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none snap-x gap-3">
          {currentWeekDays.map((date) => {
            const dateStr = formatDateOnly(date);
            const dailyPnl = pnlData[dateStr] || 0;
            const isToday = dateStr === formatDateOnly(new Date());

            const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
            const dateLabel = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

            return (
              <div 
                key={dateStr}
                className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all duration-200 w-[110px] shrink-0 snap-center ${
                  isToday 
                    ? 'bg-accentDim/30 border-accent' 
                    : 'bg-bgSurface border-customBorder hover:bg-bgElevated'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`font-syne text-[10px] font-bold tracking-wider ${isToday ? 'text-accent' : 'text-textSecondary'}`}>
                    {dayLabel}
                  </span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 bg-accent rounded-full animate-ping" title="Today" />
                  )}
                </div>
                <span className="font-dmsans text-[11px] text-textMuted font-light leading-none">
                  {dateLabel}
                </span>
                <span className={`font-mono text-[13px] font-semibold leading-none mt-2 ${
                  dailyPnl > 0 ? 'text-greenPnl' : dailyPnl < 0 ? 'text-redPnl' : 'text-textPrimary'
                }`}>
                  {dailyPnl !== 0 ? (dailyPnl > 0 ? '+' : '') + Math.round(dailyPnl) : '—'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Grid */}
        <div className="hidden md:grid md:grid-cols-7 gap-3">
          {currentWeekDays.map((date) => {
            const dateStr = formatDateOnly(date);
            const dailyPnl = pnlData[dateStr] || 0;
            const isToday = dateStr === formatDateOnly(new Date());

            const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
            const dateLabel = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

            return (
              <div 
                key={dateStr}
                className={`p-3.5 rounded-xl border flex flex-col gap-2 transition-all duration-200 ${
                  isToday 
                    ? 'bg-accentDim/30 border-accent' 
                    : 'bg-bgSurface border-customBorder hover:bg-bgElevated'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`font-syne text-[10px] font-bold tracking-wider ${isToday ? 'text-accent' : 'text-textSecondary'}`}>
                    {dayLabel}
                  </span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 bg-accent rounded-full animate-ping" title="Today" />
                  )}
                </div>
                <span className="font-dmsans text-[11px] text-textMuted font-light leading-none">
                  {dateLabel}
                </span>
                <span className={`font-mono text-[13px] font-semibold leading-none mt-2 ${
                  dailyPnl > 0 ? 'text-greenPnl' : dailyPnl < 0 ? 'text-redPnl' : 'text-textPrimary'
                }`}>
                  {dailyPnl !== 0 ? (dailyPnl > 0 ? '+' : '') + Math.round(dailyPnl) : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* REFLECTION ENTRY FORM - Curved to rounded-2xl */}
      <section className="bg-bgSurface p-6 rounded-2xl border border-customBorder flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent" />
          <h2 className="font-syne text-[14px] font-bold text-textPrimary uppercase tracking-[0.12em]">
            RECORD WEEKLY REFLECTION
          </h2>
        </div>

        <form onSubmit={handleSaveReview} className="flex flex-col gap-5">
          
          {/* What Worked - Curved to rounded-xl */}
          <div className="flex flex-col gap-1.5">
            <label className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em]" htmlFor="worked">
              1. What Worked? (Success triggers, patience examples, rule adherence)
            </label>
            <textarea
              id="worked"
              rows={3}
              required
              disabled={submitting}
              placeholder="Record setups that yielded high quality results or examples of excellent discipline..."
              value={whatWorked}
              onChange={(e) => setWhatWorked(e.target.value)}
              className="w-full px-4 py-3 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary placeholder:text-textMuted outline-none focus:border-accent focus:ring-4 focus:ring-accentGlow transition-all duration-200 resize-y min-h-[72px]"
            />
          </div>

          {/* What to Improve - Curved to rounded-xl */}
          <div className="flex flex-col gap-1.5">
            <label className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em]" htmlFor="improve">
              2. Areas of Improvement (FOMO entries, wide stops, premature exits)
            </label>
            <textarea
              id="improve"
              rows={3}
              required
              disabled={submitting}
              placeholder="Review errors: did you chase price, oversized accounts, or bypass execution rules?..."
              value={whatToImprove}
              onChange={(e) => setWhatToImprove(e.target.value)}
              className="w-full px-4 py-3 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary placeholder:text-textMuted outline-none focus:border-accent focus:ring-4 focus:ring-accentGlow transition-all duration-200 resize-y min-h-[72px]"
            />
          </div>

          {/* Goal for Next Week - Curved to rounded-xl */}
          <div className="flex flex-col gap-1.5">
            <label className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em]" htmlFor="goal">
              3. Strategic Objectives for Next Week
            </label>
            <textarea
              id="goal"
              rows={3}
              required
              disabled={submitting}
              placeholder="Specify clear mechanical milestones (e.g. max 2 trades/day, 100% stop adherence)..."
              value={goalNextWeek}
              onChange={(e) => setGoalNextWeek(e.target.value)}
              className="w-full px-4 py-3 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary placeholder:text-textMuted outline-none focus:border-accent focus:ring-4 focus:ring-accentGlow transition-all duration-200 resize-y min-h-[72px]"
            />
          </div>

          {/* Submit Action - Curved to rounded-xl */}
          <div className="flex justify-end">
            <button
              type="submit"
              id="save-review-btn"
              disabled={submitting}
              className="h-10 px-8 bg-accent hover:brightness-110 active:scale-[0.98] text-bgBase font-syne text-[13px] font-semibold uppercase tracking-[0.1em] rounded-xl transition-all duration-150 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Archiving Reflection...' : 'Archive Weekly reflection'}
            </button>
          </div>

        </form>
      </section>

      {/* ARCHIVED WEEKLY REVIEWS */}
      <section className="flex flex-col gap-4">
        <h2 className="font-syne text-[13px] uppercase text-textSecondary tracking-[0.15em] border-b border-customBorder pb-2">
          Weekly Audit Log ({weeklyReviews.length})
        </h2>

        {weeklyReviews.length === 0 ? (
          <div className="bg-bgSurface/40 border border-customBorder p-8 rounded-2xl text-center">
            <span className="font-dmsans text-[13px] text-textSecondary font-light">
              No historical weekly audits stored. Reflect regularly to enforce performance consistency.
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {weeklyReviews.map((rev) => {
              // Calculate sum of review's daily P&L
              const reviewPnl = Object.values(rev.pnlData || {}).reduce((a: number, b: number) => a + b, 0);

              return (
                <div 
                  key={rev.id}
                  className="bg-bgSurface p-5 rounded-2xl border border-customBorder flex flex-col gap-4 hover:border-accent/20 transition-all duration-200"
                >
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-customBorder/50 pb-2.5 gap-2">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-accent shrink-0" />
                      <span className="font-syne text-[12px] font-bold text-textPrimary uppercase tracking-wider">
                        WEEK: {formatReadableDate(rev.weekStartDate)} — {formatReadableDate(rev.weekEndDate)}
                      </span>
                    </div>
                    <span className={`font-mono text-[13px] font-semibold ${
                      reviewPnl > 0 ? 'text-greenPnl' : reviewPnl < 0 ? 'text-redPnl' : 'text-textPrimary'
                    }`}>
                      {reviewPnl > 0 ? '+' : ''}{formatCurrency(reviewPnl)}
                    </span>
                  </div>

                  {/* Body Text Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    
                    <div className="flex flex-col gap-1">
                      <span className="font-syne text-[9px] uppercase text-accent tracking-wider font-semibold">What Worked</span>
                      <p className="font-dmsans text-[12px] text-textPrimary leading-relaxed font-light whitespace-pre-wrap">
                        {rev.whatWorked}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="font-syne text-[9px] uppercase text-redPnl tracking-wider font-semibold">What to Improve</span>
                      <p className="font-dmsans text-[12px] text-textPrimary leading-relaxed font-light whitespace-pre-wrap">
                        {rev.whatToImprove}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="font-syne text-[9px] uppercase text-textSecondary tracking-wider font-semibold">Objectives Set</span>
                      <p className="font-dmsans text-[12px] text-textPrimary leading-relaxed font-light whitespace-pre-wrap">
                        {rev.goalNextWeek}
                      </p>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
};

export default WeeklyReview;
