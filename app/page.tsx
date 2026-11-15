import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Timer from "./timer";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <Timer userId={user.id} userEmail={user.email ?? ""} />;
}