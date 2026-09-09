import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import SignOutButton from "./SignOutButton";
import GiverMessagePanel from "./GiverMessagePanel";

export default async function GiverDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/needs");
  }
 const { data: signedInTeacherProfile } = await supabase
 .from("teacher_profiles")
 .select("id")
 .eq("user_id", user.id)
 .maybeSingle();
if (signedInTeacherProfile) {
 redirect("/teacher/dashboard");
}
  const { data: commitment } = await supabase
  .from("commitments")
  .select(
    `
    id,
    need_id,
    status,
    committed_at,
    needs (
      id,
      title,
      status,
      learners_benefiting,
      estimated_value,
      teacher_profiles (
        user_id
      )
    )
    `
  )
     .eq("giver_id", user.id)
    .eq("status", "active")
    .order("committed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  
  const { data: activeCommitments } = await supabase
 .from("commitments")
 .select(
   `
   id,
   need_id,
   status,
   committed_at,
   needs (
     id,
     title,
     status,
     learners_benefiting,
     estimated_value
   )
   `
 )
 .eq("giver_id", user.id)
 .eq("status", "active")
 .order("committed_at", { ascending: false });

  const { data: completedCommitments } = await supabase
  .from("commitments")
  .select(
    `
    id,
    need_id,
    status,
    completed_at,
    needs (
      id,
      title,
      status,
      learners_benefiting,
      estimated_value,
      completed_at
    )
    `
  )

  .eq("giver_id", user.id)
  .eq("status", "completed")
  .order("completed_at", { ascending: false });
  let conversationId = "";

  let messages: {
    id: string;
    sender_id: string;
    message_text: string;
    created_at: string;
  }[] = [];

  if (commitment) {
    const { data: conversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("commitment_id", commitment.id)
      .maybeSingle();

    if (conversation) {
      conversationId = conversation.id;

      const { data: messageRows } = await supabase
        .from("messages")
        .select("id, sender_id, message_text, created_at")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });

      messages = messageRows ?? [];
    }
  }

  const need = Array.isArray(commitment?.needs)
    ? commitment?.needs[0]
    : commitment?.needs;
const teacherProfile = Array.isArray(need?.teacher_profiles)
  ? need?.teacher_profiles[0]
  : need?.teacher_profiles;
let teacherName = "Teacher";
if (teacherProfile?.user_id) {
  const { data: teacherAccount } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", teacherProfile.user_id)
    .maybeSingle();
  teacherName = teacherAccount?.full_name || "Teacher";
}
 
  return (
    <main className="page">
      <section className="teacher-welcome">
        <div>
          <div className="eyebrow">Giver dashboard</div>
          <h1>Your classroom commitment</h1>
          <p className="muted">
            Manage your active commitment and communicate with the teacher
            inside Give Back to School.
          </p>
        </div>

        <SignOutButton />
      </section>

      <section className="section">
<div className="section-heading">
<div>
<div className="eyebrow">Active commitments</div>
<h2>Your current classroom support</h2>
</div>
</div>
 {!activeCommitments || activeCommitments.length === 0 ? (
<div className="card">
<p className="muted">
       You do not have any active classroom commitments right now.
</p>
</div>
 ) : (
<div className="needs-grid">
     {activeCommitments.map((item: any) => {
       const need = Array.isArray(item.needs)
         ? item.needs[0]
         : item.needs;
       return (
<article className="need-card" key={item.id}>
<div className="need-topline">
<span className="status-badge">
               {need?.status === "fulfilled"
                 ? "Waiting for teacher confirmation"
                 : "Active"}
</span>
</div>
<h3>{need?.title || "Classroom need"}</h3>
<div className="need-meta">
<span>
<strong>{need?.learners_benefiting || 0}</strong>
<small>Learners</small>
</span>
<span>
<strong>
                 ₱{Number(
                   need?.estimated_value || 0
                 ).toLocaleString("en-PH")}
</strong>
<small>Estimated value</small>
</span>
</div>
<Link
             className="text-link"
             href={`/needs/${item.need_id}`}
>
             View classroom need →
</Link>
</article>
       );
     })}
</div>
 )}
</section>
      

      {!commitment ? (
        <section className="card">
          <div className="eyebrow">No active commitment</div>
          <h2>You currently have no classroom commitment.</h2>
          <p className="muted">
            Browse verified classroom needs and choose one you would like to
            support.
          </p>

          <Link className="btn" href="/needs">
            Browse school needs
          </Link>
        </section>
      ) : (
        <>
          <section className="card">
            <div className="eyebrow">Active commitment</div>

            <h2>{need?.title || "Classroom need"}</h2>

            <div className="request-summary">
              <div>
                <span>Learners benefiting</span>
                <strong>{need?.learners_benefiting || 0}</strong>
              </div>

              <div>
                <span>Estimated value</span>
                <strong>
                  ₱
                  {Number(
                    need?.estimated_value || 0
                  ).toLocaleString("en-PH")}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{need?.status || commitment.status}</strong>
              </div>
            </div>

            <Link
              className="text-link"
              href={`/needs/${commitment.need_id}`}
            >
              View classroom need
            </Link>
{need?.status === "committed" ? (
<div className="giver-fulfilment-card">
<div>
<div className="eyebrow">Fulfilment</div>
<h3>Have you provided the requested goods?</h3>
<p className="muted">

        Mark this only after the items have been delivered or handed over.

        The teacher will then be asked to confirm receipt.
</p>
</div>
<form

      action={async () => {

        "use server";

        const supabase = await createClient();

        const {

          data: { user },

        } = await supabase.auth.getUser();

        if (!user) {

          return;

        }

        await supabase.from("fulfilment_events").insert({

          commitment_id: commitment.id,

          actor_id: user.id,

          event_type: "giver_marked_provided",

          note: "Giver marked the requested goods as provided.",

        });

      }}
>
<button className="btn" type="submit">

        Mark goods as provided
</button>
</form>
</div>

) : need?.status === "fulfilled" ? (
<div className="giver-fulfilment-card">
<div className="eyebrow">Goods provided</div>
<h3>Waiting for teacher confirmation</h3>
<p className="muted">

      You marked the requested goods as provided. The teacher now needs to

      confirm that the classroom received them.
</p>
<p className="muted">

      You can continue communicating with the teacher below while confirmation

      is pending.
</p>
</div>

) : null}
 
 
  </section>

          {conversationId ? (
            <GiverMessagePanel
 conversationId={conversationId}
 currentUserId={user.id}
 messages={messages}
 teacherName={teacherName}
/>
          ) : null}
        </>
      )}
      <section className="section">
<div className="section-heading">
<div>
<div className="eyebrow">Giving history</div>
<h2>Completed classroom support</h2>
</div>
</div>
  {!completedCommitments || completedCommitments.length === 0 ? (
<div className="card">
<p className="muted">
        You do not have any completed classroom commitments yet.
</p>
</div>
  ) : (
<div className="needs-grid">
      {completedCommitments.map((commitment: any) => {
        const need = Array.isArray(commitment.needs)
          ? commitment.needs[0]
          : commitment.needs;
        return (
<article className="need-card" key={commitment.id}>
<div className="need-topline">
<span className="status-badge">Completed</span>
</div>
<h3>{need?.title || "Classroom need"}</h3>
<div className="need-meta">
<span>
<strong>{need?.learners_benefiting || 0}</strong>
<small>Learners</small>
</span>
<span>
<strong>

                  ₱{Number(

                    need?.estimated_value || 0

                  ).toLocaleString("en-PH")}
</strong>
<small>Estimated value</small>
</span>
</div>

            {commitment.completed_at ? (
<p className="muted">

                Completed on{" "}

                {new Date(

                  commitment.completed_at

                ).toLocaleDateString("en-PH", {

                  year: "numeric",

                  month: "long",

                  day: "numeric",

                })}
</p>

            ) : null}
<Link

              className="text-link"

              href={`/needs/${commitment.need_id}`}
>

              View completed classroom need →
</Link>
</article>

        );

      })}
</div>

  )}
</section>
 
    </main>
  );
}
