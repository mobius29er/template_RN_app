import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { Mascot } from '@/components/Mascot';
import { Pricing } from '@/components/Pricing';
import { Waitlist } from '@/components/Waitlist';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

/**
 * Landing Page
 * 
 * Main entry point for the web landing page.
 * Includes: Hero, Features, Mascot, Pricing, Waitlist, Footer
 */
export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Mascot />
      <Pricing />
      <Waitlist />
      <Footer />
    </main>
  );
}
