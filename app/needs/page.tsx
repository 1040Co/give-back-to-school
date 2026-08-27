import Link from "next/link";

import { createClient } from "../../lib/supabase/server";

export default async function Page() {

  const supabase = await createClient();

  const { data: needs } = await supabase

    .from("needs")

    .select(

      `

      id,

      title,

      description,

      learners_benefiting,

      estimated_value,

      status,

      teacher_profile_id,

      school_id,

      schools (

        school_name,

        municipality,

        province

      ),

      teacher_profiles (

        user_id,

        verification_status

      )

      `

    )

    .eq("status", "approved")

    .order("approved_at", { ascending: false });

  return (
<main className="page">
<div className="eyebrow">Verified classroom needs</div>
<h1>School Needs</h1>
<p className="muted">

        Browse approved classroom requests from verified teachers and schools.
</p>

      {!needs || needs.length === 0 ? (
<div className="card">
<h2>No approved needs yet</h2>
<p className="muted">

            New classroom needs will appear here after GBTS review and approval.
</p>
</div>

      ) : (
<div className="needs-grid">

          {needs.map((need: any) => {

            const school = Array.isArray(need.schools)

              ? need.schools[0]

              : need.schools;

            return (
<article className="need-card" key={need.id}>
<div className="need-topline">
<span className="status-badge">Open need</span>
</div>
<h2>{need.title}</h2>
<p className="school-name">

                  {school?.school_name || "Verified school"}
</p>
<p className="muted">

                  {[school?.municipality, school?.province]

                    .filter(Boolean)

                    .join(", ")}
</p>
<div className="need-meta">
<span>
<strong>{need.learners_benefiting || 0}</strong>
<small>Learners</small>
</span>
<span>
<strong>

                      ₱{Number(need.estimated_value || 0).toLocaleString()}
</strong>
<small>Estimated value</small>
</span>
</div>
<p className="status">✓ Verified teacher & school</p>
<Link className="btn" href={`/needs/${need.id}`}>

                  View need
</Link>
</article>

            );

          })}
</div>

      )}
</main>

  );

}
 
