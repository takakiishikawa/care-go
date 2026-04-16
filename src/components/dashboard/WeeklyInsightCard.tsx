import { BrainCircuit, TrendingUp, Lightbulb, ArrowRight } from 'lucide-react';
import { WeeklyInsight } from '@/lib/types';

interface WeeklyInsightCardProps {
  insight: WeeklyInsight | null;
  thisWeekAvg: number | null;
  lastWeekAvg: number | null;
}

interface InsightSections {
  summary: string;
  insight: string;
  suggestion: string;
}

function parseInsightSections(text: string): InsightSections | null {
  const summaryMatch = text.match(/【今週のまとめ】\s*([\s\S]*?)(?=【気づき】|$)/);
  const insightMatch = text.match(/【気づき】\s*([\s\S]*?)(?=【来週への提案】|$)/);
  const suggestionMatch = text.match(/【来週への提案】\s*([\s\S]*?)$/);

  if (!summaryMatch && !insightMatch && !suggestionMatch) return null;

  return {
    summary: summaryMatch?.[1]?.trim() ?? '',
    insight: insightMatch?.[1]?.trim() ?? '',
    suggestion: suggestionMatch?.[1]?.trim() ?? '',
  };
}

const SECTION_META = [
  {
    key: 'summary' as const,
    label: '今週のまとめ',
    Icon: TrendingUp,
    color: 'var(--text-green)',
    bg: 'var(--bg-green)',
    border: 'var(--border-green)',
  },
  {
    key: 'insight' as const,
    label: '気づき',
    Icon: Lightbulb,
    color: 'var(--text-amber)',
    bg: 'var(--bg-amber)',
    border: 'var(--border-amber)',
  },
  {
    key: 'suggestion' as const,
    label: '来週への提案',
    Icon: ArrowRight,
    color: 'var(--text-green)',
    bg: 'var(--bg-green)',
    border: 'var(--border-green)',
  },
];

export default function WeeklyInsightCard({ insight, thisWeekAvg, lastWeekAvg }: WeeklyInsightCardProps) {
  const weekDiff = thisWeekAvg !== null && lastWeekAvg !== null
    ? Math.round(thisWeekAvg - lastWeekAvg)
    : null;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-xl)',
      padding: '24px',
      boxShadow: 'var(--shadow-card)',
    }}>
      {/* ヘッダー */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
            background: 'var(--bg-purple)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <BrainCircuit size={16} strokeWidth={1.8} color="var(--accent-green)" />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '-0.01em', margin: 0 }}>
              週次レポート
            </p>
            {weekDiff !== null && (
              <p style={{ fontSize: '12px', color: weekDiff > 0 ? 'var(--text-green)' : weekDiff < 0 ? 'var(--text-amber)' : 'var(--text-placeholder)', margin: 0 }}>
                {weekDiff > 0
                  ? `先週より+${weekDiff}pt 上向き`
                  : weekDiff < 0
                    ? `先週より${weekDiff}pt`
                    : '先週と同水準'}
              </p>
            )}
          </div>
        </div>

        {/* 週平均バッジ */}
        {thisWeekAvg !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              textAlign: 'right',
              padding: '6px 14px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-green)', border: '1px solid var(--border-green)',
            }}>
              <div style={{ fontSize: '10px', color: 'var(--text-green)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>今週平均</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-green)', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                {Math.round(thisWeekAvg)}
              </div>
            </div>
            {lastWeekAvg !== null && (
              <div style={{ textAlign: 'right', padding: '6px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-placeholder)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>先週</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                  {Math.round(lastWeekAvg)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 本文 */}
      {insight ? (() => {
        const sections = parseInsightSections(insight.insight_text);
        return sections ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            {SECTION_META.map(({ key, label, Icon, color, bg, border }) => {
              const text = sections[key];
              if (!text) return null;
              return (
                <div key={key} style={{
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                  padding: '14px 16px', borderRadius: 'var(--radius-lg)',
                  background: bg, border: `1px solid ${border}`,
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-card)', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: 'var(--shadow-xs)',
                    marginTop: '1px',
                  }}>
                    <Icon size={14} strokeWidth={2} color={color} />
                  </div>
                  <div>
                    <p style={{
                      fontSize: '11px', fontWeight: 700, color, letterSpacing: '0.05em',
                      textTransform: 'uppercase', marginBottom: '4px',
                    }}>
                      {label}
                    </p>
                    <p style={{
                      fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0,
                    }}>
                      {text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>
            {insight.insight_text}
          </p>
        );
      })() : (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '16px', borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-subtle)', border: '1px solid var(--border-color)',
        }}>
          <BrainCircuit size={18} strokeWidth={1.8} color="var(--text-placeholder)" />
          <p style={{ fontSize: '14px', color: 'var(--text-placeholder)', margin: 0, lineHeight: 1.6 }}>
            日曜日にログインすると、今週の振り返りが生成されます。
          </p>
        </div>
      )}
    </div>
  );
}
