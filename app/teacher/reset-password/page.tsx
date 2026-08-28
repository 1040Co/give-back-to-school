"use client";

import { FormEvent, useState } from "react";

import { useRouter } from "next/navigation";

import { createClient } from "../../../lib/supabase/client";

export default function ResetPasswordPage() {

  const supabase = createClient();

  const router = useRouter();

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();

    setMessage("");

    if (password.length < 8) {

      setMessage("Please use at least 8 characters for your new password.");

      return;

    }

    if (password !== confirmPassword) {

      setMessage("The passwords do not match.");

      return;

    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({

      password,

    });

    if (error) {

      setMessage(

        "We couldn’t update your password. Please request a new reset link and try again."

      );

      setLoading(false);

      return;

    }

    router.push("/teacher/sign-in?password=updated");

  }

  return (
<main className="page">
<div className="eyebrow">Teacher account</div>
<h1>Create a new password</h1>
<p className="muted">

        Choose a new password for your Give Back to School teacher account.
</p>
<form className="card" onSubmit={handleSubmit}>
<label>

          New password
<input

            type="password"

            value={password}

            onChange={(event) => setPassword(event.target.value)}

            minLength={8}

            required

          />
</label>
<label>

          Confirm new password
<input

            type="password"

            value={confirmPassword}

            onChange={(event) => setConfirmPassword(event.target.value)}

            minLength={8}

            required

          />
</label>
<button className="btn" type="submit" disabled={loading}>

          {loading ? "Updating..." : "Update password"}
</button>

        {message ? <div className="callout">{message}</div> : null}
</form>
</main>

  );

}
 
