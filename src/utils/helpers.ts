/**
 * EDGELOG - Core Utility Helpers
 */

/**
 * Formats a numeric value into USD currency representation.
 */
export const formatCurrency = (value: number): string => {
  let currencyCode = 'USD';
  try {
    const quickCurrency = localStorage.getItem('tradox_active_currency');
    if (quickCurrency) {
      currencyCode = quickCurrency;
    } else {
      // Fallback check profile configs in localStorage
      const localMockUser = localStorage.getItem('edgelog_mock_user');
      let uid = '';
      if (localMockUser) {
        uid = JSON.parse(localMockUser).uid;
      }
      if (uid) {
        const storedProfile = localStorage.getItem(`edgelog_profile_${uid}`);
        if (storedProfile) {
          currencyCode = JSON.parse(storedProfile).currency || 'USD';
          localStorage.setItem('tradox_active_currency', currencyCode);
        }
      }
    }
  } catch (e) {
    // Ignore Storage errors in SSR or restricted environments
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(value);
};

/**
 * Formats a Date object or ISO string into a clean date-only format (e.g. YYYY-MM-DD).
 */
export const formatDateOnly = (date: Date | string | any): string => {
  if (!date) return '';
  const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats a Date into standard readable table display (e.g. May 24, 2026).
 */
export const formatReadableDate = (date: Date | string | any): string => {
  if (!date) return '';
  const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Exports an array of trade objects to a clean downloadable CSV file.
 */
export const exportToCSV = (trades: any[], filename = 'tradox_trades.csv') => {
  if (!trades || !trades.length) return;

  const headers = [
    'Date',
    'Symbol',
    'Direction',
    'Entry Price',
    'Exit Price',
    'Position Size',
    'P&L ($)',
    'Strategy',
    'Outcome',
    'Notes'
  ];

  const rows = trades.map((t) => {
    const tradeDate = formatDateOnly(t.timestamp || t.date);
    return [
      tradeDate,
      t.symbol.toUpperCase(),
      t.direction,
      t.entryPrice,
      t.exitPrice,
      t.positionSize,
      t.pnl,
      `"${(t.strategy || 'None').replace(/"/g, '""')}"`,
      t.outcome,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ];
  });

  const csvContent = 
    'data:text/csv;charset=utf-8,' + 
    [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Computes statistics from an array of trades.
 */
export const calculateStats = (trades: any[]) => {
  const totalTrades = trades.length;
  
  if (totalTrades === 0) {
    return {
      totalPnl: 0,
      tradeCount: 0,
      winRate: 0,
      avgWin: 0,
      bestTrade: 0
    };
  }

  let totalPnl = 0;
  let winCount = 0;
  let winSum = 0;
  let bestTrade = -Infinity;

  trades.forEach((t) => {
    const pnl = Number(t.pnl || 0);
    totalPnl += pnl;
    
    if (t.outcome === 'Win' || pnl > 0) {
      winCount++;
      winSum += pnl;
    }
    
    if (pnl > bestTrade) {
      bestTrade = pnl;
    }
  });

  const winRate = (winCount / totalTrades) * 100;
  const avgWin = winCount > 0 ? winSum / winCount : 0;

  return {
    totalPnl,
    tradeCount: totalTrades,
    winRate: Math.round(winRate * 10) / 10,
    avgWin,
    bestTrade: bestTrade === -Infinity ? 0 : bestTrade
  };
};
