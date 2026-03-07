import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import SocialProof from "@/components/sections/SocialProof";
import PlatformPreview from "@/components/PlatformPreview";
import HowItWorks from "@/components/sections/HowItWorks";
import FeaturesGrid from "@/components/sections/FeaturesGrid";
import TechStack from "@/components/sections/TechStack";
import Metrics from "@/components/sections/Metrics";
import CTA from "@/components/sections/CTA";
import ToasterProvider from "@/components/ui/ToasterProvider";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-[#3b82f6]/30">
      <ToasterProvider />
      <Navbar />

      <Hero />
      <SocialProof />
      <PlatformPreview />
      <HowItWorks />
      <FeaturesGrid />
      <TechStack />
      <Metrics />
      <CTA />

      <Footer />
    </main>
  );
}
