import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TopNav from '@/components/ui/TopNav';
import { BrainCircuit, TrendingUp, Lightbulb, ArrowRight, ChevronDown } from 'lucide-react';
import { WeeklyInsight } from '@/lib/types';

function parseInsightSections(text: string) {
  const summaryMatch = text.match(/【今週のサマリー】\s*([\s\S]*?)(?=【パターン分析】|【来週への一言】|$)/)
    ?? text.match(/【今週のまとめ】\s*([\s\S]*?)(?=【気づき】|【来週への提案】|$)/);
  const insightMatch = text.match(/【パターン分析】\s*([\s\S]*?)(?=【来週への一言】|$)/)
    ?? text.match(/【気づき】\s*([\s\S]*?)(?=【来週への提案】|$)/);
  const suggestionMatch = text.match(/【来週への一言】\s*([\s\S]*?)$/)
    ?? text.match(/【来週への提案】\s*([\s\S]*?)$/);

  if (!summaryMatch && !insightMatch && !suggestionMatch) return null;

  return {
    summary: summaryMatch?.[1]?.trim() ?? '',
    insight: insightMatch?.[1]?.trim() ?? '',
    suggestion: suggestionMatch?.[1]?.trim() ?? '',
  };
}

const SECTION_META = [
  { key: 'summary' as const, label: '今週のサマリー', Icon: TrendingUp, color: 'var(--text-green)', bg: 'var(--bg-green)', border: 'var(--border-green)' },
  { key: 'insight' as const, label: 'パターン分析', Icon: Lightbulb, color: 'var(--text-amber)', bg: 'var(--bg-amber)', border: 'var(--border-amber)' },
  { key: 'suggestion' as const, label: '来週への一言', Icon: ArrowRight, color: 'var(--text-green)', bg: 'var(--bg-green)', border: 'var(--border-green)' },
];

function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart + 'T00:00:00');
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  return `${fmt(start)} 〜 ${fmt(end)}`;
}

function InsightCard({ insight }: { insight: WeeklyInsight }) {
  const sections = parseInsightSections(insight.insight_text);
  const weekRange = formatWeekRange(insight.week_start);

  const card: React.CSSProperties = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-xl)',
    padding: '24px',
    boxShadow: 'var(--shadow-card)',
  };

  return (
    <div style={card}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: 'var(--radius-md)',
            background: 'var(--bg-purple)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <BrainCircuit size={17} strokeWidth={1.8} color="var(--accent-green)" />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '-0.01em', margin: 0 }}>
              週次レポート
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-placeholder)', margin: 0 }}>
              {weekRange}
            </p>
          </div>
        </div>

        {insight.avg_score !== null && (
          <div style={{
            padding: '6px 14px', borderRadius: 'var(--radius-md)',
            background: 'var(--bg-green)', border: '1px solid var(--border-green)',
            textAlign: 'right',
          }}>
            <div style={{ fontSize: '10px', color: 'var(--text-green)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>週平均</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-green)', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
              {Math.round(insight.avg_score)}
            </div>
          </div>
        )}
      </div>

      {/* 本文 */}
      {sections ? (
        <div style={{ display: 'grid', gap: '10px' }}>
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
                  boxShadow: 'var(--shadow-xs)', marginTop: '1px',
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
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>
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
      )}
    </div>
  );
}

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: insights }, { data: profile }] = await Promise.all([
    supabase.from('weekly_insights')
      .select('*')
      .eq('user_id', user.id)
      .order('week_start', { ascending: false })
      .limit(12),
    supabase.from('profiles').select('display_name, avatar_url').eq('id', user.id).single(),
  ]);

  // モーニング/チェックアウト完了状態（ナビ用）
  const today = new Date().toISOString().split('T')[0];
  const { data: todayCheckins } = await supabase
    .from('checkins').select('timing')
    .gte('checked_at', today + 'T00:00:00Z')
    .lte('checked_at', today + 'T23:59:59Z');

  const morningDone = (todayCheckins || []).some(c => c.timing === 'morning');
  const eveningDone = (todayCheckins || []).some(c => c.timing === 'checkout' || c.timing === 'evening');

  const sectionLabel: React.CSSProperties = {
    fontSize: '12px', fontWeight: 600, color: 'var(--text-placeholder)',
    letterSpacing: '0.06em', textTransform: 'uppercase',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <TopNav morningDone={morningDone} eveningDone={eveningDone} profile={profile} userId={user.id} />

      <main className="page-main" style={{ maxWidth: '760px' }}>
        {/* ページヘッダー */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-purple)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BrainCircuit size={18} strokeWidth={1.8} color="var(--accent-green)" />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: 0 }}>
              週次レポート
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-placeholder)', marginLeft: '46px' }}>
            毎週のコンディション振り返り記録
          </p>
        </div>

        {/* レポート一覧 */}
        {insights && insights.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {insights.map((insight, idx) => (
              <div key={insight.id}>
                {idx === 0 && (
                  <p style={{ ...sectionLabel, marginBottom: '10px' }}>最新</p>
                )}
                {idx === 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '8px 0 10px' }}>
                    <p style={{ ...sectionLabel, margin: 0 }}>過去のレポート</p>
                    <ChevronDown size={13} strokeWidth={2} color="var(--text-placeholder)" />
                  </div>
                )}
                <InsightCard insight={insight as WeeklyInsight} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)', padding: '48px 32px',
            boxShadow: 'var(--shadow-card)', textAlign: 'center',
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: 'var(--radius-full)',
              background: 'var(--bg-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <BrainCircuit size={22} strokeWidth={1.8} color="var(--text-placeholder)" />
            </div>
            <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              まだレポートがありません
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-placeholder)', lineHeight: 1.7 }}>
              5日以上チェックインすると<br />週次レポートが生成されます
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
