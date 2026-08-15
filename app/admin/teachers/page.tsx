import { revalidatePath } from "next/cache";

import { redirect } from "next/navigation";

import { createClient } from "../../../lib/supabase/server";

export default async function AdminTeachersPage() {

  const supabase = await createClient();

  const {

    data: { user },

  } = await supabase.auth.getUser();

  if (!user) {

    redirect("/teacher/sign-in");

  }

  const { data: profile } = await supabase

    .from("profiles")

    .select("role")

    .eq("id", user.id)

    .maybeSingle();

  if (!profile || profile.role !== "admin") {

    return (
<main className="page">
<div className="eyebrow">Admin</div>
<h1>Access restricted</h1>
</main>

    );

  }

  const { data: verifications, error } = await supabase

    .from("teacher_verifications")

    .select(`

      id,

      status,

      submitted_at,

      teacher_profile_id,

      teacher_profiles (

        id,

        user_id,

        position_title,

        grade_level,

        subjects,

        school_id

      )

    `)

    .eq("status", "pending")

    .order("submitted_at", { ascending: true });

  async function approveTeacher(formData: FormData) {

    "use server";

    const verificationId = String(formData.get("verificationId") || "");

    const supabase = await createClient();

    const {

      data: { user },

    } = await supabase.auth.getUser();

    if (!user) {

      redirect("/teacher/sign-in");

    }

    const { data: profile } = await supabase

      .from("profiles")

      .select("role")

      .eq("id", user.id)

      .maybeSingle();

    if (!profile || profile.role !== "admin") {

      throw new Error("Unauthorized");

    }

    const { error } = await supabase

      .from("teacher_verifications")

      .update({

        status: "verified",

        reviewed_by: user.id,

        reviewed_at: new Date().toISOString(),

      })

      .eq("id", verificationId)

      .eq("status", "pending");

    if (error) {

      throw new Error(error.message);

    }

    revalidatePath("/admin");

    revalidatePath("/admin/teachers");

    revalidatePath("/teacher/dashboard");

  }

  if (error) {

    return (
<main className="page">
<div className="eyebrow">Admin · Teachers</div>
<h1>Teacher reviews</h1>
<div className="card">
<p className="muted">{error.message}</p>
</div>
</main>

    );

  }

  return (
<main className="page">
<div className="eyebrow">Admin · Teachers</div>
<h1>Teacher reviews</h1>

      {!verifications || verifications.length === 0 ? (
<div className="card">
<p className="muted">There are no pending teacher verifications.</p>
</div>

      ) : (

        verifications.map((verification) => (
<div className="card" key={verification.id}>
<h2>Pending teacher verification</h2>
<p>

              Status: <strong>{verification.status}</strong>
</p>
<p className="muted">

              Submitted:{" "}

              {new Date(verification.submitted_at).toLocaleDateString()}
</p>
<form action={approveTeacher}>
<input

                type="hidden"

                name="verificationId"

                value={verification.id}

              />
<button className="btn" type="submit">

                Approve teacher
</button>
</form>
</div>

        ))

      )}
</main>

  );

}
 
