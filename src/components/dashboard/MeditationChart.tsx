'use client';

import { DailyMeditation } from '@/lib/types';

interface MeditationChartProps {
  data: DailyMeditation[];
}

export default function MeditationChart({ data }: MeditationChartProps) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '64px', marginBottom: '8px' }}>
        {data.map((day) => {
          const isToday = day.date === today;
          const height = day.count > 0 ? (day.count / 2) * 100 : 0;

          return (
            <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '100%', height: '56px', display: 'flex', alignItems: 'flex-end' }}>
                {height > 0 ? (
                  <div
                    title={`${day.count}回`}
                    style={{
                      width: '100%',
                      height: `${height}%`,
                      background: isToday ? '#C07818' : '#F5C878',
                      borderRadius: '3px 3px 0 0',
                    }}
                  />
                ) : (
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
            <div key={day.date} style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: isToday ? '#C07818' : '#A09B92', fontWeight: isToday ? 500 : 400 }}>
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
