'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Wind, CheckCircle, LayoutDashboard } from 'lucide-react';
import CareComment from '@/components/ui/CareComment';

interface CompleteContentProps {
  meditationUrl: string;
}

export default function CompleteContent({ meditationUrl }: CompleteContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [meditationLogged, setMeditationLogged] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const [btnPressed, setBtnPressed] = useState(false);

  const checkinId = searchParams.get('id');
  const timing = searchParams.get('timing') || 'morning';
  const comment = searchParams.get('comment') || '';
  const score = searchParams.get('score') || '0';

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
    } catch {
      // ignore
    } finally {
      setIsLogging(false);
      window.open(meditationUrl, '_blank', 'noopener,noreferrer');
      router.push('/dashboard');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{
        background: 'var(--bg-card)', border: '0.5px solid var(--border-color)',
        borderRadius: '20px', padding: '48px 40px',
        maxWidth: '520px', width: '100%',
        boxShadow: 'var(--shadow-card)',
      }}>
        {/* 完了ヘッダー */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '60px', height: '60px', background: 'var(--bg-green)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <CheckCircle size={28} strokeWidth={1.8} color="var(--accent-green)" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            記録しました
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-placeholder)' }}>
            {timing === 'morning' ? '☀️ 朝のチェックイン完了' : '🌙 夜のチェックイン完了'}
          </p>
        </div>

        {/* スコア */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-placeholder)', marginBottom: '8px' }}>コンディションスコア</div>
          <div style={{ fontSize: '48px', fontWeight: 600, color: 'var(--text-green)', lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: '14px', color: 'var(--text-placeholder)', marginTop: '4px' }}>/ 100</div>
        </div>

        {/* Care のひとこと */}
        {comment && (
          <div style={{ marginBottom: '28px' }}>
            <CareComment comment={comment} />
          </div>
        )}

        {/* 瞑想誘導 */}
        <div style={{
          background: 'var(--bg-amber)', border: '0.5px solid var(--border-amber)',
          borderRadius: '14px', padding: '22px', marginBottom: '24px', textAlign: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', marginBottom: '10px' }}>
            <Wind size={16} strokeWidth={1.8} color="var(--text-amber)" />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-amber-dark)' }}>瞑想タイム</span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-amber-dark)', marginBottom: '16px', lineHeight: 1.6 }}>
            記録できました。瞑想に進みますか？
          </p>
          <button
            onClick={handleMeditation}
            disabled={isLogging}
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => { setBtnHovered(false); setBtnPressed(false); }}
            onMouseDown={() => setBtnPressed(true)}
            onMouseUp={() => setBtnPressed(false)}
            style={{
              background: btnHovered ? 'var(--accent-amber-hover)' : 'var(--accent-amber)',
              color: 'white', border: 'none', borderRadius: '10px',
              padding: '11px 24px', fontSize: '14px', fontWeight: 500,
              cursor: isLogging ? 'not-allowed' : 'pointer',
              opacity: isLogging ? 0.7 : 1,
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              transform: btnPressed ? 'scale(0.97)' : 'scale(1)',
              transition: 'all 0.15s ease',
            }}
          >
            <Wind size={15} strokeWidth={2} />
            {meditationLogged ? '記録済み ✓' : '瞑想に進む →'}
          </button>
          <p style={{ fontSize: '12px', color: 'var(--text-placeholder)', marginTop: '10px' }}>
            別タブでYouTubeが開き、このページはダッシュボードへ戻ります
          </p>
        </div>

        <Link href="/dashboard" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          color: 'var(--text-green)', fontSize: '14px', textDecoration: 'none', fontWeight: 500,
        }}>
          <LayoutDashboard size={15} strokeWidth={2} />
          ダッシュボードへ
        </Link>
      </div>
    </div>
  );
}
