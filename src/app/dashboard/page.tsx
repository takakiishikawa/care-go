import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Sun, Moon, TrendingUp, Wind, Sparkles, Activity, ArrowRight } from 'lucide-react';
import TopNav from '@/components/ui/TopNav';
import ScoreLineChart from '@/components/dashboard/ScoreLineChart';
import MeditationLineChart from '@/components/dashboard/MeditationLineChart';
import WeeklyInsightCard from '@/components/dashboard/WeeklyInsightCard';
import InsightPopup from '@/components/dashboard/InsightPopup';
import { DailyScore, DailyMeditation } from '@/lib/types';
import { getCheckinWindow, getHCMHour, getLast7DaysHCM, getTodayHCM } from '@/lib/timing';
import CheckinCTABanner from '@/components/dashboard/CheckinCTABanner';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const today = getTodayHCM();
  const last7Days = getLast7DaysHCM();
  const sevenDaysAgo = last7Days[0];

  const [
    { data: checkins },
    { data: meditationLogs },
    { data: profile },
  ] = await Promise.all([
    supabase.from('checkins').select('*').gte('checked_at', sevenDaysAgo + 'T00:00:00Z').order('checked_at', { ascending: false }),
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
  const todayScore = ms !== null && es !== null ? Math.round((ms + es) / 2) : ms ?? es ?? null;

  // 昨日
  const yesterdayStr = last7Days[last7Days.length - 2];
  const yesterdayCheckins = (checkins || []).filter(c => c.checked_at.startsWith(yesterdayStr));
  const ym = yesterdayCheckins.find(c => c.timing === 'morning')?.condition_score ?? null;
  const ye = yesterdayCheckins.find(c => c.timing === 'evening')?.condition_score ?? null;
  const yesterdayScore = ym !== null && ye !== null ? Math.round((ym + ye) / 2) : ym ?? ye ?? null;
  const scoreDiff = todayScore !== null && yesterdayScore !== null ? todayScore - yesterdayScore : null;

  // 7日間データ
  const scoreData: DailyScore[] = last7Days.map(date => {
    const day = (checkins || []).filter(c => c.checked_at.startsWith(date));
    const m = day.find(c => c.timing === 'morning')?.condition_score ?? null;
    const e = day.find(c => c.timing === 'evening')?.condition_score ?? null;
    const score = m !== null && e !== null ? Math.round((m + e) / 2) : m ?? e ?? null;
    return { date, score, morning_score: m, evening_score: e };
  });

  const meditationData: DailyMeditation[] = last7Days.map(date => ({
    date,
    count: (meditationLogs || []).filter(m => m.logged_at.startsWith(date)).length,
  }));

  const validScores = scoreData.filter(d => d.score !== null).map(d => d.score!);
  const weekAvg = validScores.length > 0
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : null;

  const window_ = getCheckinWindow();
  const showMorningCTA = window_ === 'morning' && !morningCheckin;
  const showEveningCTA = window_ === 'evening' && !eveningCheckin;
  const showCTA = showMorningCTA || showEveningCTA;

  const hcmHour = getHCMHour();
  const greeting = hcmHour < 12 ? 'おはようございます。' : 'お疲れさまでした。';
  const ctaLabel = showMorningCTA ? '朝のチェックイン' : '夜のチェックイン';

  const uniqueDays = new Set((checkins || []).map(c => c.checked_at.split('T')[0])).size;
  const hasEnoughData = uniqueDays >= 5;

  const sep = (
    <div style={{ width: '1px', alignSelf: 'stretch', background: 'var(--border-color)', margin: '0 4px', flexShrink: 0 }} />
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <TopNav morningDone={!!morningCheckin} eveningDone={!!eveningCheckin} profile={profile} userId={user.id} />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 40px 64px' }}>

        {showCTA && (
          <CheckinCTABanner
            greeting={greeting}
            ctaLabel={ctaLabel}
            timing={showMorningCTA ? 'morning' : 'evening'}
          />
        )}

        {/* 本日のコンディション */}
        <div style={{
          background: 'var(--bg-card)', border: '0.5px solid var(--border-color)',
          borderRadius: '14px', padding: '20px 24px',
          boxShadow: 'var(--shadow-card)', marginBottom: '20px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            fontSize: '13px', color: 'var(--text-placeholder)', marginBottom: '16px', fontWeight: 500,
          }}>
            <Activity size={14} strokeWidth={2} color="var(--text-placeholder)" />
            本日のコンディション
          </div>

          {/* スコア行 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: latestCheckin?.ai_comment ? '16px' : '0' }}>

            {/* 前日 */}
            <div style={{ textAlign: 'center', minWidth: '52px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-placeholder)', marginBottom: '4px' }}>前日</div>
              <div style={{ fontSize: '30px', fontWeight: 600, lineHeight: 1, color: 'var(--text-muted)' }}>
                {yesterdayScore ?? '–'}
              </div>
            </div>

            <ArrowRight size={14} strokeWidth={2} color="var(--border-muted)" style={{ flexShrink: 0 }} />

            {/* 今日（メイン） */}
            <div style={{ textAlign: 'center', minWidth: '80px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-placeholder)', marginBottom: '4px' }}>今日</div>
              <div style={{
                fontSize: '52px', fontWeight: 700, lineHeight: 1,
                color: todayScore !== null ? 'var(--text-green-dark)' : 'var(--border-muted)',
              }}>
                {todayScore ?? '–'}
              </div>
              {scoreDiff !== null && (
                <div style={{
                  fontSize: '12px', fontWeight: 500, marginTop: '4px',
                  color: scoreDiff > 0 ? 'var(--text-green)' : scoreDiff < 0 ? 'var(--text-error)' : 'var(--text-placeholder)',
                }}>
                  {scoreDiff > 0 ? `▲ +${scoreDiff}` : scoreDiff < 0 ? `▼ ${scoreDiff}` : '±0'}
                </div>
              )}
            </div>

            {sep}

            {/* 朝・夜の内訳 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {([
                { Icon: Sun, label: '朝', score: ms },
                { Icon: Moon, label: '夜', score: es },
              ] as const).map(({ Icon, label, score }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '8px',
                    background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={12} strokeWidth={2} color="var(--text-placeholder)" />
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-placeholder)', minWidth: '16px' }}>{label}</span>
                  <span style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>
                    {score ?? '–'}
                  </span>
                </div>
              ))}
            </div>

            {sep}

            {/* 週平均 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-placeholder)', marginBottom: '4px' }}>週平均</div>
              <div style={{ fontSize: '36px', fontWeight: 600, lineHeight: 1, color: weekAvg !== null ? 'var(--text-green)' : 'var(--border-muted)' }}>
                {weekAvg ?? '–'}
              </div>
            </div>

          </div>

          {/* Coaコメント */}
          {latestCheckin?.ai_comment && (
            <div style={{
              background: 'var(--bg-green)', borderLeft: '3px solid #4DAF80',
              borderRadius: '0 10px 10px 0', padding: '12px 16px',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '12px', color: 'var(--text-green)', marginBottom: '4px', fontWeight: 600,
              }}>
                <Sparkles size={12} strokeWidth={2} />
                Coa のひとこと
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-green-dark)', lineHeight: 1.7 }}>{latestCheckin.ai_comment}</div>
            </div>
          )}

          {!morningCheckin && !eveningCheckin && (
            <div style={{ fontSize: '13px', color: 'var(--text-placeholder)', marginTop: '4px' }}>
              本日のチェックインはまだありません
            </div>
          )}
        </div>

        {/* グラフ行 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div style={{
            background: 'var(--bg-card)', border: '0.5px solid var(--border-color)',
            borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              fontSize: '14px', color: 'var(--text-placeholder)', marginBottom: '20px', fontWeight: 500,
            }}>
              <TrendingUp size={15} strokeWidth={2} color="var(--text-placeholder)" />
              コンディションスコア（7日間）
            </div>
            <ScoreLineChart data={scoreData} />
          </div>

          <div style={{
            background: 'var(--bg-card)', border: '0.5px solid var(--border-color)',
            borderRadius: '14px', padding: '24px', boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              fontSize: '14px', color: 'var(--text-placeholder)', marginBottom: '20px', fontWeight: 500,
            }}>
              <Wind size={15} strokeWidth={2} color="var(--text-placeholder)" />
              瞑想回数（7日間）
            </div>
            <MeditationLineChart data={meditationData} />
          </div>
        </div>

        {/* 週次インサイト */}
        <WeeklyInsightCard insight={weeklyInsight} />
      </main>

      <InsightPopup weekStartStr={weekStartStr} hasEnoughData={hasEnoughData} />
    </div>
  );
}
