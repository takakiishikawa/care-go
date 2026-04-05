'use client';

import { useState } from 'react';
import { WeeklyInsight } from '@/lib/types';

interface WeeklyInsightCardProps {
  insight: WeeklyInsight | null;
}

export default function WeeklyInsightCard({ insight }: WeeklyInsightCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentInsight, setCurrentInsight] = useState<WeeklyInsight | null>(insight);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/insights', { method: 'POST' });
      const data = await res.json();
      if (data.insight) setCurrentInsight(data.insight);
    } catch {
      // エラーは無視
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{
      background: '#FFFFFF',
      border: '0.5px solid var(--border-color)',
      borderRadius: '14px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', color: '#A09B92', fontWeight: 500 }}>
          週次AIインサイト
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{
            background: 'transparent',
            color: '#2D8A5F',
            border: '0.5px solid #9AD4B3',
            borderRadius: '10px',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 500,
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            opacity: isGenerating ? 0.6 : 1,
          }}
        >
          {isGenerating ? '生成中...' : '今週のインサイトを生成'}
        </button>
      </div>

      {currentInsight ? (
        <div>
          <div style={{ fontSize: '11px', color: '#A09B92', marginBottom: '10px' }}>
            週平均スコア: <span style={{ color: '#2D8A5F', fontWeight: 500 }}>{currentInsight.avg_score ? Math.round(Number(currentInsight.avg_score)) : '–'}</span>
          </div>
          <p style={{ fontSize: '14px', color: '#2E2B28', lineHeight: 1.8, margin: 0 }}>
            {currentInsight.insight_text}
          </p>
        </div>
      ) : (
        <p style={{ fontSize: '13px', color: '#A09B92', margin: 0, lineHeight: 1.7 }}>
          まだインサイトがありません。7日分のチェックインが溜まったら生成できます。
        </p>
      )}
    </div>
  );
}
