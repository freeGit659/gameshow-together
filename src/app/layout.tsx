import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "GameShow Together - Nền Tảng Game Show Trực Tuyến",
  description: "Web Game Show thời gian thực với Webcam tròn, bạn bè online và Creator Workshop.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" data-theme="purple">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎮</text></svg>" />
      </head>
      <body className="antialiased min-h-screen text-slate-100 flex flex-col selection:bg-violet-500/30 selection:text-violet-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
