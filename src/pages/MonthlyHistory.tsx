import React, { useState, useMemo } from 'react';
import { useData, type Trade } from '../hooks/useData';
import { 
  formatCurrency, 
  formatReadableDate, 
  formatDateOnly 
} from '../utils/helpers';
import { 
  Calendar, 
  Award, 
  Flame, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Activity, 
  Zap,
  Info,
  CalendarDays,
  Target,
  PieChart
} from 'lucide-react';
import { PlanGate } from '../components/PlanGate';

const MonthlyHistory: React.FC = () => {
  const { trades } = useData();

  // Selected Month and Year states (Default to current month & year)
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return {
      month: now.getMonth(), // 0-indexed
      year: now.getFullYear()
    };
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate a list of years from trades, plus current and previous year
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearsSet = new Set<number>([currentYear, currentYear - 1]);
    
    trades.forEach((trade) => {
      const d = trade.timestamp?.seconds 
        ? new Date(trade.timestamp.seconds * 1000) 
        : new Date(trade.timestamp);
      if (!isNaN(d.getTime())) {
        yearsSet.add(d.getFullYear());
      }
    });

    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [trades]);

  // Navigate months
  const handlePrevMonth = () => {
    setSelectedDate((prev) => {
      if (prev.month === 0) {
        return { month: 11, year: prev.year - 1 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setSelectedDate((prev) => {
      if (prev.month === 11) {
        return { month: 0, year: prev.year + 1 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  };

  // Filter trades for the selected month and year
  const monthlyTrades = useMemo(() => {
    return trades.filter((trade) => {
      const d = trade.timestamp?.seconds 
        ? new Date(trade.timestamp.seconds * 1000) 
        : new Date(trade.timestamp);
      if (isNaN(d.getTime())) return false;
      return d.getMonth() === selectedDate.month && d.getFullYear() === selectedDate.year;
    }).sort((a, b) => {
      // Sort oldest to newest for streak calculations
      const da = a.timestamp?.seconds ? new Date(a.timestamp.seconds * 1000) : new Date(a.timestamp);
      const db = b.timestamp?.seconds ? new Date(b.timestamp.seconds * 1000) : new Date(b.timestamp);
      return da.getTime() - db.getTime();
    });
  }, [trades, selectedDate]);

  // Calculate monthly stats
  const stats = useMemo(() => {
    const total = monthlyTrades.length;
    if (total === 0) {
      return {
        totalTrades: 0,
        wins: 0,
        losses: 0,
        be: 0,
        winRate: 0,
        totalPnl: 0,
        avgWin: 0,
        avgLoss: 0,
        bestTrade: 0,
        worstTrade: 0,
        currentStreak: 0,
        currentStreakType: 'Win' as 'Win' | 'Loss',
        maxWinStreak: 0,
        maxLossStreak: 0
      };
    }

    let wins = 0;
    let losses = 0;
    let be = 0;
    let totalPnl = 0;
    let winSum = 0;
    let lossSum = 0;
    let best = -Infinity;
    let worst = Infinity;

    // Streak trackers
    let currentStreak = 0;
    let currentStreakType: 'Win' | 'Loss' = 'Win';
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let runningWinStreak = 0;
    let runningLossStreak = 0;

    monthlyTrades.forEach((t) => {
      const pnl = Number(t.pnl || 0);
      totalPnl += pnl;

      if (pnl > best) best = pnl;
      if (pnl < worst) worst = pnl;

      if (t.outcome === 'Win') {
        wins++;
        winSum += pnl;

        runningWinStreak++;
        runningLossStreak = 0;
        if (runningWinStreak > maxWinStreak) maxWinStreak = runningWinStreak;

        // Current streak logic
        if (currentStreak === 0 || currentStreakType === 'Win') {
          currentStreakType = 'Win';
          currentStreak++;
        } else {
          currentStreakType = 'Win';
          currentStreak = 1;
        }

      } else if (t.outcome === 'Loss') {
        losses++;
        lossSum += pnl;

        runningLossStreak++;
        runningWinStreak = 0;
        if (runningLossStreak > maxLossStreak) maxLossStreak = runningLossStreak;

        // Current streak logic
        if (currentStreak === 0 || currentStreakType === 'Loss') {
          currentStreakType = 'Loss';
          currentStreak++;
        } else {
          currentStreakType = 'Loss';
          currentStreak = 1;
        }
      } else {
        be++;
        runningWinStreak = 0;
        runningLossStreak = 0;
        currentStreak = 0; // Breakeven breaks active streaks
      }
    });

    const winRate = total > 0 ? (wins / (wins + losses || 1)) * 100 : 0;
    const avgWin = wins > 0 ? winSum / wins : 0;
    const avgLoss = losses > 0 ? lossSum / losses : 0;

    return {
      totalTrades: total,
      wins,
      losses,
      be,
      winRate: Math.round(winRate * 10) / 10,
      totalPnl,
      avgWin,
      avgLoss,
      bestTrade: best === -Infinity ? 0 : best,
      worstTrade: worst === Infinity ? 0 : worst,
      currentStreak,
      currentStreakType,
      maxWinStreak,
      maxLossStreak
    };
  }, [monthlyTrades]);

  // Generate calendar days for the visual heatmap grid
  const calendarDays = useMemo(() => {
    const year = selectedDate.year;
    const month = selectedDate.month;

    // Date of first day of the month
    const firstDay = new Date(year, month, 1);
    // Number of days in the month
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    // Day of the week of first day (0 = Sunday, 1 = Monday, etc.)
    // We adjust so Monday is first (1 = Mon, 6 = Sat, 0 = Sun -> adjust to 0-6 index where Mon is 0)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday becomes 6

    const days = [];

    // Padding empty days for previous month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({
        dayNumber: null,
        dateString: '',
        trades: [] as Trade[],
        dailyPnl: 0
      });
    }

    // Add days of the month
    for (let day = 1; day <= totalDays; day++) {
      const currentDate = new Date(year, month, day);
      const dateStr = formatDateOnly(currentDate);

      // Find trades on this day
      const dayTrades = monthlyTrades.filter((t) => {
        const td = t.timestamp?.seconds 
          ? new Date(t.timestamp.seconds * 1000) 
          : new Date(t.timestamp);
        return formatDateOnly(td) === dateStr;
      });

      const dailyPnl = dayTrades.reduce((sum, t) => sum + Number(t.pnl || 0), 0);

      days.push({
        dayNumber: day,
        dateString: dateStr,
        trades: dayTrades,
        dailyPnl
      });
    }

    return days;
  }, [selectedDate, monthlyTrades]);

  // Active day details for the calendar click details
  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);
  const activeDay = useMemo(() => {
    if (activeDayIndex === null) return null;
    return calendarDays[activeDayIndex] || null;
  }, [calendarDays, activeDayIndex]);

  // Cumulative P&L Path calculation
  const cumulativePnlData = useMemo(() => {
    let current = 0;
    const data = [{ index: 0, pnl: 0 }];
    
    monthlyTrades.forEach((trade, index) => {
      current += Number(trade.pnl || 0);
      data.push({ index: index + 1, pnl: current });
    });
    
    return data;
  }, [monthlyTrades]);

  // Compute SVG paths for Line Chart
  const lineChartPaths = useMemo(() => {
    if (cumulativePnlData.length <= 1) return { linePath: '', areaPath: '', zeroY: 60, endY: 60 };

    const width = 300;
    const height = 120;
    const padding = 15;

    const pnlValues = cumulativePnlData.map(d => d.pnl);
    const maxPnl = Math.max(...pnlValues, 100);
    const minPnl = Math.min(...pnlValues, -100);
    const range = maxPnl - minPnl || 1;

    const getY = (val: number) => {
      const ratio = (val - minPnl) / range;
      return height - (padding + ratio * (height - 2 * padding));
    };

    const getX = (idx: number) => {
      return (idx / (cumulativePnlData.length - 1)) * width;
    };

    let linePath = '';
    let areaPath = '';

    cumulativePnlData.forEach((d, idx) => {
      const x = getX(idx);
      const y = getY(d.pnl);
      if (idx === 0) {
        linePath += `M ${x} ${y}`;
        areaPath += `M ${x} ${getY(0)} L ${x} ${y}`;
      } else {
        linePath += ` L ${x} ${y}`;
        areaPath += ` L ${x} ${y}`;
      }
    });

    const lastX = getX(cumulativePnlData.length - 1);
    areaPath += ` L ${lastX} ${getY(0)} Z`;

    const zeroY = getY(0);
    const endY = getY(cumulativePnlData[cumulativePnlData.length - 1].pnl);

    return { linePath, areaPath, zeroY, endY };
  }, [cumulativePnlData]);

  // Donut segment dimensions
  const donutSegments = useMemo(() => {
    const total = stats.wins + stats.losses + stats.be || 1;
    const winsPct = stats.wins / total;
    const lossesPct = stats.losses / total;
    const bePct = stats.be / total;

    const circumference = 238.76;

    const winSegmentLength = winsPct * circumference;
    const lossSegmentLength = lossesPct * circumference;
    const beSegmentLength = bePct * circumference;

    return { winSegmentLength, lossSegmentLength, beSegmentLength };
  }, [stats]);

  return (
    <div className="page-transition flex flex-col gap-8 select-none">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-customBorder/30 pb-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-syne text-[20px] font-bold text-textPrimary uppercase tracking-[0.15em] m-0">
            MONTHLY TRADE HUB
          </h1>
          <p className="font-dmsans text-[13px] text-textSecondary font-light">
            Sleek calendars, distribution matrices, streak analytics, and monthly statistics.
          </p>
        </div>

        {/* MONTH SELECTOR WIDGET */}
        <div className="flex items-center gap-2 bg-bgSurface border border-customBorder/60 p-1.5 rounded-2xl">
          <button 
            onClick={handlePrevMonth}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-textSecondary hover:text-textPrimary hover:bg-bgElevated transition-all"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex gap-1.5 items-center px-2">
            <select
              value={selectedDate.month}
              onChange={(e) => setSelectedDate(prev => ({ ...prev, month: parseInt(e.target.value) }))}
              className="bg-transparent text-textPrimary font-syne text-[12px] font-bold uppercase tracking-wider outline-none cursor-pointer py-1"
            >
              {months.map((m, idx) => (
                <option key={m} value={idx} className="bg-bgSurface text-textPrimary uppercase">{m}</option>
              ))}
            </select>

            <select
              value={selectedDate.year}
              onChange={(e) => setSelectedDate(prev => ({ ...prev, year: parseInt(e.target.value) }))}
              className="bg-transparent text-textPrimary font-syne text-[12px] font-bold tracking-wider outline-none cursor-pointer py-1"
            >
              {availableYears.map((y) => (
                <option key={y} value={y} className="bg-bgSurface text-textPrimary">{y}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-textSecondary hover:text-textPrimary hover:bg-bgElevated transition-all"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {monthlyTrades.length === 0 ? (
        <div className="bg-bgSurface/40 border border-customBorder p-16 rounded-2xl text-center flex flex-col items-center gap-4">
          <CalendarDays className="w-12 h-12 text-textMuted animate-pulse-subtle" />
          <h3 className="font-syne text-[14px] uppercase tracking-wider text-textSecondary font-semibold">No Trade Ledger Found</h3>
          <p className="font-dmsans text-[12px] text-textMuted max-w-[340px] font-light leading-relaxed">
            There are no recorded trades for {months[selectedDate.month]} {selectedDate.year}. Create logs in the Daily Log to view visual metrics here.
          </p>
        </div>
      ) : (
        <>
          {/* STATS INFOGRAPHICS GRID (RESTORED TO 3 BOXES) */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* CARD 1: Profit & Win Rate (Glassmorphic glow effect) */}
            <div className="relative overflow-hidden bg-gradient-to-br from-bgSurface to-bgSurface/95 border border-customBorder p-5 rounded-2xl flex flex-col justify-between h-[155px] hover:border-accent/30 transition-all duration-300 group">
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-all" />
              <div className="flex justify-between items-start">
                <span className="font-syne text-[10px] uppercase text-textSecondary tracking-[0.12em] flex items-center gap-1.5 font-semibold">
                  <Activity className="w-3.5 h-3.5 text-accent" />
                  Monthly Net Revenue
                </span>
                {stats.totalPnl !== 0 && (
                  <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${
                    stats.totalPnl > 0 
                      ? 'bg-greenPnl/5 text-greenPnl border-greenPnl/15' 
                      : 'bg-redPnl/5 text-redPnl border-redPnl/15'
                  }`}>
                    {stats.totalPnl > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stats.totalPnl > 0 ? 'PROFIT' : 'DRAWDOW'}
                  </span>
                )}
              </div>

              <div>
                <h3 className={`font-mono text-[30px] font-semibold leading-none tracking-tight ${
                  stats.totalPnl > 0 ? 'text-greenPnl' : stats.totalPnl < 0 ? 'text-redPnl' : 'text-textPrimary'
                }`}>
                  {stats.totalPnl > 0 ? '+' : ''}{formatCurrency(stats.totalPnl)}
                </h3>
                <div className="flex items-center gap-3 mt-3.5 pt-3.5 border-t border-customBorder/30">
                  <div className="flex flex-col">
                    <span className="font-dmsans text-[10px] text-textMuted font-light leading-none">Win Ratio</span>
                    <span className="font-mono text-[13px] font-bold text-accent mt-1 leading-none">{stats.winRate}%</span>
                  </div>
                  <div className="w-[1px] h-6 bg-customBorder/40" />
                  <div className="flex flex-col">
                    <span className="font-dmsans text-[10px] text-textMuted font-light leading-none">Total Trades</span>
                    <span className="font-mono text-[13px] font-bold text-textPrimary mt-1 leading-none">{stats.totalTrades}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: Streaks of the Month (Interactive dynamic badge) */}
            <div className="relative overflow-hidden bg-gradient-to-br from-bgSurface to-bgSurface/95 border border-customBorder p-5 rounded-2xl flex flex-col justify-between h-[155px] hover:border-accent/30 transition-all duration-300 group">
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-all" />
              <div className="flex justify-between items-start">
                <span className="font-syne text-[10px] uppercase text-textSecondary tracking-[0.12em] flex items-center gap-1.5 font-semibold">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  Streak Metrics
                </span>
                {stats.currentStreak > 0 && (
                  <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border ${
                    stats.currentStreakType === 'Win' 
                      ? 'bg-greenPnl/5 text-greenPnl border-greenPnl/15' 
                      : 'bg-redPnl/5 text-redPnl border-redPnl/15'
                  }`}>
                    {stats.currentStreakType === 'Win' ? '🔥 HOT' : '❄️ COLD'}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-[30px] font-bold text-textPrimary leading-none">
                    {stats.currentStreak > 0 ? stats.currentStreak : '0'}
                  </span>
                  <span className="font-syne text-[10px] uppercase text-textSecondary font-semibold tracking-wider">
                    Current {stats.currentStreakType === 'Win' ? 'Wins' : 'Losses'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-3.5 pt-3.5 border-t border-customBorder/30">
                  <div className="flex flex-col">
                    <span className="font-dmsans text-[10px] text-textMuted font-light leading-none flex items-center gap-1">
                      <Award className="w-3 h-3 text-yellow-500" /> Max Wins
                    </span>
                    <span className="font-mono text-[13px] font-bold text-greenPnl mt-1 leading-none">
                      {stats.maxWinStreak} <span className="font-syne text-[9px] font-light text-textMuted uppercase">Trades</span>
                    </span>
                  </div>
                  <div className="flex flex-col border-l border-customBorder/30 pl-4">
                    <span className="font-dmsans text-[10px] text-textMuted font-light leading-none flex items-center gap-1">
                      <Target className="w-3 h-3 text-red-500" /> Max Losses
                    </span>
                    <span className="font-mono text-[13px] font-bold text-redPnl mt-1 leading-none">
                      {stats.maxLossStreak} <span className="font-syne text-[9px] font-light text-textMuted uppercase">Trades</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 3: Trade Quality Breakdown */}
            <div className="relative overflow-hidden bg-gradient-to-br from-bgSurface to-bgSurface/95 border border-customBorder p-5 rounded-2xl flex flex-col justify-between h-[155px] hover:border-accent/30 transition-all duration-300 group">
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-all" />
              <div className="flex justify-between items-start">
                <span className="font-syne text-[10px] uppercase text-textSecondary tracking-[0.12em] flex items-center gap-1.5 font-semibold">
                  <Zap className="w-3.5 h-3.5 text-accent" />
                  Efficiency Indicators
                </span>
                <span className="font-mono text-[10px] text-textMuted">W/L: {stats.wins}/{stats.losses}</span>
              </div>

              <div>
                {/* Dynamic Infographic Win/Loss Distribution bar */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-textSecondary leading-none">
                    <span className="text-greenPnl">{stats.wins} W</span>
                    <span className="text-textMuted">{stats.be} BE</span>
                    <span className="text-redPnl">{stats.losses} L</span>
                  </div>
                  <div className="w-full h-2.5 bg-bgElevated rounded-full flex overflow-hidden border border-customBorder/40">
                    <div className="bg-greenPnl h-full transition-all" style={{ width: `${(stats.wins / stats.totalTrades) * 100}%` }} title={`Wins: ${stats.wins}`} />
                    <div className="bg-textSecondary h-full transition-all" style={{ width: `${(stats.be / stats.totalTrades) * 100}%` }} title={`Breakeven: ${stats.be}`} />
                    <div className="bg-redPnl h-full transition-all" style={{ width: `${(stats.losses / stats.totalTrades) * 100}%` }} title={`Losses: ${stats.losses}`} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3.5 pt-3 pt-3.5 border-t border-customBorder/30">
                  <div className="flex flex-col">
                    <span className="font-dmsans text-[10px] text-textMuted font-light leading-none">Avg Profit</span>
                    <span className="font-mono text-[12px] font-bold text-greenPnl mt-1 leading-none">
                      +{formatCurrency(stats.avgWin)}
                    </span>
                  </div>
                  <div className="flex flex-col border-l border-customBorder/30 pl-4">
                    <span className="font-dmsans text-[10px] text-textMuted font-light leading-none">Avg Loss</span>
                    <span className="font-mono text-[12px] font-bold text-redPnl mt-1 leading-none">
                      {formatCurrency(stats.avgLoss)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </section>

          {/* DUAL VISUAL CHARTS SECTION */}
          <PlanGate isGated={true} message="Unlock professional cumulative curves and win ratio donuts. Upgrade to Pro.">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-bgSurface border border-customBorder p-5 rounded-2xl">
              
              {/* GRAPH 1: Cumulative P&L Path Line Chart */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-syne text-[10px] uppercase text-textSecondary tracking-[0.12em] font-semibold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-accent" />
                    Cumulative P&L
                  </span>
                  {stats.totalTrades > 0 && (
                    <span className="font-mono text-[9px] text-textMuted bg-bgElevated/50 border border-customBorder/40 px-1.5 py-0.5 rounded-lg">
                      {stats.totalTrades} trades
                    </span>
                  )}
                </div>
                
                <div className="flex-1 flex items-center justify-center bg-bgElevated/20 border border-customBorder/50 rounded-xl p-3 h-[170px] sm:h-[180px] relative overflow-hidden">
                  {stats.totalTrades === 0 ? (
                    <span className="font-dmsans text-[11px] text-textMuted font-light">No Trade Data</span>
                  ) : (
                    <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={stats.totalPnl >= 0 ? '#10b981' : '#ef4444'} stopOpacity="0.2" />
                          <stop offset="100%" stopColor={stats.totalPnl >= 0 ? '#10b981' : '#ef4444'} stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1={lineChartPaths.zeroY} x2="300" y2={lineChartPaths.zeroY} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" strokeWidth="1" />
                      <path d={lineChartPaths.areaPath} fill="url(#area-grad)" />
                      <path d={lineChartPaths.linePath} fill="none" stroke={stats.totalPnl >= 0 ? '#10b981' : '#ef4444'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="300" cy={lineChartPaths.endY} r="3.5" fill={stats.totalPnl >= 0 ? '#10b981' : '#ef4444'} />
                    </svg>
                  )}
                </div>
              </div>

              {/* GRAPH 2: Circular Win Rate / Loss Rate Donut Chart */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-syne text-[10px] uppercase text-textSecondary tracking-[0.12em] font-semibold flex items-center gap-1.5">
                    <PieChart className="w-3.5 h-3.5 text-accent" />
                    Win / Loss Ratio
                  </span>
                  <span className="font-mono text-[9px] text-textMuted bg-bgElevated/50 border border-customBorder/40 px-1.5 py-0.5 rounded-lg">
                    {stats.wins}W — {stats.losses}L
                  </span>
                </div>
                
                <div className="flex-1 flex items-center justify-center bg-bgElevated/20 border border-customBorder/50 rounded-xl p-3 h-[170px] sm:h-[180px]">
                  {stats.totalTrades === 0 ? (
                    <span className="font-dmsans text-[11px] text-textMuted font-light">No Trade Data</span>
                  ) : (
                    <div className="flex items-center justify-center gap-6 w-full">
                      <div className="relative w-[84px] h-[84px] shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="9" />
                          
                          {donutSegments.winSegmentLength > 0 && (
                            <circle
                              cx="50"
                              cy="50"
                              r="38"
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="9"
                              strokeDasharray={`${donutSegments.winSegmentLength} 238.76`}
                              strokeDashoffset="0"
                              strokeLinecap={donutSegments.winSegmentLength > 2 ? 'round' : 'butt'}
                            />
                          )}
                          
                          {donutSegments.beSegmentLength > 0 && (
                            <circle
                              cx="50"
                              cy="50"
                              r="38"
                              fill="none"
                              stroke="#94a3b8"
                              strokeWidth="9"
                              strokeDasharray={`${donutSegments.beSegmentLength} 238.76`}
                              strokeDashoffset={`-${donutSegments.winSegmentLength}`}
                              strokeLinecap={donutSegments.beSegmentLength > 2 ? 'round' : 'butt'}
                            />
                          )}

                          {donutSegments.lossSegmentLength > 0 && (
                            <circle
                              cx="50"
                              cy="50"
                              r="38"
                              fill="none"
                              stroke="#ef4444"
                              strokeWidth="9"
                              strokeDasharray={`${donutSegments.lossSegmentLength} 238.76`}
                              strokeDashoffset={`-${donutSegments.winSegmentLength + donutSegments.beSegmentLength}`}
                              strokeLinecap={donutSegments.lossSegmentLength > 2 ? 'round' : 'butt'}
                            />
                          )}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                          <span className="font-mono text-[13px] font-bold text-accent">{stats.winRate}%</span>
                          <span className="font-syne text-[6px] text-textMuted uppercase mt-1">Win Rate</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0 text-[10px] font-mono leading-none">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-sm bg-greenPnl" />
                          <span className="text-textSecondary">Wins:</span>
                          <span className="text-textPrimary font-semibold">{stats.wins}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-2 h-2 rounded-sm bg-slate-400" />
                          <span className="text-textSecondary">BE:</span>
                          <span className="text-textPrimary font-semibold">{stats.be}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-2 h-2 rounded-sm bg-redPnl" />
                          <span className="text-textSecondary">Loss:</span>
                          <span className="text-textPrimary font-semibold">{stats.losses}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </section>
          </PlanGate>

          {/* TRADING CALENDAR HEATMAP INFOGRAPHIC */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-customBorder pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" />
                <h2 className="font-syne text-[11px] uppercase text-textSecondary tracking-[0.12em]">
                  TRADING CALENDAR HEATMAP
                </h2>
              </div>
              <span className="font-dmsans text-[10px] text-textMuted flex items-center gap-1 font-light">
                <Info className="w-3.5 h-3.5 text-accent" />
                Click on any active day to inspect detailed trades.
              </span>
            </div>

            {/* Heatmap Grid Calendar */}
            <div className="bg-bgSurface p-5 rounded-2xl border border-customBorder flex flex-col gap-4">
              
              {/* Day Labels */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2.5 text-center">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => (
                  <span key={d} className="font-syne text-[8px] sm:text-[10px] font-bold text-textMuted tracking-wider">{d}</span>
                ))}
              </div>

              {/* Heatmap Squares */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2.5">
                {calendarDays.map((day, idx) => {
                  const hasTrades = day.trades.length > 0;
                  const isWinningDay = day.dailyPnl > 0;
                  const isLosingDay = day.dailyPnl < 0;
                  const isBreakevenDay = hasTrades && day.dailyPnl === 0;

                  // Define dynamic styles based on P&L density
                  let squareBg = 'bg-bgElevated/30 border-customBorder/30';
                  let textColor = 'text-textMuted/40';

                  if (day.dayNumber) {
                    squareBg = 'bg-bgElevated/50 border-customBorder/50 hover:bg-bgElevated hover:border-accent/40';
                    textColor = 'text-textSecondary';
                    
                    if (isWinningDay) {
                      squareBg = 'bg-greenPnl border-greenPnl/40';
                      textColor = 'text-bgBase font-bold';
                      // Style override for custom background colored element
                    } else if (isLosingDay) {
                      squareBg = 'bg-redPnl border-redPnl/40';
                      textColor = 'text-bgBase font-bold';
                    } else if (isBreakevenDay) {
                      squareBg = 'bg-bgOverlay border-customBorder text-textPrimary font-semibold';
                    }
                  }

                  const activeDayStyle: React.CSSProperties = {};
                  if (day.dayNumber) {
                    if (isWinningDay) {
                      const ratio = Math.min(1, 0.15 + (Math.abs(day.dailyPnl) / 1000) * 0.85);
                      activeDayStyle.backgroundColor = `rgba(16, 185, 129, ${ratio})`;
                      activeDayStyle.borderColor = 'rgba(16, 185, 129, 0.4)';
                      activeDayStyle.color = '#0a0a0a';
                    } else if (isLosingDay) {
                      const ratio = Math.min(1, 0.15 + (Math.abs(day.dailyPnl) / 1000) * 0.85);
                      activeDayStyle.backgroundColor = `rgba(239, 68, 68, ${ratio})`;
                      activeDayStyle.borderColor = 'rgba(239, 68, 68, 0.4)';
                      activeDayStyle.color = '#0a0a0a';
                    }
                  }

                  const isActive = activeDayIndex === idx;

                  return (
                    <button
                      key={`${idx}-${day.dayNumber || 'empty'}`}
                      disabled={!day.dayNumber}
                      onClick={() => setActiveDayIndex(isActive ? null : idx)}
                      style={activeDayStyle}
                      className={`h-[42px] xs:h-[48px] sm:h-[62px] p-1 xs:p-1.5 sm:p-2 rounded-lg sm:rounded-xl border flex flex-col justify-between items-start text-left transition-all duration-200 ${squareBg} ${textColor} ${
                        !day.dayNumber ? 'opacity-20 cursor-default' : 'cursor-pointer'
                      } ${isActive ? 'ring-2 ring-accent scale-[1.03]' : ''}`}
                    >
                      <span className="font-mono text-[8px] sm:text-[10px] leading-none font-semibold">
                        {day.dayNumber || ''}
                      </span>
                      
                      {hasTrades && (
                        <div className="flex flex-col items-start w-full overflow-hidden mt-0.5 sm:mt-1.5 leading-none">
                          <span className="font-mono text-[7px] xs:text-[8px] sm:text-[10px] font-bold truncate max-w-full">
                            {day.dailyPnl !== 0 ? (day.dailyPnl > 0 ? '+' : '') + Math.round(day.dailyPnl) : '0'}
                          </span>
                          <span className="font-dmsans text-[6px] sm:text-[8px] opacity-75 mt-0.5 truncate hidden xs:block">
                            {day.trades.length} trade{day.trades.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected day modal info inside parent panel */}
            {activeDay && activeDay.trades.length > 0 && (
              <div className="bg-bgSurface/95 border border-accent/20 p-5 rounded-2xl flex flex-col gap-4 animate-fade-in">
                <div className="flex justify-between items-center border-b border-customBorder/50 pb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" />
                    <span className="font-syne text-[11px] font-bold text-textPrimary uppercase tracking-wider">
                      AUDITING: {formatReadableDate(activeDay.dateString)}
                    </span>
                  </div>
                  <span className={`font-mono text-[12px] font-bold ${
                    activeDay.dailyPnl > 0 ? 'text-greenPnl' : activeDay.dailyPnl < 0 ? 'text-redPnl' : 'text-textPrimary'
                  }`}>
                    Daily P&L: {activeDay.dailyPnl > 0 ? '+' : ''}{formatCurrency(activeDay.dailyPnl)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeDay.trades.map((trade) => {

                    return (
                      <div 
                        key={trade.id}
                        className="bg-bgElevated p-4 rounded-xl border border-customBorder/60 flex flex-col gap-2.5"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[13px] font-bold uppercase text-textPrimary">{trade.symbol}</span>
                            <span className={`text-[9px] font-mono font-medium px-1.5 py-0.5 rounded border uppercase ${
                              trade.direction === 'Long' 
                                ? 'bg-greenPnl/5 text-greenPnl border-greenPnl/15' 
                                : 'bg-redPnl/5 text-redPnl border-redPnl/15'
                            }`}>
                              {trade.direction}
                            </span>
                          </div>
                          
                          <span className={`font-mono text-[12px] font-semibold ${
                            trade.pnl > 0 ? 'text-greenPnl' : trade.pnl < 0 ? 'text-redPnl' : 'text-textPrimary'
                          }`}>
                            {trade.pnl > 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 border-y border-customBorder/20 py-2 text-[10px] font-mono">
                          <div className="flex flex-col">
                            <span className="text-textMuted font-dmsans">Entry</span>
                            <span className="text-textPrimary mt-0.5 font-bold">{formatCurrency(trade.entryPrice)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-textMuted font-dmsans">Exit</span>
                            <span className="text-textPrimary mt-0.5 font-bold">{formatCurrency(trade.exitPrice)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-textMuted font-dmsans">Size</span>
                            <span className="text-textPrimary mt-0.5 font-bold">{trade.positionSize}</span>
                          </div>
                        </div>

                        {trade.strategy && (
                          <div className="flex items-center gap-1.5">
                            <span className="font-syne text-[9px] text-textMuted uppercase">Setup:</span>
                            <span className="font-syne text-[9px] text-accent uppercase font-bold tracking-wider">{trade.strategy}</span>
                          </div>
                        )}

                        {trade.notes && (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-syne text-[8px] text-textMuted uppercase leading-none">Journal Notes:</span>
                            <p className="font-dmsans text-[11px] text-textSecondary font-light leading-normal">{trade.notes}</p>
                          </div>
                        )}
                        
                        {trade.mindset && (
                          <div className="flex flex-col gap-0.5 border-t border-customBorder/20 pt-2">
                            <span className="font-syne text-[8px] text-textMuted uppercase leading-none">Mindset logged:</span>
                            <p className="font-dmsans text-[11px] text-accent/80 font-light leading-normal italic">"{trade.mindset}"</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* MONTHLY LOG LEDGER (WINS & LOSSES WITH DATE) */}
          <section className="flex flex-col gap-4">
            <h2 className="font-syne text-[13px] uppercase text-textSecondary tracking-[0.15em] border-b border-customBorder pb-2">
              Wins & Losses Ledger ({months[selectedDate.month]} {selectedDate.year})
            </h2>

            {/* MOBILE LAYOUT: CARD LIST (Shown only on mobile screens) */}
            <div className="flex flex-col gap-3.5 md:hidden">
              {monthlyTrades.map((t) => {
                const isLong = t.direction === 'Long';
                const isWin = t.outcome === 'Win';
                const isLoss = t.outcome === 'Loss';

                return (
                  <div 
                    key={t.id} 
                    className="bg-bgSurface border border-customBorder/70 p-4 rounded-2xl flex flex-col gap-3 relative hover:border-accent/15 transition-all"
                  >
                    {/* Header Row */}
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-[11px] text-textMuted font-light">
                          {formatReadableDate(t.timestamp)}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[14px] font-semibold text-textPrimary uppercase tracking-tight">
                            {t.symbol}
                          </span>
                          <span className={`inline-flex items-center text-[9px] font-mono font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded border ${
                            isLong 
                              ? 'bg-greenPnl/5 text-greenPnl border-greenPnl/20' 
                              : 'bg-redPnl/5 text-redPnl border-redPnl/20'
                          }`}>
                            {t.direction}
                          </span>
                        </div>
                      </div>
                      
                      {/* P&L */}
                      <span className={`font-mono text-[14px] font-semibold ${
                        t.pnl > 0 ? 'text-greenPnl' : t.pnl < 0 ? 'text-redPnl' : 'text-textPrimary'
                      }`}>
                        {t.pnl > 0 ? '+' : ''}{t.pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Meta/Sub-details grid */}
                    <div className="grid grid-cols-3 gap-2 border-y border-customBorder/20 py-2.5 my-0.5 text-[11px] font-mono">
                      <div className="flex flex-col">
                        <span className="text-textMuted font-syne text-[8px] uppercase tracking-wider">Entry</span>
                        <span className="text-textPrimary mt-0.5 font-medium">{t.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex flex-col border-l border-customBorder/20 pl-2.5">
                        <span className="text-textMuted font-syne text-[8px] uppercase tracking-wider">Exit</span>
                        <span className="text-textPrimary mt-0.5 font-medium">{t.exitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex flex-col border-l border-customBorder/20 pl-2.5">
                        <span className="text-textMuted font-syne text-[8px] uppercase tracking-wider">Size</span>
                        <span className="text-textSecondary mt-0.5 font-medium">{t.positionSize}</span>
                      </div>
                    </div>

                    {/* Bottom strip: Outcome, Strategy */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center text-[9px] font-mono tracking-wider px-2 py-0.5 rounded border ${
                          isWin 
                            ? 'bg-greenPnl/5 text-greenPnl border-greenPnl/25' 
                            : isLoss 
                              ? 'bg-redPnl/5 text-redPnl border-redPnl/25' 
                              : 'bg-bgElevated text-textSecondary border-customBorder'
                        }`}>
                          {t.outcome}
                        </span>
                        {t.strategy && t.strategy !== 'None' && (
                          <span className="font-syne text-[9px] text-textSecondary uppercase tracking-wide bg-bgElevated px-1.5 py-0.5 rounded border border-customBorder/50">
                            {t.strategy}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP LAYOUT: TABLE (Shown only on tablet/laptops and up) */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-customBorder/30">
              <table className="w-full text-left border-collapse select-none">
                <thead>
                  <tr className="bg-bgElevated border-b border-customBorder text-textSecondary font-syne text-[10px] uppercase tracking-[0.12em]">
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Asset</th>
                    <th className="py-3 px-4 font-semibold">Direction</th>
                    <th className="py-3 px-4 font-semibold">Entry ($)</th>
                    <th className="py-3 px-4 font-semibold">Exit ($)</th>
                    <th className="py-3 px-4 font-semibold">Size</th>
                    <th className="py-3 px-4 font-semibold text-right">P&L ($)</th>
                    <th className="py-3 px-4 font-semibold">Outcome</th>
                    <th className="py-3 px-4 font-semibold">Strategy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-customBorder/30">
                  {monthlyTrades.map((t, idx) => {
                    const isLong = t.direction === 'Long';
                    const isWin = t.outcome === 'Win';
                    const isLoss = t.outcome === 'Loss';

                    return (
                      <tr 
                        key={t.id}
                        className={`transition-colors duration-150 ${idx % 2 === 0 ? 'bg-bgSurface' : 'bg-transparent'} hover:bg-bgElevated`}
                      >
                        <td className="py-3 px-4 font-mono text-[11px] text-textSecondary whitespace-nowrap">
                          {formatReadableDate(t.timestamp)}
                        </td>

                        <td className="py-3 px-4 font-mono text-[13px] font-bold text-textPrimary uppercase">
                          {t.symbol}
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center text-[10px] font-mono font-medium tracking-wide uppercase px-2 py-0.5 rounded-lg border ${
                            isLong 
                              ? 'bg-greenPnl/5 text-greenPnl border-greenPnl/20' 
                              : 'bg-redPnl/5 text-redPnl border-redPnl/20'
                          }`}>
                            {t.direction}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono text-[13px] text-textPrimary">
                          {t.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3 px-4 font-mono text-[13px] text-textPrimary">
                          {t.exitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3 px-4 font-mono text-[13px] text-textSecondary">
                          {t.positionSize}
                        </td>

                        <td className={`py-3 px-4 font-mono text-[13px] text-right font-semibold ${
                          t.pnl > 0 ? 'text-greenPnl' : t.pnl < 0 ? 'text-redPnl' : 'text-textPrimary'
                        }`}>
                          {t.pnl > 0 ? '+' : ''}{t.pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-lg border ${
                            isWin 
                              ? 'bg-greenPnl/5 text-greenPnl border-greenPnl/25' 
                              : isLoss 
                                ? 'bg-redPnl/5 text-redPnl border-redPnl/25' 
                                : 'bg-bgElevated text-textSecondary border-customBorder'
                          }`}>
                            {t.outcome}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-syne text-[10px] text-textSecondary uppercase tracking-wide">
                          {t.strategy || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

    </div>
  );
};

export default MonthlyHistory;
