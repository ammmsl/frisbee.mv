import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SkipLink from "@/app/_components/SkipLink";
import { ToastProvider } from "@/app/_components/Toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "frisbee.mv",
    template: "%s | frisbee.mv",
  },
  description:
    "Ultimate Frisbee Association (UFA) — the national governing body for Ultimate and flying disc sports in the Republic of Maldives.",
  metadataBase: new URL("https://frisbee.mv"),
  openGraph: {
    siteName: "frisbee.mv",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-[family-name:var(--font-inter)] antialiased">
        <SkipLink />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
