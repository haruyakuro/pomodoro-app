import type { SupabaseClient } from "@supabase/supabase-js";

const MIN = 2;
const MAX = 16;

type Result = { ok: true; name: string } | { ok: false; message: string };

// ユーザー名のルールをチェックする
export function validateUsername(raw: string): Result {
  const name = raw.trim();
  const length = [...name].length; // 絵文字も1文字として数える

  if (length < MIN || length > MAX) {
    return { ok: false, message: `ユーザー名は${MIN}〜${MAX}文字で入力してください` };
  }
  if (name.includes("@")) {
    return {
      ok: false,
      message: "「@」は使えません（メールアドレスをそのまま使わないでね）",
    };
  }
  return { ok: true, name };
}

// 同じ名前を使っている人がいるか調べる（大文字小文字は区別しない）
// exceptId を渡すと、その人自身は数えない（自分の名前の変更用）
export async function isUsernameTaken(
  supabase: SupabaseClient,
  name: string,
  exceptId?: string
) {
  const escaped = name.replace(/[\\%_]/g, "\\$&");
  let query = supabase
    .from("profiles")
    .select("id")
    .ilike("username", escaped)
    .limit(1);
  if (exceptId) {
    query = query.neq("id", exceptId);
  }
  const { data } = await query;
  return (data?.length ?? 0) > 0;
}