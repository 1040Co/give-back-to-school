import { revalidatePath } from "next/cache";

import { redirect } from "next/navigation";

import { createClient } from "../../../lib/supabase/server";

export default async function AdminNeedsPage() {

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

  const { data: needs, error } = await supabase

    .from("needs")

    .select(`

      id,

      title,

      description,

      learners_benefiting,

      estimated_value,

      status,

      submitted_at,

      school_id,

      teacher_profile_id

    `)

    .eq("status", "submitted")

    .order("submitted_at", { ascending: true });

  async function approveNeed(formData: FormData) {

    "use server";

    const needId = String(formData.get("needId") || "");

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

      .from("needs")

      .update({

        status: "approved",

        approved_at: new Date().toISOString(),

      })

      .eq("id", needId)

      .eq("status", "submitted");

    if (error) {

      throw new Error(error.message);

    }

    revalidatePath("/admin");

    revalidatePath("/admin/needs");

    revalidatePath("/needs");

    revalidatePath("/");

    revalidatePath("/teacher/dashboard");

  }

  if (error) {

    return (
<main className="page">
<div className="eyebrow">Admin · Needs</div>
<h1>Needs to review</h1>
<div className="card">
<p className="muted">{error.message}</p>
</div>
</main>

    );

  }

  return (
<main className="page">
<div className="eyebrow">Admin · Needs</div>
<h1>Needs to review</h1>
<p className="muted">

        Review teacher requests before they become visible to potential givers.
</p>

      {!needs || needs.length === 0 ? (
<div className="card">
<p className="muted">There are no submitted needs waiting for review.</p>
</div>

      ) : (

        needs.map((need) => (
<NeedReviewCard

            key={need.id}

            need={need}

            approveNeed={approveNeed}

          />

        ))

      )}
</main>

  );

}

async function NeedReviewCard({

  need,

  approveNeed,

}: {

  need: {

    id: string;

    title: string;

    description: string;

    learners_benefiting: number;

    estimated_value: number;

    status: string;

    submitted_at: string | null;

    school_id: string;

    teacher_profile_id: string;

  };

  approveNeed: (formData: FormData) => Promise<void>;

}) {

  const supabase = await createClient();

  const [{ data: school }, { data: teacherProfile }, { data: items }] =

    await Promise.all([

      supabase

        .from("schools")

        .select("school_name, municipality, province, status")

        .eq("id", need.school_id)

        .maybeSingle(),

      supabase

        .from("teacher_profiles")

        .select("user_id, position_title, grade_level, subjects")

        .eq("id", need.teacher_profile_id)

        .maybeSingle(),

      supabase

        .from("need_items")

        .select("item_name, quantity, estimated_unit_cost")

        .eq("need_id", need.id)

        .order("created_at", { ascending: true }),

    ]);

  let teacherName = "Teacher";

  if (teacherProfile?.user_id) {

    const { data: teacherAccount } = await supabase

      .from("profiles")

      .select("full_name")

      .eq("id", teacherProfile.user_id)

      .maybeSingle();

    teacherName = teacherAccount?.full_name || "Teacher";

  }

  return (
<article className="card">
<div className="dashboard-section-heading">
<div>
<div className="eyebrow">Submitted classroom need</div>
<h2>{need.title}</h2>
</div>
<span className="dashboard-badge dashboard-badge-pending">

          Submitted
</span>
</div>
<p>{need.description}</p>
<div className="request-summary">
<div>
<span>Teacher</span>
<strong>{teacherName}</strong>
</div>
<div>
<span>Learners benefiting</span>
<strong>{need.learners_benefiting}</strong>
</div>
<div>
<span>Estimated value</span>
<strong>

            ₱

            {Number(need.estimated_value).toLocaleString("en-PH", {

              minimumFractionDigits: 2,

              maximumFractionDigits: 2,

            })}
</strong>
</div>
</div>
<div className="card" style={{ marginTop: "16px" }}>
<h3>School</h3>

        {school ? (
<>
<p>
<strong>{school.school_name}</strong>
</p>
<p className="muted">

              {[school.municipality, school.province]

                .filter(Boolean)

                .join(", ")}
</p>
<p className="muted">

              School status: <strong>{school.status}</strong>
</p>
</>

        ) : (
<p className="muted">School information unavailable.</p>

        )}
</div>
<div className="card" style={{ marginTop: "16px" }}>
<h3>Requested goods</h3>

        {!items || items.length === 0 ? (
<p className="muted">No item details found.</p>

        ) : (

          items.map((item, index) => (
<div key={`${item.item_name}-${index}`}>
<strong>

                {item.quantity} × {item.item_name}
</strong>
<p className="muted">

                Estimated unit cost: ₱

                {Number(item.estimated_unit_cost).toLocaleString("en-PH", {

                  minimumFractionDigits: 2,

                  maximumFractionDigits: 2,

                })}
</p>
</div>

          ))

        )}
</div>
<form action={approveNeed} style={{ marginTop: "20px" }}>
<input type="hidden" name="needId" value={need.id} />
<button className="btn" type="submit">

          Approve classroom need
</button>
</form>
</article>

  );

}
 
