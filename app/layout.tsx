import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Backgroud } from "@/app/components/Backgroud";
import { Header } from "./components/header/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quiz Electric · Preparación REBT Profesional",
  description: "Plataforma avanzada de simulacros para la certificación REBT.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full relative" suppressHydrationWarning>
        <Backgroud />
        <div className="flex flex-col h-full max-w-5xl mx-auto ">
          <Header />
          <div className="flex-1 flex flex-col items-center justify-center  ">
            {children}
          </div>
          <footer className="py-2 border-t border-border max-w-5xl mx-auto">
            <p className="text-[8px] font-bold text-center text-foreground/20 uppercase tracking-[0.3em]">
              Powered by Thot Luna · 2026
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
