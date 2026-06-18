import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { ConditionalMain } from "@/components/layout/ConditionalMain";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CarbonCringe — Track Your Carbon Footprint",
  description:
    "A GenZ-friendly carbon footprint tracker powered by AI. Understand, track, and reduce your environmental impact with personalized roasts and real insights.",
  keywords: ["carbon footprint", "sustainability", "climate", "AI", "green"],
  authors: [{ name: "CarbonCringe" }],
  openGraph: {
    title: "CarbonCringe — Track Your Carbon Footprint",
    description: "AI-powered carbon tracker that keeps it real. No cap, no greenwashing.",
    type: "website",
    siteName: "CarbonCringe",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable} dark`}
      suppressHydrationWarning
    >
      <body className="antialiased min-h-screen bg-[#0B0F0D] text-[var(--color-text)] font-body">
        <TooltipProvider>
          <AnimatedBackground />
          <Navbar />
          <ConditionalMain>
            {children}
          </ConditionalMain>
          <Footer />
          <MobileNav />
        </TooltipProvider>
      </body>
    </html>
  );
}
