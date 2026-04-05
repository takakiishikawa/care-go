'use client';

import Link from 'next/link';
import { Sun, Moon, PenLine } from 'lucide-react';

interface CheckinCTABannerProps {
  greeting: string;
  ctaLabel: string;
  timing: 'morning' | 'evening';
}

export default function CheckinCTABanner({ greeting, ctaLabel, timing }: CheckinCTABannerProps) {
  const CtaIcon = timing === 'morning' ? Sun : Moon;

  return (
    <div style={{
      background: '#2D8A5F', borderRadius: '14px', padding: '20px 24px', marginBottom: '24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div>
        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', marginBottom: '4px' }}>{greeting}</div>
        <div style={{ color: 'white', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '7px' }}>
          <CtaIcon size={16} strokeWidth={2} />{ctaLabel}をしましょう
        </div>
      </div>
      <Link href="/checkin" style={{
        background: 'white', color: '#2D8A5F', borderRadius: '10px',
        padding: '10px 20px', fontSize: '14px', fontWeight: 600,
        textDecoration: 'none', whiteSpace: 'nowrap', transition: 'all 0.15s ease',
        display: 'inline-flex', alignItems: 'center', gap: '6px',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E8F5EF'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; }}
      >
        <PenLine size={14} strokeWidth={2} />
        チェックイン →
      </Link>
    </div>
  );
}
