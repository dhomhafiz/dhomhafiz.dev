import type { SocialLink } from "@/types/portfolio";

const platforms = {
  threads: {
    label: "Threads",
    path: "M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z",
  },
  facebook: {
    label: "Facebook",
    path: "M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.019 4.388 11.015 10.125 11.888v-8.408H7.078v-3.48h3.047V9.42c0-3.017 1.792-4.687 4.533-4.687 1.312 0 2.686.236 2.686.236v2.953h-1.513c-1.491 0-1.956.93-1.956 1.884v2.267h3.328l-.532 3.48h-2.796v8.408C19.612 23.088 24 18.092 24 12.073Z",
  },
  instagram: {
    label: "Instagram",
    path: "M7 2a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5H7Zm0 2h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Zm10.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z",
  },
  github: {
    label: "GitHub",
    path: "M12 .297C5.37.297 0 5.67 0 12.297c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.043-1.61-4.043-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.838 1.237 1.838 1.237 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.3-5.467-1.334-5.467-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.323 3.301 1.23A11.52 11.52 0 0 1 12 6.098c1.02.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.655 1.652.243 2.873.12 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.628-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.594 24 12.297c0-6.627-5.373-12-12-12",
  },
  linkedin: {
    label: "LinkedIn",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
};

export function SocialLinks({ links, appearance = "default", email }: { links: readonly SocialLink[]; appearance?: "default" | "icons"; email?: string }) {
  if (appearance === "icons") return <nav aria-label={email ? "Contact links" : "Social profiles"} className="contact-social-links">
    {email && <a href={`mailto:${email}`} aria-label={`Email ${email}`}>
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    </a>}
    {links.map(({ platform, href }) => <a key={platform} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${platforms[platform].label} (opens in a new tab)`}>
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d={platforms[platform].path} /></svg>
    </a>)}
  </nav>;
  return <nav aria-label="Social profiles" className="mt-4 flex flex-wrap gap-3">
    {links.map(({ platform, href }) => <a key={platform} href={href} target="_blank" rel="noopener noreferrer"
      className="group inline-flex min-h-12 items-center gap-3 rounded-xl border border-cyber-border/15 bg-cyber-surface/90 px-4 py-3 text-sm text-cyber-text shadow-sm backdrop-blur-md transition-colors hover:border-cyber-cyan/50 hover:bg-cyber-surface hover:text-cyber-cyan">
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor" className={`h-6 w-6 shrink-0 ${platform === "linkedin" ? "text-[#0a66c2]" : platform === "facebook" ? "text-[#1877f2]" : ""}`}>
        <path d={platforms[platform].path} />
      </svg>
      <span>{platforms[platform].label}</span>
      <span aria-hidden="true" className="ml-1 text-cyber-muted group-hover:text-cyber-cyan">↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>)}
  </nav>;
}
