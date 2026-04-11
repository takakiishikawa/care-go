import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generateAIComment(
  moodScore: number,
  emotionTags: string[],
  activityTags: string[],
  freeText: string | null,
  timing: string,
  recentCheckins: Array<{ checked_at: string; condition_score: number | null; emotion_tags: string[]; activity_tags: string[] }>
): Promise<string> {
  const timingLabel = timing === 'morning' ? '朝' : '夜';

  // 過去7日間のスコア推移
  const scoreHistory = recentCheckins
    .filter(c => c.condition_score !== null)
    .map(c => {
      const date = new Date(c.checked_at);
      const dayLabel = `${date.getMonth() + 1}/${date.getDate()}`;
      return `${dayLabel}: ${c.condition_score}`;
    })
    .join(', ');

  // 過去7日間の活動タグ傾向
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
        content: `${timingLabel}のチェックイン：
気分スコア: ${moodScore}/5
感情タグ: ${emotionTags.join('、') || 'なし'}
活動タグ: ${activityTags.join('、') || 'なし'}
${freeText ? `コメント: ${freeText}` : ''}

【直近7日間の推移】
コンディションスコア: ${scoreHistory || 'データなし'}
よく見られた活動: ${topActivities || 'データなし'}`,
      },
    ],
    system: `あなたは「Care」という名前の、ユーザーのコンディション管理AIです。
チェックイン情報を受け取り、以下の3つのセクションを必ず出力してください。

【今日の状態】
今の状態を読み取った内容を1〜2文で。入力内容の繰り返しは禁止。

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

async function generateConditionScore(
  moodScore: number,
  emotionTags: string[],
  activityTags: string[],
  freeText: string | null
): Promise<number> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 10,
    messages: [
      {
        role: 'user',
        content: `気分スコア: ${moodScore}/5
感情タグ: ${emotionTags.join('、') || 'なし'}
活動タグ: ${activityTags.join('、') || 'なし'}
${freeText ? `コメント: ${freeText}` : ''}`,
      },
    ],
    system: `ユーザーのチェックイン情報を元に、コンディションスコアを0〜100で算出してください。
気分スコア（1-5）・感情タグ・活動タグ・自由テキストを総合的に判断してください。
数値のみを返してください。`,
  });

  const content = message.content[0];
  if (content.type === 'text') {
    const score = parseInt(content.text.trim(), 10);
    if (!isNaN(score) && score >= 0 && score <= 100) return score;
  }
  return moodScore * 20;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { mood_score, emotion_tags, activity_tags = [], free_text, timing } = body;

  // 過去7日間のチェックインを取得（AIコメント用）
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { data: recentCheckins } = await supabase
    .from('checkins')
    .select('checked_at, condition_score, emotion_tags, activity_tags')
    .gte('checked_at', sevenDaysAgo.toISOString())
    .order('checked_at', { ascending: true });

  // AIコメントとコンディションスコアを並行生成
  const [ai_comment, condition_score] = await Promise.all([
    generateAIComment(mood_score, emotion_tags, activity_tags, free_text, timing, recentCheckins || []),
    generateConditionScore(mood_score, emotion_tags, activity_tags, free_text),
  ]);

  const { data, error } = await supabase
    .from('checkins')
    .insert({
      user_id: user.id,
      timing,
      mood_score,
      emotion_tags,
      activity_tags,
      free_text: free_text || null,
      condition_score,
      ai_comment,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ checkin: data });
}
