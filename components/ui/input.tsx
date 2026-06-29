import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, id, className = "", ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full min-h-11 rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/30 ${
          error ? "border-red-500" : "border-border"
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
