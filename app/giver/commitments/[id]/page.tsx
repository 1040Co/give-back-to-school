import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import GiverMessagePanel from "../../GiverMessagePanel";
export default async function CompletedCommitmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/giver/sign-in");
  }
  const { data: commitment } = await supabase
    .from("commitments")
    .select(
      `
      id,
      need_id,
      giver_id,
      status,
      committed_at,
      completed_at,
      public_display_name,
      is_anonymous,
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

    .eq("id", id)
    .eq("giver_id", user.id)
    .maybeSingle();
  if (!commitment) {
    notFound();
  }
  const need = Array.isArray(commitment.needs)
    ? commitment.needs[0]
    : commitment.needs;
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

  const { data: conversation } = await supabase

    .from("conversations")

    .select("id")

    .eq("commitment_id", commitment.id)

    .maybeSingle();

  let messages: {

    id: string;

    sender_id: string;

    message_text: string;

    created_at: string;

  }[] = [];

  if (conversation) {

    const { data: messageRows } = await supabase

      .from("messages")

      .select("id, sender_id, message_text, created_at")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true });
    messages = messageRows ?? [];
  }
  return (
<main className="page">
<div className="eyebrow">Giving history</div>
<h1>{need?.title || "Completed classroom support"}</h1>
<p className="muted">
 {commitment.status === "completed"
   ? "This commitment is complete. The conversation below is kept as a read-only record."
   : "Manage this classroom commitment, communicate with the teacher, and follow fulfilment here."}
</p>
<div className="hero-actions">
<Link className="btn secondary" href="/giver">
          Back to giver dashboard
</Link>
<Link className="btn secondary" href={`/needs/${commitment.need_id}`}>
          View completed classroom need
</Link>
</div>
{commitment.status === "active" && need?.status === "committed" ? (
<section className="card">
<div className="eyebrow">Fulfilment</div>
<h2>Have you provided the requested goods?</h2>
<p className="muted">

      Mark this only after the items have been delivered or handed over.

      The teacher will then be asked to confirm receipt.
</p>
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
        const { data: existingEvent } = await supabase
          .from("fulfilment_events")
          .select("id")
          .eq("commitment_id", commitment.id)
          .eq("event_type", "giver_marked_provided")
          .maybeSingle();
        if (existingEvent) {
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
</section>
) : need?.status === "fulfilled" ? (
<section className="card">
<div className="eyebrow">Goods provided</div>
<h2>Waiting for teacher confirmation</h2>
<p className="muted">

      You marked the requested goods as provided. The teacher now needs to

      confirm receipt.
</p>
</section>

) : null}
 
  
{commitment.status === "completed" ? (
  <section className="card">
<div className="eyebrow">Private GBTS communication</div>
<h2>Conversation with {teacherName}</h2>

    {messages.length === 0 ? (
<p className="muted">

        No messages were exchanged for this commitment.
</p>

    ) : (
<div className="message-list">

        {messages.map((message) => (
<div className="message-card" key={message.id}>
<strong>

              {message.sender_id === user.id ? "You" : teacherName}
</strong>
<p>{message.message_text}</p>
<small className="muted">

              {new Date(message.created_at).toLocaleString("en-PH")}
</small>
</div>

        ))}
</div>

    )}
<p className="muted">

      This conversation is closed because the classroom request has been completed.
</p>
</section>

) : conversation ? (
<GiverMessagePanel

    conversationId={conversation.id}

    currentUserId={user.id}

    messages={messages}

    teacherName={teacherName}

  />

) : (
<section className="card">
<div className="eyebrow">Private GBTS communication</div>
<h2>Conversation with {teacherName}</h2>
<p className="muted">

      No conversation is available for this commitment yet.
</p>
</section>

)}
 
</main>

  );

}
 
