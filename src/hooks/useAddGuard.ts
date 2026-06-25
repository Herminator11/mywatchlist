"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

// Führt eine Add-Aktion nur für angemeldete User aus; Gäste bekommen einen
// Hinweis und werden zum Login geleitet. Genutzt von Trends & Suche.
export function useAddGuard() {
  const { status } = useSession();
  const router = useRouter();
  return useCallback(
    (action: () => void) => {
      if (status === "authenticated") {
        action();
        return;
      }
      toast.info("Melde dich an, um Titel zu deinen Listen hinzuzufügen.");
      router.push("/login");
    },
    [status, router]
  );
}
