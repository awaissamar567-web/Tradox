import React from 'react';
import { CheckCircle2, AlertOctagon, Info } from 'lucide-react';

interface ToastProps {
  text: string;
  type?: 'success' | 'error' | 'info';
}

const Toast: React.FC<ToastProps> = ({ text, type = 'success' }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-greenPnl shrink-0" />;
      case 'error':
        return <AlertOctagon className="w-4 h-4 text-redPnl shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-accent shrink-0" />;
    }
  };

  return (
    <div className="toast-in flex items-center gap-3 px-4 py-3 bg-bgElevated border-l-[3px] border-accent rounded-r shadow-2xl min-w-[280px] max-w-[380px] pointer-events-auto select-none">
      {getIcon()}
      <span className="font-dmsans text-[13px] text-textPrimary tracking-wide font-light">
        {text}
      </span>
    </div>
  );
};

export default Toast;
