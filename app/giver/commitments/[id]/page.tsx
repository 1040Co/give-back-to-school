import Link from "next/link";

import { notFound, redirect } from "next/navigation";

import { createClient } from "../../../lib/supabase/server";

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

      needs (

        id,

        title,

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

        This commitment is complete. The conversation below is kept as a

        read-only record.
</p>
<div className="hero-actions">
<Link className="btn secondary" href="/giver">

          Back to giver dashboard
</Link>
<Link className="btn secondary" href={`/needs/${commitment.need_id}`}>

          View completed classroom need
</Link>
</div>
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

          This conversation is closed because the classroom request has been

          completed.
</p>
</section>
</main>

  );

}
 
