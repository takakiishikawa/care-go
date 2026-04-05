'use client';

import { useState } from 'react';

const MOOD_LABELS: Record<number, string> = {
  1: '最悪', 2: '低め', 3: '普通', 4: '良い', 5: '最高',
};
const MOOD_EMOJIS: Record<number, string> = {
  1: '😞', 2: '😕', 3: '😐', 4: '😊', 5: '😄',
};

interface MoodSelectorProps {
  value: number | null;
  onChange: (score: number) => void;
}

function MoodButton({ score, selected, onClick }: { score: number; selected: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onClick={onClick}
      type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        flex: 1, padding: '16px 8px', borderRadius: '10px',
        border: selected ? '2px solid #2D8A5F' : `0.5px solid ${hovered ? 'rgba(46,43,40,0.25)' : 'var(--border-color)'}`,
        background: selected ? '#E8F5EF' : hovered ? '#F8F6F2' : '#FFFFFF',
        color: selected ? '#1A5C3E' : '#6B6660',
        cursor: 'pointer', textAlign: 'center',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{ fontSize: '24px', marginBottom: '6px' }}>{MOOD_EMOJIS[score]}</div>
      <div style={{ fontSize: '14px', fontWeight: 600, color: selected ? '#1A5C3E' : '#2E2B28' }}>{score}</div>
      <div style={{ fontSize: '12px', color: selected ? '#2D8A5F' : '#A09B92', marginTop: '2px' }}>{MOOD_LABELS[score]}</div>
    </button>
  );
}

export default function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {[1, 2, 3, 4, 5].map(score => (
        <MoodButton key={score} score={score} selected={value === score} onClick={() => onChange(score)} />
      ))}
    </div>
  );
}
