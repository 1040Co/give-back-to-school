"use client";

import { FormEvent, useState } from "react";

import { useRouter } from "next/navigation";

import { createClient } from "../../../../lib/supabase/client";

export default function NewTeacherNeedPage() {

  const supabase = createClient();

  const router = useRouter();

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [learnersBenefiting, setLearnersBenefiting] = useState("");

  const [itemName, setItemName] = useState("");

  const [quantity, setQuantity] = useState("1");

  const [unitCost, setUnitCost] = useState("");

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  
  const [photo, setPhoto] = useState<File | null>(null);
 

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();

    setLoading(true);

    setMessage("");

    const {

      data: { user },

      error: userError,

    } = await supabase.auth.getUser();

    if (userError || !user) {

      setMessage("Please sign in first.");

      setLoading(false);

      return;

    }

    const { data: teacherProfile, error: profileError } = await supabase

      .from("teacher_profiles")

      .select("id, school_id, verification_status")

      .eq("user_id", user.id)

      .maybeSingle();

    if (profileError || !teacherProfile) {

      setMessage("Please complete your teacher profile first.");

      setLoading(false);

      return;

    }

    if (teacherProfile.verification_status !== "verified") {

      setMessage("Your teacher account must be verified first.");

      setLoading(false);

      return;

    }

    if (!teacherProfile.school_id) {

      setMessage("Your teacher profile must be linked to a school.");

      setLoading(false);

      return;

    }

    const learners = Number(learnersBenefiting);

    const itemQuantity = Number(quantity);

    const estimatedUnitCost = Number(unitCost);

    if (

      learners <= 0 ||

      itemQuantity <= 0 ||

      estimatedUnitCost <= 0

    ) {

      setMessage("Please enter valid quantities and estimated costs.");

      setLoading(false);

      return;

    }

    const { data: need, error: needError } = await supabase

      .from("needs")

      .insert({

        teacher_profile_id: teacherProfile.id,

        school_id: teacherProfile.school_id,

        title,

        description,

        learners_benefiting: learners,

        status: "draft",

      })

      .select("id")

      .single();

    if (needError || !need) {

      setMessage(

        needError?.message || "Could not create the classroom need."

      );

      setLoading(false);

      return;

    }

    if (photo) {

  const fileExtension = photo.name.split(".").pop() || "jpg";

  const filePath = `${teacherProfile.id}/${need.id}/${crypto.randomUUID()}.${fileExtension}`;

  const { error: uploadError } = await supabase.storage

    .from("need-photos")

    .upload(filePath, photo, {

      cacheControl: "3600",

      upsert: false,

    });

  if (uploadError) {

    setMessage("The classroom need was created, but the photo could not be uploaded.");

    setLoading(false);

    return;

  }

  const { error: photoUpdateError } = await supabase

    .from("needs")

    .update({

      photo_path: filePath,

    })

    .eq("id", need.id);

  if (photoUpdateError) {

    setMessage("The photo was uploaded, but it could not be linked to the classroom need.");

    setLoading(false);

    return;

  }

}
  const { error: itemError } = await supabase

      .from("need_items")

      .insert({

        need_id: need.id,

        item_name: itemName,

        quantity: itemQuantity,

        estimated_unit_cost: estimatedUnitCost,

      });

    if (itemError) {

      setMessage(itemError.message);

      setLoading(false);

      return;

    }

    const { error: submitError } = await supabase

      .from("needs")

      .update({

        status: "submitted",

      })

      .eq("id", need.id);

    if (submitError) {

      setMessage(submitError.message);

      setLoading(false);

      return;

    }

    router.push("/teacher/dashboard");

    router.refresh();

  }

  return (
<main className="page">
<div className="eyebrow">Teacher · Classroom need</div>
<h1>Create a school need</h1>
<p className="muted">

        Request specific goods needed by your learners. GBTS does not support

        cash requests for individual classroom needs.
</p>
<form className="card" onSubmit={handleSubmit}>
<label>

          Need title
<input

            type="text"

            value={title}

            onChange={(event) => setTitle(event.target.value)}

            placeholder="Example: Two stand fans for Grade 4"

            required

          />
</label>
  <label>
 Classroom / need photo
<input
   type="file"
   accept="image/jpeg,image/png,image/webp"
   onChange={(event) =>
     setPhoto(event.target.files?.[0] || null)
   }
 />
<small className="muted">
   Optional. Upload one clear photo showing the classroom need or item context.
   Please do not upload identifiable photos of learners.
</small>
</label>
<label>

          Why is this needed?
<textarea

            value={description}

            onChange={(event) => setDescription(event.target.value)}

            placeholder="Explain how the requested item will help the class."

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
<div className="callout">

          Add the specific item being requested. For v0.5 we will start with

          one item per request and expand to multiple items later.
</div>
<label>

          Item name
<input

            type="text"

            value={itemName}

            onChange={(event) => setItemName(event.target.value)}

            placeholder="Example: 16-inch stand fan"

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

          Estimated unit cost (PHP)
<input

            type="number"

            min="1"

            step="0.01"

            value={unitCost}

            onChange={(event) => setUnitCost(event.target.value)}

            placeholder="1800"

            required

          />
</label>
<button className="btn" type="submit" disabled={loading}>

          {loading ? "Submitting..." : "Submit need for review"}
</button>

        {message ? <p className="muted">{message}</p> : null}
</form>
</main>

  );

}
 
