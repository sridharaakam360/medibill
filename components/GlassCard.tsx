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
        relative overflow-hidden rounded-2xl border border-glass-border
        bg-glass-100 backdrop-blur-md shadow-lg
        transition-all duration-300
        ${hoverEffect ? 'hover:bg-glass-200 hover:shadow-xl hover:scale-[1.01]' : ''}
        ${className}
      `}
    >
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};