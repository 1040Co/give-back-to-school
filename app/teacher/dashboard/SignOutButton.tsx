"use client";

import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();

    router.push("/teacher/sign-in");
    router.refresh();
  }

  return (
    <button
      type="button"
      className="btn secondary"
      onClick={handleSignOut}
    >
      Sign out
    </button>
  );
}
