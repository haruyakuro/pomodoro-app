"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { validateUsername, isUsernameTaken } from "@/utils/supabase/username";

function backToSettings(message: string): never {
  redirect(`/settings?message=${encodeURIComponent(message)}`);
}

export async function updateUsername(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const username = validateUsername(String(formData.get("username") ?? ""));
  if (!username.ok) {
    backToSettings(username.message);
  }

  if (await isUsernameTaken(supabase, username.name, user.id)) {
    backToSettings("そのユーザー名はすでに使われています");
  }

  // 自分のプロフィールを更新（なければ作る）
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, username: username.name });

  if (error) {
    console.log("ユーザー名の保存エラー:", error);
    backToSettings(
      error.code === "23505"
        ? "そのユーザー名はすでに使われています"
        : "保存に失敗しました"
    );
  }

  revalidatePath("/", "layout");
  backToSettings("ユーザー名を変更しました");
}