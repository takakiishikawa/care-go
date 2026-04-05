import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CheckinForm from '@/components/checkin/CheckinForm';
import TopNav from '@/components/ui/TopNav';

export default async function CheckinPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const today = new Date().toISOString().split('T')[0];
  const { data: todayCheckins } = await supabase
    .from('checkins')
    .select('timing')
    .gte('checked_at', today + 'T00:00:00')
    .lte('checked_at', today + 'T23:59:59');

  const morningDone = (todayCheckins || []).some(c => c.timing === 'morning');
  const eveningDone = (todayCheckins || []).some(c => c.timing === 'evening');

  const currentHour = new Date().getHours();
  const timing = currentHour < 12 ? 'morning' : 'evening';

  // すでに実施済みの場合
  const alreadyDone = timing === 'morning' ? morningDone : eveningDone;

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6F2' }}>
      <TopNav morningDone={morningDone} eveningDone={eveningDone} />

      <main style={{ maxWidth: '620px', margin: '0 auto', padding: '48px 32px' }}>
        {alreadyDone ? (
          <div style={{
            background: '#FFFFFF',
            border: '0.5px solid var(--border-color)',
            borderRadius: '14px',
            padding: '48px 32px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>✓</div>
            <h2 style={{ fontSize: '20px', color: '#1A5C3E', marginBottom: '12px' }}>
              {timing === 'morning' ? '朝のチェックイン' : '夜のチェックイン'}は完了済みです
            </h2>
            <p style={{ fontSize: '14px', color: '#6B6660', lineHeight: 1.7 }}>
              {timing === 'morning' && !eveningDone
                ? '夜のチェックインは夕方以降にできます。'
                : '今日のチェックインは完了しています。お疲れさまでした。'}
            </p>
            <a href="/dashboard" style={{
              display: 'inline-block',
              marginTop: '24px',
              background: '#2D8A5F',
              color: 'white',
              borderRadius: '10px',
              padding: '10px 24px',
              fontSize: '15px',
              fontWeight: 500,
              textDecoration: 'none',
            }}>
              ダッシュボードへ
            </a>
          </div>
        ) : (
          <CheckinForm timing={timing} />
        )}
      </main>
    </div>
  );
}
