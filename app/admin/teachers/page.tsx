import { revalidatePath } from "next/cache";

import { redirect } from "next/navigation";

import { createClient } from "../../../lib/supabase/server";

function formatStatus(status: string) {

  return status

    .replaceAll("_", " ")

    .replace(/\b\w/g, (letter) => letter.toUpperCase());

}

export default async function AdminTeachersPage() {

  const supabase = await createClient();

  const {

    data: { user },

  } = await supabase.auth.getUser();

  if (!user) {

    redirect("/teacher/sign-in");

  }

  const { data: adminProfile } = await supabase

    .from("profiles")

    .select("role")

    .eq("id", user.id)

    .maybeSingle();

  if (!adminProfile || adminProfile.role !== "admin") {

    return (
<main className="page">
<div className="eyebrow">Admin</div>
<h1>Access restricted</h1>
<div className="card">
<p className="muted">

            This area is available only to Give Back to School administrators.
</p>
</div>
</main>

    );

  }

  const { data: verifications, error } = await supabase

    .from("teacher_verifications")

    .select(

      `

        id,

        teacher_profile_id,

        status,

        submitted_at,

        reviewed_at

      `

    )

    .eq("status", "pending")

    .order("submitted_at", { ascending: true });

  async function updateVerification(

  verificationId: string,

  teacherProfileId: string,

  newStatus: "verified" | "correction_required" | "rejected",

  correctionMessage?: string

) {

  "use server";

  const supabase = await createClient();

  const {

    data: { user },

  } = await supabase.auth.getUser();

  if (!user) {

    return;

  }

  const { data: adminProfile } = await supabase

    .from("profiles")

    .select("role")

    .eq("id", user.id)

    .maybeSingle();

  if (adminProfile?.role !== "admin") {

    return;

  }

  const verificationUpdate: {

    status: string;

    reviewed_by: string;

    reviewed_at: string;

    correction_message?: string | null;

  } = {

    status: newStatus,

    reviewed_by: user.id,

    reviewed_at: new Date().toISOString(),

  };

  if (
 newStatus === "correction_required" ||
 newStatus === "rejected"
) {
 verificationUpdate.correction_message =
   correctionMessage?.trim() || null;
} else {
 verificationUpdate.correction_message = null;
}

  await supabase

    .from("teacher_verifications")

    .update(verificationUpdate)

    .eq("id", verificationId);

  await supabase

    .from("teacher_profiles")

    .update({

      verification_status: newStatus,

      verified_at:

        newStatus === "verified" ? new Date().toISOString() : null,

    })

    .eq("id", teacherProfileId);

  revalidatePath("/admin");

  revalidatePath("/admin/teachers");

  revalidatePath("/teacher/dashboard");

}
  async function approveTeacher(formData: FormData) {

    "use server";

    await updateVerification(

      String(formData.get("verificationId") || ""),

      String(formData.get("teacherProfileId") || ""),

      "verified"

    );

  }

async function requestCorrection(formData: FormData) {
 "use server";
 await updateVerification(
   String(formData.get("verificationId") || ""),
   String(formData.get("teacherProfileId") || ""),
   "correction_required",
   String(formData.get("correctionMessage") || "")
 );
}

 async function rejectTeacher(formData: FormData) {
 "use server";
 await updateVerification(
   String(formData.get("verificationId") || ""),
   String(formData.get("teacherProfileId") || ""),
   "rejected",
   String(formData.get("rejectionMessage") || "")
 );
}

  if (error) {

    return (
<main className="page">
<div className="eyebrow">Admin · Teachers</div>
<h1>Teacher reviews</h1>
<div className="card">
<p className="muted">{error.message}</p>
</div>
</main>

    );

  }

  return (
<main className="page">
<div className="eyebrow">Admin · Teacher verification</div>
<h1>Teacher reviews</h1>
<p className="muted">

        Review the teacher profile, school and submitted evidence before making

        a decision.
</p>

      {!verifications || verifications.length === 0 ? (
<div className="card">
<p className="muted">

            There are no pending teacher verifications.
</p>
</div>

      ) : (

        verifications.map((verification) => (
<TeacherReviewCard

            key={verification.id}

            verification={verification}

            approveTeacher={approveTeacher}

            requestCorrection={requestCorrection}

            rejectTeacher={rejectTeacher}

          />

        ))

      )}
</main>

  );

}
 async function TeacherReviewCard({

  verification,

  approveTeacher,

  requestCorrection,

  rejectTeacher,

}: {

  verification: {

    id: string;

    teacher_profile_id: string;

    status: string;

    submitted_at: string | null;

    reviewed_at: string | null;

  };

  approveTeacher: (formData: FormData) => Promise<void>;

  requestCorrection: (formData: FormData) => Promise<void>;

  rejectTeacher: (formData: FormData) => Promise<void>;

}) {

  const supabase = await createClient();

  const { data: teacherProfile } = await supabase

    .from("teacher_profiles")

    .select(

      `

        id,

        user_id,

        school_id,

        position_title,

        grade_level,

        subjects,
        
        years_teaching,

        professional_summary,
        
        verification_status

      `

    )

    .eq("id", verification.teacher_profile_id)

    .maybeSingle();

  let account = null;

  let school = null;

  if (teacherProfile?.user_id) {

    const { data } = await supabase

      .from("profiles")

      .select("full_name")

      .eq("id", teacherProfile.user_id)

      .maybeSingle();

    account = data;

  }

  if (teacherProfile?.school_id) {

    const { data } = await supabase

      .from("schools")

      .select(

        "school_name, deped_school_id, municipality, province, region, status"

      )

      .eq("id", teacherProfile.school_id)

      .maybeSingle();

    school = data;

  }

  const { data: documents } = await supabase

    .from("verification_documents")

    .select(

      "id, document_type, storage_path, original_filename, uploaded_at"

    )

    .eq("verification_id", verification.id)

    .order("uploaded_at", { ascending: true });

  const documentsWithLinks = await Promise.all(

    (documents ?? []).map(async (document) => {

      const { data } = await supabase.storage

        .from("verification-documents")

        .createSignedUrl(document.storage_path, 300);

      return {

        ...document,

        signedUrl: data?.signedUrl ?? null,

      };

    })

  );

  return (
<article className="card">
<div className="dashboard-section-heading">
<div>
<div className="eyebrow">Teacher verification request</div>
<h2>{account?.full_name || "Teacher"}</h2>
</div>
<span className="dashboard-badge dashboard-badge-pending">

          {formatStatus(verification.status)}
</span>
</div>
<div className="request-summary">
<div>
<span>Position</span>
<strong>

            {teacherProfile?.position_title || "Not provided"}
</strong>
</div>
<div>
<span>Grade level</span>
<strong>{teacherProfile?.grade_level || "Not provided"}</strong>
</div>
<div>
<span>Subjects</span>
<strong>{teacherProfile?.subjects || "Not provided"}</strong>
</div>
</div>
<div className="teacher-years">
<span>Years teaching</span>
<strong>
   {teacherProfile?.years_teaching != null
     ? `${teacherProfile.years_teaching} years`
     : "Not provided"}
</strong>
</div>
<div className="teacher-background">
<span>Professional background</span>
<p>
   {teacherProfile?.professional_summary || "Not provided"}
</p>
</div>
<div className="card" style={{ marginTop: "18px" }}>
<div className="eyebrow">School</div>

        {school ? (
<>
<h3>{school.school_name}</h3>
<p className="muted">

              {[school.municipality, school.province, school.region]

                .filter(Boolean)

                .join(", ")}
</p>

            {school.deped_school_id ? (
<p>
<strong>DepEd School ID:</strong>{" "}

                {school.deped_school_id}
</p>

            ) : null}
<div

              className={`dashboard-badge ${

                school.status === "verified"

                  ? "dashboard-badge-success"

                  : "dashboard-badge-pending"

              }`}
>

              School: {formatStatus(school.status)}
</div>
</>

        ) : (
<p className="muted">No school information found.</p>

        )}
</div>
<div className="card" style={{ marginTop: "18px" }}>
<div className="eyebrow">Private verification evidence</div>
<h3>Submitted documents</h3>
<p className="muted">

          Verification documents are private. Links below expire after

          approximately five minutes.
</p>

        {documentsWithLinks.length === 0 ? (
<p className="muted">

            No verification documents were found for this submission.
</p>

        ) : (

          documentsWithLinks.map((document) => (
<div

              key={document.id}

              style={{

                padding: "14px 0",

                borderTop: "1px solid #dde4de",

              }}
>
<strong>{formatStatus(document.document_type)}</strong>
<p className="muted">

                {document.original_filename || "Verification document"}
</p>

              {document.signedUrl ? (
<a

                  className="btn secondary"

                  href={document.signedUrl}

                  target="_blank"

                  rel="noopener noreferrer"
>

                  View verification document
</a>

              ) : (
<p className="muted">

                  Document preview is currently unavailable.
</p>

              )}
</div>

          ))

        )}
</div>
<div className="callout">

        Confirm that the teacher identity, current school and employment

        evidence reasonably match before approving.
</div>
<div

        style={{

          display: "flex",

          flexWrap: "wrap",

          gap: "10px",

          marginTop: "20px",

        }}
>
<form action={approveTeacher}>
<input

            type="hidden"

            name="verificationId"

            value={verification.id}

          />
<input

            type="hidden"

            name="teacherProfileId"

            value={verification.teacher_profile_id}

          />
<button className="btn" type="submit">

            Approve teacher
</button>
</form>
<form action={requestCorrection} className="card">
<input
   type="hidden"
   name="verificationId"
   value={verification.id}
 />
<input
   type="hidden"
   name="teacherProfileId"
   value={verification.teacher_profile_id}
 />
<label>
   Correction required
<textarea
     name="correctionMessage"
     rows={4}
     required
     placeholder="Example: Please upload a clearer school ID and confirm your current grade level."
   />
</label>
<button className="btn secondary" type="submit">
   Send correction request
</button>
</form>
<form action={rejectTeacher} className="card">
<input

    type="hidden"

    name="verificationId"

    value={verification.id}

  />
<input

    type="hidden"

    name="teacherProfileId"

    value={verification.teacher_profile_id}

  />
<label>

    Reason for rejection
<textarea

      name="rejectionMessage"

      rows={4}

      required

      placeholder="Example: The submitted identification and employment information could not be validated."

    />
</label>
<p className="muted">

    Rejection will stop the teacher from immediately resubmitting. The reason
    will be shown prominently on their dashboard.
</p>
<button className="btn secondary" type="submit">

    Reject verification
</button>
</form>
 
</div>
</article>

  );

}
 
