import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Bộ nhớ tạm in-memory lưu tài khoản nếu chưa cấu hình Supabase (để test offline)
const inMemoryUsers: Record<string, { id: string; username: string; pinHash: string; avatar: string; score: number; bells: number }> = {};

function hashPin(pin: string): string {
  return createHash("sha256").update(pin).digest("hex");
}

export async function POST(req: Request) {
  try {
    const { nickname, pin } = await req.json();

    // 1. Validate Nickname
    const cleanNick = (nickname || "").trim().toLowerCase();
    if (!cleanNick || cleanNick.length < 3 || cleanNick.length > 20) {
      return NextResponse.json({ error: "Nickname phải từ 3 đến 20 ký tự!" }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(cleanNick)) {
      return NextResponse.json({ error: "Nickname chỉ bao gồm chữ cái, số và dấu gạch dưới (không dấu, không khoảng trắng)!" }, { status: 400 });
    }

    // 2. Validate PIN 6 chữ số
    if (!/^\d{6}$/.test(pin)) {
      return NextResponse.json({ error: "Mật khẩu phải là đúng 6 chữ số (VD: 123456)!" }, { status: 400 });
    }

    const pinHash = hashPin(pin);
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanNick}`;

    // 3. Lưu vào Supabase nếu có cấu hình
    if (isSupabaseConfigured && supabase) {
      // Kiểm tra username đã tồn tại chưa
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", cleanNick)
        .single();

      if (existingUser) {
        return NextResponse.json({ error: "Nickname này đã có người sử dụng. Vui lòng chọn tên khác!" }, { status: 409 });
      }

      // Tạo tài khoản mới
      const { data: newUser, error: insertError } = await supabase
        .from("profiles")
        .insert({
          username: cleanNick,
          full_name: cleanNick,
          avatar_url: avatar,
          role: "player",
          total_score: 0,
          bells_won: 0,
          auth_type: "simple",
          password_pin: pinHash,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        return NextResponse.json({ error: "Không thể tạo tài khoản trên database: " + insertError.message }, { status: 500 });
      }

      return NextResponse.json({
        user: {
          id: newUser.id,
          username: newUser.username,
          avatar: newUser.avatar_url,
          score: newUser.total_score || 0,
          bells: newUser.bells_won || 0,
          isGuest: false,
        },
      });
    }

    // 4. Fallback in-memory nếu chưa cấu hình Supabase
    if (inMemoryUsers[cleanNick]) {
      return NextResponse.json({ error: "Nickname này đã có người sử dụng!" }, { status: 409 });
    }

    const mockId = `usr_${Date.now()}`;
    inMemoryUsers[cleanNick] = {
      id: mockId,
      username: cleanNick,
      pinHash,
      avatar,
      score: 0,
      bells: 0,
    };

    return NextResponse.json({
      user: {
        id: mockId,
        username: cleanNick,
        avatar,
        score: 0,
        bells: 0,
        isGuest: false,
      },
    });
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Lỗi hệ thống khi đăng ký: " + err.message }, { status: 500 });
  }
}
