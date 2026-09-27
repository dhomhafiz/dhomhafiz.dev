import type { ComponentPropsWithoutRef } from "react";

// SRP/OCP/LSP: surface only; arbitrary children and native div attributes are supported.
export function GlassCard({ className = "", ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={`glass-panel rounded-xl ${className}`} {...props} />;
}
