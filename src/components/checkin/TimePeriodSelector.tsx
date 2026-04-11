'use client';

import { Moon, Sunrise, Sun, CloudSun, Sunset, MoonStar, TrendingUp, Minus, TrendingDown } from 'lucide-react';
import { Rating, TimePeriodRatings, CheckinTiming } from '@/lib/types';

interface Period {
  key: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
}

const MORNING_PERIODS: Period[] = [
  { key: 'last_night', label: '昨夜', Icon: Moon },
  { key: 'this_morning', label: '今朝', Icon: Sunrise },
];

const EVENING_PERIODS: Period[] = [
  { key: 'morning', label: '午前', Icon: Sun },
  { key: 'afternoon', label: '午後', Icon: CloudSun },
  { key: 'evening', label: '夕方', Icon: Sunset },
  { key: 'night', label: '夜', Icon: MoonStar },
];

const RATINGS: Array<{
  value: Rating;
  label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
  selectedColor: string;
  selectedBg: string;
  selectedBorder: string;
}> = [
  {
    value: 'A',
    label: '良い',
    Icon: TrendingUp,
    selectedColor: 'var(--text-green)',
    selectedBg: 'var(--bg-green)',
    selectedBorder: 'var(--border-green)',
  },
  {
    value: 'B',
    label: '普通',
    Icon: Minus,
    selectedColor: 'var(--text-muted)',
    selectedBg: 'var(--bg-muted)',
    selectedBorder: 'var(--border-muted)',
  },
  {
    value: 'C',
    label: '悪い',
    Icon: TrendingDown,
    selectedColor: 'var(--text-amber)',
    selectedBg: 'var(--bg-amber)',
    selectedBorder: 'var(--border-amber)',
  },
];

interface TimePeriodSelectorProps {
  timing: CheckinTiming;
  ratings: TimePeriodRatings;
  onChange: (ratings: TimePeriodRatings) => void;
}

export default function TimePeriodSelector({ timing, ratings, onChange }: TimePeriodSelectorProps) {
  const periods = timing === 'morning' ? MORNING_PERIODS : EVENING_PERIODS;

  const handleSelect = (periodKey: string, rating: Rating) => {
    onChange({ ...ratings, [periodKey]: rating });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {periods.map(({ key, label, Icon }) => {
        const selected = ratings[key] as Rating | undefined;
        return (
          <div key={key} style={{
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            {/* Period label */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              minWidth: '60px', flexShrink: 0,
            }}>
              <Icon size={15} strokeWidth={1.8} color="var(--text-placeholder)" />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
                {label}
              </span>
            </div>

            {/* Rating buttons */}
            <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
              {RATINGS.map(({ value, label: rLabel, Icon: RIcon, selectedColor, selectedBg, selectedBorder }) => {
                const isSelected = selected === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleSelect(key, value)}
                    style={{
                      flex: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                      padding: '9px 8px',
                      border: `0.5px solid ${isSelected ? selectedBorder : 'var(--border-color)'}`,
                      borderRadius: '10px',
                      background: isSelected ? selectedBg : 'var(--bg-subtle)',
                      color: isSelected ? selectedColor : 'var(--text-placeholder)',
                      fontSize: '13px', fontWeight: isSelected ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                      transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                      boxShadow: isSelected ? `0 0 0 1.5px ${selectedBorder}` : 'none',
                    }}
                  >
                    <RIcon size={13} strokeWidth={2} color={isSelected ? selectedColor : 'var(--text-placeholder)'} />
                    <span>{rLabel}</span>
                    <span style={{
                      fontSize: '11px', fontWeight: 700,
                      marginLeft: '1px',
                      color: isSelected ? selectedColor : 'var(--border-muted)',
                    }}>
                      {value}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
