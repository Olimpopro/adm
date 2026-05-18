import { Hero } from "@/components/Hero";
import { MapPlanLoader } from "@/components/MapPlanLoader";
import { Features } from "@/components/Features";
import { Location } from "@/components/Location";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { loadLots } from "@/lib/store";
import { listAllAreaPhotos } from "@/lib/photos";
import { POIS } from "@/lib/lots";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [lots, areaPhotos] = await Promise.all([
    loadLots(),
    listAllAreaPhotos(POIS.map((p) => p.id)),
  ]);
  return (
    <>
      <SmoothScroll />
      <main className="flex-1">
        <Hero />
        <MapPlanLoader lots={lots} areaPhotos={areaPhotos} />
        <Features />
        <Location />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
