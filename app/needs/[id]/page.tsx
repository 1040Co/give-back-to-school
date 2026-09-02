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

      photo_path,

     teacher_confirmed_at,

      fulfilment_note,

    fulfilment_photo_path,

    completed_at,
 
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

        photo_public_consent,

        years_teaching,

        professional_summary

      ),

      need_items (

        item_name,

        quantity,

        estimated_unit_cost

      )

      `

    )

    .eq("id", id)

    .in("status", ["approved", "committed", "fulfilled", "completed"])

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
let photoUrl = "";
if (need.photo_path) {
 const { data } = supabase.storage
   .from("need-photos")
   .getPublicUrl(need.photo_path);
 photoUrl = data.publicUrl;
}
let fulfilmentPhotoUrl = "";
if (need.fulfilment_photo_path) {
 const { data } = supabase.storage
   .from("fulfilment-photos")
   .getPublicUrl(need.fulfilment_photo_path);
 fulfilmentPhotoUrl = data.publicUrl;
} 
  return (
<main className="page need-detail-page">
<Link className="text-link need-back-link" href="/needs">

        ← Back to school needs
</Link>

      {/* HERO */}
<section className="need-hero">
<div className="need-hero-main">
<div className="need-verified-badge">

            ✓ Verified classroom need
</div>
<h1 className="need-title">{need.title}</h1>
<p className="need-location">

            {school?.school_name || "Verified school"}

            {school?.municipality ? ` · ${school.municipality}` : ""}

            {school?.province ? `, ${school.province}` : ""}
</p>
</div>
<div className="need-hero-facts">
<div className="need-fact">
<strong>{need.learners_benefiting || 0}</strong>
<span>Learners benefiting</span>
</div>
<div className="need-fact">
<strong>

              ₱{Number(need.estimated_value || 0).toLocaleString()}
</strong>
<span>Estimated value</span>
</div>
<div className="need-fact">
<strong>Verified</strong>
<span>Teacher request</span>
</div>
</div>
</section>

      {/* MAIN CONTENT */}
<div className="need-layout">
<div className="need-main-column">

          {/* WHY */}
<section className="card need-section">
<div className="need-section-heading">
<span className="need-section-icon">♡</span>
<div>
<div className="eyebrow">The story behind the request</div>
<h2>Why this is needed</h2>
</div>
</div>
<p className="need-story">

              {need.description || "No additional description provided."}
</p>
</section>

          {/* ITEMS */}
<section className="card need-section">
<div className="need-section-heading">
<span className="need-section-icon">□</span>
<div>
<div className="eyebrow">Specific goods requested</div>
<h2>What the classroom needs</h2>
</div>
</div>

            {!need.need_items || need.need_items.length === 0 ? (
<p className="muted">No item details available.</p>

            ) : (
<div className="need-items">

                {need.need_items.map((item: any, index: number) => {

                  const total =

                    Number(item.quantity || 0) *

                    Number(item.estimated_unit_cost || 0);

                  return (
<div key={index} className="need-item-row">
<div className="need-item-name">
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

                          ₱

                          {Number(

                            item.estimated_unit_cost || 0

                          ).toLocaleString()}
</strong>
</div>
<div>
<span>Estimated total</span>
<strong>₱{total.toLocaleString()}</strong>
</div>
</div>

                  );

                })}
</div>

            )}
</section>

          {/* PHOTOS — READY FOR NEXT PHASE */}
{photoUrl ? (
<section className="card need-section need-photo-intro">
<div className="need-section-heading">
<span className="need-section-icon">▧</span>
<div>
<div className="eyebrow">Classroom context</div>
<h2>Photo from the classroom</h2>
</div>
</div>
<div className="need-photo-wrap">
<img
       src={photoUrl}
       alt={`Classroom context for ${need.title}`}
       className="need-photo"
     />
</div>
<p className="muted need-photo-note">
     Photo provided by the verified teacher for this classroom request.
</p>
</section>
{need.status === "completed" ? (
<section className="card need-section fulfilment-proof">
<div className="need-section-heading">
<span className="need-section-icon">✓</span>
<div>
<div className="eyebrow">Fulfilment confirmed</div>
<h2>Received by the classroom</h2>
</div>
</div>
<div className="fulfilment-status">
<strong>✓ Classroom need completed</strong>
<span>

        The verified teacher confirmed that the requested goods were received.
</span>
</div>

    {need.teacher_confirmed_at ? (
<p className="muted">

        Confirmed on{" "}

        {new Date(need.teacher_confirmed_at).toLocaleDateString("en-PH", {

          year: "numeric",

          month: "long",

          day: "numeric",

        })}
</p>

    ) : null}

    {need.fulfilment_note ? (
<div className="fulfilment-note">
<div className="eyebrow">Teacher receipt note</div>
<p>{need.fulfilment_note}</p>
</div>

    ) : null}

    {fulfilmentPhotoUrl ? (
<>
<div className="need-photo-wrap">
<img

            src={fulfilmentPhotoUrl}

            alt={`Fulfilment confirmation for ${need.title}`}

            className="need-photo"

          />
</div>
<p className="muted need-photo-note">

          Fulfilment photo provided by the verified teacher after receipt.
</p>
</>

    ) : null}
</section>
) : null}
) : null}
</div>

        {/* SIDEBAR */}
<aside className="need-sidebar">

          {/* TEACHER */}
<section className="card teacher-card">
<div className="eyebrow">The teacher behind this request</div>
<div className="teacher-identity">
<div className="teacher-avatar">

                {teacherName.charAt(0).toUpperCase()}
</div>
<div>
<h2>{teacherName}</h2>
<p className="status">✓ Verified teacher</p>
</div>
</div>

            {teacherProfile?.position_title ? (
<p className="teacher-detail">

                {teacherProfile.position_title}

                {teacherProfile.grade_level

                  ? ` · ${teacherProfile.grade_level}`

                  : ""}
</p>

            ) : null}

            {teacherProfile?.years_teaching ? (
<p className="teacher-detail">

                {teacherProfile.years_teaching} years teaching
</p>

            ) : null}

            {teacherProfile?.subjects ? (
<p className="teacher-detail">

                Subjects: {teacherProfile.subjects}
</p>

            ) : null}

            {teacherProfile?.professional_summary ? (
<p className="teacher-summary">

                {teacherProfile.professional_summary}
</p>

            ) : null}
</section>

          {/* TRUST */}
<section className="card trust-card">
<div className="eyebrow">Trust & transparency</div>
<h2>How giving works</h2>
<div className="trust-list">
<div>
<strong>Verified teachers only</strong>
<span>Teachers are reviewed before they can post.</span>
</div>
<div>
<strong>Physical goods only</strong>
<span>Requests are for specific classroom goods.</span>
</div>
<div>
<strong>You give directly</strong>
<span>You purchase or provide the requested goods.</span>
</div>
<div>
<strong>GBTS does not handle money</strong>
<span>We do not collect or hold donation funds.</span>
</div>
<div>
<strong>Fulfilment is tracked</strong>
<span>GBTS tracks the request through completion.</span>
</div>
</div>
</section>
</aside>
</div>

      {/* FINAL CTA */}
<section className="need-commit-panel">
 {need.status === "completed" ? (
<div>
<div className="eyebrow">Completed classroom need</div>
<h2>This classroom received the requested goods.</h2>
<p>
       Receipt was confirmed by the verified teacher. This request is now
       complete and is no longer accepting commitments.
</p>
</div>
 ) : ["committed", "fulfilled"].includes(need.status) ? (
<div>
<div className="eyebrow">Commitment in progress</div>
<h2>A giver has committed to this classroom need.</h2>
<p>
       This request is currently being fulfilled and is no longer available
       for another commitment.
</p>
</div>
 ) : (
<>
<div className="need-commit-copy">
<div className="eyebrow">Direct classroom giving</div>
<h2>Give this classroom what it needs</h2>
<p>
         You provide the requested goods directly. GBTS does not collect or
         hold your money.
</p>
</div>
<div className="need-commit-action">
<span>Estimated value</span>
<strong>
         ₱{Number(need.estimated_value || 0).toLocaleString()}
</strong>
<Link
         className="btn"
         href={`/needs/${need.id}/commit`}
>
         I&apos;ll provide this
</Link>
<small>One classroom commitment at a time.</small>
</div>
</>
 )}
</section>
</main>

  );

}
 
