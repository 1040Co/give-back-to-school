"use client";

import { FormEvent, useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { createClient } from "../../../../../lib/supabase/client";

export default function EditTeacherNeedPage() {

  const supabase = createClient();

  const router = useRouter();

  const params = useParams();

  const needId = String(params.id || "");

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [learnersBenefiting, setLearnersBenefiting] = useState("");

  const [itemId, setItemId] = useState("");

  const [itemName, setItemName] = useState("");

  const [quantity, setQuantity] = useState("");

  const [unitCost, setUnitCost] = useState("");

  const [correctionMessage, setCorrectionMessage] = useState("");

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  useEffect(() => {

    async function loadNeed() {

      setLoading(true);

      const {

        data: { user },

      } = await supabase.auth.getUser();

      if (!user) {

        router.replace("/teacher/sign-in");

        return;

      }

      const { data: teacherProfile, error: profileError } = await supabase

        .from("teacher_profiles")

        .select("id")

        .eq("user_id", user.id)

        .maybeSingle();

      if (profileError || !teacherProfile) {

        setMessage("Teacher profile could not be found.");

        setLoading(false);

        return;

      }

      const { data: need, error: needError } = await supabase

        .from("needs")

        .select(`

          id,

          teacher_profile_id,

          title,

          description,

          learners_benefiting,

          status,

          correction_message

        `)

        .eq("id", needId)

        .eq("teacher_profile_id", teacherProfile.id)

        .maybeSingle();

      if (needError || !need) {

        setMessage("This classroom request could not be found.");

        setLoading(false);

        return;

      }

      if (need.status !== "correction_required") {

        setMessage("This classroom request is not available for correction.");

        setLoading(false);

        return;

      }

      const { data: item, error: itemError } = await supabase

        .from("need_items")

        .select("id, item_name, quantity, estimated_unit_cost")

        .eq("need_id", need.id)

        .order("created_at", { ascending: true })

        .limit(1)

        .maybeSingle();

      if (itemError || !item) {

        setMessage("The requested item could not be found.");

        setLoading(false);

        return;

      }

      setTitle(need.title || "");

      setDescription(need.description || "");

      setLearnersBenefiting(String(need.learners_benefiting || ""));

      setCorrectionMessage(need.correction_message || "");

      setItemId(item.id);

      setItemName(item.item_name || "");

      setQuantity(String(item.quantity || ""));

      setUnitCost(String(item.estimated_unit_cost || ""));

      setLoading(false);

    }

    loadNeed();

  }, [needId, router, supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();

    setSaving(true);

    setMessage("");

    const learners = Number(learnersBenefiting);

    const itemQuantity = Number(quantity);

    const estimatedUnitCost = Number(unitCost);

    if (!title.trim() || !description.trim() || !itemName.trim()) {

      setMessage("Please complete all required fields.");

      setSaving(false);

      return;

    }

    if (

      !Number.isFinite(learners) ||

      learners <= 0 ||

      !Number.isFinite(itemQuantity) ||

      itemQuantity <= 0 ||

      !Number.isFinite(estimatedUnitCost) ||

      estimatedUnitCost <= 0

    ) {

      setMessage("Please enter valid quantities and costs.");

      setSaving(false);

      return;

    }

    const {

      data: { user },

    } = await supabase.auth.getUser();

    if (!user) {

      router.replace("/teacher/sign-in");

      return;

    }

    const { data: teacherProfile } = await supabase

      .from("teacher_profiles")

      .select("id")

      .eq("user_id", user.id)

      .maybeSingle();

    if (!teacherProfile) {

      setMessage("Teacher profile could not be found.");

      setSaving(false);

      return;

    }

    const { error: needError } = await supabase

      .from("needs")

      .update({

        title: title.trim(),

        description: description.trim(),

        learners_benefiting: learners,

      })

      .eq("id", needId)

      .eq("teacher_profile_id", teacherProfile.id)

      .eq("status", "correction_required");

    if (needError) {

      setMessage(needError.message);

      setSaving(false);

      return;

    }

    const { error: itemError } = await supabase

      .from("need_items")

      .update({

        item_name: itemName.trim(),

        quantity: itemQuantity,

        estimated_unit_cost: estimatedUnitCost,

      })

      .eq("id", itemId)

      .eq("need_id", needId);

    if (itemError) {

      setMessage(itemError.message);

      setSaving(false);

      return;

    }

    const { error: submitError } = await supabase

      .from("needs")

      .update({

        status: "submitted",

        submitted_at: new Date().toISOString(),

        correction_message: null,

      })

      .eq("id", needId)

      .eq("teacher_profile_id", teacherProfile.id)

      .eq("status", "correction_required");

    if (submitError) {

      setMessage(submitError.message);

      setSaving(false);

      return;

    }

    router.push("/teacher/dashboard");

    router.refresh();

  }

  if (loading) {

    return (
<main className="page">
<p className="muted">Loading classroom request...</p>
</main>

    );

  }

  return (
<main className="page">
<div className="eyebrow">Teacher · Request correction</div>
<h1>Edit and resubmit your classroom need</h1>

      {correctionMessage ? (
<div className="verification-warning">
<strong>Changes requested by GBTS</strong>
<p>{correctionMessage}</p>
</div>

      ) : null}

      {message ? (
<div className="card">
<p>{message}</p>
</div>

      ) : null}
<form onSubmit={handleSubmit} className="card">
<label>

          Request title
<input

            value={title}

            onChange={(event) => setTitle(event.target.value)}

            required

          />
</label>
<label>

          Description
<textarea

            value={description}

            onChange={(event) => setDescription(event.target.value)}

            rows={5}

            required

          />
</label>
<label>

          Learners benefiting
<input

            type="number"

            min="1"

            value={learnersBenefiting}

            onChange={(event) => setLearnersBenefiting(event.target.value)}

            required

          />
</label>
<h2>Requested goods</h2>
<label>

          Item
<input

            value={itemName}

            onChange={(event) => setItemName(event.target.value)}

            required

          />
</label>
<label>

          Quantity
<input

            type="number"

            min="1"

            value={quantity}

            onChange={(event) => setQuantity(event.target.value)}

            required

          />
</label>
<label>

          Estimated unit cost (₱)
<input

            type="number"

            min="0.01"

            step="0.01"

            value={unitCost}

            onChange={(event) => setUnitCost(event.target.value)}

            required

          />
</label>
<button className="btn" type="submit" disabled={saving}>

          {saving ? "Resubmitting..." : "Save changes and resubmit"}
</button>
</form>
</main>

  );

}
 
