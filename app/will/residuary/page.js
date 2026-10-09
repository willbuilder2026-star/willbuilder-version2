"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { fetchWillData } from "../../../lib/willData";
import WillStageShell from "../../../components/WillStageShell";
import WillPageFrame from "../../../components/WillPageFrame";
import PersonPicker from "../../../components/PersonPicker";
import FamilyEstateMap from "../../../components/FamilyEstateMap";
import { input, label, btn, btnSmall, rowItem } from "../../../components/styles";

const CONTINGENCY_OPTIONS = [
  ["none", "No special provision — normal residuary rules apply"],
  ["to_children", "Passes to specific people they choose (name them below)"],
  ["redistribute", "Redistributed among the other beneficiaries below"],
];

function contingencyLabel(value) {
  const found = CONTINGENCY_OPTIONS.find(([v]) => v === value);
  return found ? found[1] : value;
}

// The nested "name who this share passes to" editor for one beneficiary.
// Whoever's named here doesn't have to be that beneficiary's own child —
// it could be a niece, a nephew, a friend, anyone the person chooses.
// Kept separate from ListStage because it's scoped to a single
// beneficiary_id rather than a whole will, and sits inline under that
// beneficiary's row.
function BeneficiaryChildren({ willId, userId, beneficiaryId, beneficiaryShare, onChange }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", share_percent: "" });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, [beneficiaryId]);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("residuary_beneficiary_children")
      .select("*")
      .eq("beneficiary_id", beneficiaryId)
      .order("created_at");
    setRows(data || []);
    setLoading(false);
    onChange?.();
  }

  function startEdit(row) {
    setEditingId(row.id);
    setForm({ name: row.name, share_percent: row.share_percent ?? "" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ name: "", share_percent: "" });
    setError("");
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.name) {
      setError("Give this person a name.");
      return;
    }
    const payload = {
      name: form.name,
      share_percent: form.share_percent === "" ? null : Number(form.share_percent),
    };
    if (editingId) {
      const { error } = await supabase.from("residuary_beneficiary_children").update(payload).eq("id", editingId);
      if (error) return setError(error.message);
    } else {
      const { error } = await supabase
        .from("residuary_beneficiary_children")
        .insert({ will_id: willId, user_id: userId, beneficiary_id: beneficiaryId, ...payload });
      if (error) return setError(error.message);
    }
    cancelEdit();
    load();
  }

  async function remove(id) {
    await supabase.from("residuary_beneficiary_children").delete().eq("id", id);
    if (editingId === id) cancelEdit();
    load();
  }

  return (
    <div style={{ marginTop: 10, paddingLeft: 14, borderLeft: "2px solid #e3d9c8" }}>
      <p style={{ fontSize: 12.5, color: "#7a7266", margin: "0 0 8px" }}>
        Name anyone this share should pass to if this beneficiary dies before you — their own children, a niece or
        nephew, a friend, anyone you choose. Leave "Share" blank for someone to split what's left of this
        beneficiary's {beneficiaryShare}% equally with anyone else left blank — or give each an exact percentage if
        you'd rather split it unevenly.
      </p>
      {loading ? (
        <p style={{ fontSize: 13, color: "#7a7266" }}>Loading…</p>
      ) : rows.length === 0 ? (
        <p style={{ fontSize: 13, color: "#7a7266" }}>No one named yet.</p>
      ) : (
        rows.map((row) => (
          <div key={row.id} style={{ ...rowItem, marginTop: 8, borderColor: editingId === row.id ? "#9c6b32" : "#e3d9c8" }}>
            <div>
              <strong>{row.name}</strong> — {row.share_percent === null || row.share_percent === undefined ? "equal share" : `${row.share_percent}%`}
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button type="button" style={btnSmall} onClick={() => startEdit(row)}>
                Edit
              </button>
              <button type="button" style={{ ...btnSmall, background: "#f6e6dc", color: "#a8541f" }} onClick={() => remove(row.id)}>
                Remove
              </button>
            </div>
          </div>
        ))
      )}
      <form onSubmit={submit} style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div>
          <label style={{ ...label, marginBottom: 4 }}>Their name</label>
          <input style={{ ...input, margin: 0, width: 200 }} type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label style={{ ...label, marginBottom: 4 }}>Share % (optional)</label>
          <input
            style={{ ...input, margin: 0, width: 90 }}
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={form.share_percent}
            onChange={(e) => setForm({ ...form, share_percent: e.target.value })}
          />
        </div>
        <button type="submit" style={btnSmall}>
          {editingId ? "Save" : "+ Add person"}
        </button>
        {editingId && (
          <button type="button" style={{ ...btnSmall, background: "#eee", color: "#4a5867" }} onClick={cancelEdit}>
            Cancel
          </button>
        )}
      </form>
      {error && <p style={{ marginTop: 8, fontSize: 13, color: "#a8541f" }}>{error}</p>}
    </div>
  );
}

const SPOUSE_MODE_OPTIONS = [
  ["off", "No — split the residuary estate as set out below regardless"],
  ["outright", "Yes, outright — everything to my partner; the beneficiaries below only inherit if they don't survive me"],
  ["life_interest", "Yes, but protect it for my own beneficiaries too (life interest) — needs legal review"],
];

function ResiduaryForm({ willId, userId }) {
  const [loading, setLoading] = useState(true);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [spouseMode, setSpouseMode] = useState("off");
  const [hasPartner, setHasPartner] = useState(false);
  const [partnerName, setPartnerName] = useState("");
  const [form, setForm] = useState({ name: "", share_percent: "", contingency: "none" });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [mapData, setMapData] = useState(null);

  useEffect(() => {
    load();
  }, [willId]);

  async function load() {
    setLoading(true);
    const [{ data: rows }, { data: settings }, { data: partner }, fullData] = await Promise.all([
      supabase.from("residuary_beneficiaries").select("*").eq("will_id", willId).order("created_at"),
      supabase.from("residuary_settings").select("*").eq("will_id", willId).maybeSingle(),
      supabase.from("will_partner").select("has_partner, partner_name").eq("will_id", willId).maybeSingle(),
      fetchWillData(willId),
    ]);
    setBeneficiaries(rows || []);
    if (settings) setSpouseMode(settings.spouse_mode || (settings.spouse_first ? "outright" : "off"));
    setHasPartner(!!partner?.has_partner);
    setPartnerName(partner?.partner_name || "");
    setMapData(fullData);
    setLoading(false);
  }

  async function refreshMap() {
    setMapData(await fetchWillData(willId));
  }

  async function saveSettings(nextValue) {
    setSpouseMode(nextValue);
    await supabase
      .from("residuary_settings")
      .upsert({ will_id: willId, user_id: userId, spouse_mode: nextValue, spouse_first: nextValue !== "off" }, { onConflict: "will_id" });
    if (nextValue === "life_interest") {
      // Auto-add a flagged admin note so executors — and whoever reviews
      // this Will — can't miss that a life interest trust is in play here.
      const { data: existing } = await supabase
        .from("admin_notes")
        .select("id")
        .eq("will_id", willId)
        .ilike("note_text", "%life interest%")
        .maybeSingle();
      if (!existing) {
        await supabase.from("admin_notes").insert({
          will_id: willId,
          user_id: userId,
          note_text:
            "This Will includes a life interest for my partner over the residuary estate (Stage 9) — this needs a properly drafted trust clause, reviewed by a qualified professional, before this Will is relied upon.",
        });
      }
    }
  }

  function startEdit(row) {
    setEditingId(row.id);
    setForm({ name: row.name, share_percent: row.share_percent, contingency: row.contingency || (row.deceased ? "to_children" : "none") });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ name: "", share_percent: "", contingency: "none" });
    setMessage("");
  }

  async function submitBeneficiary(e) {
    e.preventDefault();
    setMessage("");
    if (!form.name || form.share_percent === "") return;
    const payload = { name: form.name, share_percent: Number(form.share_percent), contingency: form.contingency };
    if (editingId) {
      const { error } = await supabase.from("residuary_beneficiaries").update(payload).eq("id", editingId);
      if (error) {
        setMessage(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("residuary_beneficiaries").insert({ will_id: willId, user_id: userId, ...payload });
      if (error) {
        setMessage(error.message);
        return;
      }
    }
    cancelEdit();
    load();
  }

  async function removeBeneficiary(id) {
    await supabase.from("residuary_beneficiaries").delete().eq("id", id);
    if (editingId === id) cancelEdit();
    load();
  }

  if (loading) return <p>Loading your answers…</p>;

  const total = beneficiaries.reduce((sum, b) => sum + Number(b.share_percent || 0), 0);
  const totalOk = Math.round(total * 100) / 100 === 100;

  return (
    <div>
      <label style={label}>If you have a partner, should they inherit everything first?</label>
      <select style={input} value={spouseMode} onChange={(e) => saveSettings(e.target.value)} disabled={!hasPartner}>
        {SPOUSE_MODE_OPTIONS.map(([val, lbl]) => (
          <option key={val} value={val}>
            {lbl}
          </option>
        ))}
      </select>
      {!hasPartner && (
        <p style={{ fontSize: 12.5, color: "#7a7266", marginTop: -8, marginBottom: 14 }}>
          You haven't recorded a partner on Stage 2 — add them there first if this applies to you.
        </p>
      )}

      {spouseMode === "life_interest" && (
        <div style={{ background: "#f6e6dc", border: "1px solid #e9c3a8", borderRadius: 10, padding: 14, marginTop: -4, marginBottom: 16, fontSize: 13, color: "#4a5867", lineHeight: 1.6 }}>
          <strong style={{ color: "#a8541f" }}>This needs legal review before you rely on it.</strong> A "life
          interest" normally means {partnerName || "your partner"} can live in your home or benefit from your
          estate for the rest of their life, but on their death it passes to the beneficiaries you've named below —
          rather than becoming {partnerName || "your partner"}'s to leave to whoever they choose. Getting the trust
          wording right matters, so this Will marks the clause as pending professional review rather than
          generating it automatically, and we've added a note about it to your Estate Administration Notes.
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <FamilyEstateMap data={mapData} />
      </div>

      <h3 style={{ fontSize: 15, marginTop: 24, marginBottom: 8 }}>Residuary beneficiaries</h3>
      <p style={{ fontSize: 13.5, color: "#7a7266", marginTop: -4 }}>
        Everything left over after debts, expenses, and the gifts you added earlier — split by percentage. Should add up to 100%.
      </p>

      {beneficiaries.length === 0 ? (
        <p style={{ fontSize: 13.5, color: "#7a7266" }}>No beneficiaries added yet.</p>
      ) : (
        beneficiaries.map((b) => {
          const contingency = b.contingency || (b.deceased ? "to_children" : "none");
          return (
            <div key={b.id} style={{ ...rowItem, flexDirection: "column", alignItems: "stretch", borderColor: editingId === b.id ? "#9c6b32" : "#e3d9c8" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div>
                  <strong>{b.name}</strong> — {b.share_percent}%
                  {contingency !== "none" && <span style={{ color: "#a8541f" }}> ({contingencyLabel(contingency)})</span>}
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button type="button" style={btnSmall} onClick={() => startEdit(b)}>
                    Edit
                  </button>
                  <button type="button" style={{ ...btnSmall, background: "#f6e6dc", color: "#a8541f" }} onClick={() => removeBeneficiary(b.id)}>
                    Remove
                  </button>
                </div>
              </div>
              {contingency === "to_children" && (
                <BeneficiaryChildren willId={willId} userId={userId} beneficiaryId={b.id} beneficiaryShare={b.share_percent} onChange={refreshMap} />
              )}
            </div>
          );
        })
      )}

      <div style={{ marginTop: 10, fontSize: 13.5, fontWeight: 700, color: totalOk ? "#3a7a4e" : "#a8541f" }}>
        Total: {total}% {totalOk ? "✓" : "— should add up to 100%"}
      </div>

      <form onSubmit={submitBeneficiary} style={{ marginTop: 14, background: editingId ? "#fdf1e0" : "#faf7f1", border: `1px solid ${editingId ? "#e9c98a" : "#e3d9c8"}`, borderRadius: 10, padding: 14 }}>
        {editingId && <div style={{ fontSize: 12, fontWeight: 700, color: "#8a5b12", marginBottom: 8 }}>Editing — changes replace the entry above</div>}
        <label style={label}>Beneficiary name</label>
        <PersonPicker willId={willId} value={form.name} onChange={(v) => setForm({ ...form, name: v })} />

        <label style={label}>Share (%)</label>
        <input
          style={input}
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={form.share_percent}
          onChange={(e) => setForm({ ...form, share_percent: e.target.value })}
        />

        <label style={label}>If they predecease me, what happens to their share?</label>
        <select style={input} value={form.contingency} onChange={(e) => setForm({ ...form, contingency: e.target.value })}>
          {CONTINGENCY_OPTIONS.map(([val, lbl]) => (
            <option key={val} value={val}>
              {lbl}
            </option>
          ))}
        </select>
        {form.contingency === "to_children" && (
          <p style={{ fontSize: 12.5, color: "#7a7266", marginTop: -8, marginBottom: 12 }}>
            You'll be able to name whoever this share should go to once you've saved this beneficiary — their own
            children, a niece or nephew, anyone at all. If nobody's named later on, it's treated as "redistributed"
            instead — there's otherwise nobody for the share to go to.
          </p>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" style={btnSmall}>
            {editingId ? "Save changes" : "+ Add beneficiary"}
          </button>
          {editingId && (
            <button type="button" style={{ ...btnSmall, background: "#eee", color: "#4a5867" }} onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
        {message && <p style={{ marginTop: 10, fontSize: 13, color: "#a8541f" }}>{message}</p>}
      </form>
    </div>
  );
}

export default function ResiduaryPage() {
  return (
    <WillStageShell>
      {(willId, userId) => (
        <WillPageFrame willId={willId} current={9} desc="Who gets what's left of your estate, once specific and charitable gifts are accounted for.">
          <ResiduaryForm willId={willId} userId={userId} />
        </WillPageFrame>
      )}
    </WillStageShell>
  );
}
