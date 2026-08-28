"use client";

import Link from "next/link";

import { useParams } from "next/navigation";

import { useEffect, useState } from "react";

import { createClient } from "../../../../../lib/supabase/client";

export default function GiverConfirmPage() {

  const params = useParams();

  const needId = String(params.id || "");

  const supabase = createClient();

  const [status, setStatus] = useState("Verifying your email...");

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
<Link className="btn secondary" href={`/needs/${needId}`}>

        Back to classroom need
</Link>
</main>

  );

}
 
