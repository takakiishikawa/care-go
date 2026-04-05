'use client';

import { DailyMeditation } from '@/lib/types';

interface MeditationLineChartProps {
  data: DailyMeditation[];
}

const W = 480;
const H = 90;
const PAD = { top: 12, right: 8, bottom: 28, left: 8 };
const CHART_W = W - PAD.left - PAD.right;
const CHART_H = H - PAD.top - PAD.bottom;
const MAX_COUNT = 2;

function xPos(i: number, total: number): number {
  return PAD.left + (total === 1 ? CHART_W / 2 : (i / (total - 1)) * CHART_W);
}

function yPos(value: number): number {
  return PAD.top + (1 - value / MAX_COUNT) * CHART_H;
}

export default function MeditationLineChart({ data }: MeditationLineChartProps) {
  const today = new Date().toISOString().split('T')[0];
  const baseline = PAD.top + CHART_H;

  const points = data.map((d, i) => ({
    x: xPos(i, data.length),
    y: yPos(d.count),
    count: d.count,
    date: d.date,
  }));

  const linePath = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
  ).join(' ');

  const areaPath = linePath
    + ` L ${points[points.length - 1].x.toFixed(1)} ${baseline}`
    + ` L ${points[0].x.toFixed(1)} ${baseline} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id="meditationGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: 'var(--accent-amber)', stopOpacity: 0.18 }} />
            <stop offset="100%" style={{ stopColor: 'var(--accent-amber)', stopOpacity: 0 }} />
          </linearGradient>
        </defs>

        {/* エリア */}
        <path d={areaPath} fill="url(#meditationGradient)" />

        {/* ライン */}
        <path d={linePath} fill="none" style={{ stroke: 'var(--accent-amber)' }} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* ドット */}
        {points.map(p => {
          const isToday = p.date === today;
          const hasData = p.count > 0;
          return (
            <circle
              key={p.date}
              cx={p.x} cy={p.y}
              r={isToday ? 5 : 3.5}
              style={{
                fill: hasData ? (isToday ? 'var(--accent-amber)' : 'var(--bg-card)') : 'var(--bg-muted)',
                stroke: hasData ? 'var(--accent-amber)' : 'var(--border-muted)',
              }}
              strokeWidth={isToday && hasData ? 0 : 2}
            />
          );
        })}

        {/* X軸ラベル */}
        {data.map((d, i) => {
          const x = xPos(i, data.length);
          const isToday = d.date === today;
          const date = new Date(d.date + 'T00:00:00');
          const label = isToday ? '今日' : `${date.getMonth() + 1}/${date.getDate()}`;
          return (
            <text
              key={d.date}
              x={x} y={H - 4}
              textAnchor="middle"
              fontSize="11"
              style={{ fill: isToday ? 'var(--accent-amber)' : 'var(--text-placeholder)' }}
              fontWeight={isToday ? '600' : '400'}
              fontFamily="DM Sans, system-ui, sans-serif"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
