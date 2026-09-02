import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
function formatStatus(status: string) {
 return status
   .replaceAll("_", " ")
   .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function needStatusMessage(status: string) {
 switch (status) {
   case "submitted":
     return "Your request has been submitted and is waiting for admin review.";
   case "correction_required":
     return "Your request needs some changes before it can be approved.";
   case "approved":
     return "Your request is approved and visible to potential givers.";
   case "committed":
     return "A giver has committed to your classroom request.";
   case "fulfilled":
     return "The giver has marked the goods as provided. Please confirm receipt when they arrive.";
   default:
     return "";
 }
}
export default async function TeacherDashboardPage() {
 const supabase = await createClient();
 const {
   data: { user },
 } = await supabase.auth.getUser();
 if (!user) {
   redirect("/teacher/sign-in");
 }
 const { data: accountProfile } = await supabase
   .from("profiles")
   .select("full_name")
   .eq("id", user.id)
   .maybeSingle();
 const { data: teacherProfile } = await supabase
   .from("teacher_profiles")
   .select(
     `
       id,
       school_id,
       verification_status,
       position_title,
       grade_level,
       subjects
     `
   )
   .eq("user_id", user.id)
   .maybeSingle();
 
 const { data: latestVerification } = await supabase
 .from("teacher_verifications")
 .select("status, correction_message")
 .eq("teacher_profile_id", teacherProfile?.id || "")
 .order("submitted_at", { ascending: false })
 .limit(1)
 .maybeSingle();
 
 let school = null;
 let activeNeed = null;
 let completedNeeds = 0;
 if (teacherProfile?.school_id) {
   const { data } = await supabase
     .from("schools")
     .select("school_name, municipality, province, status")
     .eq("id", teacherProfile.school_id)
     .maybeSingle();
   school = data;
 }
 if (teacherProfile?.id) {
   const { data } = await supabase
     .from("needs")
     .select(
       `
         id,
         title,
         learners_benefiting,
         estimated_value,
         status,
         created_at
       `
     )
     .eq("teacher_profile_id", teacherProfile.id)
     .in("status", [
       "submitted",
       "correction_required",
       "approved",
       "committed",
       "fulfilled",
     ])
     .order("created_at", { ascending: false })
     .limit(1)
     .maybeSingle();
   activeNeed = data;
   const { count } = await supabase
     .from("needs")
     .select("id", { count: "exact", head: true })
     .eq("teacher_profile_id", teacherProfile.id)
     .eq("status", "completed");
   completedNeeds = count ?? 0;
 }
 const teacherVerified =
   teacherProfile?.verification_status === "verified";
 const schoolVerified = school?.status === "verified";
 const setupSteps = [
   {
     label: "Account",
     complete: true,
   },
   {
     label: "Teacher profile",
     complete: Boolean(teacherProfile),
   },
   {
     label: "School",
     complete: Boolean(school),
   },
   {
     label: "Verification",
     complete: teacherVerified,
   },
 ];
 return (
<main className="page">
<section className="teacher-welcome">
<div>
<div className="eyebrow">Teacher dashboard</div>
<h1>
           Welcome
           {accountProfile?.full_name
             ? `, ${accountProfile.full_name}`
             : ""}
</h1>
<p className="muted">
           Manage your teacher profile, verification, and classroom requests
           from one place.
</p>
</div>
<div className="teacher-account-chip">
<span>Signed in as</span>
<strong>{user.email}</strong>
</div>
</section>
<section className="impact-grid teacher-metrics">
<div className="metric-card">
<div className="metric-label">Teacher status</div>
<div className="dashboard-status">
           {teacherProfile
             ? formatStatus(teacherProfile.verification_status)
             : "Profile incomplete"}
</div>
</div>
<div className="metric-card">
<div className="metric-label">School status</div>
<div className="dashboard-status">
           {school ? formatStatus(school.status) : "Not linked"}
</div>
</div>
<div className="metric-card">
<div className="metric-label">Current request</div>
<div className="dashboard-status">
           {activeNeed ? formatStatus(activeNeed.status) : "None"}
</div>
</div>
<div className="metric-card">
<div className="metric-number">{completedNeeds}</div>
<div className="metric-label">Needs completed</div>
</div>
</section>
{latestVerification?.status === "correction_required" &&

  latestVerification?.correction_message && (
<section className="card">
<div className="eyebrow">Action required</div>
<h2>Verification correction needed</h2>
<p className="muted">

        The GBTS admin reviewed your verification and needs the following

        correction:
</p>
<div className="correction-callout">

        {latestVerification.correction_message}
</div>
<p className="muted">

        Please update the requested information or documents and resubmit your

        verification.
</p>
<Link className="btn" href="/teacher/verification">

        Update verification
</Link>
</section>

  )}

{latestVerification?.status === "rejected" &&

  latestVerification?.correction_message && (
<section className="card">
<div className="eyebrow">Verification rejected</div>
<h2>Your verification was not approved</h2>
<p className="muted">

        The GBTS admin reviewed your verification and could not approve it.
</p>
<div className="rejection-callout">

        {latestVerification.correction_message}
</div>
<p className="muted">

        You cannot resubmit verification at this time.
</p>
</section>

  )}
 

<section className="card">
<div className="dashboard-section-heading">
<div>
<div className="eyebrow">Getting started</div>
<h2>Your GBTS setup</h2>
</div>
</div>
<div className="setup-progress">
         {setupSteps.map((step) => (
<div
             className={`setup-step ${
               step.complete ? "setup-complete" : ""
             }`}
             key={step.label}
>
<span className="setup-icon">
               {step.complete ? "✓" : "○"}
</span>
<span>{step.label}</span>
</div>
         ))}
</div>
</section>
  {!teacherProfile ? (
<section className="card dashboard-action-card">
<div>
<div className="eyebrow">Next step</div>
<h2>Complete your teacher profile</h2>
<p className="muted">
             Add your school and teaching information before submitting your
             teacher verification.
</p>
</div>
<Link className="btn" href="/teacher/profile">
           Complete teacher profile
</Link>
</section>
     ) : (
<>
<section className="dashboard-two-column">
<div className="card">
<div className="eyebrow">Teacher profile</div>
<h2>{accountProfile?.full_name || "Teacher"}</h2>
<div className="profile-details">
<div>
<span>Position</span>
<strong>
                   {teacherProfile.position_title || "Not provided"}
</strong>
</div>
<div>
<span>Grade level</span>
<strong>
                   {teacherProfile.grade_level || "Not provided"}
</strong>
</div>
<div>
<span>Subjects</span>
<strong>
                   {teacherProfile.subjects || "Not provided"}
</strong>
</div>
<div>
<span>Email</span>
<strong>{user.email}</strong>
</div>
</div>
</div>
<div className="card">
<div className="eyebrow">School</div>
             {school ? (
<>
<h2>{school.school_name}</h2>
<p className="muted">
                   {[school.municipality, school.province]
                     .filter(Boolean)
                     .join(", ")}
</p>
<div
                   className={`dashboard-badge ${
                     schoolVerified
                       ? "dashboard-badge-success"
                       : "dashboard-badge-pending"
                   }`}
>
                   {schoolVerified
                     ? "Verified school"
                     : `${formatStatus(school.status)} school`}
</div>
</>
             ) : (
<>
<h2>No school linked</h2>
<p className="muted">
                   Add your school before continuing with verification.
</p>
<Link className="btn" href="/teacher/profile">
                   Add school information
</Link>
</>
             )}
</div>
</section>
<section className="card dashboard-action-card">
<div>
<div className="eyebrow">Teacher verification</div>
<h2>
               {formatStatus(teacherProfile.verification_status)}
</h2>
             {teacherVerified ? (
<p className="muted">
                 Your teacher identity has been verified. You can submit
                 classroom needs through GBTS.
</p>
             ) : teacherProfile.verification_status === "pending" ? (
<p className="muted">
                 Your verification has been submitted and is waiting for
                 review.
</p>
             ) : teacherProfile.verification_status ===
               "correction_required" ? (
<p className="muted">
                 A correction is required before your verification can be
                 approved.
</p>
             ) : teacherProfile.verification_status === "rejected" ? (
<p className="muted">
                 Your previous verification was not approved. You may submit
                 new verification information.
</p>
             ) : (
<p className="muted">
                 Verification is required before you can submit a classroom
                 need.
</p>
             )}
</div>
           {!teacherVerified &&
           teacherProfile.verification_status !== "pending" ? (
<Link className="btn" href="/teacher/verification">
               {teacherProfile.verification_status === "not_submitted"
                 ? "Submit verification"
                 : "Update verification"}
</Link>
           ) : null}
</section>
<section className="card current-request-card">
<div className="dashboard-section-heading">
<div>
<div className="eyebrow">Classroom request</div>
<h2>Your current need</h2>
</div>
             {activeNeed ? (
<span className="dashboard-badge dashboard-badge-pending">
                 {formatStatus(activeNeed.status)}
</span>
             ) : null}
</div>
           {activeNeed ? (
<>
<h3>{activeNeed.title}</h3>
<p className="muted">
                 {needStatusMessage(activeNeed.status)}
</p>
<div className="request-summary">
<div>
<span>Learners benefiting</span>
<strong>{activeNeed.learners_benefiting}</strong>
</div>
 <div>
<span>Estimated value</span>
<strong>
                     ₱
                     {Number(activeNeed.estimated_value).toLocaleString(
                       "en-PH",
                       {
                         minimumFractionDigits: 2,
                         maximumFractionDigits: 2,
                       }
                     )}
</strong>
</div>
 <div>
<span>Status</span>
<strong>{formatStatus(activeNeed.status)}</strong>
</div>
</div>
 
{["committed", "fulfilled"].includes(activeNeed.status) ? (
<div className="receipt-action">
<div>
<div className="eyebrow">Next step</div>
<h3>Have the goods arrived?</h3>
<p className="muted">

        Once you have physically received the requested items, confirm receipt

        so this classroom request can be marked completed.
</p>
</div>
<Link

      className="btn"

      href={`/teacher/needs/${activeNeed.id}/fulfilment`}
>

      Confirm goods received
</Link>
</div>

) : null}
 

</>
           ) : teacherVerified ? (
<>
<h3>No active classroom request</h3>
<p className="muted">
                 You currently have no active need. When your classroom needs
                 something specific, you can submit a request for review.
</p>
<Link className="btn" href="/teacher/needs/new">
                 Create a school need
</Link>
</>
           ) : (
<>
<h3>Classroom requests are locked</h3>
<p className="muted">
                 Complete teacher verification first. Once approved, you can
                 submit a classroom need.
</p>
</>
           )}
</section>
</>
     )}
</main>
 );
}
