'use client';

import { Lightbulb, ArrowRight } from 'lucide-react';

interface Section {
  label: string;
  text: string;
}

function parseComment(comment: string): { main: string; sections: Section[] } | null {
  // 新形式: 【ひとこと】【気づき】【提案】
  const mainMatch = comment.match(/【ひとこと】\s*([\s\S]*?)(?=【気づき】|【提案】|$)/);
  const insightMatch = comment.match(/【気づき】\s*([\s\S]*?)(?=【提案】|$)/);
  const suggestionMatch = comment.match(/【提案】\s*([\s\S]*?)$/);

  if (mainMatch || insightMatch || suggestionMatch) {
    const sections: Section[] = [];
    if (insightMatch?.[1]?.trim()) sections.push({ label: '気づき', text: insightMatch[1].trim() });
    if (suggestionMatch?.[1]?.trim()) sections.push({ label: '提案', text: suggestionMatch[1].trim() });
    return {
      main: mainMatch?.[1]?.trim() ?? '',
      sections,
    };
  }

  // 旧形式フォールバック: 【今の状態】【今日の状態】【気づき】【提案】
  const legacyLabels = ['今の状態', '今日の状態', '気づき', '提案'];
  const legacySections: Section[] = [];
  for (let i = 0; i < legacyLabels.length; i++) {
    const marker = `【${legacyLabels[i]}】`;
    const start = comment.indexOf(marker);
    if (start === -1) continue;
    const contentStart = start + marker.length;
    const nextMarker = legacyLabels[i + 1] ? `【${legacyLabels[i + 1]}】` : null;
    const nextPos = nextMarker ? comment.indexOf(nextMarker) : -1;
    const text = comment.slice(contentStart, nextPos !== -1 ? nextPos : comment.length).trim();
    if (text) legacySections.push({ label: legacyLabels[i], text });
  }
  if (legacySections.length >= 2) {
    return { main: legacySections[0]?.text ?? '', sections: legacySections.slice(1) };
  }

  return null;
}

/** Care キャラクターアイコン（リーフ + 顔） */
function CareIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 葉っぱ背景 */}
      <circle cx="20" cy="20" r="20" fill="var(--accent-green)" opacity="0.12" />
      <circle cx="20" cy="20" r="16" fill="var(--accent-green)" opacity="0.18" />
      {/* リーフ */}
      <path
        d="M20 8 C14 8 10 13 10 18 C10 24 15 29 20 32 C25 29 30 24 30 18 C30 13 26 8 20 8Z"
        fill="var(--accent-green)"
        opacity="0.9"
      />
      {/* 顔 */}
      <circle cx="17" cy="18" r="1.5" fill="white" />
      <circle cx="23" cy="18" r="1.5" fill="white" />
      <path d="M17 22 Q20 24.5 23 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

interface CareCommentProps {
  comment: string;
  compact?: boolean;
}

const SECTION_META: Record<string, { Icon: typeof Lightbulb; color: string; bg: string; border: string }> = {
  '気づき': {
    Icon: Lightbulb,
    color: 'var(--text-amber)',
    bg: 'var(--bg-amber)',
    border: 'var(--border-amber)',
  },
  '提案': {
    Icon: ArrowRight,
    color: 'var(--text-green)',
    bg: 'var(--bg-green)',
    border: 'var(--border-green)',
  },
};

export default function CareComment({ comment, compact = false }: CareCommentProps) {
  const parsed = parseComment(comment);

  if (!parsed) {
    return (
      <div style={{
        display: 'flex', gap: '12px', alignItems: 'flex-start',
        padding: compact ? '12px 14px' : '16px',
        background: 'var(--bg-green)',
        border: '1px solid var(--border-green)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <CareIcon size={32} />
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>
          {comment}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* メインメッセージ */}
      {parsed.main && (
        <div style={{
          display: 'flex', gap: '12px', alignItems: 'flex-start',
          padding: compact ? '12px 14px' : '16px 18px',
        }}>
          <div style={{ flexShrink: 0, marginTop: '2px' }}>
            <CareIcon size={compact ? 28 : 32} />
          </div>
          <p style={{
            fontSize: compact ? '14px' : '15px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: 1.7,
            margin: 0,
            letterSpacing: '-0.01em',
          }}>
            {parsed.main}
          </p>
        </div>
      )}

      {/* サブセクション */}
      {parsed.sections.length > 0 && (
        <div style={{
          borderTop: compact ? '1px solid var(--border-color)' : 'none',
          paddingTop: compact ? '10px' : 0,
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          {parsed.sections.map(({ label, text }) => {
            const meta = SECTION_META[label];
            const Icon = meta?.Icon ?? Lightbulb;
            return (
              <div key={label} style={{
                display: 'flex', gap: '10px', alignItems: 'flex-start',
                padding: compact ? '10px 12px' : '12px 14px',
                background: meta?.bg ?? 'var(--bg-subtle)',
                border: `1px solid ${meta?.border ?? 'var(--border-color)'}`,
                borderRadius: 'var(--radius-md)',
              }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-card)', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'var(--shadow-xs)', marginTop: '1px',
                }}>
                  <Icon size={12} strokeWidth={2.2} color={meta?.color ?? 'var(--text-muted)'} />
                </div>
                <div>
                  <p style={{
                    fontSize: '11px', fontWeight: 700,
                    color: meta?.color ?? 'var(--text-muted)',
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                    marginBottom: '3px',
                  }}>
                    {label}
                  </p>
                  <p style={{
                    fontSize: compact ? '13px' : '14px',
                    color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0,
                  }}>
                    {text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
