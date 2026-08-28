"use client";

import Link from "next/link";

import { useEffect, useState } from "react";

import { createClient } from "../../../lib/supabase/client";

export default function GiverConfirmPage() {

  const supabase = createClient();

  const [status, setStatus] = useState("Verifying your email...");

  const [needId, setNeedId] = useState("");

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

      const savedNeedId = String(user.user_metadata?.need_id || "");

      setNeedId(savedNeedId);

      setStatus("Email verified successfully.");

    }

    checkUser();

  }, []);

  return (
<main className="page">
<div className="eyebrow">Giver verification</div>
<h1>{status}</h1>
<p className="muted">

        Your classroom commitment has not been created yet.
</p>

      {needId ? (
<Link className="btn" href={`/needs/${needId}`}>

          Continue to classroom need
</Link>

      ) : (
<Link className="btn secondary" href="/needs">

          Browse school needs
</Link>

      )}
</main>

  );

}
 
