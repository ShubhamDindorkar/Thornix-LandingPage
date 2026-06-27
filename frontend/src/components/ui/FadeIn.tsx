'use client';

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-config';

export default function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!el.current) return;
    const node = el.current;

    // Hint the browser to promote this layer before the animation starts
    node.style.willChange = 'opacity, transform';

    const anim = gsap.fromTo(node,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: node,
          start: "top 85%",
          once: true,
        },
        onComplete: () => {
          // Release will-change after animation to free GPU memory
          node.style.willChange = 'auto';
        },
      }
    );

    return () => {
      anim.kill();
      ScrollTrigger.getById(anim.vars.scrollTrigger as string)?.kill();
    };
  }, [delay]);

  return <div ref={el} className={className}>{children}</div>;
}
