import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase";

export async function POST(req) {
  try {
    const { technicianId, email, fullName, phone, address, specialization, location, availability, dateJoined } = await req.json();

    // ✅ Check if email already exists
    const { data: existingUser, error: userError } = await supabaseAdmin
      .from("technicians")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) throw new Error("This email is already registered as a technician.");

    // ✅ Create technician authentication account
    const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: "temporaryPassword123",
      email_confirm: false,
      user_metadata: { fullName, phone, address },
    });

    if (authError) throw new Error(authError.message);
    const technicianAuthId = newUser?.user?.id;
    if (!technicianAuthId) throw new Error("Failed to retrieve technician ID.");

    // ✅ Save technician in database
    const { error: dbError } = await supabaseAdmin.from("technicians").insert([
      {
        id: technicianAuthId,
        technician_id: technicianId,
        email,
        name: fullName,
        phone,
        address,
        specialization,
        location,
        availability,
        role: "technician",
        date_joined: dateJoined || new Date().toISOString(),
      },
    ]);

    if (dbError) throw new Error(dbError.message);

    // ✅ Send invite email
    const { error: emailError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
    if (emailError) throw new Error(emailError.message);

    return NextResponse.json({ success: true, message: "Technician added successfully!" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
