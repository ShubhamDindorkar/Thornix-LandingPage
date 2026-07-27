import Link from 'next/link';
import Image from 'next/image';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function About() {
  return (
    <div className="flex flex-col w-full bg-[#f7f9fc]">
      
      {/* Header Section (Image 1 Layout) */}
      <section className="w-full pt-20 md:pt-24 pb-8 md:pb-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-10 max-w-7xl mx-auto">
            <div className="lg:w-1/2">
               <ScrollReveal as="div" textClassName="text-xs font-mono font-bold uppercase tracking-widest text-gray-500 mb-6 block">
                 [OUR MISSION]
               </ScrollReveal>
               <ScrollReveal
                 as="h1"
                 baseOpacity={0}
                 enableBlur={true}
                 textClassName="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-black leading-tight"
               >
                 Establish The Single Source Of Truth.
               </ScrollReveal>
            </div>
            <div className="lg:w-1/3 pt-2 lg:pt-12">
               <p className="text-lg text-gray-700 font-light leading-relaxed mb-8">
                 Our mission is to establish the single source of truth for industrial asset monitoring, preventing catastrophic failures with uncompromising engineering standards.
               </p>
               <Link
                 href="/contact"
                 className="inline-flex h-12 items-center justify-center rounded-md bg-[#2b7fff] px-8 py-3 text-xs font-bold tracking-widest text-white transition-all hover:bg-[#1a6aeb] hover:scale-105"
               >
                 OUR EXPERTISE
               </Link>
            </div>
          </div>
          
          {/* Three Vertical Panels - Interactive Accordion */}
          <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto h-auto md:h-[600px] group/container">
             {/* Left Panel - Image */}
             <div className="rounded-xl overflow-hidden h-64 md:h-full relative group shadow-lg w-full md:w-auto md:flex-[2] md:group-has-[.right-panel:hover]/container:flex-[1] transition-all duration-700 ease-in-out">
               <Image src="/9.jpg" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" alt="Industrial site" />
             </div>
             
             {/* Middle Panel - Dark Card */}
             <div className="rounded-xl bg-[#111] p-10 flex flex-col justify-center border border-white/10 relative overflow-hidden h-64 md:h-full group shadow-lg hover:shadow-2xl transition-all w-full md:w-auto md:flex-[1.5] shrink-0">
               <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               <ScrollReveal as="div" textClassName="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 mb-6 relative z-10">
                 UNCOMPROMISING STANDARDS
               </ScrollReveal>
               <ScrollReveal as="div" textClassName="text-5xl md:text-6xl font-light text-white mb-6 relative z-10">
                 100%
               </ScrollReveal>
               <p className="text-base text-white/80 font-medium leading-snug relative z-10">
                 Immutable audit log recording every event, alert, and resolution permanently.
               </p>
             </div>

             {/* Right Panel - Image */}
             <div className="rounded-xl overflow-hidden h-64 md:h-full relative group shadow-lg w-full md:w-auto md:flex-[1] md:hover:flex-[2] transition-all duration-700 ease-in-out right-panel cursor-pointer">
               <Image src="/5.jpg" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" alt="Engineer" />
             </div>
          </div>
        </div>
      </section>

      {/* The Challenge & Approach (Image 2 Top Layout) */}
      <section className="w-full py-10 md:py-14 bg-white border-y border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-7xl mx-auto items-center">
            {/* Left Square Image */}
            <div className="rounded-xl overflow-hidden aspect-square relative group shadow-2xl">
              <Image src="/6.jpg" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" alt="Extreme weather conditions" />
            </div>
            
            {/* Right Content */}
            <div>
               <ScrollReveal as="div" textClassName="text-xs font-mono font-bold uppercase tracking-widest text-gray-500 mb-6 block">
                 [THE CHALLENGE]
               </ScrollReveal>
               <ScrollReveal
                 as="h2"
                 baseOpacity={0}
                 enableBlur={true}
                 textClassName="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-black mb-8 leading-tight"
               >
                 Architecting Safety For Critical Operations.
               </ScrollReveal>
               <p className="text-base text-gray-700 font-light leading-relaxed mb-6">
                  In oil and gas operations — from GCC fields to Niger deep-water — missing a critical alert isn&apos;t just an operational issue—it&apos;s a life safety issue. H₂S gas leaks, well kicks, and blowouts require immediate, unquestionable detection.
               </p>
               <p className="text-base text-gray-700 font-light leading-relaxed mb-10">
                  Traditional SCADA systems poll data too slowly and alarm indiscriminately, creating &apos;alarm floods&apos; that cause operators to ignore real emergencies. We built Thronix AI from the ground up using strict EEMUA 191 standards.
               </p>
               
               {/* Grid of Pills for Approach */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Pill icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>} text="EEMUA 191 Standards" />
                  <Pill icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>} text="Multi-tier Triggers" />
                  <Pill icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>} text="No Alarm Floods" />
                  <Pill icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>} text="Life-safety First" />
                  <Pill icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>} text="Immutable Logs" />
                  <Pill icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>} text="Instant Detection" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team / Leadership Section (Based on Image Reference) */}
      <section className="w-full relative overflow-hidden bg-[#f7f9fc] py-10 md:py-14 border-t border-black/10">
         <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-8 md:mb-12">
               <div className="md:w-1/2">
                 <ScrollReveal as="div" textClassName="text-xs font-mono font-bold uppercase tracking-widest text-gray-500 mb-6 block">
                   [LEADERSHIP]
                 </ScrollReveal>
                 <ScrollReveal as="h2" baseOpacity={0} enableBlur={true} textClassName="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-black leading-tight">
                   Our AI & Engineering Leadership.
                 </ScrollReveal>
               </div>
               <div className="md:w-1/2 md:pt-12">
                 <p className="text-base md:text-lg text-gray-700 font-light leading-relaxed mb-6">
                   We design the infrastructure, systems, and strategies that accelerate the transition to safe energy—without disrupting operations. From grid-edge logistics hubs to on-site generation, our work helps organizations integrate securely and at scale.
                 </p>
                 <p className="text-base md:text-lg text-gray-700 font-light leading-relaxed">
                  Whether you&apos;re deploying sensors at distribution centers or incorporating intelligent tracking into regional supply chains, we bring the technical depth and sector insight to turn ambition into impact.
                 </p>
               </div>
            </div>

            {/* Grid Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12 max-w-3xl mx-auto">
               <TeamMemberCard 
                 img="/mahebub-sheikh.png"
                 role="CO-FOUNDER & CHIEF EXECUTIVE OFFICER (CEO)"
                 name="Mahebub Sheikh"
                 email="shaikh@thronixai.com"
                 desc="Leading Thronix AI with a focus on AI-powered industrial asset monitoring, safety-first architecture, and real-world deployment in demanding oil & gas environments."
               />
               <TeamMemberCard 
                 img="/pooja-suryavanshi.png"
                 role="CO-FOUNDER & CHIEF OPERATING OFFICER (COO)"
                 name="Pooja Suryavanshi"
                 email="plsuryavanshi@thronixai.com"
                 desc="Driving strategy and delivery for Thronix AI — aligning product, operations, and client outcomes across industrial monitoring deployments."
               />
            </div>
         </div>
      </section>
    </div>
  );
}

function Pill({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-3 bg-[#111] hover:bg-[#222] transition-colors rounded-full px-5 py-3 border border-white/10 group cursor-default shadow-md hover:shadow-lg">
      <div className="text-[#2b7fff] group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-xs font-medium text-white">{text}</span>
    </div>
  );
}

interface TeamMemberCardProps {
  img: string;
  role: string;
  name: string;
  desc: string;
  email?: string;
}

function TeamMemberCard({ img, role, name, desc, email }: TeamMemberCardProps) {
  return (
    <div className="flex flex-col group h-full">
      <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden mb-6 bg-gray-200 border border-black/5 shadow-sm">
        <Image src={img} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover object-top transition-transform duration-700 group-hover:scale-105" alt={name} />
      </div>
      <div className="text-xs md:text-sm font-mono font-bold tracking-widest uppercase text-gray-500 mb-3">{role}</div>
      <div className="text-2xl font-light text-black mb-3">{name}</div>
      <div className="text-sm text-gray-600 font-light leading-relaxed mb-4 flex-1">{desc}</div>
      {email && (
        <a
          href={`mailto:${email}`}
          className="text-sm text-[#2b7fff] hover:underline font-medium mb-6 break-all"
        >
          {email}
        </a>
      )}
      
      {/* Social Icons */}
      <div className="flex items-center gap-4 text-gray-400 mt-auto pb-4">
         {/* Bluesky/Butterfly Icon */}
         <svg className="w-4 h-4 cursor-pointer hover:text-black transition-colors" viewBox="0 0 24 24" fill="currentColor">
           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5c-2.48 0-4.5-2.02-4.5-4.5S8.52 7.5 11 7.5s4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5z"/>
         </svg>
         {/* LinkedIn Icon */}
         <svg className="w-4 h-4 cursor-pointer hover:text-black transition-colors" viewBox="0 0 24 24" fill="currentColor">
           <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
         </svg>
         {/* X Icon */}
         <svg className="w-4 h-4 cursor-pointer hover:text-black transition-colors" viewBox="0 0 24 24" fill="currentColor">
           <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
         </svg>
      </div>
    </div>
  );
}
