import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { AuthForm } from "@/components/auth-form";

export default async function HomePage() {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/dashboard");
    }
  }

  return <AuthForm configured={isSupabaseConfigured()} />;
}
