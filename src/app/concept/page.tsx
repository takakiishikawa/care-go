import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTodayHCM } from '@/lib/timing';
import TopNav from '@/components/ui/TopNav';
import {
  Wind, ArrowDown,
  Sun, Moon, Target, BarChart3,
  CircleCheck, CircleX,
} from 'lucide-react';

export default async function ConceptPage() {
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
  const eveningDone = (todayCheckins || []).some(c => c.timing === 'evening');

  const card: React.CSSProperties = {
    background: 'var(--bg-card)',
    border: '0.5px solid var(--border-color)',
    borderRadius: '14px',
    padding: '28px 28px',
    boxShadow: 'var(--shadow-card)',
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-green)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '12px',
  };

  const body: React.CSSProperties = {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    lineHeight: 1.85,
  };

  const userStory = [
    { icon: <Sun size={16} strokeWidth={2} color="var(--text-amber)" />, text: '朝の瞑想前にチェックイン（気分・感情を記録）', color: 'var(--bg-amber)', border: 'var(--border-amber)' },
    { icon: <span style={{ fontSize: '14px' }}>✨</span>, text: 'Coaがスコアと短いコメントを即時返す', color: 'var(--bg-green)', border: 'var(--border-green)' },
    { icon: <Wind size={16} strokeWidth={2} color="#2980B9" />, text: '瞑想に進む（ログが自動記録される）', color: 'var(--bg-blue)', border: 'var(--border-blue)' },
    { icon: <Moon size={16} strokeWidth={2} color="var(--text-muted)" />, text: '夜の瞑想前に再度チェックイン', color: 'var(--bg-muted)', border: 'var(--border-muted)' },
    { icon: <BarChart3 size={16} strokeWidth={2} color="var(--text-green)" />, text: '1日のスコアが確定・グラフに反映', color: 'var(--bg-green)', border: 'var(--border-green)' },
    { icon: <span style={{ fontSize: '14px' }}>🔁</span>, text: '毎週日曜日にCoaが週次インサイトを生成', color: 'var(--bg-amber)', border: 'var(--border-amber)' },
    { icon: <Target size={16} strokeWidth={2} color="var(--text-green)" />, text: 'パターンへの気づきが行動変化につながる', color: 'var(--bg-green)', border: 'var(--border-green)' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <TopNav morningDone={morningDone} eveningDone={eveningDone} profile={profile} userId={user.id} />

      <main style={{ maxWidth: '820px', margin: '0 auto', padding: '52px 40px 80px' }}>

        {/* ドキュメントヘッダー */}
        <section style={{ marginBottom: '56px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '40px' }}>
            CareGo
          </h1>

          {/* コアバリュー */}
          <div style={{ marginBottom: '36px' }}>
            <p style={sectionLabel}>コアバリュー</p>
            <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
              良いコンディションの安定を、AIと一緒に作る。
            </p>
          </div>

          {/* 背景・課題 */}
          <div style={{ marginBottom: '36px' }}>
            <p style={sectionLabel}>背景・課題</p>
            <p style={{ ...body, marginBottom: '20px' }}>
              義務感で動き続けると、じわじわとエネルギーが削られていく。
              コンディションが不安定になると、学習・仕事・人間関係、
              あらゆる領域のパフォーマンスが落ちる。
              逆に、調子が良い日は同じことをしても全てがうまく回る。
            </p>
            <div style={{
              padding: '16px 20px',
              background: 'var(--bg-green)', borderRadius: '10px',
              borderLeft: '3px solid var(--accent-green)',
            }}>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-green-dark)', lineHeight: 1.6 }}>
                コンディションを安定させることが、生活全体を底上げする<br />
                最も効果的なアプローチである。
              </p>
            </div>
          </div>

          {/* プロダクトの定義 */}
          <div>
            <p style={sectionLabel}>プロダクトの定義</p>
            <p style={{ ...body, margin: 0 }}>
              毎日の気分・感情をチェックインで記録し、AIがパターンを
              分析してインサイトを返す。瞑想との連携で習慣化を促す。
            </p>
          </div>
        </section>

        {/* プロダクトスコープ */}
        <section style={{ marginBottom: '48px' }}>
          <p style={sectionLabel}>プロダクトスコープ</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ ...card, borderTop: '3px solid var(--accent-green)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <CircleCheck size={18} strokeWidth={2} color="var(--accent-green)" />
                <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-green-dark)' }}>解くこと</span>
              </div>
              <p style={{ ...body, fontSize: '14px' }}>
                日常のコンディションの波を観察・認識し、良い状態を安定させること。
              </p>
            </div>
            <div style={{ ...card, borderTop: '3px solid var(--border-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <CircleX size={18} strokeWidth={2} color="var(--text-placeholder)" />
                <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-muted)' }}>解かないこと</span>
              </div>
              <ul style={{ ...body, fontSize: '14px', color: 'var(--text-muted)', listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  '臨床的なメンタルヘルス疾患の治療・診断',
                  'カウンセリングや医療の代替',
                  '人とのつながりを直接増やすこと',
                  'やりたいことをやりたいに変えること',
                ].map(t => (
                  <li key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <span style={{ marginTop: '4px', flexShrink: 0, color: 'var(--border-muted)' }}>—</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ユーザーストーリー */}
        <section style={{ marginBottom: '48px' }}>
          <p style={sectionLabel}>ユーザーストーリー</p>
          <div style={{ ...card }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {userStory.map((step, i) => (
                <div key={i}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px 16px', borderRadius: '10px',
                    background: step.color, border: `0.5px solid ${step.border}`,
                  }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)',
                      boxShadow: 'var(--shadow-sm)',
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      {step.icon}
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step.text}</span>
                    </div>
                  </div>
                  {i < userStory.length - 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
                      <ArrowDown size={14} strokeWidth={2} color="var(--border-muted)" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 指標 */}
        <section>
          <p style={sectionLabel}>指標</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={card}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px' }}>
                行動指標
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'チェックイン入力率（朝・夜）', freq: '日単位', Icon: Sun },
                  { label: '瞑想実施回数', freq: '週単位', Icon: Wind },
                ].map(({ label, freq, Icon }) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 14px', background: 'var(--bg-subtle)', borderRadius: '10px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icon size={14} strokeWidth={2} color="var(--text-green)" />
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{label}</span>
                    </div>
                    <span style={{
                      fontSize: '12px', color: 'var(--text-green)', fontWeight: 500,
                      background: 'var(--bg-green)', padding: '3px 8px', borderRadius: '9999px',
                    }}>{freq}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...card, borderLeft: '3px solid var(--accent-green)' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px' }}>
                結果指標
              </div>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>
                コンディションスコアの週次平均値が、以前より
                <strong style={{ color: 'var(--text-green-dark)' }}> 安定して高くなること。</strong>
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
