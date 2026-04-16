'use client';

import { useState } from 'react';

const EMOTION_TAGS = [
  // ポジティブ
  '穏やか', 'リラックス', '落ち着いている', '前向き',
  'やる気がある', '集中できている', '自信がある', 'スッキリしている',
  '楽しい', '充実している', 'ワクワク', '感謝',
  '達成感', '希望がある', 'つながりを感じる',
  // ネガティブ
  '疲れた', 'だるい', '眠い', '体が重い',
  '不安', 'モヤモヤ', '焦り', 'プレッシャー',
  'イライラ', '落ち込んでいる', '悲しい', '空虚', '孤独',
];

const POSITIVE_TAGS = new Set([
  '穏やか', 'リラックス', '落ち着いている', '前向き',
  'やる気がある', '集中できている', '自信がある', 'スッキリしている',
  '楽しい', '充実している', 'ワクワク', '感謝', '達成感', '希望がある', 'つながりを感じる',
]);

interface EmotionTagsProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

function TagButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const isPositive = POSITIVE_TAGS.has(label);

  const selectedBg = isPositive ? 'var(--bg-green)' : 'var(--bg-amber)';
  const selectedBorder = isPositive ? 'var(--border-green)' : 'var(--border-amber)';
  const selectedColor = isPositive ? 'var(--text-green-dark)' : 'var(--text-amber-dark)';

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '6px 14px', borderRadius: 'var(--radius-full)',
        border: selected
          ? `1.5px solid ${selectedBorder}`
          : `1px solid ${hovered ? 'var(--border-color-hover)' : 'var(--border-color)'}`,
        background: selected ? selectedBg : hovered ? 'var(--bg-subtle)' : 'transparent',
        color: selected ? selectedColor : hovered ? 'var(--text-secondary)' : 'var(--text-muted)',
        fontSize: '13px', fontWeight: selected ? 600 : 400,
        cursor: 'pointer',
        transform: selected ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.15s ease',
        letterSpacing: '-0.01em',
        boxShadow: selected ? 'var(--shadow-xs)' : 'none',
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
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
      {EMOTION_TAGS.map(label => (
        <TagButton key={label} label={label} selected={selected.includes(label)} onClick={() => toggle(label)} />
      ))}
    </div>
  );
}
