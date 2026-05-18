"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { MapPlan as MapPlanT } from "./MapPlan";

const MapPlan = dynamic(
  () => import("./MapPlan").then((m) => m.MapPlan),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full px-4 md:px-12 py-24 md:py-32 bg-[var(--av-navy-950)]">
        <div className="max-w-[1500px] mx-auto">
          <div className="rounded-3xl border border-[var(--av-navy-800)] bg-[var(--av-navy-900)] h-[78vh] grid place-items-center">
            <div className="text-[var(--av-ink-300)] text-sm uppercase tracking-[0.22em] animate-pulse">
              Carregando mapa…
            </div>
          </div>
        </div>
      </div>
    ),
  },
);

export function MapPlanLoader(props: ComponentProps<typeof MapPlanT>) {
  return <MapPlan {...props} />;
}
