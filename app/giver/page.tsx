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
    .in("status", ["active", "fulfilled"])
    .order("committed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

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
          </section>

          {conversationId ? (
            <GiverMessagePanel
              conversationId={conversationId}
              currentUserId={user.id}
              messages={messages}
            />
          ) : null}
        </>
      )}
    </main>
  );
}
