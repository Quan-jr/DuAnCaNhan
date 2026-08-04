import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CircularNavMenu from "@/components/CircularNavMenu";
import TopNavbar from "@/components/shared/TopNavbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quản lý cá nhân",
  description: "Dashboard quản lý tài chính và công việc cá nhân",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} antialiased flex flex-col bg-background min-h-screen relative`}>
        <CircularNavMenu />
        <TopNavbar />
        <main className="flex-1 flex flex-col min-h-screen overflow-y-auto w-full">
          <div className="p-3 pt-4 sm:p-4 sm:pt-6 lg:px-8 lg:pt-8 xl:px-10 pb-24 sm:pb-16 grow shrink-0 w-full">
            {children}
          </div>
          <footer className="w-full p-4 lg:px-8 pb-8 text-center text-sm text-gray-500 mt-auto">
            © 2026 Quản lý cá nhân. All rights reserved.
          </footer>
        </main>
      </body>
    </html>
  );
}
