'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isSundayHCM } from '@/lib/timing';

interface InsightPopupProps {
  weekStartStr: string;
  hasEnoughData: boolean;
}

export default function InsightPopup({ weekStartStr, hasEnoughData }: InsightPopupProps) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSundayHCM() || !hasEnoughData) return;
    const key = `insight_dismissed_${weekStartStr}`;
    if (!localStorage.getItem(key)) {
      setShow(true);
    }
  }, [weekStartStr, hasEnoughData]);

  const handleLater = () => {
    localStorage.setItem(`insight_dismissed_${weekStartStr}`, '1');
    setShow(false);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/insights', { method: 'POST' });
      if (!res.ok) throw new Error('生成に失敗しました');
      localStorage.setItem(`insight_dismissed_${weekStartStr}`, '1');
      setShow(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(26, 24, 21, 0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px',
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '40px 36px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>✨</div>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1A1815', marginBottom: '12px' }}>
          今週のインサイトを生成しますか？
        </h2>
        <p style={{ fontSize: '14px', color: '#6B6660', lineHeight: 1.7, marginBottom: '28px' }}>
          今週のコンディションデータをAIが分析して、気づきと提案をお伝えします。
        </p>

        {error && (
          <div style={{ color: '#C0392B', fontSize: '14px', marginBottom: '16px', background: '#FDF3E3', padding: '10px 14px', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{
              width: '100%', background: '#2D8A5F', color: 'white',
              border: 'none', borderRadius: '10px', padding: '13px',
              fontSize: '16px', fontWeight: 500,
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              opacity: isGenerating ? 0.7 : 1,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { if (!isGenerating) (e.currentTarget as HTMLElement).style.background = '#1A5C3E'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#2D8A5F'; }}
            onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
          >
            {isGenerating ? '生成中...' : '生成する'}
          </button>
          <button
            onClick={handleLater}
            style={{
              width: '100%', background: 'transparent', color: '#6B6660',
              border: '0.5px solid var(--border-color-hover)',
              borderRadius: '10px', padding: '13px',
              fontSize: '16px', fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F8F6F2'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
          >
            後で
          </button>
        </div>
      </div>
    </div>
  );
}
