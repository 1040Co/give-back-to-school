"use client";

import Link from "next/link";

import { FormEvent, useState } from "react";

import { createClient } from "../../../lib/supabase/client";

export default function ForgotPasswordPage() {

  const supabase = createClient();

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();

    setLoading(true);

    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {

      redirectTo: `${window.location.origin}/teacher/reset-password`,

    });

    if (error) {

      setMessage(

        "We couldn’t send the reset email. Please wait a moment and try again."

      );

      setLoading(false);

      return;

    }

    setMessage(

      "Password reset email sent. Please check your inbox and spam folder."

    );

    setLoading(false);

  }

  return (
<main className="page">
<div className="eyebrow">Teacher account</div>
<h1>Reset your password</h1>
<p className="muted">

        Enter the email address connected to your teacher account.
</p>
<form className="card" onSubmit={handleSubmit}>
<label>

          Email address
<input

            type="email"

            value={email}

            onChange={(event) => setEmail(event.target.value)}

            required

          />
</label>
<button className="btn" type="submit" disabled={loading}>

          {loading ? "Sending..." : "Send reset email"}
</button>

        {message ? <div className="callout">{message}</div> : null}
</form>
<Link className="text-link" href="/teacher/sign-in">

        ← Back to sign in
</Link>
</main>

  );

}
 
