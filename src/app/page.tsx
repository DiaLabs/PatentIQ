import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
      </main>
    </div>
  );
}
