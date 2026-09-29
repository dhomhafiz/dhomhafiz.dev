export interface ContactMessage { name: string; email: string; message: string }

// EmailJS public identifiers are intended for browser use.
export async function sendContactMessage(values: ContactMessage) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
        template_params: { name: values.name, email: values.email, message: values.message },
      }),
    });
    if (!response.ok) throw new Error("Email service could not accept the message.");
  } finally { clearTimeout(timeout); }
}
