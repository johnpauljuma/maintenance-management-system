import emailjs from '@emailjs/browser';

// Initialize EmailJS with your Public Key
emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY);

export default async function sendEmails(requestData, userEmail) {
  try {
    // Validate required environment variables
    if (!process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 
        !process.env.NEXT_PUBLIC_EMAILJS_ADMIN_TEMPLATE_ID || 
        !process.env.NEXT_PUBLIC_EMAILJS_USER_TEMPLATE_ID) {
      throw new Error('EmailJS environment variables are not properly configured');
    }

    // Send to Admin
    const adminResponse = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      process.env.NEXT_PUBLIC_EMAILJS_ADMIN_TEMPLATE_ID,
      {
        client_name: requestData.client,
        client_email: userEmail,
        request_title: requestData.title,
        request_description: requestData.description,
        urgency: requestData.urgency,
        preferred_date: requestData.preferred_date,
        admin_dashboard_url: `${process.env.NEXT_PUBLIC_SITE_URL}/admin`,
        location: requestData.location
      }
    );

    // Send to User
    const userResponse = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      process.env.NEXT_PUBLIC_EMAILJS_USER_TEMPLATE_ID,
      {
        client_name: requestData.client,
        user_email: userEmail,
        request_title: requestData.title,
        request_description: requestData.description,
        urgency: requestData.urgency,
        preferred_date: requestData.preferred_date,
        response_time: '1-2 business days',
        support_contact: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@example.com'
      }
    );

    return {
      adminSuccess: adminResponse.status === 200,
      userSuccess: userResponse.status === 200
    };

  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error(`Failed to send confirmation emails: ${error.message}`);
  }
}