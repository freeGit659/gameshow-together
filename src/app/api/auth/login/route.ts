import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

function hashPin(pin: string): string {
  return createHash("sha256").update(pin).digest("hex");
}

export async function POST(req: Request) {
  try {
    const { nickname, pin } = await req.json();

    const cleanNick = (nickname || "").trim().toLowerCase();
    if (!cleanNick) {
      return NextResponse.json({ error: "Vui lòng nhập nickname!" }, { status: 400 });
    }

    if (!/^\d{6}$/.test(pin)) {
      return NextResponse.json({ error: "Mật khẩu phải là đúng 6 chữ số!" }, { status: 400 });
    }

    const pinHash = hashPin(pin);

    // 1. Kiểm tra trên Supabase
    if (isSupabaseConfigured && supabase) {
      const { data: user, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, total_score, bells_won, password_pin")
        .eq("username", cleanNick)
        .single();

      if (error || !user) {
        return NextResponse.json({ error: "Tài khoản không tồn tại. Vui lòng kiểm tra lại nickname hoặc Đăng ký!" }, { status: 404 });
      }

      if (user.password_pin && user.password_pin !== pinHash) {
        return NextResponse.json({ error: "Mật khẩu 6 số không chính xác!" }, { status: 401 });
      }

      return NextResponse.json({
        user: {
          id: user.id,
          username: user.username,
          avatar: user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`,
          score: user.total_score || 0,
          bells: user.bells_won || 0,
          isGuest: false,
        },
      });
    }

    // 2. Fallback nếu Supabase chưa config
    return NextResponse.json({
      user: {
        id: `usr_${cleanNick}`,
        username: cleanNick,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanNick}`,
        score: 1200,
        bells: 1,
        isGuest: false,
      },
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Lỗi đăng nhập: " + err.message }, { status: 500 });
  }
}
