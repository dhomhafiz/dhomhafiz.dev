import { FaWhatsapp } from "react-icons/fa6";
import { displayFont } from "@/lib/displayFont";
import { SocialLinks } from "@/components/common/SocialLinks";
import type { SocialLink } from "@/types/portfolio";
import { whatsappHref } from "@/config/editorial";
import { ContactMotion } from "./ContactMotion";

export function HireMe({ email, socials = [] }: { email: string; socials?: readonly SocialLink[] }) {
  const href = whatsappHref();
  return <section id="contact" className={`hire-section contact-scroll-track ${displayFont.variable}`} aria-labelledby="hire-heading">
    <ContactMotion />
    <div className="contact-stage">
      <div className="contact-type-space"><h2 id="hire-heading" className="contact-title" aria-label="CONTACT"><span className="contact-title-native" aria-hidden="true">CONTACT</span><svg className="contact-title-vector" aria-hidden="true" focusable="false" preserveAspectRatio="none"><text x="0" y="0">CONTACT</text></svg></h2></div>
      <div className="contact-actions">
        {href ? <a className="hire-button" href={href} target="_blank" rel="noopener noreferrer"><FaWhatsapp aria-hidden="true" focusable="false" size={22} /> Let’s talk on WhatsApp</a> : <button className="hire-button" disabled><FaWhatsapp aria-hidden="true" focusable="false" size={22} /> WhatsApp unavailable</button>}
        <SocialLinks links={[...socials].sort((a, b) => ["instagram", "facebook", "linkedin", "threads"].indexOf(a.platform) - ["instagram", "facebook", "linkedin", "threads"].indexOf(b.platform))} appearance="icons" email={email} />
        <p className="contact-copyright">ALL RIGHTS RESERVED 2026 <strong>dhomhafiz.dev</strong></p>
      </div>
    </div>
  </section>;
}
