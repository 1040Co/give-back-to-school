"use client";

import { FormEvent, useState } from "react";

import { useRouter } from "next/navigation";

import { createClient } from "../../../lib/supabase/client";

export default function TeacherVerificationPage() {

  const supabase = createClient();

  const router = useRouter();

  const [documentType, setDocumentType] = useState("school_id");

  const [file, setFile] = useState<File | null>(null);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();

    if (!file) {

      setMessage("Please select a verification document.");

      return;

    }

    setLoading(true);

    setMessage("");

    const {

      data: { user },

      error: userError,

    } = await supabase.auth.getUser();

    if (userError || !user) {

      setMessage("Please sign in first.");

      setLoading(false);

      return;

    }

    const { data: teacherProfile, error: profileError } = await supabase

      .from("teacher_profiles")

      .select("id")

      .eq("user_id", user.id)

      .maybeSingle();

    if (profileError || !teacherProfile) {

      setMessage("Please complete your teacher profile first.");

      setLoading(false);

      return;

    }

    const { data: existingVerification } = await supabase

      .from("teacher_verifications")

      .select("id, status")

      .eq("teacher_profile_id", teacherProfile.id)

      .in("status", ["pending", "verified"])

      .maybeSingle();

    if (existingVerification) {

      setMessage(

        existingVerification.status === "verified"

          ? "Your teacher account is already verified."

          : "Your verification is already being reviewed."

      );

      setLoading(false);

      return;

    }

    const { data: verification, error: verificationError } = await supabase

      .from("teacher_verifications")

      .insert({

        teacher_profile_id: teacherProfile.id,

        status: "pending",

      })

      .select("id")

      .single();

    if (verificationError || !verification) {

      setMessage(

        verificationError?.message || "Could not create verification request."

      );

      setLoading(false);

      return;

    }

    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    const storagePath = `${user.id}/${verification.id}-${Date.now()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage

      .from("verification-documents")

      .upload(storagePath, file, {

        contentType: file.type,

        upsert: false,

      });

    if (uploadError) {

      setMessage(uploadError.message);

      setLoading(false);

      return;

    }

    const { error: documentError } = await supabase

      .from("verification_documents")

      .insert({

        verification_id: verification.id,

        document_type: documentType,

        storage_path: storagePath,

        original_filename: file.name,

      });

    if (documentError) {

      setMessage(documentError.message);

      setLoading(false);

      return;

    }

    router.push("/teacher/dashboard");

    router.refresh();

  }

  return (
<main className="page">
<div className="eyebrow">Teacher verification</div>
<h1>Verify your teacher status</h1>
<p className="muted">

        Submit one current document that helps confirm that you are an active

        teacher. Your verification documents are private and are not displayed

        on public school-need pages.
</p>
<form className="card" onSubmit={handleSubmit}>
<label>

          Document type
<select

            value={documentType}

            onChange={(event) => setDocumentType(event.target.value)}
>
<option value="school_id">School ID</option>
<option value="employment_certificate">

              Employment certificate
</option>
<option value="deped_id">DepEd ID</option>
<option value="other">Other teacher employment proof</option>
</select>
</label>
<label>

          Verification document
<input

            type="file"

            accept=".jpg,.jpeg,.png,.pdf"

            onChange={(event) => {

              setFile(event.target.files?.[0] ?? null);

            }}

            required

          />
</label>
<div className="callout">

          This file is for verification only. Do not upload student records,

          student photos, class lists or documents containing student personal

          information.
</div>
<button className="btn" type="submit" disabled={loading}>

          {loading ? "Submitting..." : "Submit for verification"}
</button>

        {message ? <p className="muted">{message}</p> : null}
</form>
</main>

  );

}
 
