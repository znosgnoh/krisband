"use client";

import { useEffect } from "react";
import { useSongStore } from "@/store/song-store";

export function StoreHydrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setHasHydrated = useSongStore((state) => state.setHasHydrated);

  useEffect(() => {
    useSongStore.persist.rehydrate();
    setHasHydrated(true);

    if (process.env.NODE_ENV === "development") {
      (
        window as Window & { useSongStore?: typeof useSongStore }
      ).useSongStore = useSongStore;
    }
  }, [setHasHydrated]);

  return <>{children}</>;
}
