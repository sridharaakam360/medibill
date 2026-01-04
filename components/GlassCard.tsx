import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hoverEffect = false }) => {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl 
        border border-slate-200 dark:border-glass-border
        bg-white/70 dark:bg-glass-100 
        backdrop-blur-md shadow-lg
        transition-all duration-300
        ${hoverEffect ? 'hover:bg-white/90 dark:hover:bg-glass-200 hover:shadow-xl hover:scale-[1.01]' : ''}
        ${className}
      `}
    >
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 pointer-events-none" />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};