'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, X, Loader2 } from 'lucide-react';
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
    if (!localStorage.getItem(key)) setShow(true);
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
      background: 'var(--overlay)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px',
    }}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: '20px', padding: '40px 36px',
        maxWidth: '400px', width: '100%',
        boxShadow: 'var(--shadow-modal)',
        border: '0.5px solid var(--border-color)',
        position: 'relative',
      }}>
        <button
          onClick={handleLater}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-placeholder)', padding: '4px', borderRadius: '6px',
            display: 'flex', transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'var(--text-placeholder)'; }}
        >
          <X size={18} strokeWidth={2} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px', height: '56px', background: 'var(--bg-green)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <Sparkles size={26} strokeWidth={1.8} color="var(--text-green)" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
            今週を振り返ります
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.75 }}>
            今週のコンディションデータをもとに、振り返りメッセージを生成します。
          </p>
        </div>

        {error && (
          <div style={{ color: 'var(--text-error)', fontSize: '14px', marginBottom: '16px', background: 'var(--bg-amber)', padding: '10px 14px', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{
              width: '100%', background: 'var(--accent-green)', color: 'white',
              border: 'none', borderRadius: '10px', padding: '14px',
              fontSize: '16px', fontWeight: 500,
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              opacity: isGenerating ? 0.8 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { if (!isGenerating) (e.currentTarget as HTMLElement).style.background = 'var(--accent-green-hover)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-green)'; }}
            onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
          >
            {isGenerating
              ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> 生成しています…</>
              : <><Sparkles size={16} strokeWidth={2} /> 振り返りを見る</>
            }
          </button>
          <button
            onClick={handleLater}
            style={{
              width: '100%', background: 'transparent', color: 'var(--text-muted)',
              border: '0.5px solid var(--border-color-hover)',
              borderRadius: '10px', padding: '14px',
              fontSize: '16px', fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
          >
            後で
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
