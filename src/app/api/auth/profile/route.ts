import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

function hashPin(pin: string): string {
  return createHash("sha256").update(pin).digest("hex");
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const username = searchParams.get("username");

    if (!userId && !username) {
      return NextResponse.json({ error: "Thiếu userId hoặc username" }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase) {
      let query = supabase.from("profiles").select("*");
      if (userId && !userId.startsWith("usr_") && !userId.startsWith("guest_")) {
        query = query.eq("id", userId);
      } else if (username) {
        query = query.eq("username", username.toLowerCase());
      }

      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        return NextResponse.json({
          user: {
            id: data.id,
            username: data.username,
            fullName: data.full_name || data.username,
            avatar: data.avatar_url,
            score: data.total_score || 0,
            bells: data.bells_won || 0,
            isGuest: false,
          },
        });
      }
    }

    return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, username, fullName, avatarUrl, newPin } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "Thiếu thông tin người dùng!" }, { status: 400 });
    }

    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (fullName) updates.full_name = fullName.trim();
    if (avatarUrl) updates.avatar_url = avatarUrl;
    if (newPin) {
      if (!/^\d{6}$/.test(newPin)) {
        return NextResponse.json({ error: "Mật khẩu PIN mới phải là đúng 6 chữ số!" }, { status: 400 });
      }
      updates.password_pin = hashPin(newPin);
    }

    if (isSupabaseConfigured && supabase) {
      const query = userId && !userId.startsWith("usr_") && !userId.startsWith("guest_")
        ? supabase.from("profiles").update(updates).eq("id", userId).select().single()
        : supabase.from("profiles").update(updates).eq("username", username.toLowerCase()).select().single();

      const { data: updatedProfile, error } = await query;

      if (error) {
        console.error("Supabase profile update error:", error);
        return NextResponse.json({ error: "Lỗi cập nhật profile: " + error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        user: {
          id: updatedProfile.id,
          username: updatedProfile.username,
          fullName: updatedProfile.full_name,
          avatar: updatedProfile.avatar_url,
          score: updatedProfile.total_score || 0,
          bells: updatedProfile.bells_won || 0,
          isGuest: false,
        },
      });
    }

    // Fallback offline
    return NextResponse.json({
      success: true,
      user: {
        id: userId || `usr_${username}`,
        username,
        fullName: fullName || username,
        avatar: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        score: 0,
        bells: 0,
        isGuest: false,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
