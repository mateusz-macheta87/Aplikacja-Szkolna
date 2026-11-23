import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { ProgressProvider } from "@/lib/progressStore";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";

const fredoka = Fredoka({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "Bzyczek — Aplikacja Szkolna | Gry językowe i quizy audio na iPada",
  description:
    "Multimedialna, modułowa aplikacja edukacyjna na iPada do nauki słownictwa, gramatyki i przygotowania do sprawdzianów szkolnych przez zabawę.",
  manifest: `${BASE_PATH}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bzyczek",
  },
  icons: {
    icon: `${BASE_PATH}/icons/icon-192.png`,
    apple: `${BASE_PATH}/icons/apple-touch-icon.png`,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F59E0B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${fredoka.variable} ${nunito.variable}`}>
      <body>
        <ProgressProvider>
          <ServiceWorkerRegistrar />
          {children}
        </ProgressProvider>
      </body>
    </html>
  );
}
