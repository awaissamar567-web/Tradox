import React from 'react';

interface TradoxLogoProps {
  className?: string;
  size?: number;
}

export const TradoxLogo: React.FC<TradoxLogoProps> = ({ className = '', size = 32 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      {/* Orange rounded square backdrop */}
      <rect x="20" y="20" width="60" height="60" rx="16" fill="#FF6B00" />
      
      {/* Black 4-pointed outer star with rounded tips extending outside the orange square */}
      <path 
        d="M50 10C50 30 30 50 10 50C30 50 50 70 50 90C50 70 70 50 90 50C70 50 50 30 50 10Z" 
        fill="#0C0C0E" 
      />
      
      {/* Inner hollow orange star that aligns with the backdrop */}
      <path 
        d="M50 32C50 42 42 50 32 50C42 50 50 58 50 68C50 58 58 50 68 50C58 50 50 42 50 32Z" 
        fill="#FF6B00" 
      />
    </svg>
  );
};

export default TradoxLogo;
