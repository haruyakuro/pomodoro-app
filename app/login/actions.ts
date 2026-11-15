"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { validateUsername, isUsernameTaken } from "@/utils/supabase/username";

// メッセージ付きでログイン画面に戻る
function backToLogin(message: string): never {
  redirect(`/login?message=${encodeURIComponent(message)}`);
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    backToLogin("ログインに失敗しました");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const username = validateUsername(String(formData.get("username") ?? ""));
  if (!username.ok) {
    backToLogin(username.message);
  }

  const supabase = await createClient();

  if (await isUsernameTaken(supabase, username.name)) {
    backToLogin("そのユーザー名はすでに使われています");
  }

  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    // ユーザー名を一緒に送る（データベース側で profiles に保存される）
    options: { data: { username: username.name } },
  });

  if (error) {
    console.log("サインアップエラーの詳細:", error);
    backToLogin("登録に失敗しました");
  }

  backToLogin("確認メールを送りました。メール内のリンクをクリックしてください");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}