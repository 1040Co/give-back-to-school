import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
export default async function TeacherDashboardPage() {
 const supabase = await createClient();
 const {
   data: { user },
 } = await supabase.auth.getUser();
 if (!user) {
   redirect("/teacher/sign-in");
 }
 const { data: teacherProfile } = await supabase
   .from("teacher_profiles")
   .select(
     `
       id,
       verification_status,
       position_title,
       grade_level,
       subjects,
       schools (
         school_name,
         municipality,
         province
       )
     `
   )
   .eq("user_id", user.id)
   .maybeSingle();
 return (
<main className="page">
<div className="eyebrow">Teacher dashboard</div>
<h1>Your teacher account</h1>
<div className="card">
<h2>Account</h2>
<p className="muted">{user.email}</p>
</div>
     {!teacherProfile ? (
<div className="card">
<h2>Complete your teacher profile</h2>
<p className="muted">
           Your account is active, but your teacher profile has not been
           completed yet.
</p>
<a className="btn" href="/teacher/profile">
           Complete teacher profile
</a>
</div>
     ) : (
<>
<div className="card">
<h2>Verification status</h2>
<p>
<strong>
               {teacherProfile.verification_status.replaceAll("_", " ")}
</strong>
</p>
           {teacherProfile.verification_status === "verified" ? (
<p className="muted">
               Your teacher account is verified. You can submit a school need.
</p>
           ) : (
<p className="muted">
               Verification is required before you can submit a school need.
</p>
           )}
</div>
<div className="card">
<h2>School</h2>
           {teacherProfile.schools ? (
<>
<p>{teacherProfile.schools.school_name}</p>
<p className="muted">
                 {teacherProfile.schools.municipality},{" "}
                 {teacherProfile.schools.province}
</p>
</>
           ) : (
<p className="muted">No school linked yet.</p>
           )}
</div>
</>
     )}
</main>
 );
}
