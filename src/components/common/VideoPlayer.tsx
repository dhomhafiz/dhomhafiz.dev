"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import type { VideoSource } from "@/types/portfolio";

// SRP: render media only. Playback policy and controls belong to the consuming feature.
// LSP/OCP: callers retain native video props, events, children, and ref access.
export const VideoPlayer = forwardRef<HTMLVideoElement, ComponentPropsWithoutRef<"video"> & { sources: readonly VideoSource[] }>(
  function VideoPlayer({ sources, children, ...props }, ref) {
    return <video ref={ref} {...props}>
      {sources.map(({ src, type }) => <source key={src} src={src} type={type} />)}
      {children}
    </video>;
  },
);
