'use client';

const EMOTION_TAGS = [
  { label: '穏やか', category: 'positive' },
  { label: '落ち着いている', category: 'positive' },
  { label: 'やる気がある', category: 'positive' },
  { label: '集中できている', category: 'positive' },
  { label: '楽しい', category: 'positive' },
  { label: '充実している', category: 'positive' },
  { label: '感謝', category: 'positive' },
  { label: 'ワクワク', category: 'positive' },
  { label: '疲れた', category: 'negative' },
  { label: 'だるい', category: 'negative' },
  { label: '不安', category: 'negative' },
  { label: 'イライラ', category: 'negative' },
  { label: '空虚', category: 'negative' },
  { label: '孤独', category: 'negative' },
];

interface EmotionTagsProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export default function EmotionTags({ selected, onChange }: EmotionTagsProps) {
  const toggle = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter(t => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {EMOTION_TAGS.map(({ label }) => {
        const isSelected = selected.includes(label);
        return (
          <button
            key={label}
            type="button"
            onClick={() => toggle(label)}
            style={{
              padding: '5px 14px',
              borderRadius: '9999px',
              border: isSelected ? '1.5px solid #2D8A5F' : '0.5px solid var(--border-color)',
              background: isSelected ? '#E8F5EF' : '#FFFFFF',
              color: isSelected ? '#1A5C3E' : '#6B6660',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
