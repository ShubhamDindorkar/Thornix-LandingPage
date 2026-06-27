import Link from 'next/link';
import Image from 'next/image';
import ScrollReveal from '@/components/ui/ScrollReveal';
import FadeIn from '@/components/ui/FadeIn';
import LineReveal from '@/components/ui/LineReveal';

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section (Black/Dark) */}
      <section className="relative w-full overflow-hidden border-b border-border h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0 bg-black">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="object-cover w-full h-full opacity-80"
          >
            <source src="https://res.cloudinary.com/dl13gok9x/video/upload/f_auto,q_auto/v1782577817/video_d8747o.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center -translate-y-24 md:-translate-y-32">
          <div className="inline-flex items-center rounded-full border border-white/20 bg-black/40 backdrop-blur-sm px-3 py-1 text-sm font-medium mb-8 text-white">
            <span className="flex h-2 w-2 rounded-full bg-white mr-2"></span>
            <ScrollReveal as="span" textClassName="inline-block">Real-time industrial asset monitoring</ScrollReveal>
          </div>
          <ScrollReveal
            as="h1"
            baseOpacity={0}
            enableBlur={true}
            baseRotation={3}
            blurStrength={10}
            containerClassName="max-w-4xl mb-10"
            textClassName="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight text-white"
          >
            Prevent catastrophic failures before they happen.
          </ScrollReveal>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-md bg-white px-8 py-3 text-sm font-medium text-black transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
            >
              Request a Pilot
            </Link>
            <Link
              href="#the-hardest-place"
              className="inline-flex h-12 items-center justify-center rounded-md border border-white/30 bg-black/20 backdrop-blur-sm px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
            >
              See How It Works
            </Link>
          </div>
        </div>

        {/* Glass Box Info */}
        <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 z-20 max-w-[calc(100%-3rem)] md:max-w-sm p-6 rounded-2xl border border-white/20 bg-black/40 backdrop-blur-md block">
          <p className="text-sm md:text-base text-white/90 font-light leading-relaxed">
            Thronix ingests high-frequency telemetry from wellhead sensors, runs a multi-tier anomaly detection engine against safety thresholds, and broadcasts actionable alerts within seconds.
          </p>
        </div>

        {/* Speak with our team button */}
        <Link href="/contact" className="absolute bottom-6 right-6 md:bottom-12 md:right-12 z-20 flex items-center gap-4 md:gap-6 bg-[#f4f4f0] rounded-full p-2 pr-2 pl-2 shadow-xl transition-all hover:shadow-2xl hover:bg-white group hidden sm:flex">
          <div className="flex -space-x-4">
            <Image className="w-12 h-12 rounded-full border-2 border-[#f4f4f0] object-cover group-hover:border-white transition-colors" src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Team member" width={48} height={48} />
            <Image className="w-12 h-12 rounded-full border-2 border-[#f4f4f0] object-cover group-hover:border-white transition-colors" src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Team member" width={48} height={48} />
          </div>
          <span className="text-xs md:text-sm font-semibold tracking-widest text-black px-2">
            SPEAK WITH OUR TEAM
          </span>
          <div className="w-12 h-12 rounded-full bg-lime-400 flex items-center justify-center text-white transition-transform group-hover:translate-x-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </div>
        </Link>
      </section>

      {/* Section 1 (Light Background like the image) */}
      <section id="the-hardest-place" className="w-full py-12 md:py-24 bg-[#f4f4f0] border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12 md:mb-24 max-w-6xl mx-auto">
            <div className="md:w-1/2">
               <ScrollReveal as="div" textClassName="text-sm font-mono font-bold uppercase tracking-widest text-gray-500 mb-4 block">
                 [OUR CHALLENGES]
               </ScrollReveal>
               <ScrollReveal
                 as="h2"
                 baseOpacity={0}
                 enableBlur={true}
                 textClassName="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-black"
               >
                 The hardest place on earth to keep a well honest.
               </ScrollReveal>
            </div>
            <div className="md:w-1/3 pt-2 md:pt-12">
               <p className="text-lg md:text-xl text-gray-700 font-light leading-relaxed">
                 GCC oil & gas fields run thousands of wells through conditions that break ordinary monitoring systems.
               </p>
            </div>
          </div>
          
          {/* Four Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
            <FeatureCardLight 
              title="Shamal dust storms" 
              description="40-60+ km/h winds, sub-200 m visibility: sensors degrade, comms drop." 
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
              } 
            />
            <FeatureCardLight 
              title="Extreme heat & sour gas" 
              description="50 °C heat kills gas detectors; high H₂S means errors cost lives." 
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              } 
            />
            <FeatureCardLight 
              title="Sand & water" 
              description="Sand erodes equipment; water and gas come up mixed with the oil." 
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
              } 
            />
            <FeatureCardLight 
              title="Sensors that lie" 
              description="30–50% of sensors can be suspect at once — most 'alarms' are bad data, not bad wells" 
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              } 
            />
          </div>
        </div>
      </section>

      {/* Section 2 (Beige Background - Intelligence Layer) */}
      <section className="w-full py-12 md:py-24 bg-[#f4f4f0] border-b border-gray-200 text-black overflow-hidden">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16 max-w-7xl mx-auto">
            <div className="md:w-1/2">
               <ScrollReveal as="div" textClassName="text-sm font-mono font-bold uppercase tracking-widest text-gray-500 mb-4 block">
                 [INTELLIGENCE LAYER]
               </ScrollReveal>
               <ScrollReveal
                 as="h2"
                 baseOpacity={0}
                 enableBlur={true}
                 textClassName="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-black"
               >
                 Raw signals in, ranked decisions out.
               </ScrollReveal>
            </div>
            <div className="md:w-1/3 pt-2 md:pt-12">
               <p className="text-lg md:text-xl text-gray-700 font-light leading-relaxed">
                 Always honest about how sure it is, and never overrides a human on anything dangerous.
               </p>
            </div>
          </div>
          
          {/* Linear Flowchart */}
          <div className="relative max-w-7xl mx-auto w-full pb-12">
            <div className="flex flex-col lg:flex-row justify-between items-center lg:items-stretch py-8 relative px-4 gap-6">
              
              {/* Horizontal Connecting Line (Desktop) */}
              <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-px z-0 -translate-y-1/2 pointer-events-none">
                <LineReveal delay={1.4} className="h-full border-t border-black/40 border-dashed" />
              </div>

              {/* Step 1 */}
              <FadeIn delay={0} className="w-full lg:flex-1 flex justify-center z-10 relative">
                <WorkflowCard step="01" title="INPUTS" desc="Pressures, temps, H₂S, sand, pump health, weather: every 3-5 s" img="/1.jpg" />
              </FadeIn>
              
              {/* Step 2 */}
              <FadeIn delay={0.2} className="w-full lg:flex-1 flex justify-center z-10 relative">
                <WorkflowCard step="02" title="VALIDATE" desc="Reject spikes, frozen & stale sensors before trusting anything" img="/2.jpg" />
              </FadeIn>
              
              {/* Step 3 */}
              <FadeIn delay={0.4} className="w-full lg:flex-1 flex justify-center z-10 relative">
                <WorkflowCard step="03" title="UNDERSTAND" desc="Well state + estimate the unmeasured oil/water/gas split" img="/9.jpg" />
              </FadeIn>
              
              {/* Step 4 */}
              <FadeIn delay={0.6} className="w-full lg:flex-1 flex justify-center z-10 relative">
                <WorkflowCard step="04" title="DECIDE" desc="Rank by danger, cross-check neighbours, prevent alarm floods" img="/3.jpg" />
              </FadeIn>
              
              {/* Step 5 */}
              <FadeIn delay={0.8} className="w-full lg:flex-1 flex justify-center z-10 relative">
                <WorkflowCard step="05" title="OUTPUTS" desc="Ranked, explained, actionable alerts + recommendations" img="/4.jpg" />
              </FadeIn>
              
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 (Beige Background) */}
      <section className="w-full py-12 md:py-24 bg-[#f4f4f0] border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12 md:mb-24 max-w-6xl mx-auto">
            <div className="md:w-1/2">
               <ScrollReveal as="div" textClassName="text-sm font-mono font-bold uppercase tracking-widest text-gray-500 mb-4 block">
                 [OUR ARCHITECTURE]
               </ScrollReveal>
               <ScrollReveal
                 as="h2"
                 baseOpacity={0}
                 enableBlur={true}
                 textClassName="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-black"
               >
                 Why THRONIX earns those marks.
               </ScrollReveal>
            </div>
            <div className="md:w-1/3 pt-2 md:pt-12">
               <p className="text-lg md:text-xl text-gray-700 font-light leading-relaxed">
                  The framework&apos;s deepest design investment is the part that matters most in GCC fields — and the part most platforms treat as an afterthought.
               </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row w-full h-auto md:h-[600px] gap-4 max-w-6xl mx-auto">
            {[
              {
                title: "Safety as architecture",
                desc: "H₂S, integrity & pressure alarms are constitutional: no learning loop, mode, or grace window can ever silence them.",
                img: "/5.jpg"
              },
              {
                title: "Antifragile by design",
                desc: "Split degradation modes, edge survival during comms loss, and a SAFE CORE that runs whole even when everything else is pruned.",
                img: "/6.jpg"
              },
              {
                title: "Fleet-aware reasoning",
                desc: "Cross-well graph intelligence separates a real well event from weather, a manifold problem, or coordinated sabotage.",
                img: "/7.jpg"
              },
              {
                title: "Honest intelligence",
                desc: "Calibrated confidence on every output, counterfactual explanations, and a human signature on every irreversible action.",
                img: "/8.jpg"
              }
            ].map((item, i) => (
              <div 
                key={i} 
                className="group relative flex-none w-full md:w-auto md:flex-[1] md:hover:flex-[4] transition-all duration-700 ease-in-out rounded-2xl overflow-hidden cursor-pointer h-[250px] sm:h-[300px] md:h-full border border-black/10 shadow-lg hover:shadow-2xl will-change-transform"
              >
                <Image src={item.img} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" alt={item.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 group-hover:from-black/80 transition-colors duration-500"></div>
                
                {/* Collapsed State (Vertical Text) */}
                <div className="absolute inset-0 hidden md:flex items-end justify-center pb-8 opacity-100 md:group-hover:opacity-0 transition-opacity duration-300">
                  <h3 className="text-white font-bold tracking-widest uppercase text-sm [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                    {item.title}
                  </h3>
                </div>

                {/* Expanded State Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  <div className="bg-lime-400 w-12 h-1 mb-6 rounded-full transform -translate-x-8 group-hover:translate-x-0 transition-transform duration-700 delay-300"></div>
                  <h3 className="text-2xl md:text-3xl font-light text-white mb-4 leading-tight transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-100">{item.title}</h3>
                  <p className="text-sm md:text-base text-white/80 leading-relaxed font-light transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-200 line-clamp-4 md:line-clamp-none">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 (Black Background) */}
      <section className="w-full py-12 md:py-24 bg-[#0a0a0a] border-b border-white/10 text-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12 md:mb-24 max-w-6xl mx-auto">
            <div className="md:w-1/2">
               <ScrollReveal as="div" textClassName="text-sm font-mono font-bold uppercase tracking-widest text-white/50 mb-4 block">
                 [ROADMAP]
               </ScrollReveal>
               <ScrollReveal
                 as="h2"
                 baseOpacity={0}
                 enableBlur={true}
                 textClassName="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight"
               >
                 Where we are and the path to proof.
               </ScrollReveal>
            </div>
            <div className="md:w-1/3 pt-2 md:pt-12">
               <p className="text-lg md:text-xl text-white/70 font-light leading-relaxed">
                  We don&apos;t claim measured superiority we haven&apos;t earned. We claim the strongest safety-first design and a clear, fast path to prove it.
               </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <TimelineCard 
              label="NOW"
              title="Design complete" 
              description="Full safety, degradation, fleet & intelligence spec, validated against critique."
            />
            <TimelineCard 
              label="NEXT"
              title="Replay validation" 
              description="Run triggers on labelled datasets → first measured precision, recall & lead-time."
            />
            <TimelineCard 
              label="THEN"
              title="Shadow pilots" 
              description="10–15 wells, sour + sweet mix; measure false-alarm rate & operator trust."
            />
            <TimelineCard 
              label="SCALE"
              title="Certified deployment" 
              description="SCADA/ESD integration on the certified safety path; fleet rollout."
            />
          </div>
        </div>
      </section>

      {/* Section 5 / CTA (Beige Background) */}
      <section className="w-full py-16 md:py-32 bg-[#f4f4f0]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <ScrollReveal
            as="h2"
            baseOpacity={0}
            enableBlur={true}
            containerClassName="mb-6 max-w-3xl"
            textClassName="text-4xl md:text-6xl font-light tracking-tight text-black"
          >
            Built to survive the worst day in the field.
          </ScrollReveal>
          <p className="text-xl text-gray-700 font-light max-w-2xl mx-auto mb-10">
            Let&apos;s run THRONIX against your toughest well data and show you the numbers honestly.
          </p>
          <Link
            href="/contact"
            className="inline-flex h-14 items-center justify-center rounded-md bg-black px-10 py-4 text-base font-medium text-white transition-all hover:bg-[#222] hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          >
            Request a pilot conversation
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCardLight({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="flex flex-col p-8 border border-gray-200 bg-gray-50/50 rounded-2xl transition-all hover:shadow-lg hover:shadow-lime-400/10 hover:border-lime-400 group">
      <div className="p-3 bg-lime-400 rounded-lg w-12 h-12 flex items-center justify-center mb-6 text-black shadow-sm transition-transform group-hover:scale-110">
        {icon}
      </div>
      <ScrollReveal as="h3" textClassName="text-xl font-medium mb-3 text-black">{title}</ScrollReveal>
      <p className="text-gray-600 font-light leading-relaxed">{description}</p>
    </div>
  );
}

function TimelineCard({ label, title, description }: { label: string, title: string, description: string }) {
  return (
    <div className="flex flex-col border-l border-white/10 pl-6 relative group">
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-white/30 to-transparent -translate-x-px group-hover:from-lime-400 transition-colors duration-500"></div>
      <div className="absolute left-0 top-0 w-2 h-2 rounded-full bg-lime-400 -translate-x-[5px] shadow-[0_0_10px_rgba(163,230,53,0.8)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <ScrollReveal as="div" textClassName="text-sm font-bold text-white/50 tracking-widest mb-3 uppercase">{label}</ScrollReveal>
      <ScrollReveal as="h3" textClassName="text-2xl font-light mb-3 text-white">{title}</ScrollReveal>
      <p className="text-white/70 font-light leading-relaxed">{description}</p>
    </div>
  );
}



interface WorkflowCardProps {
  step: string;
  title: string;
  desc: string;
  img?: string;
}

function WorkflowCard({ step, title, desc, img }: WorkflowCardProps) {
  return (
    <div className="relative w-full max-w-[320px] bg-black rounded-2xl shadow-lg transform transition-all hover:-translate-y-2 hover:shadow-2xl overflow-hidden flex flex-col h-[340px] group border border-black/10">
      {img && (
        <Image src={img} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100" alt={title} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10"></div>
      
      <div className="relative z-10 flex flex-col justify-end h-full p-6 text-left">
        <div className="text-lime-400 font-mono text-xs font-bold tracking-widest mb-2 border border-lime-400/30 bg-lime-400/10 px-2 py-1 rounded w-fit">{step}</div>
        <div className="text-2xl font-light text-white mb-3 leading-tight">{title}</div>
        <div className="text-sm text-white/70 font-light leading-relaxed">{desc}</div>
      </div>
    </div>
  )
}
