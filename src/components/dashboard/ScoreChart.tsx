'use client';

import { DailyScore } from '@/lib/types';

interface ScoreChartProps {
  data: DailyScore[];
}

export default function ScoreChart({ data }: ScoreChartProps) {
  const today = new Date().toISOString().split('T')[0];
  const maxScore = 100;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '120px', marginBottom: '8px' }}>
        {data.map((day) => {
          const isToday = day.date === today;
          const score = day.score ?? 0;
          const height = score > 0 ? Math.max((score / maxScore) * 100, 4) : 4;
          const hasData = day.score !== null;

          return (
            <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '100%', position: 'relative', height: '100px', display: 'flex', alignItems: 'flex-end' }}>
                {hasData && (
                  <div
                    title={`${score}点`}
                    style={{
                      width: '100%',
                      height: `${height}%`,
                      background: isToday ? '#2D8A5F' : '#9AD4B3',
                      borderRadius: '3px 3px 0 0',
                      transition: 'height 0.3s ease',
                    }}
                  />
                )}
                {!hasData && (
                  <div style={{ width: '100%', height: '4px', background: '#EEECE8', borderRadius: '3px 3px 0 0' }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {data.map((day) => {
          const isToday = day.date === today;
          const date = new Date(day.date + 'T00:00:00');
          const label = isToday ? '今日' : `${date.getMonth() + 1}/${date.getDate()}`;
          return (
            <div key={day.date} style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: isToday ? '#2D8A5F' : '#A09B92', fontWeight: isToday ? 500 : 400 }}>
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
