'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Smile, Tag, NotebookPen, Loader2 } from 'lucide-react';
import MoodSelector from './MoodSelector';
import EmotionTags from './EmotionTags';

interface CheckinFormProps {
  timing: 'morning' | 'evening';
}

export default function CheckinForm({ timing }: CheckinFormProps) {
  const router = useRouter();
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [emotionTags, setEmotionTags] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [btnHovered, setBtnHovered] = useState(false);
  const [btnPressed, setBtnPressed] = useState(false);

  const greeting = timing === 'morning'
    ? 'おはようございます。今朝の状態は？'
    : 'お疲れさまでした。今日一日はどうでしたか？';

  const isValid = moodScore !== null && emotionTags.length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timing, mood_score: moodScore, emotion_tags: emotionTags, free_text: freeText || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || '送信に失敗しました'); return; }
      const params = new URLSearchParams({
        id: data.checkin.id, timing,
        comment: data.checkin.ai_comment || '',
        score: String(data.checkin.condition_score || 0),
      });
      router.push(`/checkin/complete?${params.toString()}`);
    } catch {
      setError('送信中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 600, color: '#1A1815', marginBottom: '8px', lineHeight: 1.3 }}>
          {greeting}
        </h1>
        <p style={{ fontSize: '14px', color: '#A09B92' }}>
          {timing === 'morning' ? '☀️ 朝のチェックイン' : '🌙 夜のチェックイン'}
        </p>
      </div>

      <div style={{
        background: '#FFFFFF', border: '0.5px solid var(--border-color)',
        borderRadius: '14px', padding: '32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        {/* 気分スコア */}
        <section style={{ marginBottom: '28px' }}>
          <label style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            fontSize: '14px', fontWeight: 500, color: '#2E2B28', marginBottom: '14px',
          }}>
            <Smile size={16} strokeWidth={2} color="#2D8A5F" />
            今の気分
            <span style={{ color: '#C0392B', fontWeight: 400 }}>*</span>
          </label>
          <MoodSelector value={moodScore} onChange={setMoodScore} />
        </section>

        {/* 感情タグ */}
        <section style={{ marginBottom: '28px' }}>
          <label style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            fontSize: '14px', fontWeight: 500, color: '#2E2B28', marginBottom: '14px',
          }}>
            <Tag size={15} strokeWidth={2} color="#2D8A5F" />
            感情タグ
            <span style={{ color: '#C0392B', fontWeight: 400 }}>*</span>
            <span style={{ fontWeight: 400, color: '#A09B92', fontSize: '13px' }}>複数選択可</span>
          </label>
          <EmotionTags selected={emotionTags} onChange={setEmotionTags} />
        </section>

        {/* 自由テキスト */}
        <section style={{ marginBottom: '32px' }}>
          <label style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            fontSize: '14px', fontWeight: 500, color: '#2E2B28', marginBottom: '14px',
          }}>
            <NotebookPen size={15} strokeWidth={2} color="#2D8A5F" />
            メモ
            <span style={{ fontWeight: 400, color: '#A09B92', fontSize: '13px' }}>任意</span>
          </label>
          <textarea
            value={freeText}
            onChange={e => setFreeText(e.target.value)}
            placeholder="今の気持ちを自由に（省略OK）"
            rows={3}
            style={{
              width: '100%', border: '0.5px solid var(--border-color)',
              borderRadius: '10px', padding: '12px 14px',
              fontSize: '16px', color: '#2E2B28', background: '#FFFFFF',
              resize: 'none', outline: 'none', fontFamily: 'inherit',
              lineHeight: 1.6, boxSizing: 'border-box', transition: 'all 0.15s ease',
            }}
            onFocus={e => { e.target.style.borderColor = '#4DAF80'; e.target.style.boxShadow = '0 0 0 3px rgba(45,138,95,0.15)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
          />
        </section>

        {error && (
          <div style={{ color: '#C0392B', fontSize: '14px', marginBottom: '16px', background: '#FDF3E3', padding: '10px 14px', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => { setBtnHovered(false); setBtnPressed(false); }}
          onMouseDown={() => setBtnPressed(true)}
          onMouseUp={() => setBtnPressed(false)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: isValid ? (btnHovered ? '#1A5C3E' : '#2D8A5F') : '#D8D5CE',
            color: 'white', border: 'none', borderRadius: '10px',
            padding: '14px 24px', fontSize: '16px', fontWeight: 500,
            cursor: isValid && !isSubmitting ? 'pointer' : 'not-allowed',
            transform: btnPressed && isValid ? 'scale(0.97)' : 'scale(1)',
            transition: 'all 0.15s ease',
          }}
        >
          {isSubmitting
            ? <><Loader2 size={16} strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }} /> Coa がコメントを書いています…</>
            : '記録する'
          }
        </button>

        {!isValid && (
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#A09B92', marginTop: '10px' }}>
            気分と感情タグを選択してください
          </p>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
