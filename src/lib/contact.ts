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
        service_id: "service_risqb4l",
        template_id: "template_tin4wnb",
        user_id: "g9X929W5sDIxOlaoW",
        template_params: { name: values.name, email: values.email, message: values.message },
      }),
    });
    if (!response.ok) throw new Error("Email service could not accept the message.");
  } finally { clearTimeout(timeout); }
}
