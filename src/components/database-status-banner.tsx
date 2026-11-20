"use client";

import { AlertIcon, AlertRoot } from "@yamada-ui/react";
import { useCallback, useEffect, useState } from "react";
import { AppButton, COLORS } from "./ui";

type Health = {
  ok: boolean;
  database: {
    configured: boolean;
    reachable: boolean;
    schemaReady: boolean;
    missingTables: string[];
    error: string | null;
    hint: string | null;
  };
  storage: { configured: boolean; bucket: string };
};

/**
 * Shows a Yamada `Alert` when the app cannot persist anything (missing
 * DATABASE_URL, unreachable database, missing schema or missing object
 * storage). Silence is the healthy state.
 */
export function DatabaseStatusBanner() {
  const [health, setHealth] = useState<Health | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [checking, setChecking] = useState(false);

  const check = useCallback(async () => {
    setChecking(true);
    try {
      const response = await fetch("/api/health", { cache: "no-store" });
      setHealth((await response.json()) as Health);
    } catch {
      // A failed health request is not worth a banner of its own — the data
      // request error already surfaces in the view.
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/health", { cache: "no-store" });
        const data = (await response.json()) as Health;
        if (!cancelled) setHealth(data);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (dismissed || !health || health.ok) return null;

  const problems: string[] = [];
  if (!health.database.configured) problems.push("DATABASE_URL is not set.");
  else if (!health.database.reachable) problems.push("No connection to the database.");
  else if (!health.database.schemaReady) {
    problems.push(
      `The schema is not applied${health.database.missingTables.length ? ` (missing: ${health.database.missingTables.join(", ")})` : ""}.`,
    );
  }
  if (!health.storage.configured) problems.push("Image storage is not configured.");

  return (
    <AlertRoot
      status="warning"
      mt="5"
      mb="2"
      p="4"
      gap="3"
      alignItems="flex-start"
      bg="#fff6f0"
      borderWidth="1px"
      borderColor="#e8c9b7"
      borderLeft="4px solid #ec6f42"
      rounded="0"
    >
      <AlertIcon style={{ color: COLORS.orange, width: 18, height: 18, flexShrink: 0 }} />

      <div style={{ display: "grid", gap: 6, flex: 1 }}>
        <strong style={{ fontSize: 14 }}>Your changes will not be saved</strong>
        <ul style={{ margin: 0, paddingLeft: 18, color: "#7a4a34", fontSize: 13, lineHeight: 1.5 }}>
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
        {(health.database.hint || health.database.error) && (
          <p style={{ margin: 0, color: COLORS.muted, fontSize: 12 }}>
            {health.database.hint ?? health.database.error}
          </p>
        )}
        {!health.database.schemaReady && health.database.reachable && (
          <p style={{ margin: 0, color: COLORS.muted, fontSize: 12 }}>
            Fix it with <code>npm run db:push</code>.
          </p>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <AppButton variant="secondary" size="sm" onClick={() => void check()} loading={checking}>
          Check again
        </AppButton>
        <AppButton variant="ghost" size="sm" onClick={() => setDismissed(true)}>
          Hide
        </AppButton>
      </div>
    </AlertRoot>
  );
}
