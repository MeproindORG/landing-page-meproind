import Hero from "@/components/Hero";
import StatBand from "@/components/StatBand";
import TrustStrip from "@/components/TrustStrip";
import Comparativa from "@/components/Comparativa";
import MercurySection from "@/components/MercurySection";
import ValueBand from "@/components/ValueBand";
import Models from "@/components/Models";
import SpeedClaim from "@/components/SpeedClaim";
import RecoverySimulator from "@/components/RecoverySimulator";
import Anatomy from "@/components/Anatomy";
import ComparisonTable from "@/components/ComparisonTable";
import GoldTech from "@/components/GoldTech";
import VideoSection from "@/components/VideoSection";
import Seals from "@/components/Seals";
import Press from "@/components/Press";
import Testimonials from "@/components/Testimonials";
import Location from "@/components/Location";
import CtaBand from "@/components/CtaBand";

export default function Home() {
  return (
    <>
      <span id="top" />
      <main>
        <Hero />
        <StatBand />
        <TrustStrip />
        <Comparativa />
        <MercurySection />
        <ValueBand />
        <Models />
        <SpeedClaim />
        <RecoverySimulator />
        <Anatomy />
        <ComparisonTable />
        <GoldTech />
        <VideoSection />
        <Seals />
        <Press />
        <Testimonials />
        <Location />
        <CtaBand />
      </main>
    </>
  );
}
