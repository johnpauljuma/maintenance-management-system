import { supabase } from "../../../../lib/supabase"; // Adjust path as needed

export async function POST() {
  try {
    // 1️⃣ Fetch unassigned requests
    let { data: requests, error: requestError } = await supabase
      .from("requests")
      .select("*")
      .eq("status", "pending")
      .is("assigned_technician", null);

    if (requestError) throw requestError;
    if (!requests || requests.length === 0) {
      return Response.json({ success: false, message: "No pending requests found." }, { status: 400 });
    }

    // 2️⃣ Fetch available technicians sorted by workload (lowest first)
    let { data: technicians, error: techError } = await supabase
      .from("technicians")
      .select("*")
      .eq("availability", "Yes")
      .order("job_count", { ascending: true });

    if (techError) throw techError;
    if (!technicians || technicians.length === 0) {
      return Response.json({ success: false, message: "No available technicians." }, { status: 400 });
    }

    // 3️⃣ Loop through requests and assign technicians
    for (const request of requests) {
      if (technicians.length === 0) break; // Stop if no more available technicians

      const assignedTechnician = technicians.shift(); // Pick the first available technician

      // 4️⃣ Create a work order
      const { error: workOrderError } = await supabase.from("work_orders").insert({
        request_id: request.request_id,
        technician_id: assignedTechnician.technician_id,
        status: "Assigned",
        created_at: new Date(),
      });

      if (workOrderError) throw workOrderError;

      // 5️⃣ Update the request to mark it as assigned
      const { error: updateRequestError } = await supabase
        .from("requests")
        .update({ assigned_technician: assignedTechnician.technician_id, status: "In Progress" })
        .eq("request_id", request.request_id);

      if (updateRequestError) throw updateRequestError;

      // 6️⃣ Update the technician’s workload count
      const { error: updateTechError } = await supabase
        .from("technicians")
        .update({ job_count: assignedTechnician.job_count + 1 })
        .eq("technician_id", assignedTechnician.technician_id);

      if (updateTechError) throw updateTechError;
    }

    return Response.json({ success: true, message: "Technicians assigned successfully." });
  } catch (error) {
    console.error("Auto-assignment error:", error);
    return Response.json({ success: false, message: "Failed to auto-assign technicians." }, { status: 500 });
  }
}
