import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Sun, Moon, TrendingUp, Wind } from 'lucide-react';
import CareComment from '@/components/ui/CareComment';
import TopNav from '@/components/ui/TopNav';
import ScoreLineChart from '@/components/dashboard/ScoreLineChart';
import MeditationDots from '@/components/dashboard/MeditationDots';
import WeeklyInsightCard from '@/components/dashboard/WeeklyInsightCard';
import InsightPopup from '@/components/dashboard/InsightPopup';
import { DailyScore, DailyMeditation } from '@/lib/types';
import { getCheckinWindow, getLast7DaysHCM, getTodayHCM } from '@/lib/timing';
import CheckinCTABanner from '@/components/dashboard/CheckinCTABanner';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const today = getTodayHCM();
  const last7Days = getLast7DaysHCM();
  const sevenDaysAgo = last7Days[0];

  const fourteenDaysAgoDate = new Date();
  fourteenDaysAgoDate.setDate(fourteenDaysAgoDate.getDate() - 14);
  const fourteenDaysAgo = fourteenDaysAgoDate.toISOString().split('T')[0];

  const [
    { data: checkins },
    { data: prevWeekCheckins },
    { data: meditationLogs },
    { data: profile },
  ] = await Promise.all([
    supabase.from('checkins').select('*').gte('checked_at', sevenDaysAgo + 'T00:00:00Z').order('checked_at', { ascending: false }),
    supabase.from('checkins').select('condition_score').gte('checked_at', fourteenDaysAgo + 'T00:00:00Z').lt('checked_at', sevenDaysAgo + 'T00:00:00Z'),
    supabase.from('meditation_logs').select('*').gte('logged_at', sevenDaysAgo + 'T00:00:00Z'),
    supabase.from('profiles').select('display_name, avatar_url').eq('id', user.id).single(),
  ]);

  const now = new Date();
  const dow = now.getUTCDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const weekStart = new Date(now.getTime() + 7 * 3600000);
  weekStart.setUTCDate(weekStart.getUTCDate() + mondayOffset);
  const weekStartStr = weekStart.toISOString().split('T')[0];

  const { data: weeklyInsight } = await supabase
    .from('weekly_insights').select('*').eq('week_start', weekStartStr).single();

  // 今日
  const todayCheckins = (checkins || []).filter(c => c.checked_at.startsWith(today));
  const morningCheckin = todayCheckins.find(c => c.timing === 'morning');
  const eveningCheckin = todayCheckins.find(c => c.timing === 'evening');
  const latestCheckin = eveningCheckin || morningCheckin;
  const ms = morningCheckin?.condition_score ?? null;
  const es = eveningCheckin?.condition_score ?? null;
  const todayScore = latestCheckin?.condition_score ?? null;

  // 昨日
  const yesterdayStr = last7Days[last7Days.length - 2];
  const yesterdayCheckins = (checkins || []).filter(c => c.checked_at.startsWith(yesterdayStr));
  const yesterdayLatest =
    yesterdayCheckins.find(c => c.timing === 'evening') ||
    yesterdayCheckins.find(c => c.timing === 'morning');
  const yesterdayScore = yesterdayLatest?.condition_score ?? null;
  const scoreDiff = todayScore !== null && yesterdayScore !== null ? todayScore - yesterdayScore : null;

  // 7日間スコアデータ（最新チェックイン）
  const scoreData: DailyScore[] = last7Days.map(date => {
    const day = (checkins || []).filter(c => c.checked_at.startsWith(date));
    const m = day.find(c => c.timing === 'morning')?.condition_score ?? null;
    const e = day.find(c => c.timing === 'evening')?.condition_score ?? null;
    const score = e ?? m;
    return { date, score, morning_score: m, evening_score: e };
  });

  const meditationData: DailyMeditation[] = last7Days.map(date => ({
    date,
    count: (meditationLogs || []).filter(m => m.logged_at.startsWith(date)).length,
  }));

  const validScores = scoreData.filter(d => d.score !== null).map(d => d.score!);
  const thisWeekAvg = validScores.length > 0
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : null;

  const prevValidScores = (prevWeekCheckins || [])
    .map(c => c.condition_score)
    .filter((s): s is number => s !== null);
  const lastWeekAvg = prevValidScores.length > 0
    ? Math.round(prevValidScores.reduce((a, b) => a + b, 0) / prevValidScores.length)
    : null;

  const totalMeditations = meditationData.reduce((sum, d) => sum + d.count, 0);

  const window_ = getCheckinWindow();
  const showMorningCTA = window_ === 'morning' && !morningCheckin;
  const showEveningCTA = window_ === 'evening' && !eveningCheckin;
  const showCTA = showMorningCTA || showEveningCTA;
  const ctaLabel = showMorningCTA ? '朝のチェックイン' : '夜のチェックイン';

  const uniqueDays = new Set((checkins || []).map(c => c.checked_at.split('T')[0])).size;
  const hasEnoughData = uniqueDays >= 5;

  const diffColor = scoreDiff === null ? 'var(--text-placeholder)'
    : scoreDiff > 0 ? 'var(--accent-green)'
    : scoreDiff < 0 ? 'var(--accent-amber)'
    : 'var(--text-placeholder)';

  const weekDiff = thisWeekAvg !== null && lastWeekAvg !== null ? thisWeekAvg - lastWeekAvg : null;

  const card: React.CSSProperties = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-xl)',
    padding: '24px',
    boxShadow: 'var(--shadow-card)',
    display: 'flex',
    flexDirection: 'column',
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-placeholder)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: '12px',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <TopNav morningDone={!!morningCheckin} eveningDone={!!eveningCheckin} profile={profile} userId={user.id} />

      <main className="page-main">

        {showCTA && (
          <CheckinCTABanner
            greeting=""
            ctaLabel={ctaLabel}
            timing={showMorningCTA ? 'morning' : 'evening'}
          />
        )}

        {/* 上段：左（スコア）| 右（グラフ） */}
        <div className="dashboard-top-grid">

          {/* 左：本日のコンディション */}
          <div style={card}>
            <p style={sectionLabel}>今日のコンディション</p>

            {latestCheckin ? (
              <>
                {/* スコア + 前日比 */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    fontSize: '72px', fontWeight: 800, lineHeight: 1,
                    color: 'var(--text-primary)', letterSpacing: '-4px',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {todayScore ?? '–'}
                  </div>
                  <div style={{ paddingBottom: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {scoreDiff !== null && (
                      <span style={{
                        fontSize: '14px', fontWeight: 700, lineHeight: 1.2,
                        color: diffColor,
                        background: scoreDiff > 0 ? 'var(--bg-green)' : scoreDiff < 0 ? 'var(--bg-amber)' : 'var(--bg-subtle)',
                        padding: '2px 8px', borderRadius: 'var(--radius-full)',
                        border: `1px solid ${scoreDiff > 0 ? 'var(--border-green)' : scoreDiff < 0 ? 'var(--border-amber)' : 'var(--border-muted)'}`,
                      }}>
                        {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff === 0 ? '±0' : scoreDiff}
                      </span>
                    )}
                    <span style={{ fontSize: '12px', color: 'var(--text-placeholder)', letterSpacing: '-0.01em' }}>前日比</span>
                  </div>
                </div>

                {/* 朝・夜スコアバッジ */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {([
                    { Icon: Sun, label: '朝', score: ms },
                    { Icon: Moon, label: '夜', score: es },
                  ] as const).map(({ Icon, label, score }) => (
                    <div key={label} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-color)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Icon size={13} strokeWidth={2} color="var(--text-placeholder)" />
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
                      </div>
                      <span style={{
                        fontSize: '17px', fontWeight: 700, letterSpacing: '-0.03em',
                        color: score !== null ? 'var(--text-primary)' : 'var(--text-placeholder)',
                      }}>
                        {score ?? '–'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* AIひとこと */}
                {latestCheckin.ai_comment && (
                  <div style={{
                    borderTop: '1px solid var(--border-color)', paddingTop: '16px', flex: 1,
                  }}>
                    <CareComment comment={latestCheckin.ai_comment} compact />
                  </div>
                )}
              </>
            ) : (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '12px', padding: '32px 0',
              }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-green)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <TrendingUp size={22} strokeWidth={1.8} color="var(--accent-green)" />
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-placeholder)', textAlign: 'center', lineHeight: 1.6 }}>
                  今日のチェックインが<br />まだありません
                </p>
              </div>
            )}
          </div>

          {/* 右：コンディションスコアグラフ */}
          <div style={card}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '4px', flexShrink: 0,
            }}>
              <p style={{ ...sectionLabel, marginBottom: 0 }}>スコア推移（7日間）</p>
              {thisWeekAvg !== null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-placeholder)' }}>
                    今週平均{' '}
                    <span style={{ color: 'var(--text-green)', fontWeight: 700, fontSize: '15px' }}>{thisWeekAvg}</span>
                  </span>
                  {weekDiff !== null && weekDiff !== 0 && (
                    <span style={{
                      fontSize: '12px', fontWeight: 700,
                      color: weekDiff > 0 ? 'var(--text-green)' : 'var(--text-amber)',
                      background: weekDiff > 0 ? 'var(--bg-green)' : 'var(--bg-amber)',
                      padding: '2px 8px', borderRadius: 'var(--radius-full)',
                      border: `1px solid ${weekDiff > 0 ? 'var(--border-green)' : 'var(--border-amber)'}`,
                    }}>
                      {weekDiff > 0 ? `+${Math.round(weekDiff)}` : Math.round(weekDiff)}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div style={{ flex: 1, minHeight: '220px' }}>
              <ScoreLineChart data={scoreData} fillHeight />
            </div>
          </div>
        </div>

        {/* 瞑想カード */}
        <div style={{ ...card, marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p style={{ ...sectionLabel, marginBottom: 0 }}>
              <Wind size={13} strokeWidth={2} style={{ display: 'inline', marginRight: '5px', verticalAlign: '-2px' }} />
              瞑想（7日間）
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-placeholder)' }}>今週</span>
              <span style={{
                fontSize: '15px', fontWeight: 700, color: totalMeditations > 0 ? 'var(--accent-amber)' : 'var(--text-placeholder)',
                letterSpacing: '-0.02em',
              }}>
                {totalMeditations}回
              </span>
            </div>
          </div>
          <MeditationDots data={meditationData} />
        </div>

        {/* 週次インサイト */}
        <WeeklyInsightCard
          insight={weeklyInsight}
          thisWeekAvg={thisWeekAvg}
          lastWeekAvg={lastWeekAvg}
        />
      </main>

      <InsightPopup weekStartStr={weekStartStr} hasEnoughData={hasEnoughData} />
    </div>
  );
}
