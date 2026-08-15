import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
export default async function AdminPage() {
 const supabase = await createClient();
 const {
   data: { user },
 } = await supabase.auth.getUser();
 if (!user) {
   redirect("/teacher/sign-in");
 }
 const { data: profile } = await supabase
   .from("profiles")
   .select("role, full_name")
   .eq("id", user.id)
   .maybeSingle();
 if (!profile || profile.role !== "admin") {
   return (
<main className="page">
<div className="eyebrow">Admin</div>
<h1>Access restricted</h1>
<div className="card">
<p className="muted">
           This area is available only to Give Back to School administrators.
</p>
</div>
</main>
   );
 }
 const [
   pendingSchoolsResult,
   pendingVerificationsResult,
   submittedNeedsResult,
   activeCommitmentsResult,
 ] = await Promise.all([
   supabase
     .from("schools")
     .select("id", { count: "exact", head: true })
     .eq("status", "pending"),
   supabase
     .from("teacher_verifications")
     .select("id", { count: "exact", head: true })
     .eq("status", "pending"),
   supabase
     .from("needs")
     .select("id", { count: "exact", head: true })
     .eq("status", "submitted"),
   supabase
     .from("commitments")
     .select("id", { count: "exact", head: true })
     .eq("status", "active"),
 ]);
 return (
<main className="page">
<div className="eyebrow">Admin command centre</div>
<h1>Admin overview</h1>
<p className="muted">
       Welcome, {profile.full_name}. Review verification and exceptions while
       routine platform activity remains automated.
</p>
<div className="grid">
<div className="card">
<div className="big">{pendingSchoolsResult.count ?? 0}</div>
<h2>Schools to review</h2>
<Link className="btn" href="/admin/schools">
           Review schools
</Link>
</div>
<div className="card">
<div className="big">{pendingVerificationsResult.count ?? 0}</div>
<h2>Teacher reviews</h2>
<Link className="btn" href="/admin/teachers">
           Review teachers
</Link>
</div>
<div className="card">
<div className="big">{submittedNeedsResult.count ?? 0}</div>
<h2>Needs to approve</h2>
<Link className="btn" href="/admin/needs">
           Review needs
</Link>
</div>
<div className="card">
<div className="big">{activeCommitmentsResult.count ?? 0}</div>
<h2>Active fulfilments</h2>
</div>
</div>
<div className="callout">
       Admin work should focus on teacher verification, need approval,
       exceptions and disputes rather than approving every normal user action.
</div>
</main>
 );
}
