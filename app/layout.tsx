import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "frisbee.mv",
  description: "Maldives Flying Disc Federation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
