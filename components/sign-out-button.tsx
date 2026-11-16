"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function signOut() {
    setError("");
    const { error: signOutError } = await createClient().auth.signOut();

    if (signOutError) {
      setError(signOutError.message);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <span>
      <button className="signout-button" type="button" onClick={signOut}>
        Sign out
      </button>
      {error && <span role="alert">{error}</span>}
    </span>
  );
}
