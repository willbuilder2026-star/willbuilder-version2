"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { createLinkedWill } from "../../../lib/linkedWill";
import { stageHref } from "../../../lib/stages";
import WillStageShell from "../../../components/WillStageShell";
import WillPageFrame from "../../../components/WillPageFrame";
import { input, label, btn, btnSmall } from "../../../components/styles";

// Shown only once "Linked Wills" was chosen on Stage 1. Lets the person
// create their partner's linked Will from here, once the partner's name
// is known — or, if it's already been created, links straight to it.
function LinkedWillBox({ willId, userId, hasPartner, partnerName }) {
  const [willRow, setWillRow] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [linkedName, setLinkedName] = useState("");

  useEffect(() => {
    load();
  }, [willId]);

  async function load() {
    const { data } = await supabase.from("wills").select("will_type, link_mode, linked_will_id").eq("id", willId).maybeSingle();
    setWillRow(data || null);
    if (data?.linked_will_id) {
      const { data: theirAbout } = await supabase.from("will_about").select("full_name").eq("will_id", data.linked_will_id).maybeSingle();
      setLinkedName(theirAbout?.full_name || "");
    }
  }

  async function handleCreate() {
    setError("");
    setCreating(true);
    try {
      await createLinkedWill({ originalWillId: willId, userId, linkMode: willRow.link_mode || "basics_only" });
      await load();
    } catch (err) {
      setError(err.message || "Something went wrong creating their linked Will.");
    } finally {
      setCreating(false);
    }
  }

  if (!willRow || willRow.will_type !== "couple") return null;

  return (
    <div style={{ marginTop: 20, background: "#f1e4d0", border: "1px solid #e3d9c8", borderRadius: 10, padding: 16 }}>
      {willRow.linked_will_id ? (
        <>
          <div style={{ fontSize: 13.5 }}>
            🔗 Linked with {linkedName ? `${linkedName}'s` : "your partner's"} Will.
          </div>
          <a href={stageHref("../", "", willRow.linked_will_id)} style={{ display: "inline-block", marginTop: 8, color: "#7a5225", fontWeight: 600, fontSize: 13.5 }}>
            Continue their Will →
          </a>
        </>
      ) : (
        <>
          <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 4 }}>You chose to set up linked Wills</div>
          {hasPartner && partnerName ? (
            <>
              <p style={{ fontSize: 13, color: "#4a5867", marginTop: 0 }}>
                Ready to create {partnerName}'s linked Will?{" "}
                {willRow.link_mode === "mirror"
                  ? "It'll start as a mirror of this one, with \"my partner\" swapped to mean you."
                  : "Your name, address and this partner link will fill in automatically."}
              </p>
              <button type="button" style={btnSmall} onClick={handleCreate} disabled={creating}>
                {creating ? "Creating…" : `Create ${partnerName}'s Will`}
              </button>
            </>
          ) : (
            <p style={{ fontSize: 13, color: "#4a5867", marginTop: 0 }}>
              Add your partner's name below and save it first — then you'll be able to create their linked Will from
              here.
            </p>
          )}
          {error && <p style={{ marginTop: 10, fontSize: 13, color: "#a8541f" }}>{error}</p>}
        </>
      )}
    </div>
  );
}

function PartnerForm({ willId, userId, onDirtyChange }) {
  const [loadingRow, setLoadingRow] = useState(true);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ has_partner: false, partner_name: "", partner_date_of_birth: "" });

  useEffect(() => {
    load();
  }, [willId]);

  async function load() {
    setLoadingRow(true);
    const { data, error } = await supabase.from("will_partner").select("*").eq("will_id", willId).maybeSingle();
    if (!error && data) {
      setForm({
        has_partner: !!data.has_partner,
        partner_name: data.partner_name || "",
        partner_date_of_birth: data.partner_date_of_birth || "",
      });
    }
    setLoadingRow(false);
    onDirtyChange(false);
  }

  function update(patch) {
    setForm((f) => ({ ...f, ...patch }));
    onDirtyChange(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage("");
    const { error } = await supabase.from("will_partner").upsert(
      {
        will_id: willId,
        user_id: userId,
        has_partner: form.has_partner,
        partner_name: form.has_partner ? form.partner_name : null,
        partner_date_of_birth: form.has_partner ? form.partner_date_of_birth || null : null,
      },
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
    <>
      <form onSubmit={handleSave}>
        <label style={label}>Do you have a partner?</label>
        <select style={input} value={form.has_partner ? "yes" : "no"} onChange={(e) => update({ has_partner: e.target.value === "yes" })}>
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>

        {form.has_partner && (
          <>
            <label style={label}>Partner's full name</label>
            <input style={input} type="text" value={form.partner_name} onChange={(e) => update({ partner_name: e.target.value })} />

            <label style={label}>Partner's date of birth</label>
            <input style={input} type="date" value={form.partner_date_of_birth} onChange={(e) => update({ partner_date_of_birth: e.target.value })} />
          </>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button style={btn} type="submit">
            {saved ? "Saved ✓" : "Save"}
          </button>
        </div>
        {message && !saved && <p style={{ marginTop: 12, fontSize: 13, color: "#a8541f" }}>{message}</p>}
      </form>
      <LinkedWillBox willId={willId} userId={userId} hasPartner={form.has_partner} partnerName={form.partner_name} />
    </>
  );
}

function PartnerPageInner({ willId, userId }) {
  const [dirty, setDirty] = useState(false);
  return (
    <WillPageFrame
      willId={willId}
      current={2}
      desc="Your partner's details, if you have one — used for the Family & Estate Map and anywhere you leave something to them specifically."
      unsaved={dirty}
    >
      <PartnerForm willId={willId} userId={userId} onDirtyChange={setDirty} />
    </WillPageFrame>
  );
}

export default function PartnerPage() {
  return <WillStageShell>{(willId, userId) => <PartnerPageInner willId={willId} userId={userId} />}</WillStageShell>;
}
