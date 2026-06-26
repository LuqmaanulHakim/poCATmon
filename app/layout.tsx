import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DisableZoom from "./components/DisableZoom";
import { ThemeProvider } from "./context/ThemeContext";
import Toolbar from "./components/Toolbar";
import BottomNav from "./components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PoCATmon",
  description: "PoCATmon is a web application that allows users to snap and upload cat images",
  themeColor: "transparent",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // critical for iOS safe areas
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <DisableZoom />
      <ThemeProvider>
        <body className="min-h-full flex flex-col">
          <Toolbar />
          {children}
          <BottomNav />
        </body>
      </ThemeProvider>
    </html>
  );
}
