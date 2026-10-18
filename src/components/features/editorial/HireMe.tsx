import { FaWhatsapp } from "react-icons/fa6";
import { SocialLinks } from "@/components/common/SocialLinks";
import type { SocialLink } from "@/types/portfolio";
import { whatsappHref } from "@/config/editorial";
export function HireMe({ email, socials = [] }: { email: string; socials?: readonly SocialLink[] }) {
  const href = whatsappHref();
  return <section id="contact" className="hire-section" aria-labelledby="hire-heading"><p className="eyebrow">Have something in mind?</p><h2 id="hire-heading">Let’s make your<br />next chapter <span>happen.</span></h2><div className="hire-bottom"><p>A new business, a fresh direction,<br />or a website ready for a rethink.</p><div>{href ? <a className="hire-button" href={href} target="_blank" rel="noopener noreferrer"><FaWhatsapp aria-hidden="true" focusable="false" size={22} style={{ flexShrink: 0 }} /> Let’s talk on WhatsApp</a> : <><button className="hire-button" disabled><FaWhatsapp aria-hidden="true" focusable="false" size={22} style={{ flexShrink: 0 }} /> WhatsApp unavailable</button><p className="contact-note">WhatsApp number has not been configured.</p></>}<SocialLinks links={[...socials].sort((a, b) => ["instagram", "facebook", "linkedin", "threads"].indexOf(a.platform) - ["instagram", "facebook", "linkedin", "threads"].indexOf(b.platform))} appearance="icons" email={email} /></div></div></section>;
}
