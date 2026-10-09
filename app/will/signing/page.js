"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { fetchWillData, JURISDICTION_LABELS } from "../../../lib/willData";
import { buildWillText } from "../../../lib/willText";
import { SIGNING_INSTRUCTIONS, SIGNING_WARNINGS } from "../../../lib/signingInstructions";
import WillStageShell from "../../../components/WillStageShell";
import WillPageFrame from "../../../components/WillPageFrame";
import { input, label, btn } from "../../../components/styles";

const instructions = SIGNING_INSTRUCTIONS;

function Signing({ willId }) {
  const [jurisdiction, setJurisdiction] = useState(null);
  const [storageNote, setStorageNote] = useState("");
  const [signed, setSigned] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("wills")
      .select("jurisdiction, status")
      .eq("id", willId)
      .maybeSingle()
      .then(({ data }) => {
        setJurisdiction(data?.jurisdiction);
        setSigned(data?.status === "executed");
      });
  }, [willId]);

  async function markSigned(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    const data = await fetchWillData(willId);
    const documentText = buildWillText(data.will?.jurisdiction, data);

    const { count } = await supabase.from("executed_wills").select("id", { count: "exact", head: true }).eq("will_id", willId);

    const { error: insertError } = await supabase.from("executed_wills").insert({
      will_id: willId,
      user_id: user.id,
      version_number: (count || 0) + 1,
      document_text: documentText,
      storage_location_note: storageNote || null,
      signed_copy_uploaded: false,
    });

    if (insertError) {
      setMessage(insertError.message);
      setSaving(false);
      return;
    }

    await supabase.from("wills").update({ status: "executed" }).eq("id", willId);
    setSigned(true);
    setSaving(false);
  }

  if (!jurisdiction) return <p>Loading…</p>;

  return (
    <div>
      <p style={{ fontSize: 14.5, color: "#4a5867", lineHeight: 1.7 }}>
        Signing instructions for <strong>{JURISDICTION_LABELS[jurisdiction]}</strong>:
      </p>
      <ol style={{ paddingLeft: 20, fontSize: 14, color: "#4a5867", lineHeight: 1.8 }}>
        {instructions[jurisdiction].map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>

      <div style={{ marginTop: 18, background: "#f6e6dc", border: "1px solid #e9c3a8", borderRadius: 10, padding: "14px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#a8541f", marginBottom: 6 }}>Before you sign — important</div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#4a5867", lineHeight: 1.7 }}>
          {SIGNING_WARNINGS.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      </div>

      {signed ? (
        <div style={{ marginTop: 20, background: "#eef5ee", border: "1px solid #bfe0c4", borderRadius: 10, padding: 16, fontSize: 14, color: "#2c5c38" }}>
          ✓ This Will is recorded as signed. Keep the physical, signed copy safe — this online record is not a
          substitute for the original paper document.
        </div>
      ) : (
        <form onSubmit={markSigned} style={{ marginTop: 20 }}>
          <label style={label}>Where will you keep the signed original? (optional note for yourself)</label>
          <input style={input} type="text" value={storageNote} onChange={(e) => setStorageNote(e.target.value)} placeholder="e.g. fireproof box at home, with my solicitor…" />

          <button style={btn} type="submit" disabled={saving}>
            {saving ? "Saving…" : "I've signed and witnessed my Will"}
          </button>
          {message && <p style={{ marginTop: 12, fontSize: 13, color: "#a8541f" }}>{message}</p>}
        </form>
      )}
    </div>
  );
}

export default function SigningPage() {
  return (
    <WillStageShell>
      {(willId) => (
        <WillPageFrame willId={willId} current={14} desc="Clear instructions for signing and witnessing correctly.">
          <Signing willId={willId} />
        </WillPageFrame>
      )}
    </WillStageShell>
  );
}
