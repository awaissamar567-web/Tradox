import { useAuth } from '../context/AuthContext';
import { useData } from './useData';

export const usePlan = () => {
  const { userPlan } = useAuth();
  const { trades, strategies } = useData();

  const plan = userPlan || 'free';
  const executionCount = trades.length;
  const canExport = plan === 'pro';
  const canAddStrategy = plan === 'pro' || strategies.length < 1;
  const historyDays = plan === 'pro' ? Infinity : 7;

  return {
    plan,
    executionCount,
    canExport,
    canAddStrategy,
    historyDays
  };
};
