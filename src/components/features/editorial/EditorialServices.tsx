import { editorialServices } from "@/config/editorial";
import { ServicesMotion } from "./ServicesMotion";

export function EditorialServices() {
  return <section id="services" className="editorial-section services-editorial" aria-labelledby="services-heading"><ServicesMotion />
    <div className="services-heading-block"><p className="eyebrow">How I can help</p><h2 id="services-heading">Good design.<br />Built with purpose.</h2><p className="services-intro">I build fast landing pages that make your offer clear and your next enquiry easy. Thoughtful design, responsive development and a direct path to WhatsApp.</p></div>
    <div className="services-sequence">{editorialServices.map((service, i) => <article className="service-row" key={service.title}><span className="service-number">0{i + 1}</span><div><h3>{service.title}</h3><p>{service.text}</p></div></article>)}</div>
  </section>;
}
