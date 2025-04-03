import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  try {
    const { phone, amount } = await req.json();
    
    // Validate input
    if (!phone || !amount) {
      return NextResponse.json(
        { error: "Phone number and amount are required" },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!/^(\+?254|0)[17]\d{8}$/.test(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid Kenyan phone number" },
        { status: 400 }
      );
    }

    // Format phone number
    const formattedPhone = phone.startsWith('0') ? `254${phone.substring(1)}` : phone;
    
    // Sandbox credentials (should be in environment variables!)
    const MPESA_CONSUMER_KEY = "Ka5BzpPETz1wznJw0P88GhZbhxghuhmjmu4YGA60xORsmGDL";
    const MPESA_CONSUMER_SECRET = "MVO42xgcOnXA6PAypNmA9tqxBevZaydWZGwrRGuHfsyalm6AtjScJupwTjeOGDgA";
    const MPESA_SHORTCODE = "174379"; // Sandbox test shortcode
    const MPESA_PASSKEY = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78"; // Sandbox test passkey
    const MPESA_CALLBACK_URL = "https://maintenance-management-system-two.vercel.app/api/mpesa/callback";

    // Get access token
    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString("base64");
    const tokenRes = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { 
        headers: { 
          Authorization: `Basic ${auth}` 
        } 
      }
    );

    const accessToken = tokenRes.data.access_token;
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14);
    
    // Generate password dynamically (must match timestamp)
    const password = Buffer.from(
      `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    // STK Push Payload
    const payload = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password, // Use dynamically generated password
      Timestamp: timestamp, // Use current timestamp
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CALLBACK_URL,    
      AccountReference: "Payment",
      TransactionDesc: "Payment for services"
    };

    // Send request
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
      }
    );

    return NextResponse.json({
      success: true,
      data: response.data,
      message: "STK Push initiated successfully"
    });

  } catch (error) {
    console.error("M-Pesa Error:", error.response?.data || error.message);
    return NextResponse.json(
      { 
        success: false,
        error: error.response?.data?.errorMessage || "Payment failed",
        details: error.response?.data || error.message
      },
      { status: 500 }
    );
  }
}

/*let headers = new Headers();
headers.append("Content-Type", "application/json");
headers.append("Authorization", "Bearer SprkIoGEAxtNATolxe6GcGFTVSlq");
​
fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
  method: 'POST',
  headers,
  body: JSON.stringify({
    "BusinessShortCode": 174379,
    "Password": "MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjUwNDAzMjMwODM4",
    "Timestamp": "20250403230838",
    "TransactionType": "CustomerPayBillOnline",
    "Amount": 1,
    "PartyA": 254708374149,
    "PartyB": 174379,
    "PhoneNumber": 254708374149,
    "CallBackURL": "https://mydomain.com/path",
    "AccountReference": "CompanyXLTD",
    "TransactionDesc": "Payment of X" 
  })
})
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log(error));*/