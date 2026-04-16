'use client';

import { DailyMeditation } from '@/lib/types';

interface MeditationDotsProps {
  data: DailyMeditation[];
}

export default function MeditationDots({ data }: MeditationDotsProps) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end' }}>
      {data.map(d => {
        const isToday = d.date === today;
        const date = new Date(d.date + 'T00:00:00');
        const label = isToday ? '今日' : `${date.getMonth() + 1}/${date.getDate()}`;

        const dotBg = d.count >= 2
          ? 'var(--accent-amber)'
          : d.count === 1
            ? '#FDE68A'
            : 'var(--bg-muted)';
        const dotBorder = d.count >= 1 ? 'var(--border-amber)' : 'var(--border-color)';

        return (
          <div key={d.date} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
          }}>
            {/* 回数 */}
            <div style={{
              fontSize: '13px', fontWeight: d.count > 0 ? 700 : 400,
              color: d.count > 0 ? 'var(--text-amber)' : 'var(--text-placeholder)',
              letterSpacing: '-0.02em', height: '18px',
              display: 'flex', alignItems: 'center',
            }}>
              {d.count > 0 ? `${d.count}` : '–'}
            </div>

            {/* ドット */}
            <div style={{
              width: '32px', height: '32px', borderRadius: 'var(--radius-full)',
              background: dotBg, border: `1.5px solid ${dotBorder}`,
              flexShrink: 0,
              boxShadow: d.count > 0 ? 'var(--shadow-amber)' : 'none',
              transition: 'all 0.15s ease',
            }} />

            {/* 日付 */}
            <div style={{
              fontSize: '12px',
              color: isToday ? 'var(--accent-amber)' : 'var(--text-placeholder)',
              fontWeight: isToday ? 700 : 400,
              letterSpacing: '-0.01em',
            }}>
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
