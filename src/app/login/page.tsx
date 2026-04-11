'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Logo from '@/components/ui/Logo';

export default function LoginPage() {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-page)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px',
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '0.5px solid var(--border-color)',
        borderRadius: '20px', padding: '52px 48px',
        maxWidth: '400px', width: '100%',
        boxShadow: 'var(--shadow-card)', textAlign: 'center',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
          <Logo size="lg" />
        </div>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '36px' }}>
          良いコンディションの安定を、<br />毎日の記録と AIの気づきで作る。
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {['☀️ 毎朝のチェックイン', '🌙 毎夜の振り返り', '✨ AIの気づき'].map(text => (
            <span key={text} style={{
              fontSize: '12px', padding: '4px 12px', borderRadius: '9999px',
              background: 'var(--bg-green)', color: 'var(--text-green-dark)', border: '0.5px solid var(--border-green)',
            }}>
              {text}
            </span>
          ))}
        </div>

        <button
          onClick={handleGoogleLogin}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => { setHovered(false); setPressed(false); }}
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}
          style={{
            width: '100%', background: hovered ? 'var(--accent-green-hover)' : 'var(--accent-green)',
            color: 'white', border: 'none', borderRadius: '10px',
            padding: '14px 24px', fontSize: '16px', fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            transform: pressed ? 'scale(0.98)' : 'scale(1)',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#fff" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
          </svg>
          Googleでログイン
        </button>

        <p style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-placeholder)' }}>
          毎日のコンディションを記録して、パターンを発見しよう。
        </p>
      </div>
    </div>
  );
}
