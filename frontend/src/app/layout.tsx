import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

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
      <body className={`${inter.variable} antialiased flex bg-background`}>
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-4 pt-24 lg:p-8 overflow-y-auto h-screen w-full">
          <div className="w-full">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
