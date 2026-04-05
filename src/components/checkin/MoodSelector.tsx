'use client';

const MOOD_LABELS: Record<number, string> = {
  1: '最悪',
  2: '低め',
  3: '普通',
  4: '良い',
  5: '最高',
};

interface MoodSelectorProps {
  value: number | null;
  onChange: (score: number) => void;
}

export default function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {[1, 2, 3, 4, 5].map((score) => {
        const selected = value === score;
        return (
          <button
            key={score}
            onClick={() => onChange(score)}
            type="button"
            style={{
              flex: 1,
              padding: '16px 8px',
              borderRadius: '10px',
              border: selected ? '2px solid #2D8A5F' : '0.5px solid var(--border-color)',
              background: selected ? '#E8F5EF' : '#FFFFFF',
              color: selected ? '#1A5C3E' : '#6B6660',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ fontSize: '22px', marginBottom: '6px' }}>
              {score === 1 ? '😞' : score === 2 ? '😕' : score === 3 ? '😐' : score === 4 ? '😊' : '😄'}
            </div>
            <div style={{ fontSize: '11px', fontWeight: 500 }}>{score}</div>
            <div style={{ fontSize: '11px', color: selected ? '#2D8A5F' : '#A09B92' }}>{MOOD_LABELS[score]}</div>
          </button>
        );
      })}
    </div>
  );
}
