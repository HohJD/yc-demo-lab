import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { FlaskConical } from "lucide-react";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YC Startup Demo Lab",
  description:
    "Unofficial gallery of interactive startup prototypes inspired by Y Combinator's public Requests for Startups.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#07080b" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <header className="sticky top-0 z-40 border-b border-line bg-background/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-indigo-500 to-fuchsia-500">
                <FlaskConical className="h-4 w-4 text-white" />
              </span>
              <span>Startup Demo Lab</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm text-muted">
              <Link href="/" className="hover:text-foreground">Gallery</Link>
              <Link href="/status" className="hover:text-foreground">Status</Link>
              <Link href="/about" className="hover:text-foreground">About</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-24 border-t border-line">
          <div className="mx-auto max-w-7xl px-4 py-8 text-xs text-muted sm:px-6">
            Independent, unofficial project. Not affiliated with or endorsed by Y Combinator. Startup concepts are
            prototypes inspired by YC&apos;s public{" "}
            <a className="underline hover:text-foreground" href="https://www.ycombinator.com/rfs" target="_blank" rel="noreferrer">
              Requests for Startups
            </a>
            . All sample data is illustrative unless stated otherwise.
          </div>
        </footer>
      </body>
    </html>
  );
}
