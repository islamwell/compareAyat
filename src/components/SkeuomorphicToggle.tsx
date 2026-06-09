import React from 'react';

interface SkeuomorphicToggleProps {
  leftLabel: string;
  rightLabel: string;
  isRight: boolean; // if true, knob is on the right (shows leftLabel)
  onToggle: () => void;
  leftColorTop?: string;
  leftColorBottom?: string;
  rightColorTop?: string;
  rightColorBottom?: string;
}

export const SkeuomorphicToggle: React.FC<SkeuomorphicToggleProps> = ({
  leftLabel,
  rightLabel,
  isRight,
  onToggle,
  leftColorTop = '#84c53c', 
  leftColorBottom = '#609827',
  rightColorTop = '#e9534f',
  rightColorBottom = '#ba322f'
}) => {
  return (
    <div 
      onClick={onToggle}
      className="relative flex items-center cursor-pointer select-none"
      style={{
        width: '90px',
        height: '34px',
        borderRadius: '17px',
        backgroundColor: '#e6e6e6',
        boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.8)',
        overflow: 'hidden'
      }}
    >
      {/* Background Track with Sliding Colors */}
      <div 
        className="absolute top-0 bottom-0 flex transition-transform duration-300 ease-in-out"
        style={{
          width: '200%',
          transform: isRight ? 'translateX(0%)' : 'translateX(-50%)',
        }}
      >
        <div className="flex-1 h-full flex items-center justify-center relative" style={{ background: `linear-gradient(to bottom, ${leftColorTop}, ${leftColorBottom})`, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}>
          <span className="font-bold text-white text-xs" style={{ textShadow: '0 -1px 0 rgba(0,0,0,0.5)', paddingRight: '20px' }}>{leftLabel}</span>
        </div>
        <div className="flex-1 h-full flex items-center justify-center relative" style={{ background: `linear-gradient(to bottom, ${rightColorTop}, ${rightColorBottom})`, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}>
          <span className="font-bold text-white text-xs" style={{ textShadow: '0 -1px 0 rgba(0,0,0,0.5)', paddingLeft: '20px' }}>{rightLabel}</span>
        </div>
      </div>

      {/* The Knob */}
      <div 
        className="absolute top-0 w-[34px] h-[34px] rounded-full transition-transform duration-300 ease-in-out z-10"
        style={{
          transform: isRight ? 'translateX(56px)' : 'translateX(0px)',
          background: 'linear-gradient(to bottom, #f9f9f9, #d0d0d0)',
          boxShadow: '-1px 0 3px rgba(0,0,0,0.3), 1px 0 3px rgba(0,0,0,0.3), inset 0 1px 0 #ffffff',
          border: '1px solid #b0b0b0',
        }}
      >
        <div 
          className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full border border-gray-400"
          style={{ transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, #f0f0f0, #c0c0c0)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3), 0 1px 0 #fff' }}
        />
      </div>
    </div>
  );
};
