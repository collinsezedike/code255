import React from 'react';

export const ScanlineOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute inset-0 opacity-10 scanlines"></div>
    </div>
  );
};
