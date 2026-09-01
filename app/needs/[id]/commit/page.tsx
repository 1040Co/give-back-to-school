"use client";

import Link from "next/link";

import { FormEvent, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { createClient } from "../../../../lib/supabase/client";

export default function GiverCommitPage() {

  const params = useParams();

  const router = useRouter();

  const supabase = createClient();

  const needId = String(params.id || "");

  const [fullName, setFullName] = useState("");

  const [email, setEmail] = useState("");

  const [anonymous, setAnonymous] = useState(false);

  const [agreeRules, setAgreeRules] = useState(false);

  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const [otp, setOtp] = useState("");

  const [codeSent, setCodeSent] = useState(false);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSendCode(event: FormEvent<HTMLFormElement>) {

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

        shouldCreateUser: true,

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

          "Too many verification emails were requested. Please wait a while before trying again."

        );

      } else {

        setMessage(

          "We couldn’t send the verification code. Please try again."

        );

      }

      setLoading(false);

      return;

    }

    setCodeSent(true);

    setMessage(

      "We sent a verification code to your email. Enter the code below to continue."

    );

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

        "That verification code is invalid or has expired. Please check the newest email and try again."

      );

      setLoading(false);

      return;

    }

    const params = new URLSearchParams({
 need_id: needId,
 full_name: fullName,
 anonymous: anonymous ? "true" : "false",
});
router.push(`/giver/confirm?${params.toString()}`);

  }

  return (
<main className="page">
<Link className="text-link" href={`/needs/${needId}`}>

        ← Back to classroom need
</Link>
<div className="eyebrow">Giver commitment</div>
<h1>I want to provide this</h1>
<p className="muted">

        Thank you for choosing to support a classroom. GBTS verifies your

        email before creating the commitment.
</p>
<div className="callout">

        GBTS does not collect or hold money for classroom requests. You are

        committing to provide the requested goods directly.
</div>

      {!codeSent ? (
<form className="card" onSubmit={handleSendCode}>
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

            I agree to the GBTS Giver Rules and understand that I am

            committing to provide the requested goods directly.
</label>
<label>
<input

              type="checkbox"

              checked={agreePrivacy}

              onChange={(event) => setAgreePrivacy(event.target.checked)}

              required

            />

            I acknowledge the GBTS Privacy Notice and agree to the processing

            of my name, email and commitment information for verification,

            fulfilment, security and platform administration.
</label>
<button

            className="btn"

            type="submit"

            disabled={loading || !agreeRules || !agreePrivacy}
>

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

            {loading ? "Verifying..." : "Verify email"}
</button>
<button

            className="text-link"

            type="button"

            onClick={() => {

              setCodeSent(false);

              setOtp("");

              setMessage("");

            }}
>

            Use a different email
</button>
</form>

      )}

      {message ? <div className="callout">{message}</div> : null}
</main>

  );

}
 
