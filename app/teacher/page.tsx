import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
export default async function TeacherPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
 if (user) {
 const { data: teacherProfile } = await supabase
   .from("teacher_profiles")
   .select("id")
   .eq("user_id", user.id)
   .maybeSingle();
 if (teacherProfile) {
   redirect("/teacher/dashboard");
 }
 redirect("/teacher/profile");
}
  return (
 
<main className="page">
<div className="eyebrow">Teacher portal</div>
<h1>Support your classroom with specific school needs</h1>
<p className="muted">

        Verified teachers can submit requests for specific goods needed by

        their learners. Give Back to School does not collect or hold money for

        individual classroom requests.
</p>
<div className="verification-warning">
<strong>Teacher verification not yet submitted</strong>
<p>
   Your email is confirmed. Complete your teacher verification so GBTS can
   review your account before you submit a classroom need.
</p>
<Link className="btn" href="/teacher/verification">
   Start teacher verification
</Link>
</div>
<div className="card">
<h2>Already registered?</h2>
<p className="muted">

          Sign in to view your teacher profile, verification status and

          classroom requests.
</p>
<Link className="btn" href="/teacher/sign-in">

          Sign in
</Link>
</div>
<div className="card">
<h2>New teacher?</h2>
<p className="muted">

          Create an account, add your school information and submit your

          verification privately.
</p>
<Link className="btn" href="/teacher/register">

          Register as a teacher
</Link>
</div>
<div className="card">
<h3>How verification works</h3>
<p className="muted">

          Your verification documents are kept private and are used only to

          confirm that you are a current teacher. They are not displayed on

          public classroom-need pages.
</p>
</div>
</main>

  );

}
 
