import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
export async function GET(request: Request) {
 const url = new URL(request.url);
 const code = url.searchParams.get("code");
 if (!code) {
   return NextResponse.redirect(new URL("/needs", url.origin));
 }
 const supabase = await createClient();
 const { error } = await supabase.auth.exchangeCodeForSession(code);
 if (error) {
 console.error("Giver verification exchange failed:", error);
 return NextResponse.redirect(
   new URL(
     `/giver/confirm?error=${encodeURIComponent(
       error.code || "verification_failed"
     )}`,
     url.origin
   )
 );
}
 return NextResponse.redirect(new URL("/giver/confirm", url.origin));
}
