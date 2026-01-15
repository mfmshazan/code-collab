import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CodeCollab - VS Code Style",
  description: "Real-time collaborative code editor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* VS Code Dark Theme Background */}
      <body className={`${inter.className} bg-[#1e1e1e] text-[#cccccc] overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}