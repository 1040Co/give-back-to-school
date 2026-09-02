"use client";

import Link from "next/link";

import { FormEvent, useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { createClient } from "../../../../../lib/supabase/client";

export default function TeacherFulfilmentPage() {

  const params = useParams();

  const router = useRouter();

  const supabase = createClient();

  const needId = String(params.id || "");

  const [needTitle, setNeedTitle] = useState("");

  const [note, setNote] = useState("");

  const [photo, setPhoto] = useState<File | null>(null);

  const [teacherProfileId, setTeacherProfileId] = useState("");

  const [loadingPage, setLoadingPage] = useState(true);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  useEffect(() => {

    async function loadNeed() {

      const {

        data: { user },

      } = await supabase.auth.getUser();

      if (!user) {

        router.push("/teacher/sign-in");

        return;

      }

      const { data: teacherProfile } = await supabase

        .from("teacher_profiles")

        .select("id")

        .eq("user_id", user.id)

        .maybeSingle();

      if (!teacherProfile) {

        setMessage("Teacher profile not found.");

        setLoadingPage(false);

        return;

      }

      setTeacherProfileId(teacherProfile.id);

      const { data: need } = await supabase

        .from("needs")

        .select("id, title, status")

        .eq("id", needId)

        .eq("teacher_profile_id", teacherProfile.id)

        .maybeSingle();

      if (!need) {

        setMessage("Classroom need not found.");

        setLoadingPage(false);

        return;

      }

      setNeedTitle(need.title);

      setLoadingPage(false);

    }

    loadNeed();

  }, [needId, router, supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();

    setLoading(true);

    setMessage("");

    let fulfilmentPhotoPath: string | null = null;

    if (photo) {

      const fileExtension = photo.name.split(".").pop() || "jpg";

      const filePath = `${teacherProfileId}/${needId}/${crypto.randomUUID()}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage

        .from("fulfilment-photos")

        .upload(filePath, photo, {

          cacheControl: "3600",

          upsert: false,

        });

      if (uploadError) {

        setMessage("The fulfilment photo could not be uploaded.");

        setLoading(false);

        return;

      }

      fulfilmentPhotoPath = filePath;

    }

    const { error } = await supabase

      .from("needs")

      .update({

        teacher_confirmed_at: new Date().toISOString(),

        fulfilment_note: note.trim() || null,

        fulfilment_photo_path: fulfilmentPhotoPath,

        status: "completed",

      })

      .eq("id", needId)

      .eq("teacher_profile_id", teacherProfileId);

  if (error) {
 console.error("Confirm receipt error:", error);
 setMessage(
   `We could not confirm receipt: ${error.message}`
 );
 setLoading(false);
 return;
}

    router.push("/teacher/dashboard");

  }

  if (loadingPage) {

    return (
<main className="page">
<p className="muted">Loading...</p>
</main>

    );

  }

  return (
<main className="page">
<Link className="text-link" href="/teacher/dashboard">

        ← Back to dashboard
</Link>
<div className="eyebrow">Receipt confirmation</div>
<h1>Confirm goods received</h1>

      {needTitle ? (
<p className="muted">

          Classroom need: <strong>{needTitle}</strong>
</p>

      ) : null}
<div className="callout">

        Confirm this only after the requested goods have actually been received.

        The teacher confirmation will be used as the main fulfilment record.
</div>
<form className="card" onSubmit={handleSubmit}>
<label>

          Receipt note
<textarea

            rows={4}

            maxLength={500}

            value={note}

            onChange={(event) => setNote(event.target.value)}

            placeholder="Example: Projector received in good condition on 2 September 2026."

          />
<small className="muted">{note.length} / 500 characters</small>
</label>
<label>

          Optional fulfilment photo
<input

            type="file"

            accept="image/jpeg,image/png,image/webp"

            onChange={(event) =>

              setPhoto(event.target.files?.[0] || null)

            }

          />
<small className="muted">

            Upload a photo of the delivered goods or classroom equipment.

            Do not include identifiable students or private documents.
</small>
</label>
<button className="btn" type="submit" disabled={loading}>

          {loading ? "Confirming..." : "Confirm goods received"}
</button>
</form>

      {message ? <div className="callout">{message}</div> : null}
</main>

  );

}
 
