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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center -translate-y-16 md:-translate-y-20">
          <div className="inline-flex items-center rounded-full border border-white/20 bg-black/40 backdrop-blur-sm px-3 py-1 text-sm font-medium mb-5 text-white">
            <span className="flex h-2 w-2 rounded-full bg-[#2b7fff] mr-2"></span>
            <ScrollReveal as="span" textClassName="inline-block">AI-Powered Real-Time Industrial Asset Monitoring</ScrollReveal>
          </div>
          <ScrollReveal
            as="h1"
            baseOpacity={0}
            enableBlur={true}
            baseRotation={3}
            blurStrength={10}
            containerClassName="max-w-4xl mb-6"
            textClassName="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight text-white"
          >
            Prevent Catastrophic Failures Before They Happen.
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
        <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-20 max-w-[calc(100%-3rem)] md:max-w-sm p-5 rounded-2xl border border-white/20 bg-black/40 backdrop-blur-md block">
          <p className="text-sm md:text-base text-white/90 font-light leading-relaxed">
            Thronix AI ingests high-frequency telemetry from wellhead sensors, runs an AI-driven multi-tier anomaly detection engine against safety thresholds, and broadcasts actionable alerts within seconds.
          </p>
        </div>

        {/* Speak with our team button */}
        <Link href="/contact" className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-20 flex items-center gap-4 md:gap-5 bg-white rounded-full p-2 pr-2 pl-2 shadow-xl transition-all hover:shadow-2xl hover:bg-[#f7f9fc] group hidden sm:flex">
          <div className="flex -space-x-4">
            <Image className="w-12 h-12 rounded-full border-2 border-white object-cover group-hover:border-[#f7f9fc] transition-colors" src="/team-ai-1.png" alt="Team member" width={48} height={48} />
            <Image className="w-12 h-12 rounded-full border-2 border-white object-cover group-hover:border-[#f7f9fc] transition-colors" src="/team-ai-2.png" alt="Team member" width={48} height={48} />
          </div>
          <span className="text-xs md:text-sm font-semibold tracking-widest text-black px-2">
            SPEAK WITH OUR TEAM
          </span>
          <div className="w-12 h-12 rounded-full bg-[#2b7fff] flex items-center justify-center text-white transition-transform group-hover:translate-x-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </div>
        </Link>
      </section>

      {/* Scale ambition — investor-facing */}
      <section className="w-full py-8 md:py-10 bg-black border-b border-white/10 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-6xl mx-auto text-center sm:text-left">
            <div>
              <ScrollReveal as="div" textClassName="text-3xl md:text-4xl font-light text-white mb-2">~4,000</ScrollReveal>
              <p className="text-sm text-white/60 font-light leading-relaxed">Well capacity at full-scale deployment — built for fleet-wide coverage.</p>
            </div>
            <div>
              <ScrollReveal as="div" textClassName="text-3xl md:text-4xl font-light text-white mb-2">~38.4M</ScrollReveal>
              <p className="text-sm text-white/60 font-light leading-relaxed">Rows/day ingestion capacity for high-frequency industrial telemetry.</p>
            </div>
            <div>
              <ScrollReveal as="div" textClassName="text-3xl md:text-4xl font-light text-white mb-2">3–5 s</ScrollReveal>
              <p className="text-sm text-white/60 font-light leading-relaxed">Sensor cadence — AI spots anomalies before they become failures.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges — GCC fields + Niger deep water */}
      <section id="the-hardest-place" className="w-full py-10 md:py-14 bg-[#f7f9fc] border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4 lg:gap-8 mb-8 md:mb-12 max-w-6xl mx-auto">
            <div className="w-full lg:w-1/2">
               <ScrollReveal as="div" textClassName="text-sm font-mono font-bold uppercase tracking-widest text-gray-500 mb-3 block">
                 [OUR CHALLENGES]
               </ScrollReveal>
               <ScrollReveal
                 as="h2"
                 baseOpacity={0}
                 enableBlur={true}
                 textClassName="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-black"
               >
                 The Hardest Place On Earth To Keep A Well Honest.
               </ScrollReveal>
            </div>
            <div className="w-full lg:w-1/3 lg:pt-8">
               <p className="text-base md:text-lg text-gray-700 font-light leading-relaxed">
                 GCC oil &amp; gas fields run thousands of wells through conditions that break ordinary monitoring systems. A client also operates in Niger deep-water wells — Thronix AI frameworks and datasets pass region-specific parameters so monitoring matches the field, not a generic model.
               </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            <FeatureCardLight 
              title="Shamal Dust Storms" 
              description="40-60+ km/h winds, sub-200 m visibility: sensors degrade, comms drop." 
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
              } 
            />
            <FeatureCardLight 
              title="Extreme Heat & Sour Gas" 
              description="50 °C heat kills gas detectors; high H₂S means errors cost lives." 
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              } 
            />
            <FeatureCardLight 
              title="Sand & Water" 
              description="Sand erodes equipment; water and gas come up mixed with the oil." 
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
              } 
            />
            <FeatureCardLight 
              title="Sensors That Lie" 
              description="30–50% of sensors can be suspect at once — most 'alarms' are bad data, not bad wells." 
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              } 
            />
            <FeatureCardLight 
              title="Niger Deep Water" 
              description="Offshore depth, remote ops, and high-stakes integrity — high-GOR profiles, hydrate risk, and every real kick must be separated from false calm." 
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              } 
            />
          </div>
        </div>
      </section>

      {/* AI Intelligence Layer */}
      <section className="w-full py-10 md:py-14 bg-[#f7f9fc] border-b border-gray-200 text-black overflow-hidden">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4 lg:gap-8 mb-8 lg:mb-10 max-w-7xl mx-auto">
            <div className="w-full lg:w-1/2">
               <ScrollReveal as="div" textClassName="text-sm font-mono font-bold uppercase tracking-widest text-gray-500 mb-3 block">
                 [AI DECISION ENGINE]
               </ScrollReveal>
               <ScrollReveal
                 as="h2"
                 baseOpacity={0}
                 enableBlur={true}
                 textClassName="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-black"
               >
                 Raw Signals In, Ranked Decisions Out.
               </ScrollReveal>
            </div>
            <div className="w-full lg:w-1/3 lg:pt-8">
               <p className="text-base md:text-lg text-gray-700 font-light leading-relaxed">
                 Always honest about how sure it is, and never overrides a human on anything dangerous.
               </p>
            </div>
          </div>
          
          <div className="relative max-w-7xl mx-auto w-full">
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-stretch py-2 lg:py-4 relative gap-3 lg:gap-5">
              
              <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-px z-0 -translate-y-1/2 pointer-events-none">
                <LineReveal delay={1.4} className="h-full border-t border-black/40 border-dashed" />
              </div>

              <FadeIn delay={0} className="w-full lg:flex-1 flex justify-center z-10 relative">
                <WorkflowCard step="01" title="INPUTS" desc="Pressures, temps, H₂S, sand, pump health, weather: every 3-5 s" img="/1.jpg" />
              </FadeIn>
              
              <FadeIn delay={0.2} className="w-full lg:flex-1 flex justify-center z-10 relative">
                <WorkflowCard step="02" title="VALIDATE" desc="Reject spikes, frozen & stale sensors before trusting anything" img="/2.jpg" />
              </FadeIn>
              
              <FadeIn delay={0.4} className="w-full lg:flex-1 flex justify-center z-10 relative">
                <WorkflowCard step="03" title="UNDERSTAND" desc="Well state + AI-estimated oil/water/gas split" img="/9.jpg" />
              </FadeIn>
              
              <FadeIn delay={0.6} className="w-full lg:flex-1 flex justify-center z-10 relative">
                <WorkflowCard step="04" title="DECIDE" desc="AI ranks by danger, cross-checks neighbours, prevent alarm floods" img="/3.jpg" />
              </FadeIn>
              
              <FadeIn delay={0.8} className="w-full lg:flex-1 flex justify-center z-10 relative">
                <WorkflowCard step="05" title="OUTPUTS" desc="Ranked, explained, actionable alerts + recommendations" img="/4.jpg" />
              </FadeIn>
              
            </div>
          </div>
        </div>
      </section>

      {/* AI recommends, human decides */}
      <section className="w-full py-10 md:py-14 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4 lg:gap-8 mb-8 md:mb-12 max-w-6xl mx-auto">
            <div className="w-full lg:w-1/2">
              <ScrollReveal as="div" textClassName="text-sm font-mono font-bold uppercase tracking-widest text-gray-500 mb-3 block">
                [HUMAN IN THE LOOP]
              </ScrollReveal>
              <ScrollReveal
                as="h2"
                baseOpacity={0}
                enableBlur={true}
                textClassName="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-black"
              >
                AI Recommends, Human Decides.
              </ScrollReveal>
            </div>
            <div className="w-full lg:w-1/3 lg:pt-8">
              <p className="text-base md:text-lg text-gray-700 font-light leading-relaxed">
                Our AI only gives suggestions — it never controls valves, ESD, or any irreversible action. A person must approve. That design protects operators, and it protects liability.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            <div className="p-8 border border-gray-200 bg-[#f7f9fc] rounded-2xl">
              <ScrollReveal as="h3" textClassName="text-xl font-medium text-black mb-3">Prediction</ScrollReveal>
              <p className="text-gray-600 font-light leading-relaxed">
                Spots patterns across telemetry and warns early — drift, integrity risk, and anomalies before they escalate.
              </p>
            </div>
            <div className="p-8 border border-gray-200 bg-[#f7f9fc] rounded-2xl">
              <ScrollReveal as="h3" textClassName="text-xl font-medium text-black mb-3">Advisory</ScrollReveal>
              <p className="text-gray-600 font-light leading-relaxed">
                Suggests what action to take, with calibrated confidence and explanations — but a human must approve every irreversible step.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="w-full py-10 md:py-14 bg-[#f7f9fc] border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4 lg:gap-8 mb-8 md:mb-12 max-w-6xl mx-auto">
            <div className="w-full lg:w-1/2">
               <ScrollReveal as="div" textClassName="text-sm font-mono font-bold uppercase tracking-widest text-gray-500 mb-3 block">
                 [OUR ARCHITECTURE]
               </ScrollReveal>
               <ScrollReveal
                 as="h2"
                 baseOpacity={0}
                 enableBlur={true}
                 textClassName="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-black"
               >
                 Why Thronix AI Earns Those Marks.
               </ScrollReveal>
            </div>
            <div className="w-full lg:w-1/3 lg:pt-8">
               <p className="text-base md:text-lg text-gray-700 font-light leading-relaxed">
                  The framework&apos;s deepest design investment is the part that matters most in GCC fields and Niger deep-water operations — and the part most platforms treat as an afterthought.
               </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row w-full h-auto md:h-[480px] gap-4 max-w-6xl mx-auto">
            {[
              {
                title: "Safety As Architecture",
                desc: "H₂S, integrity & pressure alarms are constitutional: no learning loop, mode, or grace window can ever silence them.",
                img: "/5.jpg"
              },
              {
                title: "Antifragile By Design",
                desc: "Split degradation modes, edge survival during comms loss, and a SAFE CORE that runs whole even when everything else is pruned.",
                img: "/6.jpg"
              },
              {
                title: "Fleet-Aware Reasoning",
                desc: "Cross-well graph intelligence separates a real well event from weather, a manifold problem, or coordinated sabotage.",
                img: "/7.jpg"
              },
              {
                title: "Honest Intelligence",
                desc: "Calibrated confidence on every output, counterfactual explanations, and a human signature on every irreversible action.",
                img: "/8.jpg"
              }
            ].map((item, i) => (
              <div 
                key={i} 
                className="group relative flex-none w-full md:w-auto md:flex-[1] md:hover:flex-[4] transition-all duration-700 ease-in-out rounded-2xl overflow-hidden cursor-pointer h-[220px] sm:h-[260px] md:h-full border border-black/10 shadow-lg hover:shadow-2xl will-change-transform"
              >
                <Image src={item.img} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" alt={item.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 group-hover:from-black/80 transition-colors duration-500"></div>
                
                <div className="absolute inset-0 hidden md:flex items-end justify-center pb-8 opacity-100 md:group-hover:opacity-0 transition-opacity duration-300">
                  <h3 className="text-white font-bold tracking-widest uppercase text-sm [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                    {item.title}
                  </h3>
                </div>

                <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  <div className="bg-[#2b7fff] w-12 h-1 mb-4 rounded-full transform -translate-x-8 group-hover:translate-x-0 transition-transform duration-700 delay-300"></div>
                  <h3 className="text-2xl md:text-3xl font-light text-white mb-3 leading-tight transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-100">{item.title}</h3>
                  <p className="text-sm md:text-base text-white/80 leading-relaxed font-light transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-200 line-clamp-4 md:line-clamp-none">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming verticals */}
      <section className="w-full py-16 md:py-24 bg-[#0a0a0a] border-b border-white/10 text-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4 lg:gap-8 mb-8 md:mb-12 max-w-6xl mx-auto">
            <div className="w-full lg:w-1/2">
               <ScrollReveal as="div" textClassName="text-sm font-mono font-bold uppercase tracking-widest text-white/50 mb-3 block">
                 [UPCOMING]
               </ScrollReveal>
               <ScrollReveal
                 as="h2"
                 baseOpacity={0}
                 enableBlur={true}
                 textClassName="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight"
               >
                 Expanding Beyond The Wellhead.
               </ScrollReveal>
            </div>
            <div className="w-full lg:w-1/3 lg:pt-8">
               <p className="text-base md:text-lg text-white/70 font-light leading-relaxed">
                  The same AI recommend / human decide stack extends to new industrial domains. Customised AI software solutions also on the roadmap.
               </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <UpcomingCard
              title="Smart Power Grid"
              description="Monitoring and power redirect — early anomaly detection across grid assets, with human approval on redirect actions."
            />
            <UpcomingCard
              title="Security Surveillance"
              description="AI-assisted threat spotting from camera and sensor feeds — recommendations only, operators stay in control."
            />
            <UpcomingCard
              title="SCADA Systems Monitoring"
              description="Layer AI validation and ranked alerts on existing SCADA — reduce floods, surface what matters."
            />
            <UpcomingCard
              title="Smart Parking"
              description="Occupancy, flow, and anomaly insight for parking infrastructure — advisory intelligence at city scale."
            />
            <UpcomingCard
              title="Customised AI Software"
              description="Bespoke AI software solutions tailored to your operational data, constraints, and decision workflows."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-12 md:py-16 bg-[#f7f9fc]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <ScrollReveal
            as="h2"
            baseOpacity={0}
            enableBlur={true}
            containerClassName="mb-4 max-w-3xl"
            textClassName="text-3xl md:text-5xl font-light tracking-tight text-black"
          >
            Built To Survive The Worst Day In The Field.
          </ScrollReveal>
          <p className="text-lg text-gray-700 font-light max-w-2xl mx-auto mb-8">
            Let&apos;s run Thronix AI against your toughest well data and show you the numbers honestly.
          </p>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-md bg-black px-10 py-3 text-base font-medium text-white transition-all hover:bg-[#222] hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
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
    <div className="flex flex-col p-6 border border-gray-200 bg-white/70 rounded-2xl transition-all hover:shadow-lg hover:shadow-[#2b7fff]/10 hover:border-[#2b7fff] group">
      <div className="p-3 bg-[#2b7fff] rounded-lg w-12 h-12 flex items-center justify-center mb-4 text-white shadow-sm transition-transform group-hover:scale-110">
        {icon}
      </div>
      <ScrollReveal as="h3" textClassName="text-xl font-medium mb-2 text-black">{title}</ScrollReveal>
      <p className="text-gray-600 font-light leading-relaxed">{description}</p>
    </div>
  );
}

function UpcomingCard({ title, description }: { title: string, description: string }) {
  return (
    <div className="flex flex-col border border-white/10 rounded-2xl p-6 bg-white/5 hover:bg-white/10 transition-colors">
      <div className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#2b7fff] mb-3">Coming Soon</div>
      <ScrollReveal as="h3" textClassName="text-xl font-light text-white mb-3">{title}</ScrollReveal>
      <p className="text-white/70 font-light leading-relaxed text-sm">{description}</p>
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
    <div className="relative w-full lg:max-w-[320px] bg-black rounded-2xl shadow-lg transform transition-all hover:-translate-y-2 hover:shadow-2xl overflow-hidden flex flex-col h-[200px] sm:h-[240px] lg:h-[300px] group border border-black/10">
      {img && (
        <Image src={img} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100" alt={title} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10"></div>
      
      <div className="relative z-10 flex flex-col justify-end h-full p-4 sm:p-5 text-left">
        <div className="text-[#2b7fff] font-mono text-xs font-bold tracking-widest mb-1.5 border border-[#2b7fff]/30 bg-[#2b7fff]/10 px-2 py-1 rounded w-fit">{step}</div>
        <div className="text-xl sm:text-2xl font-light text-white mb-1.5 leading-tight">{title}</div>
        <div className="text-sm text-white/70 font-light leading-relaxed">{desc}</div>
      </div>
    </div>
  )
}
