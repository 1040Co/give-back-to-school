"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

export default function GiverSignInPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      setMessage(
        "We couldn’t send the verification code. Please check your email and try again."
      );
      setLoading(false);
      return;
    }

    setCodeSent(true);
    setMessage("We sent a verification code to your email.");
    setLoading(false);
  }

  async function handleVerifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      setMessage(
        "That verification code is invalid or has expired. Please try again."
      );
      setLoading(false);
      return;
    }

    router.push("/giver");
    router.refresh();
  }

  return (
    <main className="page">
      <div className="eyebrow">Giver sign in</div>
      <h1>Return to your classroom commitment</h1>

      <p className="muted">
        Enter the email address you used when you committed to a classroom need.
      </p>

      {!codeSent ? (
        <form className="card" onSubmit={handleSendCode}>
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
            {loading ? "Sending code..." : "Send verification code"}
          </button>
        </form>
      ) : (
        <form className="card" onSubmit={handleVerifyCode}>
          <div className="eyebrow">Email verification</div>
          <h2>Enter your verification code</h2>

          <p className="muted">
            We sent a code to <strong>{email}</strong>.
          </p>

          <label>
            Verification code
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, ""))
              }
              required
            />
          </label>

          <button
            className="btn"
            type="submit"
            disabled={loading || otp.length < 6}
          >
            {loading ? "Verifying..." : "Sign in"}
          </button>
        </form>
      )}

      {message ? <div className="callout">{message}</div> : null}
    </main>
  );
}
