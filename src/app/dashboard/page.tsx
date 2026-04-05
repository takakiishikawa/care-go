import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import TopNav from '@/components/ui/TopNav';
import ScoreChart from '@/components/dashboard/ScoreChart';
import MeditationChart from '@/components/dashboard/MeditationChart';
import WeeklyInsightCard from '@/components/dashboard/WeeklyInsightCard';
import { DailyScore, DailyMeditation } from '@/lib/types';

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  // 過去7日のチェックインを取得
  const { data: checkins } = await supabase
    .from('checkins')
    .select('*')
    .gte('checked_at', sevenDaysAgo.toISOString().split('T')[0] + 'T00:00:00')
    .order('checked_at', { ascending: false });

  // 過去7日の瞑想ログを取得
  const { data: meditationLogs } = await supabase
    .from('meditation_logs')
    .select('*')
    .gte('logged_at', sevenDaysAgo.toISOString().split('T')[0] + 'T00:00:00');

  // 今週のインサイトを取得
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  const weekStartStr = weekStart.toISOString().split('T')[0];

  const { data: weeklyInsight } = await supabase
    .from('weekly_insights')
    .select('*')
    .eq('week_start', weekStartStr)
    .single();

  // 今日のチェックイン
  const todayCheckins = (checkins || []).filter(c =>
    c.checked_at.startsWith(today)
  );
  const morningCheckin = todayCheckins.find(c => c.timing === 'morning');
  const eveningCheckin = todayCheckins.find(c => c.timing === 'evening');
  const latestCheckin = eveningCheckin || morningCheckin;

  // 今日のスコア計算
  const todayMorningScore = morningCheckin?.condition_score ?? null;
  const todayEveningScore = eveningCheckin?.condition_score ?? null;
  const todayScore = todayMorningScore !== null && todayEveningScore !== null
    ? Math.round((todayMorningScore + todayEveningScore) / 2)
    : todayMorningScore ?? todayEveningScore ?? null;

  // 7日間のスコアデータ構築
  const last7Days = getLast7Days();
  const scoreData: DailyScore[] = last7Days.map(date => {
    const dayCheckins = (checkins || []).filter(c => c.checked_at.startsWith(date));
    const morning = dayCheckins.find(c => c.timing === 'morning');
    const evening = dayCheckins.find(c => c.timing === 'evening');
    const ms = morning?.condition_score ?? null;
    const es = evening?.condition_score ?? null;
    const score = ms !== null && es !== null ? Math.round((ms + es) / 2) : ms ?? es ?? null;
    return { date, score, morning_score: ms, evening_score: es };
  });

  // 7日間の瞑想データ構築
  const meditationData: DailyMeditation[] = last7Days.map(date => {
    const count = (meditationLogs || []).filter(m =>
      m.logged_at.startsWith(date)
    ).length;
    return { date, count };
  });

  // 週次サマリー
  const validScores = scoreData.filter(d => d.score !== null).map(d => d.score!);
  const weekAvg = validScores.length > 0
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : null;

  const currentHour = new Date().getHours();
  const isMorning = currentHour < 12;
  const nextTiming = isMorning && !morningCheckin ? 'morning' : !eveningCheckin ? 'evening' : null;
  const nextTimingLabel = nextTiming === 'morning' ? '朝のチェックイン' : '夜のチェックイン';

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6F2' }}>
      <TopNav morningDone={!!morningCheckin} eveningDone={!!eveningCheckin} />

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 32px 64px' }}>

        {/* チェックインCTA */}
        {nextTiming && (
          <div style={{
            background: '#2D8A5F',
            borderRadius: '14px',
            padding: '20px 24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginBottom: '4px' }}>
                {isMorning ? 'おはようございます。' : 'お疲れさまでした。'}
              </div>
              <div style={{ color: 'white', fontSize: '16px', fontWeight: 500 }}>
                {nextTimingLabel}をしましょう
              </div>
            </div>
            <Link
              href="/checkin"
              style={{
                background: 'white',
                color: '#2D8A5F',
                borderRadius: '10px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              チェックイン →
            </Link>
          </div>
        )}

        {/* 本日のコンディション */}
        <div style={{
          background: '#FFFFFF',
          border: '0.5px solid var(--border-color)',
          borderRadius: '14px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          marginBottom: '20px',
        }}>
          <div style={{ fontSize: '13px', color: '#A09B92', marginBottom: '16px', fontWeight: 500 }}>
            本日のコンディション
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#A09B92', marginBottom: '4px' }}>総合スコア</div>
              <div style={{
                fontFamily: '"DM Serif Display", Georgia, serif',
                fontSize: '56px',
                lineHeight: 1,
                color: todayScore !== null ? '#1A5C3E' : '#D8D5CE',
              }}>
                {todayScore ?? '–'}
              </div>
              {todayScore !== null && (
                <div style={{ fontSize: '13px', color: '#A09B92' }}>/ 100</div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ background: '#F8F6F2', borderRadius: '10px', padding: '12px 16px', minWidth: '120px' }}>
                <div style={{ fontSize: '11px', color: '#A09B92', marginBottom: '4px' }}>朝スコア</div>
                <div style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: '24px', color: '#1A1815' }}>
                  {todayMorningScore ?? '–'}
                </div>
              </div>
              <div style={{ background: '#F8F6F2', borderRadius: '10px', padding: '12px 16px', minWidth: '120px' }}>
                <div style={{ fontSize: '11px', color: '#A09B92', marginBottom: '4px' }}>夜スコア</div>
                <div style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: '24px', color: '#1A1815' }}>
                  {todayEveningScore ?? '–'}
                </div>
              </div>
            </div>

            {weekAvg !== null && (
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#A09B92', marginBottom: '4px' }}>週平均</div>
                <div style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: '28px', color: '#2D8A5F' }}>
                  {weekAvg}
                </div>
              </div>
            )}
          </div>

          {latestCheckin?.ai_comment && (
            <div style={{
              background: '#E8F5EF',
              borderLeft: '3px solid #4DAF80',
              borderRadius: '0 10px 10px 0',
              padding: '12px 16px',
            }}>
              <div style={{ fontSize: '11px', color: '#2D8A5F', marginBottom: '4px', fontWeight: 500 }}>AIコメント</div>
              <div style={{ fontSize: '13px', color: '#1A5C3E', lineHeight: 1.6 }}>
                {latestCheckin.ai_comment}
              </div>
            </div>
          )}

          {!morningCheckin && !eveningCheckin && (
            <div style={{ color: '#A09B92', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>
              本日のチェックインはまだありません
            </div>
          )}
        </div>

        {/* グラフ行 */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* スコア推移 */}
          <div style={{
            background: '#FFFFFF',
            border: '0.5px solid var(--border-color)',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: '13px', color: '#A09B92', marginBottom: '20px', fontWeight: 500 }}>
              コンディションスコア（7日間）
            </div>
            <ScoreChart data={scoreData} />
          </div>

          {/* 瞑想回数 */}
          <div style={{
            background: '#FFFFFF',
            border: '0.5px solid var(--border-color)',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: '13px', color: '#A09B92', marginBottom: '20px', fontWeight: 500 }}>
              瞑想回数（7日間）
            </div>
            <MeditationChart data={meditationData} />
          </div>
        </div>

        {/* 週次インサイト */}
        <WeeklyInsightCard insight={weeklyInsight} />

      </main>
    </div>
  );
}
