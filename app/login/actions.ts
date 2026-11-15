"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect(`/login?message=${encodeURIComponent("ログインに失敗しました")}`);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    console.log("サインアップエラーの詳細:", error); // ← これを追加
    redirect(`/login?message=${encodeURIComponent("登録に失敗しました")}`);
  }

  redirect(
    `/login?message=${encodeURIComponent(
      "確認メールを送りました。メール内のリンクをクリックしてください"
    )}`
  );
}
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}