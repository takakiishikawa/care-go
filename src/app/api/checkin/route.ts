import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Rating, TimePeriodRatings } from '@/lib/types';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PERIOD_LABELS: Record<string, string> = {
  last_night: '昨夜',
  this_morning: '今朝',
  morning: '午前',
  afternoon: '午後',
  evening: '夕方',
  night: '夜',
};

const RATING_SCORE: Record<Rating, number> = { A: 100, B: 60, C: 20 };

function calculateConditionScore(ratings: TimePeriodRatings): number {
  const values = Object.values(ratings).map(r => RATING_SCORE[r]);
  if (values.length === 0) return 50;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

async function generateAIComment(
  ratings: TimePeriodRatings,
  activityTags: string[],
  freeText: string | null,
  timing: string,
  checkedAt: string,
  recentCheckins: Array<{ checked_at: string; condition_score: number | null; time_period_ratings: TimePeriodRatings | null; activity_tags: string[] }>
): Promise<string> {
  const timingLabel = timing === 'morning' ? '朝' : '夜';

  // チェックイン時刻（HCM = UTC+7）
  const checkinDate = new Date(checkedAt);
  const hcmHour = (checkinDate.getUTCHours() + 7) % 24;
  const hcmMin = checkinDate.getUTCMinutes();
  const timeStr = `${hcmHour}:${String(hcmMin).padStart(2, '0')}`;

  // 時間帯別評価を文字列化
  const ratingsText = Object.entries(ratings)
    .map(([key, val]) => `${PERIOD_LABELS[key] ?? key}: ${val}`)
    .join('、');

  // 過去7日間のスコア推移
  const scoreHistory = recentCheckins
    .filter(c => c.condition_score !== null)
    .map(c => {
      const date = new Date(c.checked_at);
      const dayLabel = `${date.getMonth() + 1}/${date.getDate()}`;
      return `${dayLabel}: ${c.condition_score}`;
    })
    .join(', ');

  // 過去の活動タグ傾向
  const allRecentActivities = recentCheckins.flatMap(c => c.activity_tags || []);
  const activityCounts: Record<string, number> = {};
  allRecentActivities.forEach(a => { activityCounts[a] = (activityCounts[a] || 0) + 1; });
  const topActivities = Object.entries(activityCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tag, count]) => `${tag}(${count}回)`)
    .join('、');

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 200,
    messages: [
      {
        role: 'user',
        content: `${timingLabel}のチェックイン（${timeStr}）：
時間帯別評価: ${ratingsText}
活動タグ: ${activityTags.join('、') || 'なし'}
${freeText ? `メモ: ${freeText}` : ''}

【直近7日間の推移】
コンディションスコア: ${scoreHistory || 'データなし'}
よく見られた活動: ${topActivities || 'データなし'}`,
      },
    ],
    system: `ユーザーのコンディションチェックイン情報を受け取り、以下の3つのセクションを必ず出力してください。

【今日の状態】
時間帯ごとの評価（A良い・B普通・C悪い）から読み取れる状態を1〜2文で。入力内容の繰り返しは禁止。

【気づき】
活動タグ・スコア推移から見えるパターンや相関を1〜2文で。データがない場合は傾向を述べる。

【提案】
今日・この時間帯にやると良い具体的な行動を1文で。説教・過度なアドバイス不要。

ルール：
- セクション見出しは【今日の状態】【気づき】【提案】をそのまま使う
- 各セクション見出しの直後に改行して本文を書く
- 絵文字は使わない
- テキストのみ返してください`,
  });

  const content = message.content[0];
  if (content.type === 'text') return content.text;
  return 'お疲れさまです。';
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { time_period_ratings, activity_tags = [], free_text, timing } = body;

  if (!time_period_ratings || typeof time_period_ratings !== 'object') {
    return NextResponse.json({ error: 'time_period_ratings is required' }, { status: 400 });
  }

  const checkedAt = new Date().toISOString();

  // コンディションスコアをローカルで計算（AI不要）
  const condition_score = calculateConditionScore(time_period_ratings as TimePeriodRatings);

  // 過去7日間のチェックインを取得（AIコメント用）
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { data: recentCheckins } = await supabase
    .from('checkins')
    .select('checked_at, condition_score, time_period_ratings, activity_tags')
    .gte('checked_at', sevenDaysAgo.toISOString())
    .order('checked_at', { ascending: true });

  const ai_comment = await generateAIComment(
    time_period_ratings as TimePeriodRatings,
    activity_tags,
    free_text || null,
    timing,
    checkedAt,
    recentCheckins || []
  );

  const { data, error } = await supabase
    .from('checkins')
    .insert({
      user_id: user.id,
      timing,
      time_period_ratings,
      activity_tags,
      free_text: free_text || null,
      condition_score,
      ai_comment,
      checked_at: checkedAt,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ checkin: data });
}
