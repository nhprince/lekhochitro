import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lekhochitro — Graph Calculator",
  description: "A beautiful graphing calculator. Plot functions, explore math.",
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
