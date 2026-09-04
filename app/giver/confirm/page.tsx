"use client";

import Link from "next/link";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";


import { createClient } from "../../../lib/supabase/client";

export default function GiverConfirmPage() {

  const searchParams = useSearchParams();
   
  const supabase = createClient();

  const [status, setStatus] = useState("Verifying your email...");

  const [needId, setNeedId] = useState("");

  const [success, setSuccess] = useState(false);

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

const savedNeedId =

  searchParams.get("need_id") ||

  String(user.user_metadata?.need_id || "");

const anonymousParam = searchParams.get("anonymous");

const anonymous =

  anonymousParam !== null

    ? anonymousParam === "true"

    : Boolean(user.user_metadata?.anonymous);

const fullName =

  searchParams.get("full_name") ||

  String(user.user_metadata?.full_name || "");
 

setNeedId(savedNeedId);

if (!savedNeedId) {

  setStatus(

    "Your email was verified, but we could not identify the classroom need."

  );

  return;

}

const { data: existingCommitment } = await supabase

  .from("commitments")

  .select("id")

  .eq("need_id", savedNeedId)

  .eq("giver_id", user.id)

  .maybeSingle();

if (existingCommitment) {

  setStatus("Your commitment is already active.");

  return;

}

const { error } = await supabase.rpc("claim_need", {
 p_need_id: savedNeedId,
 p_is_anonymous: anonymous,
 p_public_display_name: anonymous ? null : fullName,
});

if (error) {

  setStatus(error.message);

  return;

}

setSuccess(true);
setStatus("Commitment confirmed.");
    }

    checkUser();

 }, [searchParams]);

  return (
<main className="page">
<div className="eyebrow">Giver verification</div>
{success ? (
<section className="card">
<div className="eyebrow">Commitment confirmed</div>
<h1>Thank you for supporting this classroom.</h1>
<p className="muted">

      Your email is verified and your commitment is now active.
</p>
<div className="callout">

      Please continue with the fulfilment process and provide the requested

      goods within the expected timeframe.
</div>
</section>

) : (
<>
<h1>{status}</h1>
<p className="muted">

      Your classroom commitment has not been created yet.
</p>
</>

)}
 

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
 
