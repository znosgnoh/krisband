import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "cursor-pointer bg-accent text-on-accent hover:bg-accent-muted disabled:opacity-50",
  secondary:
    "cursor-pointer border border-border bg-surface-elevated text-foreground hover:bg-surface disabled:opacity-50",
  ghost:
    "cursor-pointer text-muted hover:bg-surface-elevated hover:text-foreground disabled:opacity-50",
  danger:
    "cursor-pointer bg-primary text-white hover:bg-primary-muted disabled:opacity-50",
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
      className={`inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
