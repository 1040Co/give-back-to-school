"use client";

import { FormEvent, useState } from "react";

import { createClient } from "../../../lib/supabase/client";

export default function TeacherRegisterPage() {

  const supabase = createClient();

  const [fullName, setFullName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();

    setLoading(true);

    setMessage("");

    const { error } = await supabase.auth.signUp({
 email,
 password,
 options: {
   emailRedirectTo: `${window.location.origin}/teacher/sign-in`,
   data: {
     full_name: fullName,
   },
 },
});

    if (error) {

      setMessage(error.message);

      setLoading(false);

      return;

    }

    setMessage(

      "Registration successful. Please check your email and confirm your account before continuing."

    );

    setLoading(false);

  }

  return (
<main className="page">
<div className="eyebrow">Teacher registration</div>
<h1>Create your teacher account</h1>
<p className="muted">

        Start with your account. After confirming your email, you can add your

        school information and submit teacher verification.
</p>
<form className="card" onSubmit={handleSubmit}>
<label>

          Full legal name
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

          Password
<input

            type="password"

            value={password}

            onChange={(event) => setPassword(event.target.value)}

            minLength={8}

            required

          />
</label>
<button className="btn" type="submit" disabled={loading}>

          {loading ? "Creating account..." : "Create teacher account"}
</button>

        {message ? <p className="muted">{message}</p> : null}
</form>
</main>

  );

}
 
