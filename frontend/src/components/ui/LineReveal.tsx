'use client';

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-config';

export default function LineReveal({ delay = 0, className = "" }: { delay?: number, className?: string }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!el.current) return;
    const node = el.current;

    node.style.willChange = 'width';

    const anim = gsap.fromTo(node,
      { width: "0%" },
      {
        width: "100%",
        duration: 1.5,
        delay,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: node,
          start: "top 85%",
          once: true,
        },
        onComplete: () => {
          node.style.willChange = 'auto';
        },
      }
    );

    return () => {
      anim.kill();
      ScrollTrigger.getById(anim.vars.scrollTrigger as string)?.kill();
    };
  }, [delay]);

  return <div ref={el} className={className}></div>;
}
