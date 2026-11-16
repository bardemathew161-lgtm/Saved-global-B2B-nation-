import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NicToons Studio",
  description: "AI video creation platform for cartoon and comedy storytelling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
