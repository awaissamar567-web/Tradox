import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, isFirebaseConfigured } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy
} from 'firebase/firestore';

export interface Trade {
  id: string;
  symbol: string;
  direction: 'Long' | 'Short';
  entryPrice: number;
  exitPrice: number;
  positionSize: number;
  pnl: number;
  strategy: string;
  outcome: 'Win' | 'Loss' | 'BE';
  notes: string;
  mindset: string;
  timestamp: any; // Date, Timestamp or string
}

export interface Strategy {
  id: string;
  name: string;
  timeframe: string;
  riskReward: string;
  rules: string;
  timestamp: any;
}

export interface MindsetLog {
  id: string;
  emotion: string;
  notes: string;
  date: string;
  timestamp: any;
}

export interface WeeklyReview {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  pnlData: { [date: string]: number };
  whatWorked: string;
  whatToImprove: string;
  goalNextWeek: string;
  timestamp: any;
}

export const useData = () => {
  const { user } = useAuth();
  
  const [trades, setTrades] = useState<Trade[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [mindsetLogs, setMindsetLogs] = useState<MindsetLog[]>([]);
  const [weeklyReviews, setWeeklyReviews] = useState<WeeklyReview[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Mock generation omitted (pre-logs removed for production-ready empty state)

  // Fetch all collections
  useEffect(() => {
    if (!user) {
      setTrades([]);
      setStrategies([]);
      setMindsetLogs([]);
      setWeeklyReviews([]);
      setLoadingData(false);
      return;
    }

    const uid = user.uid;

    const fetchData = async () => {
      setLoadingData(true);
      if (isFirebaseConfigured && db) {
        try {
          // Fetch Trades
          const qTrades = query(collection(db, 'users', uid, 'trades'), orderBy('timestamp', 'desc'));
          const snapTrades = await getDocs(qTrades);
          const loadedTrades = snapTrades.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          })) as Trade[];
          setTrades(loadedTrades);

          // Fetch Strategies
          const qStrats = query(collection(db, 'users', uid, 'strategies'), orderBy('timestamp', 'desc'));
          const snapStrats = await getDocs(qStrats);
          const loadedStrats = snapStrats.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          })) as Strategy[];
          setStrategies(loadedStrats);

          // Fetch Mindset Logs
          const qMindset = query(collection(db, 'users', uid, 'mindset'), orderBy('timestamp', 'desc'));
          const snapMindset = await getDocs(qMindset);
          const loadedMindset = snapMindset.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          })) as MindsetLog[];
          setMindsetLogs(loadedMindset);

          // Fetch Weekly Reviews
          const qReviews = query(collection(db, 'users', uid, 'weeklyReviews'), orderBy('timestamp', 'desc'));
          const snapReviews = await getDocs(qReviews);
          const loadedReviews = snapReviews.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          })) as WeeklyReview[];
          setWeeklyReviews(loadedReviews);

        } catch (error) {
          console.error("Firestore retrieval error: ", error);
        } finally {
          setLoadingData(false);
        }
      } else {
        // LOCAL STORAGE FALLBACK
        const localTrades = localStorage.getItem(`edgelog_trades_${uid}`);
        const localStrats = localStorage.getItem(`edgelog_strategies_${uid}`);
        const localMindset = localStorage.getItem(`edgelog_mindset_${uid}`);
        const localReviews = localStorage.getItem(`edgelog_reviews_${uid}`);

        // Fallback loads from localStorage, starting empty if null
        setTrades(localTrades ? JSON.parse(localTrades) : []);
        setStrategies(localStrats ? JSON.parse(localStrats) : []);
        setMindsetLogs(localMindset ? JSON.parse(localMindset) : []);
        setWeeklyReviews(localReviews ? JSON.parse(localReviews) : []);
        
        // Short artificial visual delay for local queries to feel realistic
        setTimeout(() => {
          setLoadingData(false);
        }, 400);
      }
    };

    fetchData();
  }, [user]);

  // ADD TRADE
  const addTrade = async (trade: Omit<Trade, 'id'>) => {
    if (!user) return;
    const uid = user.uid;

    if (isFirebaseConfigured && db) {
      const docRef = await addDoc(collection(db, 'users', uid, 'trades'), {
        ...trade,
        timestamp: new Date()
      });
      const newTrade = { id: docRef.id, ...trade, timestamp: new Date() } as Trade;
      setTrades((prev) => [newTrade, ...prev]);
    } else {
      const newTrade = {
        id: 'trade-' + Math.random().toString(36).substring(2, 9),
        ...trade,
        timestamp: new Date().toISOString()
      } as Trade;
      const updated = [newTrade, ...trades];
      setTrades(updated);
      localStorage.setItem(`edgelog_trades_${uid}`, JSON.stringify(updated));
    }
  };

  // DELETE TRADE
  const deleteTrade = async (tradeId: string) => {
    if (!user) return;
    const uid = user.uid;

    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, 'users', uid, 'trades', tradeId));
      setTrades((prev) => prev.filter((t) => t.id !== tradeId));
    } else {
      const updated = trades.filter((t) => t.id !== tradeId);
      setTrades(updated);
      localStorage.setItem(`edgelog_trades_${uid}`, JSON.stringify(updated));
    }
  };

  // ADD STRATEGY
  const addStrategy = async (strategy: Omit<Strategy, 'id'>) => {
    if (!user) return;
    const uid = user.uid;

    if (isFirebaseConfigured && db) {
      const docRef = await addDoc(collection(db, 'users', uid, 'strategies'), {
        ...strategy,
        timestamp: new Date()
      });
      const newStrat = { id: docRef.id, ...strategy, timestamp: new Date() } as Strategy;
      setStrategies((prev) => [newStrat, ...prev]);
    } else {
      const newStrat = {
        id: 'strat-' + Math.random().toString(36).substring(2, 9),
        ...strategy,
        timestamp: new Date().toISOString()
      } as Strategy;
      const updated = [newStrat, ...strategies];
      setStrategies(updated);
      localStorage.setItem(`edgelog_strategies_${uid}`, JSON.stringify(updated));
    }
  };

  // ADD MINDSET LOG
  const addMindsetLog = async (log: Omit<MindsetLog, 'id'>) => {
    if (!user) return;
    const uid = user.uid;

    if (isFirebaseConfigured && db) {
      const docRef = await addDoc(collection(db, 'users', uid, 'mindset'), {
        ...log,
        timestamp: new Date()
      });
      const newLog = { id: docRef.id, ...log, timestamp: new Date() } as MindsetLog;
      setMindsetLogs((prev) => [newLog, ...prev]);
    } else {
      const newLog = {
        id: 'mind-' + Math.random().toString(36).substring(2, 9),
        ...log,
        timestamp: new Date().toISOString()
      } as MindsetLog;
      const updated = [newLog, ...mindsetLogs];
      setMindsetLogs(updated);
      localStorage.setItem(`edgelog_mindset_${uid}`, JSON.stringify(updated));
    }
  };

  // ADD WEEKLY REVIEW
  const addWeeklyReview = async (review: Omit<WeeklyReview, 'id'>) => {
    if (!user) return;
    const uid = user.uid;

    if (isFirebaseConfigured && db) {
      const docRef = await addDoc(collection(db, 'users', uid, 'weeklyReviews'), {
        ...review,
        timestamp: new Date()
      });
      const newReview = { id: docRef.id, ...review, timestamp: new Date() } as WeeklyReview;
      setWeeklyReviews((prev) => [newReview, ...prev]);
    } else {
      const newReview = {
        id: 'review-' + Math.random().toString(36).substring(2, 9),
        ...review,
        timestamp: new Date().toISOString()
      } as WeeklyReview;
      const updated = [newReview, ...weeklyReviews];
      setWeeklyReviews(updated);
      localStorage.setItem(`edgelog_reviews_${uid}`, JSON.stringify(updated));
    }
  };

  return {
    trades,
    strategies,
    mindsetLogs,
    weeklyReviews,
    loadingData,
    addTrade,
    deleteTrade,
    addStrategy,
    addMindsetLog,
    addWeeklyReview
  };
};
