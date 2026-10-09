"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

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
const smallBtn = {
  padding: "8px 14px",
  borderRadius: 7,
  border: "none",
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

// The absolute URLs Supabase should send people back to. Both must also be
// added to Supabase → Authentication → URL Configuration → Redirect URLs.
const EMAIL_REDIRECT_TO = "https://willbuilder2026-star.github.io/willbuilder2026-star/app/";
const RESET_REDIRECT_TO = "https://willbuilder2026-star.github.io/willbuilder2026-star/app/reset-password/";

function willLabel(w) {
  return w.label || `${w.jurisdiction.replace("_", " ")} Will — ${w.status}`;
}

// The delete flow: first an "are you sure, have you kept a copy" warning,
// then a second step where they have to type DELETE to actually confirm.
// Cancel is available at both steps.
function DeleteWillDialog({ will, onCancel, onDeleted }) {
  const [step, setStep] = useState(1);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setError("");
    const { error } = await supabase.from("wills").delete().eq("id", will.id);
    setDeleting(false);
    if (error) {
      setError(error.message);
      return;
    }
    onDeleted();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(28,43,58,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 100,
      }}
    >
      <div style={{ background: "#fff", borderRadius: 14, padding: 26, maxWidth: 440, width: "100%" }}>
        {step === 1 ? (
          <>
            <h2 style={{ fontSize: 18, marginBottom: 10 }}>Delete "{willLabel(will)}"?</h2>
            <p style={{ fontSize: 14, color: "#4a5867", lineHeight: 1.6 }}>
              Please confirm you have kept a copy of this Will — for example a downloaded PDF, or a signed paper
              original — before continuing. Once deleted, every answer and document relating to this Will is
              permanently removed from our system and cannot be recovered.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button style={{ ...smallBtn, flex: 1, background: "#eee", color: "#4a5867" }} onClick={onCancel}>
                Cancel
              </button>
              <button style={{ ...smallBtn, flex: 1, background: "#f6e6dc", color: "#a8541f" }} onClick={() => setStep(2)}>
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: 18, marginBottom: 10 }}>Type DELETE to confirm</h2>
            <p style={{ fontSize: 14, color: "#4a5867", lineHeight: 1.6 }}>
              To permanently delete "{willLabel(will)}", type <strong>DELETE</strong> in the box below.
            </p>
            <input
              style={{ ...input, textTransform: "uppercase" }}
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              autoFocus
            />
            {error && <p style={{ fontSize: 13, color: "#a8541f", marginTop: -8, marginBottom: 10 }}>{error}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...smallBtn, flex: 1, background: "#eee", color: "#4a5867" }} onClick={onCancel}>
                Cancel
              </button>
              <button
                style={{ ...smallBtn, flex: 1, background: "#a8541f", color: "#fff8ee", opacity: confirmText.trim() === "DELETE" ? 1 : 0.5 }}
                disabled={confirmText.trim() !== "DELETE" || deleting}
                onClick={handleDelete}
              >
                {deleting ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function WillRow({ will, linkedWill, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [labelValue, setLabelValue] = useState(will.label || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function saveLabel() {
    setSaving(true);
    const { error } = await supabase.from("wills").update({ label: labelValue.trim() || null }).eq("id", will.id);
    setSaving(false);
    if (!error) {
      setEditing(false);
      onChanged();
    }
  }

  return (
    <div style={{ border: "1px solid #e3d9c8", borderRadius: 10, padding: 14, marginTop: 10, fontSize: 13 }}>
      {editing ? (
        <div>
          <label style={label}>Name for this Will</label>
          <input style={input} type="text" value={labelValue} onChange={(e) => setLabelValue(e.target.value)} placeholder={willLabel(will)} autoFocus />
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...smallBtn, background: "#9c6b32", color: "#fff8ee" }} onClick={saveLabel} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button style={{ ...smallBtn, background: "#eee", color: "#4a5867" }} onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{willLabel(will)}</div>
            <div style={{ color: "#7a7266", marginTop: 3 }}>Started {new Date(will.created_at).toLocaleDateString()}</div>
            {linkedWill && <div style={{ color: "#7a5225", marginTop: 3, fontWeight: 600 }}>🔗 Linked with {willLabel(linkedWill)}</div>}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button style={{ ...smallBtn, background: "#f1e4d0", color: "#7a5225" }} onClick={() => setEditing(true)}>
              Edit
            </button>
            <button style={{ ...smallBtn, background: "#f6e6dc", color: "#a8541f" }} onClick={() => setDeleting(true)}>
              Delete
            </button>
            <a href={`../will/?id=${will.id}`} style={{ ...smallBtn, background: "#9c6b32", color: "#fff8ee", textDecoration: "none", display: "inline-block" }}>
              Continue →
            </a>
          </div>
        </div>
      )}
      {deleting && <DeleteWillDialog will={will} onCancel={() => setDeleting(false)} onDeleted={() => { setDeleting(false); onChanged(); }} />}
    </div>
  );
}

export default function AppHome() {
  const [session, setSession] = useState(null);
  const [mode, setMode] = useState("signup"); // signup | login | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [wills, setWills] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) loadWills();
  }, [session]);

  async function loadWills() {
    const { data, error } = await supabase.from("wills").select("*").order("created_at", { ascending: false });
    if (!error) setWills(data || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: EMAIL_REDIRECT_TO },
      });
      if (error) {
        // Supabase returns this explicit error when email confirmation is
        // switched off; when it's on, a repeat signup instead comes back
        // as "success" with an empty identities array (its anti-enumeration
        // behaviour) — both are handled below.
        if (/already registered|already exists/i.test(error.message)) {
          setMessage("You already have an account with this email. Redirecting you to sign in…");
          setTimeout(() => setMode("login"), 1600);
        } else {
          setMessage(error.message);
        }
      } else if (data?.user && data.user.identities && data.user.identities.length === 0) {
        setMessage("You already have an account with this email. Redirecting you to sign in…");
        setTimeout(() => setMode("login"), 1600);
      } else {
        setMessage("Account created. Check your email to confirm it, then come back here and log in.");
      }
    } else if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setMessage(error ? error.message : "");
    } else if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: RESET_REDIRECT_TO });
      setMessage(
        error
          ? error.message
          : "If an account exists for that email, a password reset link has been sent — check your inbox."
      );
    }
    setLoading(false);
  }

  async function createDraftWill() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;
    const { error } = await supabase.from("wills").insert({
      user_id: user.id,
      jurisdiction: "england_wales",
      status: "draft",
    });
    if (error) setMessage(error.message);
    else loadWills();
  }

  async function signOut() {
    await supabase.auth.signOut();
    setWills([]);
  }

  if (session) {
    return (
      <div style={card}>
        <div style={{ fontSize: 13, color: "#7a7266", marginBottom: 8 }}>Signed in as</div>
        <div style={{ fontWeight: 700, marginBottom: 20 }}>{session.user.email}</div>

        <button style={btn} onClick={createDraftWill}>
          + Start a new Will
        </button>

        <div style={{ marginTop: 24 }}>
          <div style={label}>YOUR WILLS</div>
          {wills.length === 0 && (
            <p style={{ color: "#7a7266", fontSize: 14 }}>No Wills started yet — click the button above.</p>
          )}
          {wills.map((w) => (
            <WillRow key={w.id} will={w} linkedWill={w.linked_will_id ? wills.find((x) => x.id === w.linked_will_id) : null} onChanged={loadWills} />
          ))}
        </div>

        <button style={{ ...btn, background: "#f6e6dc", color: "#a8541f", marginTop: 24 }} onClick={signOut}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div style={card}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Draft My Will</h1>
      <p style={{ color: "#7a7266", fontSize: 14, marginBottom: 20 }}>
        {mode === "forgot" ? "Enter your email and we'll send you a reset link." : "Sign up or log in to start or continue your Will."}
      </p>

      {mode !== "forgot" && (
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <button
            onClick={() => { setMode("signup"); setMessage(""); }}
            style={{
              ...btn,
              background: mode === "signup" ? "#9c6b32" : "#f1e4d0",
              color: mode === "signup" ? "#fff8ee" : "#7a5225",
            }}
          >
            Sign up
          </button>
          <button
            onClick={() => { setMode("login"); setMessage(""); }}
            style={{
              ...btn,
              background: mode === "login" ? "#9c6b32" : "#f1e4d0",
              color: mode === "login" ? "#fff8ee" : "#7a5225",
            }}
          >
            Log in
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label style={label}>Email</label>
        <input style={input} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        {mode !== "forgot" && (
          <>
            <label style={label}>Password</label>
            <input
              style={input}
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </>
        )}
        <button style={btn} type="submit" disabled={loading}>
          {loading ? "Please wait…" : mode === "signup" ? "Create account" : mode === "login" ? "Log in" : "Send reset link"}
        </button>
      </form>

      {mode === "login" && (
        <button
          type="button"
          onClick={() => { setMode("forgot"); setMessage(""); }}
          style={{ background: "none", border: "none", color: "#7a5225", fontSize: 13, marginTop: 12, cursor: "pointer", padding: 0 }}
        >
          Forgotten your password?
        </button>
      )}
      {mode === "forgot" && (
        <button
          type="button"
          onClick={() => { setMode("login"); setMessage(""); }}
          style={{ background: "none", border: "none", color: "#7a5225", fontSize: 13, marginTop: 12, cursor: "pointer", padding: 0 }}
        >
          ← Back to sign in
        </button>
      )}

      {message && <p style={{ marginTop: 14, fontSize: 13, color: "#a8541f" }}>{message}</p>}

      <p style={{ marginTop: 18, fontSize: 13 }}>
        <a href="../" style={{ color: "#7a5225" }}>
          ← Back to homepage
        </a>
      </p>
    </div>
  );
}
