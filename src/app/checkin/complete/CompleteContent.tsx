'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Wind, CheckCircle, LayoutDashboard, Brain, Activity } from 'lucide-react';
import CareComment from '@/components/ui/CareComment';

interface CompleteContentProps {
  meditationUrl: string;
}

export default function CompleteContent({ meditationUrl }: CompleteContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [meditationLogged, setMeditationLogged] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  const checkinId = searchParams.get('id');
  const timing = searchParams.get('timing') || 'morning';
  const comment = searchParams.get('comment') || '';
  const score = parseInt(searchParams.get('score') || '0');
  const mindScore = parseInt(searchParams.get('mind') || '0');
  const bodyScore = parseInt(searchParams.get('body') || '0');
  const isCheckout = timing === 'checkout';
  const hasScore = isCheckout && score > 0;

  const handleMeditation = async () => {
    if (meditationLogged || isLogging) return;
    setIsLogging(true);
    try {
      await fetch('/api/meditation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timing, checkin_id: checkinId }),
      });
      setMeditationLogged(true);
    } catch { /* ignore */ } finally {
      setIsLogging(false);
      window.open(meditationUrl, '_blank', 'noopener,noreferrer');
      router.push('/dashboard');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-page)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px',
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-2xl)', padding: '40px 36px',
        maxWidth: '520px', width: '100%',
        boxShadow: 'var(--shadow-modal)',
      }}>
        {/* 完了ヘッダー */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '64px', height: '64px', background: 'var(--bg-green)',
            borderRadius: 'var(--radius-full)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            boxShadow: 'var(--shadow-green)',
          }}>
            <CheckCircle size={28} strokeWidth={2} color="var(--accent-green)" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', letterSpacing: '-0.03em' }}>
            記録しました
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-placeholder)', letterSpacing: '-0.01em' }}>
            {isCheckout ? '夜チェックアウト完了' : '朝チェックイン完了'}
          </p>
        </div>

        {/* スコア（チェックアウト時のみ） */}
        {hasScore && (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px',
            marginBottom: '24px',
          }}>
            {[
              { label: '総合', value: score, color: 'var(--accent-green)', bg: 'var(--bg-green)', border: 'var(--border-green)', Icon: null },
              { label: '心', value: mindScore, color: 'var(--accent-amber)', bg: 'var(--bg-amber)', border: 'var(--border-amber)', Icon: Brain },
              { label: '体', value: bodyScore, color: 'var(--text-green)', bg: 'var(--bg-green)', border: 'var(--border-green)', Icon: Activity },
            ].map(({ label, value, color, bg, border, Icon }) => (
              <div key={label} style={{
                textAlign: 'center', padding: '14px 10px',
                background: bg, border: `1px solid ${border}`,
                borderRadius: 'var(--radius-lg)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>
                  {Icon && <Icon size={12} strokeWidth={2} color={color} />}
                  <p style={{ fontSize: '11px', fontWeight: 700, color, letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>
                    {label}
                  </p>
                </div>
                <p style={{ fontSize: '28px', fontWeight: 800, color, letterSpacing: '-0.04em', lineHeight: 1, margin: 0 }}>
                  {value || '–'}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Care コメント */}
        {comment && (
          <div style={{ marginBottom: '24px' }}>
            <CareComment comment={comment} />
          </div>
        )}

        {/* 瞑想誘導 */}
        <div style={{
          background: 'var(--bg-amber)', border: '1px solid var(--border-amber)',
          borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-xs)',
            }}>
              <Wind size={14} strokeWidth={2} color="var(--accent-amber)" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-amber-dark)', letterSpacing: '-0.01em' }}>
              瞑想タイム
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-amber-dark)', marginBottom: '14px', lineHeight: 1.6 }}>
            記録できました。このまま瞑想に進みますか？
          </p>
          <button
            onClick={handleMeditation}
            disabled={isLogging}
            style={{
              background: 'var(--accent-amber)', color: 'white', border: 'none',
              borderRadius: 'var(--radius-md)', padding: '10px 20px',
              fontSize: '14px', fontWeight: 600,
              cursor: isLogging ? 'not-allowed' : 'pointer',
              opacity: isLogging ? 0.7 : 1,
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              transition: 'all 0.15s ease',
              boxShadow: 'var(--shadow-amber)',
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => { if (!isLogging) (e.currentTarget as HTMLElement).style.background = 'var(--accent-amber-hover)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-amber)'; }}
          >
            <Wind size={14} strokeWidth={2} />
            {meditationLogged ? '記録済み' : '瞑想に進む'}
          </button>
          <p style={{ fontSize: '11px', color: 'var(--text-placeholder)', marginTop: '8px' }}>
            別タブでYouTubeが開き、このページはダッシュボードへ戻ります
          </p>
        </div>

        <Link href="/dashboard" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          color: 'var(--text-muted)', fontSize: '14px', textDecoration: 'none', fontWeight: 500,
          transition: 'color 0.12s ease',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
        >
          <LayoutDashboard size={14} strokeWidth={2} />
          ダッシュボードへ戻る
        </Link>
      </div>
    </div>
  );
}
