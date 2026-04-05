import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import CompleteContent from './CompleteContent';

const FALLBACK_URL = 'https://www.youtube.com/watch?v=LR6-B9ItZxE';

async function getMeditationUrl(): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'meditation_url')
    .single();
  return data?.value ?? FALLBACK_URL;
}

export default async function CheckinCompletePage() {
  const meditationUrl = await getMeditationUrl();

  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#F8F6F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#A09B92' }}>読み込み中...</p>
      </div>
    }>
      <CompleteContent meditationUrl={meditationUrl} />
    </Suspense>
  );
}
