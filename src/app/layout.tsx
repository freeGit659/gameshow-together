import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Đấu Trường Chuông Vàng - GameShow Together",
  description: "Nền tảng Web Game Show tương tác thời gian thực với Webcam tròn và Creator Workshop.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔔</text></svg>" />
      </head>
      <body className="antialiased min-h-screen flex flex-col selection:bg-yellow-500/30 selection:text-yellow-200">
        <header className="border-b border-border/40 backdrop-blur-md bg-slate-950/60 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-300 flex items-center justify-center text-xl shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition-transform">
                🔔
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight gold-gradient-text">
                  GameShow Together
                </span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-full">
                  PROTOTYPE
                </span>
              </div>
            </a>

            <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-300">
              <span className="hidden md:flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Real-time WebRTC & Socket
              </span>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
              >
                Docs / VibeCoding
              </a>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
