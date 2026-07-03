import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  title: "DESPERTA! Acampadentro",
  description: "App do Acampadentro 2026 para participantes, capitaes, admins e telao.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${bricolage.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F7D043] font-sans">
        {children}
      </body>
    </html>
  );
}
