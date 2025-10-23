import React from 'react';

interface RetroButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  className?: string;
}

export const RetroButton: React.FC<RetroButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
}) => {
  const baseStyles = 'px-6 py-3 font-mono text-lg uppercase tracking-wider border-2 transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-green-500 border-green-300 text-black hover:bg-green-400 active:translate-y-0.5',
    secondary: 'bg-transparent border-green-500 text-green-500 hover:bg-green-500 hover:text-black active:translate-y-0.5',
    danger: 'bg-red-500 border-red-300 text-black hover:bg-red-400 active:translate-y-0.5',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};
