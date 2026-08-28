"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../../lib/supabase/client";
 export default function GiverCommitPage() {
 const params = useParams();
 const supabase = createClient(); 
 const needId = String(params.id || "");
 const [fullName, setFullName] = useState("");
 const [email, setEmail] = useState("");
 const [anonymous, setAnonymous] = useState(false);
 const [agreeRules, setAgreeRules] = useState(false);
 const [agreePrivacy, setAgreePrivacy] = useState(false);
 const [message, setMessage] = useState("");
 const [loading, setLoading] = useState(false);
 
 async function handleSubmit(event: FormEvent<HTMLFormElement>) {

  event.preventDefault();

  setLoading(true);

  setMessage("");

  if (!agreeRules || !agreePrivacy) {

    setMessage("Please accept the Giver Rules and Privacy Notice.");

    setLoading(false);

    return;

  }

  const { error } = await supabase.auth.signInWithOtp({

    email,

    options: {

     emailRedirectTo: `${window.location.origin}/giver/confirm`,
  
      data: {

        full_name: fullName,

        anonymous,

        need_id: needId,

      },

    },

  });

  if (error) {
 if (
   error.message.toLowerCase().includes("rate") ||
   error.message.toLowerCase().includes("email")
 ) {
   setMessage(
     "Too many verification emails were requested. Please wait a while before trying again. If you already requested one, check your inbox and spam folder first."
   );
 } else {
   setMessage(error.message);
 }
 setLoading(false);
 return;
}

  setMessage(

    "Verification email sent. Please check your inbox and confirm your email to continue."

  );

  setLoading(false);

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
 disabled={loading || !agreeRules || !agreePrivacy}
>
 {loading ? "Sending verification..." : "Continue to email verification"}
</button>
{message ? <div className="callout">{message}</div> : null}
</form>
</main>
 );
}
