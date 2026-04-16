'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Logo from '@/components/ui/Logo';

const FEATURES = [
  { icon: '☀️', label: '毎朝のチェックイン' },
  { icon: '🌙', label: '毎夜の振り返り' },
  { icon: '✨', label: 'AIの気づき' },
];

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-page)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 16px',
    }}>
      {/* Card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-2xl)',
        padding: '48px 44px 44px',
        maxWidth: '420px', width: '100%',
        boxShadow: 'var(--shadow-modal)',
        textAlign: 'center',
      }}>
        {/* ロゴ */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
          <Logo size="lg" />
        </div>

        <p style={{
          fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.8,
          marginBottom: '32px', letterSpacing: '-0.01em',
        }}>
          良いコンディションの安定を、<br />
          毎日の記録とAIの気づきで作る。
        </p>

        {/* フィーチャーバッジ */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '6px',
          flexWrap: 'wrap', marginBottom: '36px',
        }}>
          {FEATURES.map(({ icon, label }) => (
            <span key={label} style={{
              fontSize: '12px', padding: '5px 12px', borderRadius: 'var(--radius-full)',
              background: 'var(--bg-green)', color: 'var(--text-green-dark)',
              border: '1px solid var(--border-green)',
              fontWeight: 500, letterSpacing: '-0.01em',
              display: 'inline-flex', alignItems: 'center', gap: '4px',
            }}>
              <span>{icon}</span>
              {label}
            </span>
          ))}
        </div>

        {/* Googleログインボタン */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? 'var(--bg-muted)' : 'var(--gradient-green)',
            color: 'white', border: 'none', borderRadius: 'var(--radius-lg)',
            padding: '14px 24px', fontSize: '15px', fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            transition: 'all 0.2s ease',
            boxShadow: loading ? 'none' : 'var(--shadow-green)',
            letterSpacing: '-0.02em',
            opacity: loading ? 0.7 : 1,
          }}
          onMouseEnter={e => {
            if (!loading) {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(16,185,129,0.40)';
            }
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLElement).style.boxShadow = loading ? 'none' : 'var(--shadow-green)';
          }}
          onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.98)'; }}
          onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#fff" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
          </svg>
          {loading ? '接続中…' : 'Googleでログイン'}
        </button>

        <p style={{ marginTop: '18px', fontSize: '12px', color: 'var(--text-placeholder)', lineHeight: 1.6 }}>
          毎日の記録でコンディションのパターンを発見しよう。
        </p>
      </div>
    </div>
  );
}
