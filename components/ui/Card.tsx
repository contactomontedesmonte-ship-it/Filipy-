import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-app-card rounded-[14px] p-5 shadow-sm border border-white/5 ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''} ${className}`}
    >
      {children}
    </div>
  );
};