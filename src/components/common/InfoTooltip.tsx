"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function InfoTooltip({ label, text }: { label: string; text: string }) {
  const id = useId();
  const button = useRef<HTMLButtonElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const pointerType = useRef("");
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    if (!open) { setPosition(null); return; }
    const place = () => {
      if (!button.current || !tooltip.current) return;
      const anchor = button.current.getBoundingClientRect();
      const viewport = window.visualViewport;
      // Size against the visible viewport before measuring, including pinch zoom.
      tooltip.current.style.maxWidth = `${Math.max(0, (viewport?.width ?? document.documentElement.clientWidth) - 16)}px`;
      tooltip.current.style.maxHeight = `${Math.max(0, (viewport?.height ?? window.innerHeight) - 16)}px`;
      const bubble = tooltip.current.getBoundingClientRect();
      const leftEdge = (viewport?.offsetLeft ?? 0) + 8;
      const topEdge = (viewport?.offsetTop ?? 0) + 8;
      const rightEdge = leftEdge + (viewport?.width ?? document.documentElement.clientWidth) - 16;
      const bottomEdge = topEdge + (viewport?.height ?? window.innerHeight) - 16;
      const left = Math.max(leftEdge, Math.min(anchor.left + anchor.width / 2 - bubble.width / 2, rightEdge - bubble.width));
      const below = anchor.bottom + 8;
      const top = Math.max(topEdge, Math.min(
        below + bubble.height <= bottomEdge ? below : anchor.top - bubble.height - 8,
        bottomEdge - bubble.height,
      ));
      setPosition({ left, top });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    window.visualViewport?.addEventListener("resize", place);
    window.visualViewport?.addEventListener("scroll", place);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      window.visualViewport?.removeEventListener("resize", place);
      window.visualViewport?.removeEventListener("scroll", place);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!button.current?.contains(target) && !tooltip.current?.contains(target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", outside, true);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside, true);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return <>
    <button
      ref={button}
      type="button"
      aria-label={label}
      aria-expanded={open}
      aria-describedby={open ? id : undefined}
      className="inline-flex h-5 w-5 items-center justify-center rounded-full align-middle text-cyber-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyber-cyan"
      onPointerDown={event => { pointerType.current = event.pointerType; }}
      onPointerEnter={event => { if (event.pointerType === "mouse") setOpen(true); }}
      onPointerLeave={event => { if (event.pointerType === "mouse") setOpen(false); }}
      onFocus={() => { if (pointerType.current !== "touch") setOpen(true); }}
      onBlur={() => { setOpen(false); pointerType.current = ""; }}
      onClick={() => { if (pointerType.current === "touch") setOpen(value => !value); else setOpen(true); }}
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-3.5 w-3.5"><circle cx="10" cy="10" r="7.5" /><path d="M10 9v5" /><circle cx="10" cy="6" r=".65" fill="currentColor" stroke="none" /></svg>
    </button>
    {open && createPortal(<div
      ref={tooltip}
      id={id}
      role="tooltip"
      className="fixed z-[100] w-64 max-w-[calc(100vw-1rem)] overflow-y-auto break-words rounded-md border border-cyber-cyan/25 bg-[#0e1621] px-3 py-2 text-xs leading-5 text-[#f1f5f9] shadow-lg"
      style={{ left: position?.left ?? 0, top: position?.top ?? 0, visibility: position ? "visible" : "hidden", maxWidth: "calc(100dvw - 1rem)", maxHeight: "calc(100dvh - 1rem)" }}
    >{text}</div>, document.body)}
  </>;
}
