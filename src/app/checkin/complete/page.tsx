'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import Link from 'next/link';

function CheckinCompleteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [meditationLogged, setMeditationLogged] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  const checkinId = searchParams.get('id');
  const timing = searchParams.get('timing') || 'morning';
  const comment = searchParams.get('comment') || '';
  const score = searchParams.get('score') || '0';

  const meditationUrl = process.env.NEXT_PUBLIC_MEDITATION_URL || 'https://www.youtube.com/';

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
      // エラーは無視して遷移
    } finally {
      setIsLogging(false);
      window.open(meditationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6F2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{
        background: '#FFFFFF',
        border: '0.5px solid var(--border-color)',
        borderRadius: '20px',
        padding: '48px 40px',
        maxWidth: '520px',
        width: '100%',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        {/* 完了ヘッダー */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: '#E8F5EF',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '24px',
          }}>
            ✓
          </div>
          <h1 style={{
            fontFamily: '"DM Serif Display", Georgia, serif',
            fontSize: '24px',
            color: '#1A1815',
            marginBottom: '8px',
          }}>
            記録しました
          </h1>
          <p style={{ fontSize: '13px', color: '#A09B92' }}>
            {timing === 'morning' ? '朝のチェックイン完了' : '夜のチェックイン完了'}
          </p>
        </div>

        {/* スコア表示 */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', color: '#A09B92', marginBottom: '8px' }}>コンディションスコア</div>
          <div style={{
            fontFamily: '"DM Serif Display", Georgia, serif',
            fontSize: '56px',
            color: '#2D8A5F',
            lineHeight: 1,
          }}>
            {score}
          </div>
          <div style={{ fontSize: '13px', color: '#A09B92', marginTop: '4px' }}>/ 100</div>
        </div>

        {/* AIコメント */}
        {comment && (
          <div style={{
            background: '#E8F5EF',
            borderLeft: '3px solid #4DAF80',
            borderRadius: '0 10px 10px 0',
            padding: '14px 16px',
            marginBottom: '28px',
          }}>
            <div style={{ fontSize: '11px', color: '#2D8A5F', fontWeight: 500, marginBottom: '6px' }}>AIコメント</div>
            <p style={{ fontSize: '14px', color: '#1A5C3E', lineHeight: 1.7, margin: 0 }}>
              {comment}
            </p>
          </div>
        )}

        {/* 瞑想誘導 */}
        <div style={{
          background: '#FDF3E3',
          border: '0.5px solid #FAE0B0',
          borderRadius: '14px',
          padding: '20px',
          marginBottom: '24px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '14px', color: '#7A4C0A', marginBottom: '16px', lineHeight: 1.6 }}>
            記録できました。瞑想に進みますか？
          </p>
          <button
            onClick={handleMeditation}
            disabled={isLogging}
            style={{
              background: '#C07818',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '11px 24px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: isLogging ? 'not-allowed' : 'pointer',
              opacity: isLogging ? 0.7 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {meditationLogged ? '記録済み ✓' : '瞑想に進む →'}
          </button>
          <p style={{ fontSize: '11px', color: '#A09B92', marginTop: '10px' }}>
            外部サービスが別タブで開きます
          </p>
        </div>

        {/* ダッシュボードへ */}
        <Link
          href="/dashboard"
          style={{
            display: 'block',
            textAlign: 'center',
            color: '#2D8A5F',
            fontSize: '14px',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          ダッシュボードへ
        </Link>
      </div>
    </div>
  );
}

export default function CheckinCompletePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#F8F6F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#A09B92' }}>読み込み中...</p>
      </div>
    }>
      <CheckinCompleteContent />
    </Suspense>
  );
}
