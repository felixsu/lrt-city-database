import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";

const BASE =
  "inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS = {
  primary: "bg-accent text-white hover:bg-accent-text",
  secondary: "border border-hairline bg-surface text-ink hover:bg-surface-soft",
  danger: "border border-red-200 text-red-600 hover:bg-red-50",
  dashed: "border border-dashed border-accent text-accent-text hover:bg-accent/8",
};

const SIZES = {
  sm: "h-8 px-3 text-xs",
  md: "h-[38px] px-4",
};

type Variant = keyof typeof VARIANTS;
type Size = keyof typeof SIZES;

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  );
}

export function LinkButton({
  variant = "secondary",
  size = "md",
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return (
    <Link className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`} {...props}>
      {children}
    </Link>
  );
}
