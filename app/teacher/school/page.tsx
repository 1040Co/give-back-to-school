"use client";

import { FormEvent, useState } from "react";

import { useRouter } from "next/navigation";

import { createClient } from "../../../lib/supabase/client";

export default function TeacherSchoolPage() {

  const supabase = createClient();

  const router = useRouter();

  const [depedSchoolId, setDepedSchoolId] = useState("");

  const [schoolName, setSchoolName] = useState("");

  const [municipality, setMunicipality] = useState("");

  const [province, setProvince] = useState("");

  const [region, setRegion] = useState("");

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();

    setLoading(true);

    setMessage("");

    const { data, error } = await supabase

      .from("schools")

      .insert({

        deped_school_id: depedSchoolId || null,

        school_name: schoolName,

        municipality: municipality || null,

        province: province || null,

        region: region || null,

        school_type: "public",

        status: "pending",

      })

      .select("id")

      .single();

    if (error) {

      setMessage(error.message);

      setLoading(false);

      return;

    }

    router.push(`/teacher/profile?school=${data.id}`);

    router.refresh();

  }

  return (
<main className="page">
<div className="eyebrow">School setup</div>
<h1>Add your school</h1>
<p className="muted">

        If your school is not yet listed, submit it here. The school can be

        reviewed by an administrator before it becomes publicly visible.
</p>
<form className="card" onSubmit={handleSubmit}>
<label>

          School name
<input

            type="text"

            value={schoolName}

            onChange={(event) => setSchoolName(event.target.value)}

            required

          />
</label>
<label>

          DepEd School ID
<input

            type="text"

            value={depedSchoolId}

            onChange={(event) => setDepedSchoolId(event.target.value)}

            placeholder="If known"

          />
</label>
<label>

          Municipality / City
<input

            type="text"

            value={municipality}

            onChange={(event) => setMunicipality(event.target.value)}

            required

          />
</label>
<label>

          Province
<input

            type="text"

            value={province}

            onChange={(event) => setProvince(event.target.value)}

            required

          />
</label>
<label>

          Region
<input

            type="text"

            value={region}

            onChange={(event) => setRegion(event.target.value)}

            placeholder="Example: Region III"

          />
</label>
<button className="btn" type="submit" disabled={loading}>

          {loading ? "Saving..." : "Add school"}
</button>

        {message ? <p className="muted">{message}</p> : null}
</form>
</main>

  );

}
