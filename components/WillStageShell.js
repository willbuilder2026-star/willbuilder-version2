"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { dashboardHref } from "../lib/stages";

const standalone = {
  maxWidth: 520,
  margin: "40px auto",
  background: "#fff",
  border: "1px solid #e3d9c8",
  borderRadius: 14,
  padding: 28,
};

function Inner({ base, children }) {
  const params = useSearchParams();
  const willId = params.get("id");
  const [session, setSession] = useState(undefined); // undefined = still loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  if (session === undefined) {
    return <div style={standalone}>Loading…</div>;
  }

  if (!session) {
    return (
      <div style={standalone}>
        <p>You need to be logged in to answer these questions.</p>
        <a href={dashboardHref(base)} style={{ color: "#7a5225" }}>
          Go to log in →
        </a>
      </div>
    );
  }

  if (!willId) {
    return (
      <div style={standalone}>
        <p>No Will selected.</p>
        <a href={dashboardHref(base)} style={{ color: "#7a5225" }}>
          ← Back to your Wills
        </a>
      </div>
    );
  }

  return children(willId, session.user.id);
}

// Handles the loading / logged-out / no-will-id states shared by every
// stage page, then calls children(willId, userId) once ready.
// base: "./" from Stage 1 (app/will/page.js), "../" from every other stage.
export default function WillStageShell({ base = "../", children }) {
  return (
    <Suspense fallback={<div style={standalone}>Loading…</div>}>
      <Inner base={base}>{children}</Inner>
    </Suspense>
  );
}
