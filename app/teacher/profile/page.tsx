"use client";

import { FormEvent, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { createClient } from "../../../lib/supabase/client";

type School = {

  id: string;

  school_name: string;

  municipality: string | null;

  province: string | null;

};

export default function TeacherProfilePage() {

  const supabase = createClient();

  const router = useRouter();

  const [schools, setSchools] = useState<School[]>([]);

  const [schoolId, setSchoolId] = useState("");

  const [positionTitle, setPositionTitle] = useState("");

  const [gradeLevel, setGradeLevel] = useState("");

  const [subjects, setSubjects] = useState("");
  
  const [yearsTeaching, setYearsTeaching] = useState("");
  
  const [professionalSummary, setProfessionalSummary] = useState("");

  const [photoConsent, setPhotoConsent] = useState(false);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {

    async function loadSchools() {

      const { data, error } = await supabase

        .from("schools")

        .select("id, school_name, municipality, province")

        .order("school_name");

      if (error) {

        setMessage(error.message);

        return;

      }

      setSchools(data ?? []);

      const params = new URLSearchParams(window.location.search);

      const schoolFromUrl = params.get("school");

      if (schoolFromUrl) {

        setSchoolId(schoolFromUrl);

      }

    }

    loadSchools();

  }, [supabase]);

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

    const { error } = await supabase.from("teacher_profiles").insert({

      user_id: user.id,

      school_id: schoolId || null,

      position_title: positionTitle || null,

      grade_level: gradeLevel || null,

      subjects: subjects || null,
      
      years_teaching: yearsTeaching ? Number(yearsTeaching) : null,
      
      professional_summary: professionalSummary || null,
      
      photo_public_consent: photoConsent,

    });

    if (error) {

      setMessage(error.message);

      setLoading(false);

      return;

    }

    router.push("/teacher/dashboard");

    router.refresh();

  }

  return (
<main className="page">
<div className="eyebrow">Teacher profile</div>
<h1>Complete your teacher profile</h1>
<p className="muted">

        Add your teaching information. Verification comes next.
</p>
<form className="card" onSubmit={handleSubmit}>
<label>

          School
<select

            value={schoolId}

            onChange={(event) => setSchoolId(event.target.value)}

            required
>
<option value="">Select your school</option>

            {schools.map((school) => (
<option key={school.id} value={school.id}>

                {school.school_name}

                {school.municipality ? ` — ${school.municipality}` : ""}

                {school.province ? `, ${school.province}` : ""}
</option>

            ))}
</select>
</label>
<p className="muted">

          Can’t find your school?{" "}
<a href="/teacher/school">Add your school</a>
</p>
<label>

          Position / teaching role
<input

            type="text"

            value={positionTitle}

            onChange={(event) => setPositionTitle(event.target.value)}

            placeholder="Example: Teacher I"

          />
</label>
<label>

          Grade level
<input

            type="text"

            value={gradeLevel}

            onChange={(event) => setGradeLevel(event.target.value)}

            placeholder="Example: Grade 5"

          />
</label>
<label>

          Subjects
<input

            type="text"

            value={subjects}

            onChange={(event) => setSubjects(event.target.value)}

            placeholder="Example: English, Science"

          />
</label>
<label>
         Years of teaching experience
<input
           type="number"
           min="0"
           max="60"
           value={yearsTeaching}
           onChange={(event) => setYearsTeaching(event.target.value)}
           placeholder="Example: 8"
 />
</label>
<label>
           Short professional background
<textarea
   rows={4}
   value={professionalSummary}
   onChange={(event) => setProfessionalSummary(event.target.value)}
   placeholder="Example: Teaching elementary students since 2018. Currently handles Grade 6 English and serves as the school reading coordinator."
 />
</label>
  
<label>
<input

            type="checkbox"

            checked={photoConsent}

            onChange={(event) => setPhotoConsent(event.target.checked)}

          />

          I allow my teacher profile photo to be shown publicly after verification.
</label>
<button className="btn" type="submit" disabled={loading}>

          {loading ? "Saving..." : "Save teacher profile"}
</button>

        {message ? <p className="muted">{message}</p> : null}
</form>
</main>

  );

}
 
