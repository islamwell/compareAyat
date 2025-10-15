import React from 'react';
import type { TextDiff } from '../utils';

interface AyahDisplayProps {
  text: string;
  differences?: TextDiff[];
  fontSize: number;
  highlightDifferences: boolean;
  label: string;
}

const AyahDisplay: React.FC<AyahDisplayProps> = ({
  text,
  differences,
  fontSize,
  highlightDifferences,
  label,
}) => {
  return (
    <div className="ayah-display">
      <h3 className="ayah-label">{label}</h3>
      <div className="ayah-text" style={{ fontSize: `${fontSize}px` }}>
        {highlightDifferences && differences ? (
          differences.map((diff, index) => (
            <span
              key={index}
              className={diff.isDifferent ? 'text-different' : 'text-same'}
            >
              {diff.text}{' '}
            </span>
          ))
        ) : (
          text
        )}
      </div>
    </div>
  );
};

export default AyahDisplay;
