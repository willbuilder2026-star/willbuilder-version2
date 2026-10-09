"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

const card = {
  maxWidth: 460,
  margin: "60px auto",
  background: "#fff",
  border: "1px solid #e3d9c8",
  borderRadius: 14,
  padding: 28,
};
const input = {
  width: "100%",
  padding: "10px 12px",
  marginTop: 6,
  marginBottom: 14,
  border: "1px solid #e3d9c8",
  borderRadius: 8,
  fontSize: 15,
  boxSizing: "border-box",
};
const btn = {
  width: "100%",
  padding: "11px",
  background: "#9c6b32",
  color: "#fff8ee",
  border: "none",
  borderRadius: 8,
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 15,
};
const label = { fontSize: 13, fontWeight: 600, color: "#7a7266" };

// Reached from the "reset your password" link in the email Supabase sends.
// Following that link signs the browser into a short-lived recovery
// session automatically (via the URL, handled by the Supabase client) —
// this page just has to notice that session exists, then let them set a
// new password.
export default function ResetPasswordPage() {
  const [status, setStatus] = useState("checking"); // checking | ready | invalid | done
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setStatus(data.session ? "ready" : "invalid");
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setStatus("ready");
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setMessage("Passwords don't match.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      setMessage(error.message);
    } else {
      setStatus("done");
    }
  }

  if (status === "checking") {
    return (
      <div style={card}>
        <p>Checking your link…</p>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div style={card}>
        <h1 style={{ fontSize: 20, marginBottom: 10 }}>This link isn't valid</h1>
        <p style={{ color: "#4a5867", fontSize: 14, lineHeight: 1.6 }}>
          This password reset link has expired or has already been used. Go back to the sign-in page and request a
          new one.
        </p>
        <a href="../" style={{ display: "inline-block", marginTop: 14, color: "#7a5225", fontSize: 13, fontWeight: 600 }}>
          ← Back to sign in
        </a>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div style={card}>
        <h1 style={{ fontSize: 20, marginBottom: 10 }}>Password updated</h1>
        <p style={{ color: "#4a5867", fontSize: 14, lineHeight: 1.6 }}>
          Your password has been changed. You're signed in now.
        </p>
        <a href="../" style={{ display: "inline-block", marginTop: 14, color: "#7a5225", fontSize: 13, fontWeight: 600 }}>
          Continue to your Wills →
        </a>
      </div>
    );
  }

  return (
    <div style={card}>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Choose a new password</h1>
      <p style={{ color: "#7a7266", fontSize: 14, marginBottom: 18 }}>
        Enter a new password for your account below.
      </p>
      <form onSubmit={handleSubmit}>
        <label style={label}>New password</label>
        <input style={input} type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        <label style={label}>Confirm new password</label>
        <input style={input} type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <button style={btn} type="submit" disabled={saving}>
          {saving ? "Saving…" : "Set new password"}
        </button>
      </form>
      {message && <p style={{ marginTop: 14, fontSize: 13, color: "#a8541f" }}>{message}</p>}
    </div>
  );
}
