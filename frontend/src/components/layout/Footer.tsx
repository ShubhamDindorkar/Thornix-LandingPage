import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#0a0a0a] py-10 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col space-y-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/image.png" alt="Thronix AI" className="h-8 w-auto object-contain self-start" />
            <p className="text-sm text-white/50">
              AI-powered real-time industrial asset monitoring — preventing catastrophic failures. AI recommends, humans decide.
            </p>
          </div>
          <div className="flex flex-col space-y-3">
            <h3 className="text-sm font-medium text-white">Product</h3>
            <Link href="/" className="text-sm text-white/50 hover:text-[#2b7fff] transition-colors">Features</Link>
            <Link href="/pricing" className="text-sm text-white/50 hover:text-[#2b7fff] transition-colors">Pricing</Link>
            <Link href="/contact" className="text-sm text-white/50 hover:text-[#2b7fff] transition-colors">Request Pilot</Link>
          </div>
          <div className="flex flex-col space-y-3">
            <h3 className="text-sm font-medium text-white">Company</h3>
            <Link href="/about" className="text-sm text-white/50 hover:text-[#2b7fff] transition-colors">About Us</Link>
            <Link href="/about" className="text-sm text-white/50 hover:text-[#2b7fff] transition-colors">Our Team</Link>
          </div>
          <div className="flex flex-col space-y-3">
            <h3 className="text-sm font-medium text-white">Legal</h3>
            <Link href="#" className="text-sm text-white/50 hover:text-[#2b7fff] transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-sm text-white/50 hover:text-[#2b7fff] transition-colors">Terms of Service</Link>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} Thronix AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
