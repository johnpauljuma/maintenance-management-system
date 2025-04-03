import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const callbackData = await req.json();
    console.log("M-Pesa Callback Data:", callbackData);

    // Extract transaction details (optional)
    const resultCode = callbackData?.Body?.stkCallback?.ResultCode;
    const checkoutRequestID = callbackData?.Body?.stkCallback?.CheckoutRequestID;

    if (resultCode === 0) {
      // Payment successful - Redirect to success page
      return NextResponse.redirect("/payments/success");
    } else {
      // Payment failed - Redirect to failure page
      return NextResponse.redirect("/payments/failed");
    }
  } catch (error) {
    console.error("M-Pesa Callback Error:", error);
    return NextResponse.json({ error: "Callback processing failed" }, { status: 500 });
  }
}
