import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-muted disabled:opacity-50",
  secondary:
    "border border-border bg-surface-elevated text-foreground hover:bg-surface disabled:opacity-50",
  ghost: "text-muted hover:bg-surface-elevated hover:text-foreground disabled:opacity-50",
  danger:
    "bg-red-600 text-white hover:bg-red-500 disabled:opacity-50",
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
