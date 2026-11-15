import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Timer from "./Timer";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 公開用のユーザー名を取得（メールアドレスは画面に出さない）
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  return <Timer userId={user.id} username={profile?.username ?? "名前未設定"} />;
}