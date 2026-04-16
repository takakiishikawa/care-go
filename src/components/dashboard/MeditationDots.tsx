'use client';

import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { DailyMeditation } from '@/lib/types';

interface MeditationDotsProps {
  data: DailyMeditation[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)', padding: '7px 12px',
      boxShadow: 'var(--shadow-dropdown)', textAlign: 'center',
    }}>
      <div style={{ fontSize: '11px', color: 'var(--text-placeholder)', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '16px', fontWeight: 700, color: (val as number) > 0 ? 'var(--accent-amber)' : 'var(--text-placeholder)', letterSpacing: '-0.02em' }}>
        {(val as number) > 0 ? `${val}回` : '–'}
      </div>
    </div>
  );
}

export default function MeditationDots({ data }: MeditationDotsProps) {
  const today = new Date().toISOString().split('T')[0];

  const chartData = data.map(d => {
    const isToday = d.date === today;
    const date = new Date(d.date + 'T00:00:00');
    const label = isToday ? '今日' : `${date.getMonth() + 1}/${date.getDate()}`;
    return { label, count: d.count, isToday };
  });

  return (
    <div style={{ width: '100%', height: 100 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }} barSize={28}>
          <XAxis
            dataKey="label"
            tick={({ x, y, payload }) => {
              const item = chartData.find(d => d.label === payload.value);
              return (
                <text
                  x={x} y={(y as number) + 14} textAnchor="middle"
                  fontSize={12}
                  fill={item?.isToday ? 'var(--accent-amber)' : 'var(--text-placeholder)'}
                  fontWeight={item?.isToday ? 600 : 400}
                  fontFamily="DM Sans, system-ui, sans-serif"
                >
                  {payload.value}
                </text>
              );
            }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-subtle)' }} />
          <Bar dataKey="count" radius={[6, 6, 2, 2]} minPointSize={3}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.count >= 2
                    ? 'var(--accent-amber)'
                    : entry.count === 1
                      ? '#FDE68A'
                      : 'var(--bg-muted)'
                }
                stroke={entry.count >= 1 ? 'var(--border-amber)' : 'transparent'}
                strokeWidth={entry.count >= 1 ? 1 : 0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
