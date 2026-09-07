"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { checkMessageForContactInfo } from "../../../lib/message-moderation";

type Message = {
  id: string;
  sender_id: string;
  message_text: string;
  created_at: string;
};

export default function MessagePanel({
 conversationId,
 currentUserId,
 messages,
 giverName,
}: {
 conversationId: string;
 currentUserId: string;
 messages: Message[];
 giverName: string;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [text, setText] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = text.trim();

    if (!message) {
      return;
    }

    setStatus("");

    const moderation = checkMessageForContactInfo(message);

    if (!moderation.allowed) {
      setStatus(
        "For privacy and safety, please keep communication inside GBTS. Phone numbers, email addresses, external links and messaging handles cannot be shared."
      );
      return;
    }

    setLoading(true);

    const { error } = await supabase.rpc("send_message", {
      p_conversation_id: conversationId,
      p_message_text: message,
    });

    if (error) {
      setStatus(error.message);
      setLoading(false);
      return;
    }

    setText("");
    setLoading(false);
    router.refresh();
  }

  return (
    <section className="card">
      <div className="eyebrow">Private GBTS communication</div>
      <h2>Messages with {giverName}</h2>

      <p className="muted">
        Keep all communication about this classroom request inside GBTS.
        Personal phone numbers, email addresses and external messaging details
        cannot be shared.
      </p>

      <div className="message-thread">
        {messages.length === 0 ? (
          <p className="muted">
            No messages yet. You can send the first message to the giver.
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={
                message.sender_id === currentUserId
                  ? "message-bubble message-own"
                  : "message-bubble"
              }
            >
             <strong>
 {message.sender_id === currentUserId ? "You" : giverName}
</strong>

              <p>{message.message_text}</p>

              <small>
                {new Date(message.created_at).toLocaleString("en-PH")}
              </small>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="message-form">
        <label>
          Message
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="Write a message about delivery or fulfilment..."
            required
          />
        </label>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send message"}
        </button>
      </form>

      {status ? <div className="callout">{status}</div> : null}
    </section>
  );
}
