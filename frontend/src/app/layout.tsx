import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/shared/Sidebar";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import TopNavbar from "@/components/shared/TopNavbar";
import MainLayoutWrapper from "@/components/shared/MainLayoutWrapper";
import { PomodoroProvider } from "@/context/PomodoroContext";
import AuthProvider from "@/components/providers/AuthProvider";
import LayoutUIWrapper from "@/components/shared/LayoutUIWrapper";

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
      <body className={`${inter.variable} antialiased flex flex-row bg-background h-screen overflow-hidden relative`}>
        <AuthProvider>
          <PomodoroProvider>
            <LayoutUIWrapper>
              {children}
            </LayoutUIWrapper>
          </PomodoroProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
