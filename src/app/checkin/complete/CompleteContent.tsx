'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Wind, CheckCircle, LayoutDashboard, Brain, Activity } from 'lucide-react';
import CareComment from '@/components/ui/CareComment';
import { Button } from '@takaki/go-design-system';

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
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px',
    }}>
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '40px 36px',
        maxWidth: '520px', width: '100%',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {/* 完了ヘッダー */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '64px', height: '64px', background: 'var(--color-success-subtle)',
            borderRadius: 'var(--radius-full)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <CheckCircle size={28} strokeWidth={2} color="var(--color-success)" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '6px', letterSpacing: '-0.03em' }}>
            記録しました
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-subtle)', letterSpacing: '-0.01em' }}>
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
              { label: '総合', value: score, color: 'var(--color-success)', bg: 'var(--color-success-subtle)', border: 'var(--color-success)', Icon: null },
              { label: '心', value: mindScore, color: 'var(--color-warning)', bg: 'var(--color-warning-subtle)', border: 'var(--color-warning)', Icon: Brain },
              { label: '体', value: bodyScore, color: 'var(--color-success)', bg: 'var(--color-success-subtle)', border: 'var(--color-success)', Icon: Activity },
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
          background: 'var(--color-warning-subtle)', border: '1px solid var(--color-warning)',
          borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: 'var(--radius-md)',
              background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <Wind size={14} strokeWidth={2} color="var(--color-warning)" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-warning)', letterSpacing: '-0.01em' }}>
              瞑想タイム
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--foreground)', marginBottom: '14px', lineHeight: 1.6 }}>
            記録できました。このまま瞑想に進みますか？
          </p>
          <Button
            onClick={handleMeditation}
            disabled={isLogging}
            style={{ background: 'var(--color-warning)', border: 'none' } as React.CSSProperties}
            className="text-white hover:opacity-90"
          >
            <Wind size={14} strokeWidth={2} />
            {meditationLogged ? '記録済み' : '瞑想に進む'}
          </Button>
          <p style={{ fontSize: '11px', color: 'var(--color-text-subtle)', marginTop: '8px' }}>
            別タブでYouTubeが開き、このページはダッシュボードへ戻ります
          </p>
        </div>

        <Button variant="ghost" asChild className="w-full text-muted-foreground">
          <Link href="/dashboard">
            <LayoutDashboard size={14} strokeWidth={2} />
            ダッシュボードへ戻る
          </Link>
        </Button>
      </div>
    </div>
  );
}
