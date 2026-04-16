import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CheckinForm from '@/components/checkin/CheckinForm';
import TopNav from '@/components/ui/TopNav';
import { getCheckinTiming, getTodayHCM } from '@/lib/timing';
import Link from 'next/link';
import { CheckCircle, LayoutDashboard } from 'lucide-react';

export default async function CheckinPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const today = getTodayHCM();

  const [{ data: todayCheckins }, { data: profile }] = await Promise.all([
    supabase.from('checkins').select('timing')
      .gte('checked_at', today + 'T00:00:00Z')
      .lte('checked_at', today + 'T23:59:59Z'),
    supabase.from('profiles').select('display_name, avatar_url').eq('id', user.id).single(),
  ]);

  const morningDone = (todayCheckins || []).some(c => c.timing === 'morning');
  // 後方互換: 旧データ 'evening' も checkout 扱い
  const checkoutDone = (todayCheckins || []).some(c => c.timing === 'checkout' || c.timing === 'evening');
  const timing = getCheckinTiming();
  const alreadyDone = timing === 'morning' ? morningDone : checkoutDone;

  const isMorning = timing === 'morning';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <TopNav morningDone={morningDone} eveningDone={checkoutDone} profile={profile} userId={user.id} />

      <main className="checkin-main">
        {alreadyDone ? (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)', padding: '48px 32px',
            boxShadow: 'var(--shadow-card)', textAlign: 'center',
          }}>
            <div style={{
              width: '64px', height: '64px', background: 'var(--bg-green)', borderRadius: 'var(--radius-full)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
              boxShadow: 'var(--shadow-green)',
            }}>
              <CheckCircle size={28} strokeWidth={2} color="var(--accent-green)" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', letterSpacing: '-0.02em' }}>
              {isMorning ? '朝チェックイン' : '夜チェックアウト'}は完了済みです
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '28px' }}>
              {isMorning && !checkoutDone
                ? '夜チェックアウトは19時以降にできます。'
                : '今日のチェックイン・アウトは完了しています。'}
            </p>
            <Link href="/dashboard" style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              background: 'var(--gradient-green)', color: 'white',
              borderRadius: 'var(--radius-md)', padding: '12px 24px',
              fontSize: '15px', fontWeight: 600, textDecoration: 'none',
              boxShadow: 'var(--shadow-green)', letterSpacing: '-0.02em',
            }}>
              <LayoutDashboard size={15} strokeWidth={2} />
              ダッシュボードへ
            </Link>
          </div>
        ) : (
          <CheckinForm timing={timing} />
        )}
      </main>
    </div>
  );
}
