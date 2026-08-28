import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
export default async function NeedDetailPage({
 params,
}: {
 params: Promise<{ id: string }>;
}) {
 const { id } = await params;
 const supabase = await createClient();
 const { data: need } = await supabase
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
       province,
       region
     ),
     teacher_profiles (
       user_id,
       position_title,
       grade_level,
       subjects,
       verification_status,
       photo_public_consent
     ),
     need_items (
       item_name,
       quantity,
       estimated_unit_cost
     )
     `
   )
   .eq("id", id)
   .eq("status", "approved")
   .maybeSingle();
 if (!need) {
   notFound();
 }
 const school = Array.isArray(need.schools)
   ? need.schools[0]
   : need.schools;
 const teacherProfile = Array.isArray(need.teacher_profiles)
   ? need.teacher_profiles[0]
   : need.teacher_profiles;
 let teacherName = "Verified teacher";
 if (teacherProfile?.user_id) {
   const { data: profile } = await supabase
     .from("profiles")
     .select("full_name")
     .eq("id", teacherProfile.user_id)
     .maybeSingle();
   teacherName = profile?.full_name || "Verified teacher";
 }
 return (
<main className="page">
<Link className="text-link" href="/needs">
       ← Back to school needs
</Link>
<div className="eyebrow">Verified classroom need</div>
<h1>{need.title}</h1>
<p className="muted">
       {school?.school_name || "Verified school"}
       {school?.municipality ? ` · ${school.municipality}` : ""}
       {school?.province ? `, ${school.province}` : ""}
</p>
<section className="card">
<div className="need-meta">
<span>
<strong>{need.learners_benefiting || 0}</strong>
<small>Learners benefiting</small>
</span>
<span>
<strong>
             ₱{Number(need.estimated_value || 0).toLocaleString()}
</strong>
<small>Estimated value</small>
</span>
</div>
</section>
<section className="card">
<div className="eyebrow">Teacher</div>
<h2>{teacherName}</h2>
<p className="status">✓ Verified teacher</p>
       {teacherProfile?.position_title ? (
<p className="muted">
           {teacherProfile.position_title}
           {teacherProfile.grade_level
             ? ` · ${teacherProfile.grade_level}`
             : ""}
</p>
       ) : null}
       {teacherProfile?.subjects ? (
<p className="muted">Subjects: {teacherProfile.subjects}</p>
       ) : null}
</section>
<section className="card">
<div className="eyebrow">Why this is needed</div>
<p>{need.description || "No additional description provided."}</p>
</section>
<section className="card">
<div className="eyebrow">Requested items</div>
       {!need.need_items || need.need_items.length === 0 ? (
<p className="muted">No item details available.</p>
       ) : (
         need.need_items.map((item: any, index: number) => (
<div key={index} className="request-summary">
<div>
<span>Item</span>
<strong>{item.item_name}</strong>
</div>
<div>
<span>Quantity</span>
<strong>{item.quantity}</strong>
</div>
<div>
<span>Estimated unit cost</span>
<strong>
                 ₱{Number(item.estimated_unit_cost || 0).toLocaleString()}
</strong>
</div>
</div>
         ))
       )}
</section>
<section className="card">
<div className="eyebrow">Give this classroom what it needs</div>
<h2>I want to provide this</h2>
<p className="muted">
         GBTS does not collect or hold money for this classroom request. The
         giver provides the requested goods directly and GBTS tracks the
         fulfilment.
</p>
<Link className="btn" href={`/needs/${need.id}/commit`}>
 I&apos;ll provide this
</Link>
</section>
</main>
 );
}
