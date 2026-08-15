import { revalidatePath } from "next/cache";

import { redirect } from "next/navigation";

import { createClient } from "../../../lib/supabase/server";

export default async function AdminSchoolsPage() {

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
<div className="card">
<p className="muted">

            This area is available only to Give Back to School administrators.
</p>
</div>
</main>

    );

  }

  const { data: schools, error } = await supabase

    .from("schools")

    .select(

      "id, school_name, deped_school_id, municipality, province, region, status, created_at"

    )

    .eq("status", "pending")

    .order("created_at", { ascending: true });

  async function approveSchool(formData: FormData) {

    "use server";

    const schoolId = String(formData.get("schoolId") || "");

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

      .from("schools")

      .update({ status: "verified" })

      .eq("id", schoolId)

      .eq("status", "pending");

    if (error) {

      throw new Error(error.message);

    }

    revalidatePath("/admin");

    revalidatePath("/admin/schools");

  }

  if (error) {

    return (
<main className="page">
<div className="eyebrow">Admin · Schools</div>
<h1>Schools to review</h1>
<div className="card">
<p className="muted">

            Could not load pending schools: {error.message}
</p>
</div>
</main>

    );

  }

  return (
<main className="page">
<div className="eyebrow">Admin · Schools</div>
<h1>Schools to review</h1>

      {!schools || schools.length === 0 ? (
<div className="card">
<p className="muted">There are no pending schools.</p>
</div>

      ) : (

        schools.map((school) => (
<div className="card" key={school.id}>
<h2>{school.school_name}</h2>
<p className="muted">

              {[school.municipality, school.province, school.region]

                .filter(Boolean)

                .join(", ")}
</p>

            {school.deped_school_id ? (
<p>
<strong>DepEd School ID:</strong> {school.deped_school_id}
</p>

            ) : (
<p className="muted">No DepEd School ID supplied.</p>

            )}
<p>

              Status: <strong>{school.status}</strong>
</p>
<form action={approveSchool}>
<input type="hidden" name="schoolId" value={school.id} />
<button className="btn" type="submit">

                Approve school
</button>
</form>
</div>

        ))

      )}
</main>

  );

}
 
