'use client';

import { DailyScore } from '@/lib/types';

interface ScoreLineChartProps {
  data: DailyScore[];
}

const W = 480;
const H = 110;
const PAD = { top: 15, right: 8, bottom: 28, left: 8 };
const CHART_W = W - PAD.left - PAD.right;
const CHART_H = H - PAD.top - PAD.bottom;
const MAX_SCORE = 100;

function xPos(i: number, total: number): number {
  return PAD.left + (total === 1 ? CHART_W / 2 : (i / (total - 1)) * CHART_W);
}

function yPos(value: number): number {
  return PAD.top + (1 - value / MAX_SCORE) * CHART_H;
}

export default function ScoreLineChart({ data }: ScoreLineChartProps) {
  const today = new Date().toISOString().split('T')[0];

  // Build point groups (split at null values)
  type Pt = { x: number; y: number };
  const groups: Pt[][] = [];
  let cur: Pt[] = [];

  data.forEach((d, i) => {
    if (d.score !== null) {
      cur.push({ x: xPos(i, data.length), y: yPos(d.score) });
    } else if (cur.length > 0) {
      groups.push(cur);
      cur = [];
    }
  });
  if (cur.length > 0) groups.push(cur);

  const baseline = PAD.top + CHART_H;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2D8A5F" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#2D8A5F" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* グリッドライン（50点） */}
        <line
          x1={PAD.left} y1={yPos(50)} x2={W - PAD.right} y2={yPos(50)}
          stroke="#EEECE8" strokeWidth="1" strokeDasharray="4 4"
        />

        {/* エリア + ライン */}
        {groups.map((group, gi) => {
          if (group.length === 0) return null;

          const linePath = group.map((p, pi) =>
            `${pi === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
          ).join(' ');

          const areaPath = group.map((p, pi) =>
            `${pi === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
          ).join(' ')
            + ` L ${group[group.length - 1].x.toFixed(1)} ${baseline}`
            + ` L ${group[0].x.toFixed(1)} ${baseline} Z`;

          return (
            <g key={gi}>
              <path d={areaPath} fill="url(#scoreGradient)" />
              <path d={linePath} fill="none" stroke="#2D8A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        })}

        {/* ドット */}
        {data.map((d, i) => {
          if (d.score === null) return null;
          const cx = xPos(i, data.length);
          const cy = yPos(d.score);
          const isToday = d.date === today;
          return (
            <circle
              key={d.date}
              cx={cx} cy={cy}
              r={isToday ? 5 : 3.5}
              fill={isToday ? '#2D8A5F' : '#FFFFFF'}
              stroke="#2D8A5F"
              strokeWidth={isToday ? 0 : 2}
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
              fill={isToday ? '#2D8A5F' : '#A09B92'}
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
