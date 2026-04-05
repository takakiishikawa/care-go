'use client';

import { useState } from 'react';

const EMOTION_TAGS = [
  '穏やか', '落ち着いている', 'やる気がある', '集中できている',
  '楽しい', '充実している', '感謝', 'ワクワク',
  '疲れた', 'だるい', '不安', 'イライラ', '空虚', '孤独',
];

interface EmotionTagsProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

function TagButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        padding: '6px 16px', borderRadius: '9999px',
        border: selected ? '1.5px solid #2D8A5F' : `0.5px solid ${hovered ? 'rgba(46,43,40,0.25)' : 'var(--border-color)'}`,
        background: selected ? '#E8F5EF' : hovered ? '#F8F6F2' : '#FFFFFF',
        color: selected ? '#1A5C3E' : hovered ? '#2E2B28' : '#6B6660',
        fontSize: '14px', fontWeight: selected ? 500 : 400,
        cursor: 'pointer',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        transition: 'all 0.15s ease',
      }}
    >
      {label}
    </button>
  );
}

export default function EmotionTags({ selected, onChange }: EmotionTagsProps) {
  const toggle = (tag: string) => {
    onChange(selected.includes(tag) ? selected.filter(t => t !== tag) : [...selected, tag]);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {EMOTION_TAGS.map(label => (
        <TagButton key={label} label={label} selected={selected.includes(label)} onClick={() => toggle(label)} />
      ))}
    </div>
  );
}
