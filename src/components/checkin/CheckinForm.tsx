'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, NotebookPen, Loader2, Activity, Mic, MicOff, BarChart2 } from 'lucide-react';
import TimePeriodSelector from './TimePeriodSelector';
import ActivityTags from './ActivityTags';
import { createClient } from '@/lib/supabase/client';
import { TimePeriodRatings } from '@/lib/types';

interface CheckinFormProps {
  timing: 'morning' | 'evening';
}

function SectionHeader({ icon, label, optional = false }: { icon: React.ReactNode; label: string; optional?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: 'var(--radius-sm)',
        background: 'var(--bg-green)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '-0.01em' }}>
        {label}
      </span>
      {optional && (
        <span style={{ fontSize: '12px', color: 'var(--text-placeholder)', fontWeight: 400 }}>任意</span>
      )}
    </div>
  );
}

export default function CheckinForm({ timing }: CheckinFormProps) {
  const router = useRouter();
  const [ratings, setRatings] = useState<TimePeriodRatings>({});
  const [activityTags, setActivityTags] = useState<string[]>([]);
  const [userActivityTags, setUserActivityTags] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 音声入力
  interface SREvent { resultIndex: number; results: SpeechRecognitionResultList }
  type SR = { lang: string; interimResults: boolean; continuous: boolean; maxAlternatives: number; onresult: ((e: SREvent) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start: () => void; stop: () => void };
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SR | null>(null);
  const baseTextRef = useRef('');

  useEffect(() => {
    const hasSR = typeof window !== 'undefined' &&
      !!(window as unknown as Record<string, unknown>).SpeechRecognition ||
      !!(window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    setSpeechSupported(hasSR);
  }, []);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsRecording(false);
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) { stopRecording(); return; }
    const w = window as unknown as Record<string, new () => SR>;
    const SRClass = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SRClass) return;
    baseTextRef.current = freeText;
    const rec = new SRClass();
    rec.lang = 'ja-JP';
    rec.interimResults = true;
    rec.continuous = true;
    rec.maxAlternatives = 1;
    rec.onresult = (event: SREvent) => {
      let interim = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += t;
        else interim += t;
      }
      if (finalTranscript) baseTextRef.current = (baseTextRef.current + finalTranscript).trimStart();
      setFreeText((baseTextRef.current + interim).trimStart());
    };
    rec.onerror = () => stopRecording();
    rec.onend = () => { setFreeText(baseTextRef.current); setIsRecording(false); recognitionRef.current = null; };
    recognitionRef.current = rec;
    rec.start();
    setIsRecording(true);
  }, [isRecording, freeText, stopRecording]);

  const activityLabel = timing === 'morning' ? '昨夜の活動' : '今日の活動';
  const expectedPeriods = timing === 'morning'
    ? ['last_night', 'this_morning']
    : ['morning', 'afternoon', 'evening', 'night'];
  const isValid = expectedPeriods.every(p => ratings[p] !== undefined);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('user_tags')
      .select('tag_name')
      .eq('tag_type', timing === 'morning' ? 'morning_activity' : 'evening_activity')
      .then(({ data }) => { if (data) setUserActivityTags(data.map(r => r.tag_name)); });
  }, [timing]);

  const handleAddUserTag = async (tag: string) => {
    setUserActivityTags(prev => [...prev, tag]);
    const supabase = createClient();
    await supabase.from('user_tags').insert({
      tag_name: tag,
      tag_type: timing === 'morning' ? 'morning_activity' : 'evening_activity',
    });
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timing, time_period_ratings: ratings, activity_tags: activityTags, free_text: freeText || null }),
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

  const isMorning = timing === 'morning';

  return (
    <div>
      {/* ページヘッダー */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
            background: isMorning ? 'var(--bg-green)' : 'linear-gradient(135deg, #1E293B, #0F172A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '18px' }}>{isMorning ? '☀️' : '🌙'}</span>
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.03em' }}>
              {isMorning ? '朝のチェックイン' : '夜のチェックイン'}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-placeholder)', margin: 0, letterSpacing: '-0.01em' }}>
              {isMorning ? '今朝の状態を記録しましょう' : '今日一日を振り返りましょう'}
            </p>
          </div>
        </div>
      </div>

      {/* メインカード */}
      <div className="checkin-card" style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        boxShadow: 'var(--shadow-card)',
        display: 'flex', flexDirection: 'column', gap: '28px',
      }}>
        {/* 時間帯別コンディション */}
        <section>
          <SectionHeader
            icon={<BarChart2 size={14} strokeWidth={2.2} color="var(--accent-green)" />}
            label="時間帯別コンディション"
          />
          <TimePeriodSelector timing={timing} ratings={ratings} onChange={setRatings} />
          {!isValid && (
            <p style={{
              fontSize: '12px', color: 'var(--text-placeholder)', marginTop: '10px',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <span style={{ fontSize: '10px' }}>●</span> すべての時間帯を選択してください
            </p>
          )}
        </section>

        {/* 区切り線 */}
        <div style={{ borderTop: '1px solid var(--border-color)', margin: '0 -4px' }} />

        {/* 活動タグ */}
        <section>
          <SectionHeader
            icon={<Activity size={14} strokeWidth={2.2} color="var(--accent-amber)" />}
            label={activityLabel}
            optional
          />
          <ActivityTags
            timing={timing}
            selected={activityTags}
            onChange={setActivityTags}
            userTags={userActivityTags}
            onAddUserTag={handleAddUserTag}
          />
        </section>

        {/* 区切り線 */}
        <div style={{ borderTop: '1px solid var(--border-color)', margin: '0 -4px' }} />

        {/* メモ */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <SectionHeader
              icon={<NotebookPen size={14} strokeWidth={2.2} color="var(--accent-green)" />}
              label="メモ"
              optional
            />
            {isRecording && (
              <span style={{
                fontSize: '12px', color: '#EF4444', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '4px',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
                録音中
              </span>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <textarea
              value={freeText}
              onChange={e => { if (!isRecording) setFreeText(e.target.value); }}
              placeholder="今の気持ちを自由に…"
              rows={3}
              style={{
                width: '100%',
                border: `1px solid ${isRecording ? '#EF4444' : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-lg)', padding: '12px 48px 12px 16px',
                fontSize: '15px', color: 'var(--text-secondary)', background: 'var(--bg-subtle)',
                resize: 'none', outline: 'none', fontFamily: 'inherit',
                lineHeight: 1.7, boxSizing: 'border-box', transition: 'all 0.15s ease',
                boxShadow: isRecording ? '0 0 0 3px rgba(239,68,68,0.15)' : 'none',
                letterSpacing: '-0.01em',
              }}
              onFocus={e => {
                if (!isRecording) {
                  e.target.style.borderColor = 'var(--accent-green)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.12)';
                  e.target.style.background = 'var(--bg-card)';
                }
              }}
              onBlur={e => {
                if (!isRecording) {
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = 'var(--bg-subtle)';
                }
              }}
            />
            {speechSupported && (
              <button
                type="button"
                onClick={toggleRecording}
                title={isRecording ? '録音を停止' : '音声入力'}
                style={{
                  position: 'absolute', right: '10px', bottom: '10px',
                  width: '32px', height: '32px', borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: isRecording ? '#EF4444' : 'var(--bg-muted)',
                  color: isRecording ? 'white' : 'var(--text-placeholder)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                  boxShadow: isRecording ? '0 2px 8px rgba(239,68,68,0.40)' : 'none',
                }}
                onMouseEnter={e => { if (!isRecording) (e.currentTarget as HTMLElement).style.background = 'var(--bg-subtle)'; }}
                onMouseLeave={e => { if (!isRecording) (e.currentTarget as HTMLElement).style.background = 'var(--bg-muted)'; }}
              >
                {isRecording ? <MicOff size={15} strokeWidth={2} /> : <Mic size={15} strokeWidth={2} />}
              </button>
            )}
          </div>
        </section>

        {/* エラー */}
        {error && (
          <div style={{
            color: 'var(--text-error)', fontSize: '14px',
            background: '#FEF2F2', padding: '12px 16px', borderRadius: 'var(--radius-md)',
            border: '1px solid #FECACA', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ fontSize: '16px' }}>⚠️</span>
            {error}
          </div>
        )}

        {/* 送信ボタン */}
        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: isValid && !isSubmitting ? 'var(--gradient-green)' : 'var(--bg-muted)',
            color: isValid ? 'white' : 'var(--text-placeholder)',
            border: 'none', borderRadius: 'var(--radius-lg)',
            padding: '15px 24px', fontSize: '16px', fontWeight: 700,
            cursor: isValid && !isSubmitting ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            boxShadow: isValid && !isSubmitting ? 'var(--shadow-green)' : 'none',
            letterSpacing: '-0.02em',
          }}
          onMouseEnter={e => {
            if (isValid && !isSubmitting) {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(16,185,129,0.40)';
            }
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLElement).style.boxShadow = isValid && !isSubmitting ? 'var(--shadow-green)' : 'none';
          }}
          onMouseDown={e => { if (isValid) (e.currentTarget as HTMLElement).style.transform = 'scale(0.98)'; }}
          onMouseUp={e => { if (isValid) (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }} />
              AIコメントを生成中…
            </>
          ) : (
            '記録する →'
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
