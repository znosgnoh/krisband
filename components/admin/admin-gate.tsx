"use client";

import { useState, useSyncExternalStore } from "react";
import { ADMIN_PIN } from "@/lib/config";
import { ADMIN_SESSION_KEY } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function subscribeNoop() {
  return () => {};
}

function readAdminUnlocked(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

interface AdminGateProps {
  children: React.ReactNode;
}

export function AdminGate({ children }: AdminGateProps) {
  const persisted = useSyncExternalStore(
    subscribeNoop,
    readAdminUnlocked,
    () => false,
  );
  const [localUnlock, setLocalUnlock] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const unlocked = persisted || localUnlock;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pin.trim() !== ADMIN_PIN) {
      setError("Incorrect PIN");
      return;
    }

    try {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
    } catch {
      // unlock in memory only
    }
    setError(null);
    setLocalUnlock(true);
  }

  if (!unlocked) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 py-10">
        <header className="space-y-1 text-center">
          <p className="font-display text-xs tracking-[0.2em] text-accent uppercase">
            Krisband
          </p>
          <h1 className="font-display text-3xl leading-none">Admin</h1>
          <p className="text-sm text-muted">Enter PIN to manage rehearsals.</p>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="PIN"
            name="pin"
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={pin}
            onChange={(event) => {
              setPin(event.target.value);
              setError(null);
            }}
            error={error ?? undefined}
          />
          <Button type="submit" className="w-full">
            Unlock
          </Button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
