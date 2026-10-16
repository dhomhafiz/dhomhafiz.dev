import { whatsappHref } from "@/config/editorial";
export function HireMe({ email }: { email: string }) {
  const href = whatsappHref();
  return <section id="contact" className="hire-section" aria-labelledby="hire-heading"><p className="eyebrow">Have something in mind?</p><h2 id="hire-heading">Let’s make your<br />next chapter <span>happen.</span></h2><div className="hire-bottom"><p>A new business, a fresh direction,<br />or a website ready for a rethink.</p><div>{href ? <a className="hire-button" href={href} target="_blank" rel="noopener noreferrer">Let’s talk on WhatsApp <span aria-hidden="true">↗</span></a> : <><button className="hire-button" disabled>WhatsApp unavailable <span aria-hidden="true">↗</span></button><p className="contact-note">WhatsApp number has not been configured.</p></>}<a className="email-link" href={`mailto:${email}`}>{email} ↗</a></div></div></section>;
}
