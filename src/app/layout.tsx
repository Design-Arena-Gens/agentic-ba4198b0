import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";

const openSans = Open_Sans({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "ShopVerse | Modern E-commerce Experience",
    template: "%s | ShopVerse",
  },
  description:
    "ShopVerse brings a premium, accessible shopping experience with personalized recommendations, seamless checkout, and secure account management.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${openSans.className} bg-surface text-foreground antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
