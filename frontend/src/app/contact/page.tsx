'use client';

import { useState } from 'react';
import Image from 'next/image';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function Contact() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    // Simulate form submission
    setTimeout(() => {
      setStatus('success');
    }, 1500);
  };

  return (
    <div className="flex flex-col w-full min-h-screen font-sans bg-[#f7f9fc]">
      
      {/* Hero Section */}
      <section className="w-full bg-[#0a0a0a] text-white py-20 md:py-28 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000&auto=format&fit=crop')] opacity-10 mix-blend-luminosity bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <ScrollReveal as="div" textClassName="text-xs md:text-sm font-mono tracking-widest uppercase mb-6 text-[#2b7fff]">
            [CONTACT US]
          </ScrollReveal>
          <ScrollReveal
            as="h1"
            baseOpacity={0}
            enableBlur={true}
            containerClassName="mb-8"
            textClassName="text-5xl md:text-7xl font-light tracking-tight text-white leading-tight"
          >
            Start the Conversation
          </ScrollReveal>
          <ScrollReveal as="p" textClassName="text-lg md:text-xl font-light text-white/70 max-w-2xl mx-auto leading-relaxed">
            We help operators secure their fields through AI-powered, safety-first intelligence — AI recommends, humans decide.
          </ScrollReveal>
        </div>
      </section>

      {/* Info Banner Section */}
      <section className="w-full bg-[#f7f9fc] text-black pt-10 md:pt-14 pb-8 md:pb-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-12 max-w-7xl mx-auto">
            
            <div className="flex-1 md:pr-12">
              <ScrollReveal as="h2" textClassName="text-4xl md:text-5xl font-light leading-tight text-black">
                Reach out to our team and we&apos;ll respond ASAP.
              </ScrollReveal>
            </div>
            
            <div className="flex-1 flex flex-col sm:flex-row gap-6 w-full">
              <div className="flex-1 bg-white text-black border border-black/10 p-10 rounded-3xl flex flex-col justify-between min-h-[220px] shadow-lg hover:-translate-y-1 transition-transform group">
                <div>
                  <div className="text-xs font-mono tracking-widest uppercase mb-4 text-gray-400 group-hover:text-black transition-colors">HELP & SUPPORT</div>
                  <div className="text-xl font-light mb-8">support@thronix.com</div>
                </div>
                <div className="text-sm font-light text-gray-500 leading-relaxed">
                  Need help? Our operations team is available 24/7 to assist with any active deployments.
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Form and Image Section */}
      <section className="w-full bg-[#f7f9fc] text-black pb-10 md:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 max-w-7xl mx-auto items-stretch">
            
            {/* Form Side */}
            <div className="flex-1 lg:max-w-xl bg-white p-10 md:p-14 rounded-3xl shadow-xl border border-black/5">
              <ScrollReveal as="div" textClassName="text-xs font-mono tracking-widest uppercase mb-6 text-gray-400">
                [LEAVE A MESSAGE]
              </ScrollReveal>
              <ScrollReveal as="h2" textClassName="text-3xl md:text-4xl font-light leading-tight mb-12 text-black">
                Send us a direct message
              </ScrollReveal>

              {status === 'success' ? (
                <div className="p-10 bg-[#111] text-white text-center rounded-2xl h-full flex flex-col items-center justify-center border border-white/10 shadow-inner">
                  <div className="w-16 h-16 bg-[#2b7fff]/10 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-[#2b7fff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="text-3xl font-light mb-3">Message Sent</h3>
                  <p className="font-light text-white/60">We&apos;ll be in touch with you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <input 
                    type="text" 
                    required
                    className="w-full h-14 px-5 bg-[#f7f9fc] border border-black/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2b7fff] focus:border-[#2b7fff] transition-all font-medium placeholder-gray-400 text-black" 
                    placeholder="Your Name"
                  />
                  <input 
                    type="email" 
                    required
                    className="w-full h-14 px-5 bg-[#f7f9fc] border border-black/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2b7fff] focus:border-[#2b7fff] transition-all font-medium placeholder-gray-400 text-black" 
                    placeholder="Email Address"
                  />
                  <input 
                    type="text" 
                    required
                    className="w-full h-14 px-5 bg-[#f7f9fc] border border-black/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2b7fff] focus:border-[#2b7fff] transition-all font-medium placeholder-gray-400 text-black" 
                    placeholder="Company Name"
                  />
                  <textarea 
                    rows={5}
                    required
                    className="w-full p-5 bg-[#f7f9fc] border border-black/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2b7fff] focus:border-[#2b7fff] transition-all resize-none font-medium placeholder-gray-400 text-black" 
                    placeholder="Your Message"
                  ></textarea>
                  
                  <button 
                    type="submit" 
                    disabled={status === 'submitting'}
                    className="h-14 w-full inline-flex items-center justify-center rounded-xl bg-[#2b7fff] text-sm font-bold tracking-widest text-white transition-all hover:bg-[#1a6aeb] hover:shadow-[0_0_20px_rgba(43,127,255,0.4)] hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 mt-4"
                  >
                    {status === 'submitting' ? 'SUBMITTING...' : 'SUBMIT MESSAGE'}
                  </button>
                </form>
              )}
            </div>

            {/* Image Side */}
            <div className="flex-1">
              <div className="relative w-full h-full min-h-[300px] md:min-h-[500px] rounded-3xl overflow-hidden shadow-2xl group border border-black/10">
                <Image 
                  src="/2.jpg" 
                  alt="Industrial Field" 
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-700"></div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
