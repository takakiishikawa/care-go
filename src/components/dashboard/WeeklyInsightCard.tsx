import { BrainCircuit } from 'lucide-react';
import { WeeklyInsight } from '@/lib/types';

interface WeeklyInsightCardProps {
  insight: WeeklyInsight | null;
}

export default function WeeklyInsightCard({ insight }: WeeklyInsightCardProps) {
  return (
    <div style={{
      background: '#FFFFFF', border: '0.5px solid var(--border-color)',
      borderRadius: '14px', padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        fontSize: '14px', color: '#A09B92', fontWeight: 500, marginBottom: '16px',
      }}>
        <BrainCircuit size={16} strokeWidth={1.8} color="#A09B92" />
        Coa の週次レポート
      </div>

      {insight ? (
        <div>
          <div style={{ fontSize: '12px', color: '#A09B92', marginBottom: '12px' }}>
            週平均スコア:{' '}
            <span style={{ color: '#2D8A5F', fontWeight: 600 }}>
              {insight.avg_score ? Math.round(Number(insight.avg_score)) : '–'}
            </span>
          </div>
          <p style={{ fontSize: '16px', color: '#2E2B28', lineHeight: 1.8, margin: 0 }}>
            {insight.insight_text}
          </p>
        </div>
      ) : (
        <p style={{ fontSize: '14px', color: '#A09B92', margin: 0, lineHeight: 1.7 }}>
          日曜日にログインすると、Coaが今週を振り返ります。
        </p>
      )}
    </div>
  );
}
