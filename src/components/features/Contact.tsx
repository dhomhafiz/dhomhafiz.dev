"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/common/Button";
import { sendContactMessage } from "@/lib/contact";
import { useServiceEnquiry } from "./ServiceEnquiry";

const fieldClass = "mt-2 min-w-0 w-full rounded-xl border border-cyber-border/20 bg-cyber-dark/70 px-4 py-3 text-base sm:text-sm text-cyber-text placeholder:text-cyber-muted/70 focus:border-cyber-cyan";

export function Contact({ contactEmail, packages }: { contactEmail: string; packages: readonly { id: string; title: string }[] }) {
  const { packageId, setPackageId } = useServiceEnquiry();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const sending = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    if (String(new FormData(form).get("website") ?? "")) return;
    const values = { name: name.trim(), email: email.trim(), message: message.trim() };
    if (!values.name || !values.message) {
      setStatus("error");
      setFeedback("Please enter your name and a message, not just spaces.");
      return;
    }
    sending.current = true;
    setStatus("sending");
    setFeedback("Sending your message…");
    try {
      const packageTitle = packages.find(item => item.id === packageId)?.title ?? "Not sure yet — help me choose";
      // Include the choice in the existing email message so no template migration is needed.
      await sendContactMessage({ ...values, message: `Service package: ${packageTitle}\n\n${values.message}` });
      setStatus("success");
      setFeedback("Thanks! Your message has been sent. I’ll get back to you by email.");
      setName(""); setEmail(""); setMessage(""); setPackageId("");
    } catch {
      setStatus("error");
      setFeedback("We couldn’t confirm your message was sent. Your details are still here; please try again or email me directly.");
    } finally { sending.current = false; }
  }

  return <section id="contact" aria-labelledby="contact-title" className="mx-auto max-w-[1440px] px-6 py-16 md:px-12 lg:px-20">
    <div className="mb-9 flex flex-wrap items-baseline justify-between gap-4">
      <h2 id="contact-title" className="font-mono text-3xl tracking-tight">Contact Us</h2>
      <p className="text-xs uppercase tracking-[0.15em] text-cyber-muted">Let’s make it happen / 05</p>
    </div>
    <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
      <div>
        <p className="max-w-md font-display text-3xl leading-tight md:text-4xl">Have an idea?<br /><span className="text-cyber-cyan">Let’s build it together.</span></p>
        <p className="mt-6 max-w-md text-sm leading-7 text-cyber-muted">Tell me about your project, your goals, and what you have in mind. A rough idea is a great place to start.</p>
        <a href={`mailto:${contactEmail}`} className="mt-7 inline-flex min-h-11 items-center break-all text-sm text-cyber-cyan underline decoration-cyber-cyan/30 underline-offset-4">{contactEmail}</a>
      </div>
      <form id="contact-form" tabIndex={-1} aria-label="Website project enquiry" onSubmit={submit} className="min-w-0 scroll-mt-4 rounded-2xl border border-cyber-border/15 bg-cyber-surface/60 p-5 sm:p-6 md:p-8" aria-busy={status === "sending"}>
        <fieldset disabled={status === "sending"} className="min-w-0 space-y-5">
          <legend className="sr-only">Send Hafiz a message</legend>
          <div>
            <label htmlFor="contact-package" className="text-sm">Which package interests you?</label>
            <select id="contact-package" name="servicePackage" value={packageId} onChange={event => setPackageId(event.target.value)} className={fieldClass} aria-describedby="package-hint">
              <option value="">Not sure yet — help me choose</option>
              {packages.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
            <p id="package-hint" className="mt-2 text-xs leading-6 text-cyber-muted">Choose a package or let me recommend a fit. You can change this anytime before sending.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div><label htmlFor="contact-name" className="text-sm">Name <span className="text-cyber-muted">(required)</span></label>
              <input id="contact-name" name="name" autoComplete="name" required maxLength={100} value={name} onChange={e => setName(e.target.value)} className={fieldClass} placeholder="Your name" /></div>
            <div><label htmlFor="contact-email" className="text-sm">Email <span className="text-cyber-muted">(required)</span></label>
              <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} className={fieldClass} placeholder="you@example.com" /></div>
          </div>
          <div><label htmlFor="contact-message" className="text-sm">Message <span className="text-cyber-muted">(required)</span></label>
            <textarea id="contact-message" name="message" required maxLength={5000} rows={6} value={message} onChange={e => setMessage(e.target.value)} className={`${fieldClass} min-h-40 resize-y`} placeholder="Tell me a little about your project…" /></div>
          <div hidden aria-hidden="true"><label htmlFor="contact-website">Leave this field empty</label><input id="contact-website" name="website" tabIndex={-1} autoComplete="off" /></div>
          <p className="text-xs leading-6 text-cyber-muted">Your name, email, package choice, and message will be sent through EmailJS so I can reply to your enquiry.</p>
          <Button type="submit" className="w-full sm:w-auto">{status === "sending" ? "Sending…" : "Send Message"}<span aria-hidden="true">↗</span></Button>
        </fieldset>
        <p role="status" aria-live="polite" aria-atomic="true" className={`mt-4 min-h-6 text-sm leading-6 ${status === "error" ? "text-cyber-text" : "text-cyber-cyan"}`}>{feedback}</p>
      </form>
    </div>
  </section>;
}
