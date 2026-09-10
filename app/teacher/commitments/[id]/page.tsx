import Link from "next/link";

import { notFound, redirect } from "next/navigation";

import { createClient } from "../../../../lib/supabase/server";

export default async function TeacherCompletedCommitmentPage({

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

    redirect("/teacher/sign-in");

  }

  const { data: teacherProfile } = await supabase

    .from("teacher_profiles")

    .select("id")

    .eq("user_id", user.id)

    .maybeSingle();

  if (!teacherProfile) {

    redirect("/teacher");

  }

  const { data: commitment } = await supabase

    .from("commitments")

    .select(

      `

      id,

      need_id,

      giver_id,

      status,

      completed_at,

      public_display_name,

      is_anonymous,

      needs (

        id,

        title,

        teacher_profile_id

      )

      `

    )

    .eq("id", id)

    .maybeSingle();

  if (!commitment) {

    notFound();

  }

  const need = Array.isArray(commitment.needs)

    ? commitment.needs[0]

    : commitment.needs;

  if (!need || need.teacher_profile_id !== teacherProfile.id) {

    notFound();

  }

  const giverName = commitment.is_anonymous

    ? "Anonymous giver"

    : commitment.public_display_name || "Giver";

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
<div className="eyebrow">Past request</div>
<h1>{need.title}</h1>
<p className="muted">

        This classroom request is complete. The conversation below is kept as a

        read-only record.
</p>
<div className="hero-actions">
<Link className="btn secondary" href="/teacher/dashboard">

          Back to teacher dashboard
</Link>
<Link className="btn secondary" href={`/needs/${commitment.need_id}`}>

          View completed classroom request
</Link>
</div>
<section className="card">
<div className="eyebrow">Private GBTS communication</div>
<h2>Conversation with {giverName}</h2>

        {messages.length === 0 ? (
<p className="muted">

            No messages were exchanged for this classroom request.
</p>

        ) : (
<div className="message-list">

            {messages.map((message) => (
<div className="message-card" key={message.id}>
<strong>

                  {message.sender_id === user.id ? "You" : giverName}
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
 
