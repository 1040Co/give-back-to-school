"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "../../../../../lib/supabase/client";

export default function GiverConfirmPage() {
  const params = useParams();
  const router = useRouter();

  const needId = String(params.id || "");

  const supabase = createClient();

  const [status, setStatus] = useState(
    "Confirming your email and classroom commitment..."
  );

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setStatus(
          "We could not confirm your email session. Please return to the classroom need and try again."
        );

        return;
      }

      const fullName = String(
        user.user_metadata?.full_name || ""
      );

      const anonymous = Boolean(
        user.user_metadata?.anonymous
      );

      const query = new URLSearchParams({
        need_id: needId,
        full_name: fullName,
        anonymous: anonymous ? "true" : "false",
      });

      router.replace(
        `/giver/confirm?${query.toString()}`
      );
    }

    checkUser();
  }, []);

  return (
    <main className="page">
      <div className="eyebrow">Giver verification</div>

      <h1>{status}</h1>

      <p className="muted">
        Please keep this page open while GBTS completes your commitment.
      </p>

      <Link
        className="btn secondary"
        href={`/needs/${needId}`}
      >
        Back to classroom need
      </Link>
    </main>
  );
}
