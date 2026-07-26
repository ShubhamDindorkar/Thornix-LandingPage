import Link from 'next/link';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function Pricing() {
  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-4rem-240px)] bg-[#f7f9fc]">
      <section className="relative w-full overflow-hidden py-10 md:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col items-center">
          <ScrollReveal as="div" textClassName="text-xs font-mono font-bold uppercase tracking-widest text-gray-500 mb-6 block">
            [PRICING MODELS]
          </ScrollReveal>
          <ScrollReveal
            as="h1"
            baseOpacity={0}
            enableBlur={true}
            containerClassName="mb-6 max-w-4xl mx-auto"
            textClassName="text-4xl md:text-5xl lg:text-7xl font-light tracking-tight text-black leading-tight"
          >
            Scale With Confidence
          </ScrollReveal>
          <ScrollReveal as="p" textClassName="text-lg md:text-xl text-gray-700 font-light max-w-2xl mx-auto leading-relaxed">
            From focused pilot programs to full-scale regional deployment, Thronix AI offers pricing models tailored to your operational footprint.
          </ScrollReveal>
        </div>
      </section>

      <section className="w-full pb-12 md:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
            {/* Pilot Scale (Light Theme) */}
            <div className="flex flex-col p-10 border border-black/10 bg-white rounded-3xl relative shadow-lg group hover:shadow-xl transition-all duration-300">
              <ScrollReveal as="h3" textClassName="text-2xl font-medium mb-3 text-black">Pilot Deployment</ScrollReveal>
              <ScrollReveal as="p" textClassName="text-sm text-gray-500 font-medium mb-8 leading-relaxed">Perfect for testing system integration and evaluating detection efficacy.</ScrollReveal>
              
              <div className="mb-10 pb-10 border-b border-black/5">
                <ScrollReveal as="span" textClassName="text-5xl font-light tracking-tight text-black">Custom</ScrollReveal>
              </div>
              
              <ul className="space-y-5 mb-10 flex-1">
                <PricingFeature text="Focused pilot deployment" light={true} />
                <PricingFeature text="3-second high-frequency cadence" light={true} />
                <PricingFeature text="Full T1/T2/T3 Trigger Architecture" light={true} />
                <PricingFeature text="High-frequency TimescaleDB capacity" light={true} />
                <PricingFeature text="Standard alerting & reporting" light={true} />
              </ul>
              
              <Link
                href="/contact"
                className="inline-flex h-14 w-full items-center justify-center rounded-xl border-2 border-black bg-transparent px-8 py-3 text-sm font-bold tracking-wide text-black transition-all hover:bg-black hover:text-white"
              >
                REQUEST PILOT PRICING
              </Link>
            </div>

            {/* Full Scale (Dark Theme) */}
            <div className="flex flex-col p-10 border border-white/10 bg-[#111] rounded-3xl relative shadow-2xl group hover:-translate-y-2 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2b7fff]/0 to-[#2b7fff]/5 transition-opacity"></div>
              <div className="absolute top-8 right-8 bg-[#2b7fff] text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(43,127,255,0.4)]">
                Enterprise
              </div>
              
              <div className="relative z-10">
                <ScrollReveal as="h3" textClassName="text-2xl font-medium mb-3 text-white">Full Scale Operation</ScrollReveal>
                <ScrollReveal as="p" textClassName="text-sm text-white/50 font-medium mb-8 leading-relaxed">Comprehensive field-wide safety and process limit monitoring.</ScrollReveal>
                
                <div className="mb-10 pb-10 border-b border-white/10">
                  <ScrollReveal as="span" textClassName="text-5xl font-light tracking-tight text-white">Contact Sales</ScrollReveal>
                </div>
                
                <ul className="space-y-5 mb-10 flex-1">
                  <PricingFeature text="Full-scale fleet deployment" light={false} />
                  <PricingFeature text="Multi-region profile management (GCC & Niger / deep water)" light={false} />
                  <PricingFeature text="Enterprise-grade ingestion capacity" light={false} />
                  <PricingFeature text="Kafka integration for enterprise queueing" light={false} />
                  <PricingFeature text="Custom SLA & dedicated support" light={false} />
                </ul>
                
                <Link
                  href="/contact"
                  className="inline-flex h-14 w-full items-center justify-center rounded-xl bg-[#2b7fff] px-8 py-3 text-sm font-bold tracking-wide text-white transition-all hover:bg-[#1a6aeb] shadow-[0_0_20px_rgba(43,127,255,0.3)] hover:shadow-[0_0_30px_rgba(43,127,255,0.5)]"
                >
                  CONTACT SALES
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PricingFeature({ text, light }: { text: string, light: boolean }) {
  return (
    <li className="flex items-start">
      <div className={`mt-0.5 rounded-full p-1 mr-4 flex-shrink-0 ${light ? 'bg-black/5 text-black' : 'bg-[#2b7fff]/10 text-[#2b7fff]'}`}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <ScrollReveal as="span" textClassName={`text-sm font-medium leading-relaxed ${light ? 'text-gray-700' : 'text-white/80'}`}>{text}</ScrollReveal>
    </li>
  );
}
