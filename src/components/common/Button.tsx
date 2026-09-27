import { forwardRef, type ComponentPropsWithoutRef } from "react";

const variants = {
  primary: "border-cyber-cyan bg-cyber-cyan text-cyber-on-accent hover:bg-cyber-hover hover:border-cyber-hover shadow-neon-cyan",
  secondary: "border-cyber-border/20 bg-cyber-border/5 text-cyber-text hover:bg-cyber-border/10 hover:border-cyber-border/40",
};
type Variant = keyof typeof variants;
function classes(variant: Variant, className = "") {
  return `inline-flex min-h-12 items-center justify-center gap-3 rounded-md border px-5 py-3 text-sm font-medium transition-colors ${variants[variant]} ${className}`;
}
// LSP/ISP: native button semantics, attributes, event handlers and refs are preserved.
export const Button = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<"button"> & { variant?: Variant }>(
  function Button({ variant = "primary", className, type = "button", ...props }, ref) {
    return <button ref={ref} type={type} className={classes(variant, className)} {...props} />;
  },
);
// OCP: a shared visual contract supports navigation without disguising anchors as buttons.
export const ButtonLink = forwardRef<HTMLAnchorElement, ComponentPropsWithoutRef<"a"> & { variant?: Variant }>(
  function ButtonLink({ variant = "primary", className, ...props }, ref) {
    return <a ref={ref} className={classes(variant, className)} {...props} />;
  },
);
