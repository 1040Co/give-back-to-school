import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const fullName = String(body.fullName || "").trim();
    const anonymous = Boolean(body.anonymous);
    const needId = String(body.needId || "").trim();

    if (!email || !needId) {
      return NextResponse.json(
        { error: "Email and classroom need are required." },
        { status: 400 }
      );
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error(
        "Missing Supabase server environment variables."
      );

      return NextResponse.json(
        { error: "Server configuration is incomplete." },
        { status: 500 }
      );
    }

    const admin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    /*
     * Try creating the giver as an already-confirmed Auth user.
     *
     * This does NOT sign them in.
     * They still need the OTP sent by the next step to prove
     * that they control the email address.
     */
    const { error: createError } =
      await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          anonymous,
          need_id: needId,
        },
      });

    /*
     * If the user already exists, that is fine.
     * We only needed to make sure a first-time giver exists
     * before requesting a passwordless OTP.
     */
    if (
      createError &&
      !createError.message
        .toLowerCase()
        .includes("already")
    ) {
      console.error(
        "Unable to prepare giver:",
        createError.message
      );

      return NextResponse.json(
        {
          error:
            "We could not prepare your giver verification. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("Giver prepare error:", error);

    return NextResponse.json(
      {
        error:
          "We could not prepare your giver verification. Please try again.",
      },
      { status: 500 }
    );
  }
}
