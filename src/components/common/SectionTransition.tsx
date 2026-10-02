"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createSectionTransitionController, sectionTransitionProfile, type SectionTransitionProfile } from "@/lib/sectionTransitions";

const controller = createSectionTransitionController();

// Composition keeps feature content independent of animation and server rendered.
export function SectionTransition({ children, order, bottomSpace = false, exit = "cover", profile = sectionTransitionProfile }: {
  children: ReactNode;
  order: number;
  bottomSpace?: boolean;
  exit?: "cover" | "flow";
  profile?: Readonly<SectionTransitionProfile>;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (exit === "flow") return;
    if (!stage.current || !panel.current || !frame.current) return;
    const unregister = controller.register(stage.current, panel.current, frame.current, profile);
    stage.current.dataset.transitionReady = "true";
    return () => {
      unregister();
      stage.current?.removeAttribute("data-transition-ready");
    };
  }, [profile, exit]);
  return <div ref={stage} className="section-transition-stage" data-exit={exit} style={{ zIndex: order }}>
    <div ref={panel} className="section-transition-panel">
      <div ref={frame} className={`section-transition-frame${bottomSpace ? " section-transition-bottom-space" : ""}`}>{children}</div>
    </div>
  </div>;
}
