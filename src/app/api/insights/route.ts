import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 過去7日分のデータを取得
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: checkins } = await supabase
    .from('checkins')
    .select('checked_at, timing, mood_score, emotion_tags, condition_score')
    .gte('checked_at', sevenDaysAgo.toISOString())
    .order('checked_at', { ascending: true });

  if (!checkins || checkins.length === 0) {
    return NextResponse.json({ error: 'データが不足しています' }, { status: 400 });
  }

  // 感情タグの集計
  const allTags = checkins.flatMap(c => c.emotion_tags);
  const tagCounts: Record<string, number> = {};
  allTags.forEach(tag => { tagCounts[tag] = (tagCounts[tag] || 0) + 1; });

  const avgScore = checkins
    .filter(c => c.condition_score !== null)
    .reduce((sum, c) => sum + (c.condition_score || 0), 0) / checkins.length;

  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tag, count]) => `${tag}(${count}回)`)
    .join('、');

  const summary = `チェックイン回数: ${checkins.length}回、平均コンディションスコア: ${avgScore.toFixed(1)}、よく感じた感情: ${topTags}`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 400,
    messages: [{ role: 'user', content: summary }],
    system: `過去7日間のコンディションデータを分析して、ユーザーへの週次インサイトを日本語で返してください。
感情の傾向・スコアの変化・気づきや提案を3〜5文で。
ポジティブな視点を基本としつつ、正直に。
テキストのみ返してください。`,
  });

  const insightContent = message.content[0];
  const insightText = insightContent.type === 'text' ? insightContent.text : '';

  // 今週の月曜日を計算
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  const weekStartStr = weekStart.toISOString().split('T')[0];

  // upsert
  const { data, error } = await supabase
    .from('weekly_insights')
    .upsert({
      user_id: user.id,
      week_start: weekStartStr,
      insight_text: insightText,
      avg_score: avgScore,
    }, { onConflict: 'user_id,week_start' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ insight: data });
}
