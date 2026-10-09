"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { dashboardHref, siteRootHref } from "../lib/stages";

// Sits above the sidebar + question card on every stage page, so people
// can always get back out — to the marketing site, or to signing out —
// without having to hunt for it.
export default function StageTopBar({ base }) {
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    window.location.href = dashboardHref(base);
  }

  return (
    <div
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "14px 16px 0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 10,
      }}
    >
      <a
        href={siteRootHref(base)}
        style={{
          fontSize: 13.5,
          color: "#7a5225",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        ← Back to website
      </a>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        style={{
          background: "none",
          border: "1px solid #e3d9c8",
          color: "#4a5867",
          borderRadius: 7,
          padding: "6px 14px",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {signingOut ? "Signing out…" : "Log out"}
      </button>
    </div>
  );
}
