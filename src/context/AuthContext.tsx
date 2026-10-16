"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface UserSession {
  id: string;
  username: string;
  avatar: string;
  score: number;
  bells: number;
  isGuest: boolean;
  email?: string;
}

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithPin: (nickname: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  registerWithPin: (nickname: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  continueAsGuest: (guestNickname?: string) => void;
  logout: () => void;
  ensureAuthenticated: (onSuccess: () => void) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  loginWithPin: async () => ({ success: false }),
  registerWithPin: async () => ({ success: false }),
  loginWithGoogle: async () => {},
  continueAsGuest: () => {},
  logout: () => {},
  ensureAuthenticated: () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Khởi tạo đọc session
  useEffect(() => {
    const initAuth = async () => {
      // 1. Kiểm tra session Supabase OAuth (Google)
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const googleUser = session.user;
            const meta = googleUser.user_metadata || {};
            const username = meta.name || meta.full_name || googleUser.email?.split("@")[0] || "Google_Player";
            const avatar = meta.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;

            const sessionUser: UserSession = {
              id: googleUser.id,
              username,
              avatar,
              score: 0,
              bells: 0,
              isGuest: false,
              email: googleUser.email,
            };

            setUser(sessionUser);
            localStorage.setItem("gst_auth_session", JSON.stringify(sessionUser));
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Error checking Supabase session:", e);
        }
      }

      // 2. Đọc session từ LocalStorage
      const saved = localStorage.getItem("gst_auth_session");
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch (e) {
          localStorage.removeItem("gst_auth_session");
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // 1. Đăng nhập với Nickname + PIN 6 số
  const loginWithPin = async (nickname: string, pin: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, pin }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || "Đăng nhập thất bại!" };
      }

      const loggedUser: UserSession = data.user;
      setUser(loggedUser);
      localStorage.setItem("gst_auth_session", JSON.stringify(loggedUser));
      localStorage.setItem("gst_player_name", loggedUser.username);
      closeAuthModal();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Lỗi mạng khi đăng nhập" };
    }
  };

  // 2. Đăng ký với Nickname + PIN 6 số
  const registerWithPin = async (nickname: string, pin: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, pin }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || "Đăng ký thất bại!" };
      }

      const newUser: UserSession = data.user;
      setUser(newUser);
      localStorage.setItem("gst_auth_session", JSON.stringify(newUser));
      localStorage.setItem("gst_player_name", newUser.username);
      closeAuthModal();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Lỗi mạng khi đăng ký" };
    }
  };

  // 3. Đăng nhập với Google OAuth
  const loginWithGoogle = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
          },
        });

        if (error) {
          console.warn("Supabase Google Auth error:", error.message);
          // Gợi ý khi chưa cấu hình Google Provider trên Supabase
          const confirmTest = confirm(
            `Supabase báo: "${error.message}"\n\n(Do Google Provider chưa được bật trong Supabase Dashboard -> Authentication -> Providers -> Google).\n\nBạn có muốn dùng Tài Khoản Thử Nghiệm Google để vào game ngay không?`
          );
          if (confirmTest) {
            const mockGoogleUser: UserSession = {
              id: `google_${Date.now()}`,
              username: "Google_Gamer",
              avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=GoogleGamer",
              score: 0,
              bells: 0,
              isGuest: false,
              email: "gamer@gmail.com",
            };
            setUser(mockGoogleUser);
            localStorage.setItem("gst_auth_session", JSON.stringify(mockGoogleUser));
            localStorage.setItem("gst_player_name", mockGoogleUser.username);
            closeAuthModal();
          }
        }
      } catch (err: any) {
        alert("Lỗi khi kết nối Google: " + err.message);
      }
    } else {
      // Mockup đăng nhập Google khi chạy offline
      const mockGoogleUser: UserSession = {
        id: `google_${Date.now()}`,
        username: "Google_Gamer",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=GoogleGamer",
        score: 0,
        bells: 0,
        isGuest: false,
        email: "gamer@gmail.com",
      };
      setUser(mockGoogleUser);
      localStorage.setItem("gst_auth_session", JSON.stringify(mockGoogleUser));
      localStorage.setItem("gst_player_name", mockGoogleUser.username);
      closeAuthModal();
    }
  };

  // 4. Chơi với tư cách Khách (Guest)
  const continueAsGuest = (guestNickname?: string) => {
    const cleanName = guestNickname?.trim() || `Khách ${Math.floor(100 + Math.random() * 900)}`;
    const guestUser: UserSession = {
      id: `guest_${Date.now()}`,
      username: cleanName,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanName}`,
      score: 0,
      bells: 0,
      isGuest: true,
    };

    setUser(guestUser);
    localStorage.setItem("gst_auth_session", JSON.stringify(guestUser));
    localStorage.setItem("gst_player_name", cleanName);
    closeAuthModal();
  };

  // 5. Đăng xuất
  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    setUser(null);
    localStorage.removeItem("gst_auth_session");
  };

  // 6. Kiểm tra quyền trước khi vào chơi: nếu chưa có tài khoản (kể cả khách) thì bật modal
  const ensureAuthenticated = (onSuccess: () => void): boolean => {
    if (!user) {
      openAuthModal();
      return false;
    }
    onSuccess();
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginWithPin,
        registerWithPin,
        loginWithGoogle,
        continueAsGuest,
        logout,
        ensureAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
