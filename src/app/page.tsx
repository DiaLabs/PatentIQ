import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { ForInstitutionsSection } from "@/components/landing/for-institutions-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-[#0a0a0a]">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ForInstitutionsSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
