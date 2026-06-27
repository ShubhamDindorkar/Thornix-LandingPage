'use client';

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap-config';
import SplitType from 'split-type';
import { cn } from '@/lib/utils';

interface ScrollRevealProps {
  children: React.ReactNode;
  as?: React.ElementType;
  className?: string;
  revealType?: 'lines' | 'words' | 'chars';
  // Legacy props to maintain compatibility with existing code
  containerClassName?: string;
  textClassName?: string;
  baseOpacity?: number;
  enableBlur?: boolean;
  baseRotation?: number;
  blurStrength?: number;
}

const splitConfig = {
  lines: { duration: 0.4, stagger: 0.04 },
  words: { duration: 0.3, stagger: 0.03 },
  chars: { duration: 0.2, stagger: 0.01 }
};

export default function ScrollReveal({
  children,
  as: Tag = 'h2',
  className,
  revealType = 'lines',
  containerClassName,
  textClassName,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    // Make visible before splitting so SplitType can measure correctly
    el.style.visibility = 'visible';

    const splitText = new SplitType(el, { types: 'lines,words' });

    // Clip-reveal: hide each word behind its line wrapper
    if (splitText.lines) {
      splitText.lines.forEach((line) => {
        line.style.overflow = 'hidden';
      });
    }

    const targets = splitText.words;
    const config = splitConfig[revealType] ?? splitConfig.lines;

    // Keep a direct reference to the trigger so cleanup is O(1)
    let st: ScrollTrigger | undefined;

    if (targets && targets.length > 0) {
      gsap.from(targets, {
        yPercent: 110,
        duration: config.duration,
        stagger: config.stagger,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          once: true,
          onToggle: (self) => { st = self; },
        },
      });
    }

    return () => {
      // Kill only this element's trigger — no global getAll() scan
      st?.kill();
      splitText.revert();
    };
  }, [revealType]);

  return (
    <Tag ref={containerRef} className={cn("invisible", containerClassName, textClassName, className)}>
      {children}
    </Tag>
  );
}
