import Link from "next/link";

import { createClient } from "../lib/supabase/server";

export default async function Home() {

  const supabase = await createClient();
  
  const { data: approvedNeeds } = await supabase
 .from("needs")
 .select(
   `
   id,
   title,
   learners_benefiting,
   estimated_value,
   school_id,
   schools (
     school_name,
     municipality,
     province
   )
   `
 )
 .eq("status", "approved")
 .order("approved_at", { ascending: false })
 .limit(3);

  const [

    verifiedSchoolsResult,

    verifiedTeachersResult,

    openNeedsResult,

    completedNeedsResult,

  ] = await Promise.all([

    supabase

      .from("schools")

      .select("id", { count: "exact", head: true })

      .eq("status", "verified"),

    supabase

      .from("teacher_profiles")

      .select("id", { count: "exact", head: true })

      .eq("verification_status", "verified"),

    supabase

      .from("needs")

      .select("id", { count: "exact", head: true })

      .eq("status", "approved"),

    supabase

      .from("needs")

      .select("id", { count: "exact", head: true })

      .eq("status", "completed"),

  ]);

  const verifiedSchools = verifiedSchoolsResult.count ?? 0;

  const verifiedTeachers = verifiedTeachersResult.count ?? 0;

  const openNeeds = openNeedsResult.count ?? 0;

  const completedNeeds = completedNeedsResult.count ?? 0;

  return (
<main>
<section className="hero">
<div>
<div className="eyebrow">Give Back to School Philippines</div>
<div className="pilot-badge">Pilot</div>
<h1>Help a classroom. See where it goes.</h1>
<p className="hero-copy">

            Verified teachers post specific classroom needs. Givers choose what

            they want to provide, purchase the goods directly, and follow the

            fulfilment until the teacher confirms receipt.
</p>
<div className="hero-actions">
<Link className="btn" href="/needs">

              Browse school needs
</Link>
<Link className="btn secondary" href="/teacher">

              I’m a teacher
</Link>
</div>
</div>
<div className="hero-highlight">
<span className="tag">How GBTS works</span>
<h2>Classroom giving stays direct.</h2>
<p>

            Teachers request specific goods. Givers provide those goods

            directly. GBTS tracks the process and confirms receipt without

            holding money for individual classroom requests.
</p>
</div>
</section>
<section className="section">
<div className="section-heading">
<div>
<div className="eyebrow">Pilot dashboard</div>
<h2>Progress at a glance</h2>
</div>
<span className="sample-note">Live pilot data</span>
</div>
<div className="impact-grid">
<div className="metric-card">
<div className="metric-number">{verifiedSchools}</div>
<div className="metric-label">Verified schools</div>
</div>
<div className="metric-card">
<div className="metric-number">{verifiedTeachers}</div>
<div className="metric-label">Verified teachers</div>
</div>
<div className="metric-card">
<div className="metric-number">{openNeeds}</div>
<div className="metric-label">Open classroom needs</div>
</div>
<div className="metric-card">
<div className="metric-number">{completedNeeds}</div>
<div className="metric-label">Needs completed</div>
</div>
</div>
</section>
<section className="section">
<div className="section-heading">
<div>
<div className="eyebrow">Sample classroom needs</div>
<h2>What giving through GBTS will look like</h2>
</div>
<Link href="/needs">View school needs →</Link>
</div>
<div className="needs-grid">

{!approvedNeeds || approvedNeeds.length === 0 ? (
<div className="card">
<h3>No approved classroom needs yet</h3>
<p className="muted">

      New verified classroom requests will appear here after GBTS approval.
</p>
</div>

) : (

  approvedNeeds.map((need: any) => {

    const school = Array.isArray(need.schools)

      ? need.schools[0]

      : need.schools;

    return (
<article className="need-card" key={need.id}>
<div className="need-topline">
<span className="status-badge">Open need</span>
<span>

            ₱{Number(need.estimated_value || 0).toLocaleString()}
</span>
</div>
<h3>{need.title}</h3>
<p className="school-name">

          {school?.school_name || "Verified school"}
</p>
<p className="muted">

          {[school?.municipality, school?.province]

            .filter(Boolean)

            .join(", ")}
</p>
<div className="need-meta">
<span>{need.learners_benefiting || 0} learners</span>
<span>Physical goods only</span>
</div>
<Link className="text-link" href={`/needs/${need.id}`}>

          View need →
</Link>
</article>

    );

  })

)}
</section>
<section className="section">
<div className="eyebrow">Simple by design</div>
<h2>Need. Give. Receive.</h2>
<div className="steps-grid">
<div className="step-card">
<div className="step-number">01</div>
<h3>Teacher</h3>
<p>

              A verified teacher submits a specific classroom need for review.
</p>
</div>
<div className="step-card">
<div className="step-number">02</div>
<h3>Giver</h3>
<p>

              A giver commits to the need and purchases or provides the goods

              directly.
</p>
</div>
<div className="step-card">
<div className="step-number">03</div>
<h3>School</h3>
<p>

              The teacher confirms that the goods were received and the need is

              completed.
</p>
</div>
</div>
</section>
<section className="section transparency-panel">
<div>
<div className="eyebrow">Built for transparency</div>
<h2>Clear rules from request to receipt.</h2>
</div>
<div className="transparency-list">
<div>✓ Verified teachers only</div>
<div>✓ Specific goods, not cash requests</div>
<div>

            ✓ GBTS does not collect or hold money for classroom requests
</div>
<div>✓ Fulfilment and teacher receipt confirmation tracked</div>
<div>✓ Private teacher and giver contact details stay protected</div>
<div>✓ Admin review for verification, needs and disputes</div>
</div>
</section>
<section className="section final-cta">
<div>
<div className="eyebrow">Give Back to School pilot</div>
<h2>Small needs can make a real classroom difference.</h2>
<p className="muted">

            We’re building the pilot now. Explore the platform, test the

            experience, or register as a teacher.
</p>
</div>
<div className="hero-actions">
<Link className="btn" href="/needs">

            Browse needs
</Link>
<Link className="btn secondary" href="/teacher">

            Teacher portal
</Link>
</div>
</section>
</main>

  );

}
 
