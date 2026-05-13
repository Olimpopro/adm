import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AcquaVille Residencial — O primeiro condomínio fechado de Santana, BA",
  description:
    "Lotes exclusivos de 250 a 450 m² em loteamento fechado às margens da BA-172. Reserva online, simulação de compra e disponibilidade em tempo real.",
  metadataBase: new URL("https://acquaville.example.com"),
  openGraph: {
    title: "AcquaVille Residencial — Santana, BA",
    description:
      "O primeiro condomínio fechado de Santana. Selecione seu lote, simule e reserve.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--av-navy-950)] text-[var(--av-cream-50)]">
        {children}
      </body>
    </html>
  );
}
