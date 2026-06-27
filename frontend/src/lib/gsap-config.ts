/**
 * Single source of truth for GSAP plugin registration.
 * Import from here in all animation components so registerPlugin
 * is called exactly once no matter how many components import it.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
