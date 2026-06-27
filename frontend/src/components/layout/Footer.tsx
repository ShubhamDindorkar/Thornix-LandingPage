import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col space-y-4">
            <span className="text-xl font-medium tracking-tight">Thronix</span>
            <p className="text-sm text-muted">
              Real-time industrial asset monitoring platform preventing catastrophic failures in oil and gas wells.
            </p>
          </div>
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-medium">Product</h3>
            <Link href="/" className="text-sm text-muted hover:text-foreground transition-colors">Features</Link>
            <Link href="/pricing" className="text-sm text-muted hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/contact" className="text-sm text-muted hover:text-foreground transition-colors">Request Pilot</Link>
          </div>
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-medium">Company</h3>
            <Link href="/about" className="text-sm text-muted hover:text-foreground transition-colors">About Us</Link>
            <Link href="/about" className="text-sm text-muted hover:text-foreground transition-colors">Our Team</Link>
          </div>
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-medium">Legal</h3>
            <Link href="#" className="text-sm text-muted hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-sm text-muted hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} Thronix. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
