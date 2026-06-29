"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  position?: "bottom-sheet" | "center";
}

export function Modal({
  open,
  title,
  onClose,
  children,
  position = "center",
}: ModalProps) {
  const titleId = useId();
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const isCentered = position === "center";

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex justify-center px-4 ${
        isCentered
          ? "items-center py-4"
          : "items-end pb-[max(1rem,var(--safe-bottom))] sm:items-center sm:py-4"
      }`}
      style={{
        paddingTop: isCentered ? "max(1rem, var(--safe-top))" : undefined,
        paddingBottom: isCentered
          ? "max(1rem, var(--safe-bottom))"
          : undefined,
      }}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative z-10 max-h-[calc(100svh-2rem)] w-full max-w-md overflow-y-auto border border-border bg-surface p-5 shadow-xl ${
          isCentered ? "rounded-2xl" : "rounded-t-2xl sm:rounded-2xl"
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
            aria-label="Close"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
