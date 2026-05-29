import React from 'react';

interface TradoxLogoProps {
  className?: string;
  size?: number;
}

export const TradoxLogo: React.FC<TradoxLogoProps> = ({ className = '', size = 32 }) => {
  return (
    <img 
      src="/tradox_logo.png" 
      alt="Tradox Logo"
      width={size}
      height={size}
      className={`shrink-0 object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

export default TradoxLogo;
