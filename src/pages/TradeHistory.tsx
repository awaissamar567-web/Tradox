import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usePlanGateModal } from '../components/PlanGate';
import { 
  formatCurrency, 
  formatReadableDate, 
  calculateStats,
  exportToCSV
} from '../utils/helpers';
import { 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Trash2,
  Lock,
  FileText
} from 'lucide-react';
import { jsPDF } from 'jspdf';

const ITEMS_PER_PAGE = 10;

const isTradeOlderThan7Days = (timestamp: any) => {
  if (!timestamp) return false;
  const tradeDate = timestamp?.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
  const diffTime = Math.abs(new Date().getTime() - tradeDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 7;
};

const TradeHistory: React.FC = () => {
  const { trades, deleteTrade } = useData();
  const { userPlan } = useAuth();
  const { showToast } = useToast();
  const { openUpgradeModal } = usePlanGateModal();

  // Filters & Sorting States
  const [searchTerm, setSearchTerm] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('All');
  const [directionFilter, setDirectionFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Compute number of active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (outcomeFilter !== 'All') count++;
    if (directionFilter !== 'All') count++;
    if (startDate) count++;
    if (endDate) count++;
    return count;
  }, [searchTerm, outcomeFilter, directionFilter, startDate, endDate]);

  // Compute all-time stats from ALL trades (unfiltered)
  const allTimeStats = useMemo(() => calculateStats(trades), [trades]);

  // Apply filters to trades
  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      // 1. Search filter (Symbol or Strategy)
      const symbolMatch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      const strategyMatch = (trade.strategy || '').toLowerCase().includes(searchTerm.toLowerCase());
      if (searchTerm && !symbolMatch && !strategyMatch) return false;

      // 2. Outcome filter
      if (outcomeFilter !== 'All' && trade.outcome !== outcomeFilter) return false;

      // 3. Direction filter
      if (directionFilter !== 'All' && trade.direction !== directionFilter) return false;

      // 4. Date range filter
      if (startDate) {
        const tradeDate = new Date(trade.timestamp);
        const start = new Date(startDate);
        if (tradeDate < start) return false;
      }
      if (endDate) {
        const tradeDate = new Date(trade.timestamp);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (tradeDate > end) return false;
      }

      return true;
    });
  }, [trades, searchTerm, outcomeFilter, directionFilter, startDate, endDate]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, outcomeFilter, directionFilter, startDate, endDate]);

  // Pagination bounds
  const totalPages = Math.max(1, Math.ceil(filteredTrades.length / ITEMS_PER_PAGE));
  const paginatedTrades = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTrades.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredTrades, currentPage]);

  const handleExportCSV = () => {
    if (userPlan === 'free') {
      openUpgradeModal();
      return;
    }
    if (filteredTrades.length === 0) {
      showToast('No trades found under current filters to export.', 'error');
      return;
    }
    try {
      exportToCSV(filteredTrades, `tradox_export_${new Date().toISOString().split('T')[0]}.csv`);
      showToast(`Exported ${filteredTrades.length} trades successfully.`, 'success');
    } catch (err) {
      showToast('CSV export failed.', 'error');
    }
  };

  const handleExportPDF = () => {
    if (userPlan === 'free') {
      openUpgradeModal();
      return;
    }
    if (filteredTrades.length === 0) {
      showToast('No trades found under current filters to export.', 'error');
      return;
    }

    try {
      const doc = new jsPDF();
      
      // dark background
      doc.setFillColor(26, 26, 26);
      doc.rect(0, 0, 210, 297, 'F');
      
      doc.setTextColor(255, 107, 0); // Orange Header
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('TRADOX JOURNAL TRADE AUDIT REPORT', 14, 20);
      
      doc.setTextColor(180, 180, 180);
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
      
      doc.setDrawColor(255, 107, 0);
      doc.line(14, 32, 196, 32);
      
      doc.setFontSize(11);
      doc.setTextColor(240, 237, 232);
      let y = 42;
      
      filteredTrades.forEach((t, idx) => {
        if (y > 270) {
          doc.addPage();
          doc.setFillColor(26, 26, 26);
          doc.rect(0, 0, 210, 297, 'F');
          y = 20;
        }
        
        const dateStr = formatReadableDate(t.timestamp);
        const pnlStr = (t.pnl > 0 ? '+' : '') + formatCurrency(t.pnl);
        
        doc.setFont('Helvetica', 'bold');
        doc.text(`${idx + 1}. ${t.symbol} — ${t.direction.toUpperCase()} (${pnlStr})`, 14, y);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Date: ${dateStr} | Entry: $${t.entryPrice} | Exit: $${t.exitPrice} | Setup: ${t.strategy || 'None'}`, 14, y + 5);
        if (t.notes) {
          doc.text(`Notes: ${t.notes.substring(0, 85)}${t.notes.length > 85 ? '...' : ''}`, 14, y + 10);
          y += 18;
        } else {
          y += 12;
        }
        doc.setFontSize(11);
      });
      
      doc.save(`tradox_audit_${new Date().toISOString().split('T')[0]}.pdf`);
      showToast(`Exported ${filteredTrades.length} trades to PDF successfully.`, 'success');
    } catch (err) {
      console.error(err);
      showToast('PDF export failed.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Permanently delete this trade from your journal history?')) {
      try {
        await deleteTrade(id);
        showToast('Trade record deleted.', 'success');
      } catch (err) {
        showToast('Failed to delete trade.', 'error');
      }
    }
  };

  return (
    <div className="page-transition flex flex-col gap-8 select-none">
      
      {/* Heading */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-syne text-[20px] font-bold text-textPrimary uppercase tracking-[0.15em] m-0">
            TRADE LOG HISTORY
          </h1>
          <p className="font-dmsans text-[13px] text-textSecondary font-light">
            Search, sort, filter, and audit your complete trading database.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="h-10 px-4 bg-transparent border border-accent/40 hover:bg-accentDim active:scale-[0.98] text-accent font-syne text-[11px] font-semibold uppercase tracking-[0.1em] rounded-xl transition-all duration-150 flex items-center justify-center gap-2 font-bold"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          
          <button
            onClick={handleExportPDF}
            className="h-10 px-4 bg-transparent border border-accent/40 hover:bg-accentDim active:scale-[0.98] text-accent font-syne text-[11px] font-semibold uppercase tracking-[0.1em] rounded-xl transition-all duration-150 flex items-center justify-center gap-2 font-bold"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
        </div>
      </header>

      {/* ALL-TIME STATS BANNER */}
      <section className="relative pt-6 border-t border-accent flex flex-col md:flex-row md:items-center w-full">
        {/* Mobile: 2x2 grid, Desktop: 1x4 row */}
        <div className="grid grid-cols-2 md:flex md:flex-row md:items-center w-full gap-4 md:gap-0">
          
          {/* STAT 1: Net P&L */}
          <div className="flex flex-col items-start px-2 sm:px-4 md:w-1/4">
            <span className="font-syne text-[9px] sm:text-[10px] uppercase text-textSecondary tracking-[0.12em]">
              All-Time Net Profit
            </span>
            <span className={`font-mono text-[20px] xs:text-[24px] sm:text-[28px] md:text-[32px] font-semibold leading-tight mt-1 ${
              allTimeStats.totalPnl > 0 ? 'text-greenPnl' : allTimeStats.totalPnl < 0 ? 'text-redPnl' : 'text-textPrimary'
            }`}>
              {allTimeStats.totalPnl > 0 ? '+' : ''}{formatCurrency(allTimeStats.totalPnl)}
            </span>
          </div>

          <div className="hidden md:block w-[1px] h-10 bg-customBorder" />

          {/* STAT 2: Total Trades */}
          <div className="flex flex-col items-start px-2 sm:px-4 md:w-1/4 border-l border-customBorder md:border-l-0">
            <span className="font-syne text-[9px] sm:text-[10px] uppercase text-textSecondary tracking-[0.12em]">
              Total Executions
            </span>
            <span className="font-mono text-[20px] xs:text-[24px] sm:text-[28px] md:text-[32px] font-semibold text-textPrimary leading-tight mt-1">
              {allTimeStats.tradeCount}
            </span>
          </div>

          <div className="hidden md:block w-[1px] h-10 bg-customBorder" />

          {/* STAT 3: Win Rate */}
          <div className="flex flex-col items-start px-2 sm:px-4 border-t border-customBorder pt-4 md:pt-0 md:border-t-0">
            <span className="font-syne text-[9px] sm:text-[10px] uppercase text-textSecondary tracking-[0.12em]">
              Win Ratio
            </span>
            <span className="font-mono text-[20px] xs:text-[24px] sm:text-[28px] md:text-[32px] font-semibold text-accent leading-tight mt-1">
              {allTimeStats.winRate}%
            </span>
          </div>

          <div className="hidden md:block w-[1px] h-10 bg-customBorder" />

          {/* STAT 4: Avg Win */}
          <div className="flex flex-col items-start px-2 sm:px-4 border-t border-l border-customBorder pt-4 md:pt-0 md:border-t-0 md:border-l-0">
            <span className="font-syne text-[9px] sm:text-[10px] uppercase text-textSecondary tracking-[0.12em]">
              Average Win
            </span>
            <span className={`font-mono text-[20px] xs:text-[24px] sm:text-[28px] md:text-[32px] font-semibold leading-tight mt-1 ${
              allTimeStats.avgWin > 0 ? 'text-greenPnl' : 'text-textPrimary'
            }`}>
              {allTimeStats.avgWin > 0 ? '+' : ''}{formatCurrency(allTimeStats.avgWin)}
            </span>
          </div>

        </div>
      </section>

      {/* FILTER PANEL */}
      <section className="bg-bgSurface p-4 sm:p-5 rounded-2xl border border-customBorder flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-customBorder pb-2">
          <div className="flex items-center gap-2 text-textSecondary">
            <Filter className="w-4 h-4 text-accent" />
            <span className="font-syne text-[11px] uppercase tracking-[0.12em]">FILTER DATABASE</span>
            {activeFiltersCount > 0 && (
              <span className="bg-accent/15 border border-accent/30 text-accent text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                {activeFiltersCount}
              </span>
            )}
          </div>
          
          <button
            type="button"
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="md:hidden text-[10px] font-syne text-accent uppercase tracking-wider font-bold hover:brightness-110 active:scale-95 transition-all"
          >
            {showFiltersMobile ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className={`${showFiltersMobile ? 'grid' : 'hidden md:grid'} grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4`}>
          
          <div className="flex flex-col gap-1.5">
            <label className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em]">Search Ticker/Strategy</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-textMuted" />
              <input
                type="text"
                placeholder="e.g. AAPL, ORB"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-9 pr-4 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary placeholder:text-textMuted outline-none focus:border-accent focus:ring-4 focus:ring-accentGlow transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em]">Outcome</label>
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              className="w-full h-10 px-3 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary outline-none focus:border-accent focus:ring-4 focus:ring-accentGlow transition-all duration-200"
            >
              <option value="All">All Outcomes</option>
              <option value="Win">Win</option>
              <option value="Loss">Loss</option>
              <option value="BE">Breakeven (BE)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em]">Direction</label>
            <select
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value)}
              className="w-full h-10 px-3 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary outline-none focus:border-accent focus:ring-4 focus:ring-accentGlow transition-all duration-200"
            >
              <option value="All">All Directions</option>
              <option value="Long">Long</option>
              <option value="Short">Short</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em]">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-10 px-3 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary outline-none focus:border-accent focus:ring-4 focus:ring-accentGlow transition-all duration-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em]">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-10 px-3 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary outline-none focus:border-accent focus:ring-4 focus:ring-accentGlow transition-all duration-200"
            />
          </div>

        </div>
      </section>

      {/* TRADES LIST TABLE */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-customBorder pb-2">
          <h2 className="font-syne text-[13px] uppercase text-textSecondary tracking-[0.15em]">
            Trade Ledger ({filteredTrades.length} matches)
          </h2>
          <span className="font-dmsans text-[11px] text-textMuted font-light">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {filteredTrades.length === 0 ? (
          <div className="bg-bgSurface/40 border border-customBorder p-12 rounded-2xl text-center">
            <span className="font-dmsans text-[13px] text-textSecondary font-light">
              No executions matched your query. Clear filters to see full history.
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            
            {/* MOBILE LAYOUT: CARD LIST */}
            <div className="flex flex-col gap-3.5 md:hidden">
              {paginatedTrades.map((t) => {
                const isLong = t.direction === 'Long';
                const isWin = t.outcome === 'Win';
                const isLoss = t.outcome === 'Loss';
                const isOlder = isTradeOlderThan7Days(t.timestamp);
                const isBlurred = userPlan === 'free' && isOlder;

                return (
                  <div 
                    key={t.id} 
                    className="bg-bgSurface border border-customBorder/70 p-4 rounded-2xl flex flex-col gap-3 relative hover:border-accent/15 transition-all overflow-hidden"
                  >
                    {isBlurred && (
                      <div 
                        onClick={openUpgradeModal}
                        className="absolute inset-0 bg-bgBase/30 backdrop-blur-[5px] z-10 flex flex-col items-center justify-center text-center cursor-pointer select-none"
                      >
                        <Lock className="w-5 h-5 text-accent animate-pulse" />
                        <span className="font-syne text-[8px] uppercase tracking-wider text-textPrimary font-semibold mt-1">Unlock History (Pro Only)</span>
                      </div>
                    )}

                    <div className={isBlurred ? "blur-[2.5px] pointer-events-none select-none" : ""}>
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
                        
                        {/* P&L & Delete Action */}
                        <div className="flex items-center gap-3">
                          <span className={`font-mono text-[14px] font-semibold ${
                            t.pnl > 0 ? 'text-greenPnl' : t.pnl < 0 ? 'text-redPnl' : 'text-textPrimary'
                          }`}>
                            {t.pnl > 0 ? '+' : ''}{t.pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="text-textSecondary hover:text-redPnl p-1 transition-colors"
                            title="Delete trade"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

                      {/* Notes if present */}
                      {t.notes && (
                        <div className="mt-1 bg-bgElevated/40 p-2.5 rounded-xl border border-customBorder/40">
                          <p className="font-dmsans text-[11px] text-textSecondary font-light leading-relaxed">
                            {t.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP LAYOUT: TABLE */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-customBorder/30 relative">
              <table className="w-full text-left border-collapse select-none">
                <thead>
                  <tr className="bg-bgElevated border-b border-customBorder text-textSecondary font-syne text-[10px] uppercase tracking-[0.12em]">
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Asset</th>
                    <th className="py-3 px-4 font-semibold">Dir</th>
                    <th className="py-3 px-4 font-semibold">Entry ($)</th>
                    <th className="py-3 px-4 font-semibold">Exit ($)</th>
                    <th className="py-3 px-4 font-semibold">Size</th>
                    <th className="py-3 px-4 font-semibold text-right">P&L ($)</th>
                    <th className="py-3 px-4 font-semibold">Outcome</th>
                    <th className="py-3 px-4 font-semibold">Strategy</th>
                    <th className="py-3 px-4 font-semibold max-w-[200px] truncate">Notes</th>
                    <th className="py-3 px-4 font-semibold text-center w-12">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-customBorder/30">
                  {paginatedTrades.map((t, idx) => {
                    const isLong = t.direction === 'Long';
                    const isWin = t.outcome === 'Win';
                    const isLoss = t.outcome === 'Loss';
                    const isOlder = isTradeOlderThan7Days(t.timestamp);
                    const isBlurred = userPlan === 'free' && isOlder;

                    return (
                      <tr 
                        key={t.id}
                        onClick={isBlurred ? openUpgradeModal : undefined}
                        className={`transition-colors duration-150 relative ${
                          isBlurred 
                            ? 'cursor-pointer hover:bg-bgElevated/30' 
                            : idx % 2 === 0 ? 'bg-bgSurface' : 'bg-transparent'
                        } hover:bg-bgElevated`}
                      >
                        {/* Trade Date */}
                        <td className="py-3 px-4 font-mono text-[11px] text-textSecondary whitespace-nowrap">
                          {isBlurred ? (
                            <span className="flex items-center gap-1 text-accent font-semibold text-[9px] tracking-wide">
                              <Lock className="w-3.5 h-3.5 shrink-0" />
                              LOCKED
                            </span>
                          ) : (
                            formatReadableDate(t.timestamp)
                          )}
                        </td>

                        {/* Symbol */}
                        <td className={`py-3 px-4 font-mono text-[13px] font-semibold text-textPrimary uppercase ${isBlurred ? 'blur-[3px] select-none pointer-events-none' : ''}`}>
                          {t.symbol}
                        </td>

                        {/* Direction */}
                        <td className={`py-3 px-4 ${isBlurred ? 'blur-[3px] select-none pointer-events-none' : ''}`}>
                          <span className={`inline-flex items-center text-[10px] font-mono font-medium tracking-wide uppercase px-2 py-0.5 rounded-lg border ${
                            isLong 
                              ? 'bg-greenPnl/5 text-greenPnl border-greenPnl/20' 
                              : 'bg-redPnl/5 text-redPnl border-redPnl/20'
                          }`}>
                            {t.direction}
                          </span>
                        </td>

                        {/* Entry */}
                        <td className={`py-3 px-4 font-mono text-[13px] text-textPrimary ${isBlurred ? 'blur-[3px] select-none pointer-events-none' : ''}`}>
                          {t.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Exit */}
                        <td className={`py-3 px-4 font-mono text-[13px] text-textPrimary ${isBlurred ? 'blur-[3px] select-none pointer-events-none' : ''}`}>
                          {t.exitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Size */}
                        <td className={`py-3 px-4 font-mono text-[13px] text-textSecondary ${isBlurred ? 'blur-[3px] select-none pointer-events-none' : ''}`}>
                          {t.positionSize}
                        </td>

                        {/* Net P&L */}
                        <td className={`py-3 px-4 font-mono text-[13px] text-right font-medium ${isBlurred ? 'blur-[3px] select-none pointer-events-none' : ''} ${
                          t.pnl > 0 ? 'text-greenPnl' : t.pnl < 0 ? 'text-redPnl' : 'text-textPrimary'
                        }`}>
                          {t.pnl > 0 ? '+' : ''}{t.pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Outcome */}
                        <td className={`py-3 px-4 ${isBlurred ? 'blur-[3px] select-none pointer-events-none' : ''}`}>
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

                        {/* Strategy */}
                        <td className={`py-3 px-4 font-syne text-[10px] text-textSecondary uppercase tracking-wide ${isBlurred ? 'blur-[3px] select-none pointer-events-none' : ''}`}>
                          {t.strategy}
                        </td>

                        {/* Notes */}
                        <td className={`py-3 px-4 font-dmsans text-[12px] text-textSecondary max-w-[200px] truncate ${isBlurred ? 'blur-[3px] select-none pointer-events-none' : ''}`} title={t.notes}>
                          {t.notes || '—'}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          {isBlurred ? (
                            <div className="w-4 h-4 mx-auto text-textMuted flex items-center justify-center">
                              <Lock className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="text-textSecondary hover:text-redPnl p-1 transition-colors duration-150"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-2 border-t border-customBorder/50 pt-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-9 px-4 bg-bgSurface hover:bg-bgElevated border border-customBorder text-textSecondary hover:text-textPrimary font-syne text-[11px] uppercase tracking-[0.1em] rounded-xl transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  PREV
                </button>
                
                <span className="font-mono text-[12px] text-textSecondary">
                  {currentPage} / {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-9 px-4 bg-bgSurface hover:bg-bgElevated border border-customBorder text-textSecondary hover:text-textPrimary font-syne text-[11px] uppercase tracking-[0.1em] rounded-xl transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
                >
                  NEXT
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

    </div>
  );
};

export default TradeHistory;
