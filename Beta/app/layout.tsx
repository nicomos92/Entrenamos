import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { PwaRegister } from "@/app/components/PwaRegister";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "EntrenaMos",
  description: "Plataforma para entrenadores y alumnos: rutinas, seguimiento y agenda en un solo lugar.",
  icons: {
    icon: "/icon.svg",
    apple: [{ url: "/pwa/icon?size=180" }],
  },
  appleWebApp: {
    capable: true,
    title: "EntrenaMos",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#f8fafc",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={inter.variable} lang="es">
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
