import Link from "next/link";
export default function TeacherPage() {
 return (
<main className="page">
<div className="eyebrow">Teacher portal</div>
<h1>Support your classroom with specific school needs</h1>
<p className="muted">
       Verified teachers can submit requests for specific goods needed by
       their learners. Give Back to School does not collect donation money.
</p>
<div className="callout">
       Teacher verification is required before a school need can be submitted.
</div>
<div className="card">
<h2>Already registered?</h2>
<p className="muted">
         Sign in to view your teacher profile, verification status and school
         needs.
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
         Your verification documents are kept private and are only used to
         confirm that you are a current teacher. They are not displayed on
         public school-need pages.
</p>
</div>
</main>
 );
}
