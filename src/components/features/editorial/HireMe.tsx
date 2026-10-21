import { FaWhatsapp } from "react-icons/fa6";
import localFont from "next/font/local";
import { SocialLinks } from "@/components/common/SocialLinks";
import type { SocialLink } from "@/types/portfolio";
import { whatsappHref } from "@/config/editorial";

// The older Anton subset does not contain every glyph in the new headline.
const contactFont = localFont({ src: "../../../app/fonts/BarlowCondensed-ExtraBold.ttf", weight: "800", variable: "--font-contact", display: "swap" });

export function HireMe({ email, socials = [] }: { email: string; socials?: readonly SocialLink[] }) {
  const href = whatsappHref();
  return <section id="contact" className={`contact-destination ${contactFont.variable}`} aria-labelledby="hire-heading">
    <div className="contact-destination-copy">
      <p className="contact-destination-eyebrow">BEFORE SUNRISE / A NEW CHAPTER</p>
      <h2 id="hire-heading" tabIndex={-1}>HAVE A PROJECT<br />IN MIND?</h2>
      <p className="contact-destination-description">Let&apos;s talk about your next chapter. I build custom websites and interactive web experiences for businesses ready to bring something new to life.</p>
      {href ? <a className="hire-button" href={href} target="_blank" rel="noopener noreferrer"><FaWhatsapp aria-hidden="true" focusable="false" size={24} /> LET&apos;S BUILD SOMETHING<span className="sr-only"> on WhatsApp (opens in a new tab)</span></a> : <button className="hire-button" disabled>WhatsApp unavailable</button>}
      <SocialLinks links={[...socials].sort((a, b) => ["instagram", "facebook", "linkedin", "threads"].indexOf(a.platform) - ["instagram", "facebook", "linkedin", "threads"].indexOf(b.platform))} appearance="icons" email={email} />
      <p className="contact-copyright">ALL RIGHTS RESERVED 2026 <strong>dhomhafiz.dev</strong></p>
    </div>
  </section>;
}
