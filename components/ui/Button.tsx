import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-app-blue hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20",
    secondary: "bg-app-card hover:bg-gray-800 text-white border border-gray-700",
    danger: "bg-app-red hover:bg-red-600 text-white",
    ghost: "bg-transparent hover:bg-white/5 text-app-textSec hover:text-white"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-12 px-6 text-sm",
    lg: "h-14 px-8 text-base"
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};