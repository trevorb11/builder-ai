import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Builder AI - AI-Powered Tools for Home Builders",
  description: "AI-powered tools designed for new home builders: website chatbots, marketing assistants, sales training, competitive intelligence, and CRM integrations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
