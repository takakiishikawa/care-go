import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generateAIComment(
  moodScore: number,
  emotionTags: string[],
  freeText: string | null,
  timing: string
): Promise<string> {
  const timingLabel = timing === 'morning' ? '朝' : '夜';
  const tagsText = emotionTags.join('、');

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 200,
    messages: [
      {
        role: 'user',
        content: `${timingLabel}のチェックイン情報：
気分スコア: ${moodScore}/5
感情タグ: ${tagsText}
${freeText ? `コメント: ${freeText}` : ''}`,
      },
    ],
    system: `あなたはユーザーのコンディション管理をサポートするAIです。
ユーザーが気分スコアと感情タグを入力しました。
1〜2文で短く温かいコメントを日本語で返してください。
説教や過度なアドバイスは不要。共感と小さな気づきを。
テキストのみ返してください。`,
  });

  const content = message.content[0];
  if (content.type === 'text') return content.text;
  return 'お疲れさまです。';
}

async function generateConditionScore(
  moodScore: number,
  emotionTags: string[],
  freeText: string | null
): Promise<number> {
  const tagsText = emotionTags.join('、');

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 10,
    messages: [
      {
        role: 'user',
        content: `気分スコア: ${moodScore}/5
感情タグ: ${tagsText}
${freeText ? `コメント: ${freeText}` : ''}`,
      },
    ],
    system: `ユーザーのチェックイン情報を元に、コンディションスコアを0〜100で算出してください。
気分スコア（1-5）・感情タグ・自由テキストを総合的に判断してください。
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
  const { mood_score, emotion_tags, free_text, timing } = body;

  // AIコメントとコンディションスコアを並行生成
  const [ai_comment, condition_score] = await Promise.all([
    generateAIComment(mood_score, emotion_tags, free_text, timing),
    generateConditionScore(mood_score, emotion_tags, free_text),
  ]);

  const { data, error } = await supabase
    .from('checkins')
    .insert({
      user_id: user.id,
      timing,
      mood_score,
      emotion_tags,
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
