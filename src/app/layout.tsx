import type { Metadata } from "next";
import "./globals.css";

const description =
  "Professional ad content brief generator for Meta Ads, supporting normal and A/B testing formats.";

export const metadata: Metadata = {
  title: "AdBrief by Boleh Belajar",
  description,
  openGraph: {
    title: "AdBrief by Boleh Belajar",
    description,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
