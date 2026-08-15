import Link from "next/link";

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

        school_id,

        verification_status,

        position_title,

        grade_level,

        subjects

      `

    )

    .eq("user_id", user.id)

    .maybeSingle();

  let school = null;

  if (teacherProfile?.school_id) {

    const { data } = await supabase

      .from("schools")

      .select("school_name, municipality, province, status")

      .eq("id", teacherProfile.school_id)

      .maybeSingle();

    school = data;

  }

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

            Add your school and teaching information before submitting teacher

            verification.
</p>
<Link className="btn" href="/teacher/profile">

            Complete teacher profile
</Link>
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
<>
<p className="muted">

                  Your teacher account is verified. You can now submit a school

                  need.
</p>
<Link className="btn" href="/teacher/needs/new">

                  Create a school need
</Link>
</>

            ) : teacherProfile.verification_status === "pending" ? (
<p className="muted">

                Your verification has been submitted and is waiting for admin

                review.
</p>

            ) : teacherProfile.verification_status ===

              "correction_required" ? (
<>
<p className="muted">

                  Your verification needs a correction before it can be

                  approved.
</p>
<Link className="btn" href="/teacher/verification">

                  Resubmit verification
</Link>
</>

            ) : teacherProfile.verification_status === "rejected" ? (
<>
<p className="muted">

                  Your previous verification was not approved. You may submit a

                  new verification request.
</p>
<Link className="btn" href="/teacher/verification">

                  Submit verification again
</Link>
</>

            ) : (
<>
<p className="muted">

                  Verification is required before you can submit a school need.
</p>
<Link className="btn" href="/teacher/verification">

                  Submit teacher verification
</Link>
</>

            )}
</div>
<div className="card">
<h2>School</h2>

            {school ? (
<>
<p>{school.school_name}</p>
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
<>
<p className="muted">No school linked yet.</p>
<Link className="btn" href="/teacher/profile">

                  Add school information
</Link>
</>

            )}
</div>
</>

      )}
</main>

  );

}
 
