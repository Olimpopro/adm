import { Hero } from "@/components/Hero";
import { SitePlan } from "@/components/SitePlan";
import { Features } from "@/components/Features";
import { Location } from "@/components/Location";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { loadLots } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Page() {
  const lots = await loadLots();
  return (
    <>
      <SmoothScroll />
      <main className="flex-1">
        <Hero />
        <SitePlan lots={lots} />
        <Features />
        <Location />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
