"use client";

import { FormEvent, useState } from "react";

import { useRouter } from "next/navigation";

import { createClient } from "../../../lib/supabase/client";

export default function TeacherSignInPage() {

  const supabase = createClient();

  const router = useRouter();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();

    setLoading(true);

    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({

      email,

      password,

    });

    if (error) {

      setMessage(error.message);

      setLoading(false);

      return;

    }

    router.push("/teacher/dashboard");

    router.refresh();

  }

  return (
<main className="page">
<div className="eyebrow">Teacher sign in</div>
<h1>Welcome back</h1>
<p className="muted">

        Sign in to manage your teacher profile, verification and school needs.
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
<label>

          Password
<input

            type="password"

            value={password}

            onChange={(event) => setPassword(event.target.value)}

            required

          />
</label>
<button className="btn" type="submit" disabled={loading}>

          {loading ? "Signing in..." : "Sign in"}
</button>

        {message ? <p className="muted">{message}</p> : null}
</form>
</main>

  );

}
 
