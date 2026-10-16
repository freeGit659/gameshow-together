import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeModeProvider } from "@/context/ThemeModeContext";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { EditProfileModal } from "@/components/EditProfileModal";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "GameShow Together - Sàn Đấu Trực Tuyến",
  description: "Web Game Show trực tuyến tương tác với Webcam tròn trên cả Máy Tính & Điện Thoại.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" data-mode="dark">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔔</text></svg>" />
      </head>
      <body className="antialiased min-h-screen">
        <ThemeModeProvider>
          <AuthProvider>
            {children}
            <AuthModal />
            <EditProfileModal />
          </AuthProvider>
        </ThemeModeProvider>
      </body>
    </html>
  );
}
