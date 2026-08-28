"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../../lib/supabase/client";
 export default function GiverCommitPage() {
 const params = useParams();
 const needId = String(params.id || "");
 const [fullName, setFullName] = useState("");
 const [email, setEmail] = useState("");
 const [anonymous, setAnonymous] = useState(false);
 const [agreeRules, setAgreeRules] = useState(false);
 const [agreePrivacy, setAgreePrivacy] = useState(false);
 function handleSubmit(event: FormEvent<HTMLFormElement>) {
   event.preventDefault();
 }
 return (
<main className="page">
<Link className="text-link" href={`/needs/${needId}`}>
       ← Back to classroom need
</Link>
<div className="eyebrow">Giver commitment</div>
<h1>I want to provide this</h1>
<p className="muted">
       Thank you for choosing to support a classroom. Please provide your
       details so GBTS can verify your commitment and track fulfilment.
</p>
<div className="callout">
       GBTS does not collect or hold money for classroom requests. You are
       committing to provide the requested goods directly.
</div>
<form className="card" onSubmit={handleSubmit}>
<label>
         Your full name
<input
           type="text"
           value={fullName}
           onChange={(event) => setFullName(event.target.value)}
           required
         />
</label>
<label>
         Email address
<input
           type="email"
           value={email}
           onChange={(event) => setEmail(event.target.value)}
           required
         />
</label>
<label>
<input
           type="checkbox"
           checked={anonymous}
           onChange={(event) => setAnonymous(event.target.checked)}
         />
         Show me publicly as an Anonymous Giver
</label>
<label>
<input
           type="checkbox"
           checked={agreeRules}
           onChange={(event) => setAgreeRules(event.target.checked)}
           required
         />
         I agree to the GBTS Giver Rules and understand that I am committing
         to provide the requested goods directly.
</label>
<label>
<input
           type="checkbox"
           checked={agreePrivacy}
           onChange={(event) => setAgreePrivacy(event.target.checked)}
           required
         />
         I acknowledge the GBTS Privacy Notice and agree to the processing of
         my name, email and commitment information for verification,
         fulfilment, security and platform administration.
</label>
<button
         className="btn"
         type="submit"
         disabled={!agreeRules || !agreePrivacy}
>
         Continue to email verification
</button>
</form>
</main>
 );
}
