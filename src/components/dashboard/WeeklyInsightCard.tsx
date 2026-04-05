import { BrainCircuit } from 'lucide-react';
import { WeeklyInsight } from '@/lib/types';

interface WeeklyInsightCardProps {
  insight: WeeklyInsight | null;
}

export default function WeeklyInsightCard({ insight }: WeeklyInsightCardProps) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '0.5px solid var(--border-color)',
      borderRadius: '14px', padding: '24px',
      boxShadow: 'var(--shadow-card)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        fontSize: '14px', color: 'var(--text-placeholder)', fontWeight: 500, marginBottom: '16px',
      }}>
        <BrainCircuit size={16} strokeWidth={1.8} color="var(--text-placeholder)" />
        Coa の週次レポート
      </div>

      {insight ? (
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-placeholder)', marginBottom: '12px' }}>
            週平均スコア:{' '}
            <span style={{ color: 'var(--text-green)', fontWeight: 600 }}>
              {insight.avg_score ? Math.round(Number(insight.avg_score)) : '–'}
            </span>
          </div>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>
            {insight.insight_text}
          </p>
        </div>
      ) : (
        <p style={{ fontSize: '14px', color: 'var(--text-placeholder)', margin: 0, lineHeight: 1.7 }}>
          日曜日にログインすると、Coaが今週を振り返ります。
        </p>
      )}
    </div>
  );
}
