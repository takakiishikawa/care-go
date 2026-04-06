'use client';

import { useState } from 'react';
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
const TW = 46; // tooltip width
const TH = 24; // tooltip height

function xPos(i: number, total: number): number {
  return PAD.left + (total === 1 ? CHART_W / 2 : (i / (total - 1)) * CHART_W);
}
function yPos(value: number): number {
  return PAD.top + (1 - value / MAX_SCORE) * CHART_H;
}

interface HoveredPoint { x: number; y: number; value: number; label: string }

export default function ScoreLineChart({ data }: ScoreLineChartProps) {
  const today = new Date().toISOString().split('T')[0];
  const [hovered, setHovered] = useState<HoveredPoint | null>(null);

  type Pt = { x: number; y: number };
  const groups: Pt[][] = [];
  let cur: Pt[] = [];
  data.forEach((d, i) => {
    if (d.score !== null) {
      cur.push({ x: xPos(i, data.length), y: yPos(d.score) });
    } else if (cur.length > 0) { groups.push(cur); cur = []; }
  });
  if (cur.length > 0) groups.push(cur);

  const baseline = PAD.top + CHART_H;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: 'var(--accent-green)', stopOpacity: 0.18 }} />
            <stop offset="100%" style={{ stopColor: 'var(--accent-green)', stopOpacity: 0 }} />
          </linearGradient>
        </defs>

        {/* グリッドライン */}
        <line
          x1={PAD.left} y1={yPos(50)} x2={W - PAD.right} y2={yPos(50)}
          style={{ stroke: 'var(--chart-grid)' }} strokeWidth="1" strokeDasharray="4 4"
        />

        {/* エリア + ライン */}
        {groups.map((group, gi) => {
          if (group.length === 0) return null;
          const linePath = group.map((p, pi) => `${pi === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
          const areaPath = group.map((p, pi) => `${pi === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
            + ` L ${group[group.length - 1].x.toFixed(1)} ${baseline} L ${group[0].x.toFixed(1)} ${baseline} Z`;
          return (
            <g key={gi}>
              <path d={areaPath} fill="url(#scoreGradient)" />
              <path d={linePath} fill="none" style={{ stroke: 'var(--accent-green)' }} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        })}

        {/* ドット + ヒットエリア */}
        {data.map((d, i) => {
          if (d.score === null) return null;
          const cx = xPos(i, data.length);
          const cy = yPos(d.score);
          const isToday = d.date === today;
          const date = new Date(d.date + 'T00:00:00');
          const label = isToday ? '今日' : `${date.getMonth() + 1}/${date.getDate()}`;
          return (
            <g key={d.date}>
              <circle cx={cx} cy={cy} r={isToday ? 5 : 3.5}
                style={{ fill: isToday ? 'var(--accent-green)' : 'var(--bg-card)', stroke: 'var(--accent-green)' }}
                strokeWidth={isToday ? 0 : 2}
              />
              {/* 大きめヒットエリア */}
              <circle cx={cx} cy={cy} r={14} fill="transparent" style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHovered({ x: cx, y: cy, value: d.score!, label })}
                onMouseLeave={() => setHovered(null)}
              />
            </g>
          );
        })}

        {/* X軸ラベル */}
        {data.map((d, i) => {
          const x = xPos(i, data.length);
          const isToday = d.date === today;
          const date = new Date(d.date + 'T00:00:00');
          const label = isToday ? '今日' : `${date.getMonth() + 1}/${date.getDate()}`;
          return (
            <text key={d.date} x={x} y={H - 4} textAnchor="middle" fontSize="11"
              style={{ fill: isToday ? 'var(--accent-green)' : 'var(--text-placeholder)' }}
              fontWeight={isToday ? '600' : '400'} fontFamily="DM Sans, system-ui, sans-serif">
              {label}
            </text>
          );
        })}

        {/* Tooltip */}
        {hovered && (() => {
          const tx = Math.min(Math.max(hovered.x - TW / 2, PAD.left), W - PAD.right - TW);
          const ty = hovered.y - TH - 8 < PAD.top ? hovered.y + 10 : hovered.y - TH - 8;
          return (
            <g style={{ pointerEvents: 'none' }}>
              <rect x={tx} y={ty} width={TW} height={TH} rx={6}
                style={{ fill: 'var(--bg-card)', stroke: 'var(--border-color)', strokeWidth: 0.5 }}
              />
              <text x={tx + TW / 2} y={ty + TH / 2 + 4.5} textAnchor="middle" fontSize="12" fontWeight="700"
                style={{ fill: 'var(--text-primary)' }} fontFamily="DM Sans, system-ui, sans-serif">
                {hovered.value}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
