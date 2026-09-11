"use client";

import { useEffect } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { buildSharedDraft } from "../utils/linkParser";
import { loadPendingShare } from "../services/pendingShareStorage";

// Query keys declared in manifest.webmanifest `share_target.params`
const SHARE_PARAMS = ["share_url", "share_text", "share_title"] as const;

/** Picks up a link sent via the Android share sheet (Web Share Target) and opens the save sheet. */
export function useShareIntake() {
  const setPendingShare = useKanbanStore((s) => s.setPendingShare);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get("share_url");
    const text = params.get("share_text");
    const title = params.get("share_title");

    if (url || text || title) {
      setPendingShare(buildSharedDraft({ url, text, title }));
      // Strip the params so a reload doesn't re-open the sheet. Deferred because on first mount
      // this child effect runs before the App Router patches history.replaceState, and the
      // router would otherwise restore its own (still-parameterised) URL.
      SHARE_PARAMS.forEach((key) => params.delete(key));
      const query = params.toString();
      const timer = window.setTimeout(() => {
        window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    const stored = loadPendingShare();
    if (stored) setPendingShare(stored);
  }, [setPendingShare]);
}
