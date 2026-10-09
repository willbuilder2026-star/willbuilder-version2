"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import WillStageShell from "../../../components/WillStageShell";
import WillPageFrame from "../../../components/WillPageFrame";
import ListStage from "../../../components/ListStage";
import { input, label, btn } from "../../../components/styles";

function ModeForm({ willId, userId, onDirtyChange, simpleMode, setSimpleMode }) {
  const [loadingRow, setLoadingRow] = useState(true);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    load();
  }, [willId]);

  async function load() {
    setLoadingRow(true);
    const { data, error } = await supabase.from("pensions").select("*").eq("will_id", willId).maybeSingle();
    if (!error && data) setSimpleMode(data.simple_mode);
    setLoadingRow(false);
    onDirtyChange(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage("");
    const { error } = await supabase.from("pensions").upsert(
      { will_id: willId, user_id: userId, simple_mode: simpleMode },
      { onConflict: "will_id" }
    );
    if (error) {
      setMessage(error.message);
    } else {
      setSaved(true);
      onDirtyChange(false);
      setMessage("Saved.");
      setTimeout(() => setSaved(false), 1800);
    }
  }

  if (loadingRow) return <p>Loading your answers…</p>;

  return (
    <form onSubmit={handleSave}>
      <label style={label}>How do you want to handle pensions?</label>
      <select
        style={input}
        value={simpleMode ? "simple" : "detailed"}
        onChange={(e) => {
          setSimpleMode(e.target.value === "simple");
          onDirtyChange(true);
        }}
      >
        <option value="simple">Keep it simple — most pensions pass via a separate nomination form, not your Will</option>
        <option value="detailed">I want to add my pension(s) for reference</option>
      </select>

      <p style={{ fontSize: 13, color: "#7a7266", marginTop: -6, marginBottom: 14 }}>
        Most UK pensions are paid at the pension provider's discretion to whoever you name on a separate
        "expression of wishes" or nomination form — they don't usually pass through your Will. It's worth
        checking your nomination is up to date directly with your provider(s). If you have more than one
        pension, you can add each one separately below.
      </p>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button style={btn} type="submit">
          {saved ? "Saved ✓" : "Save"}
        </button>
      </div>
      {message && !saved && <p style={{ marginTop: 12, fontSize: 13, color: "#a8541f" }}>{message}</p>}
    </form>
  );
}

function PensionsPageInner({ willId, userId }) {
  const [dirty, setDirty] = useState(false);
  const [simpleMode, setSimpleMode] = useState(true);
  return (
    <WillPageFrame
      willId={willId}
      current={6}
      desc="Pensions and death-in-service benefits — usually paid via a separate nomination form with your provider rather than through your Will itself, but you can list them here for reference."
      unsaved={dirty}
    >
      <ModeForm willId={willId} userId={userId} onDirtyChange={setDirty} simpleMode={simpleMode} setSimpleMode={setSimpleMode} />
      {!simpleMode && (
        <ListStage
          heading="Your pension(s)"
          emptyLabel="No pensions added yet."
          willId={willId}
          userId={userId}
          table="pension_entries"
          fields={[
            { key: "provider", label: "Pension provider / scheme name", type: "text" },
            { key: "notes", label: "Notes (optional)", type: "textarea" },
          ]}
        />
      )}
    </WillPageFrame>
  );
}

export default function PensionsPage() {
  return <WillStageShell>{(willId, userId) => <PensionsPageInner willId={willId} userId={userId} />}</WillStageShell>;
}
