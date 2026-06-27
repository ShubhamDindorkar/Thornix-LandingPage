'use client';

import { ReactLenis } from 'lenis/react';

export default function SmoothScrolling({ children }: { children: React.ReactNode }) {
  return (
    // lerp 0.08 and duration 1.2 give smooth feel with lower per-frame cost
    // syncTouch: true delegates to native momentum on touch — no JS overhead on mobile
    <ReactLenis root options={{ lerp: 0.08, duration: 1.2, smoothWheel: true, syncTouch: true }}>
      {children}
    </ReactLenis>
  );
}
