"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { isValidUKPostcode, normalisePostcode } from "../../lib/postcode";
import { stageHref } from "../../lib/stages";
import { checkScotlandAgeEligibility } from "../../lib/jurisdictionRules";
import WillStageShell from "../../components/WillStageShell";
import WillPageFrame from "../../components/WillPageFrame";
import { input, label, btn } from "../../components/styles";

const warningBox = { background: "#f6e6dc", border: "1px solid #e9c3a8", borderRadius: 10, padding: 14, fontSize: 13, color: "#4a5867", lineHeight: 1.6 };
const infoBox = { background: "#f1e9df", border: "1px solid #e3d9c8", borderRadius: 10, padding: 14, fontSize: 13, color: "#4a5867", lineHeight: 1.6 };

const LINK_MODE_OPTIONS = [
  ["basics_only", "Share our basic household details only", "Your name, address and who your partner is fill in automatically on their Will. Everything else — executors, gifts, beneficiaries — is answered separately for each of you."],
  ["mirror", "Start both Wills as mirrors of each other", "Their Will starts as a copy of yours — same executors, gifts and beneficiaries, with \"my partner\" swapped to mean you instead. They can then edit or remove anything that isn't right for them."],
];

// Stage 1 opens with this: what kind of Will is being set up. A couple is
// always given two separate legal Wills, never a single joint document —
// this just decides whether, and how closely, the two are linked.
function WillTypeForm({ willId, onJurisdictionChange }) {
  const [loadingRow, setLoadingRow] = useState(true);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [jurisdiction, setJurisdiction] = useState("england_wales");
  const [willType, setWillType] = useState("individual");
  const [linkMode, setLinkMode] = useState("basics_only");
  const [linkedWillId, setLinkedWillId] = useState(null);
  const [linkedName, setLinkedName] = useState("");

  useEffect(() => {
    load();
  }, [willId]);

  async function load() {
    setLoadingRow(true);
    const { data } = await supabase.from("wills").select("jurisdiction, will_type, link_mode, linked_will_id").eq("id", willId).maybeSingle();
    if (data) {
      const jur = data.jurisdiction || "england_wales";
      setJurisdiction(jur);
      onJurisdictionChange?.(jur);
      setWillType(data.will_type || "individual");
      setLinkMode(data.link_mode || "basics_only");
      setLinkedWillId(data.linked_will_id || null);
      if (data.linked_will_id) {
        const { data: theirAbout } = await supabase.from("will_about").select("full_name").eq("will_id", data.linked_will_id).maybeSingle();
        setLinkedName(theirAbout?.full_name || "");
      }
    }
    setLoadingRow(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage("");
    const { error } = await supabase
      .from("wills")
      .update({
        jurisdiction,
        will_type: willType,
        link_mode: willType === "couple" ? linkMode : null,
      })
      .eq("id", willId);
    if (error) {
      setMessage(error.message);
    } else {
      onJurisdictionChange?.(jurisdiction);
      setSaved(true);
      setMessage("Saved.");
      setTimeout(() => setSaved(false), 1800);
    }
  }

  if (loadingRow) return <p>Loading…</p>;

  return (
    <div style={{ marginBottom: 26, paddingBottom: 22, borderBottom: "1px solid #e3d9c8" }}>
      <h3 style={{ fontSize: 15, marginTop: 0, marginBottom: 4 }}>What are you setting up?</h3>
      <p style={{ fontSize: 13.5, color: "#7a7266", marginTop: 0 }}>
        A couple is always given two separate legal Wills, one each — never a single joint Will — but you can link
        them so your partner isn't starting from a blank page.
      </p>

      {linkedWillId ? (
        <div style={{ background: "#f1e4d0", border: "1px solid #e3d9c8", borderRadius: 10, padding: 14, fontSize: 13.5, marginTop: 10 }}>
          🔗 This Will is linked with {linkedName ? `${linkedName}'s` : "your partner's"} Will.{" "}
          <a href={stageHref("./", "", linkedWillId)} style={{ color: "#7a5225", fontWeight: 600 }}>
            Continue their Will →
          </a>
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <label style={label}>Which country's Will do you need?</label>
          <select style={input} value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)}>
            <option value="england_wales">England & Wales</option>
            <option value="scotland">Scotland</option>
            <option value="northern_ireland">Northern Ireland</option>
          </select>
          <p style={{ fontSize: 12.5, color: "#7a7266", marginTop: -8, marginBottom: 14 }}>
            This is where you live and where the Will needs to be legally valid — it changes the signing
            instructions and some of the legal wording later on.
          </p>

          {jurisdiction === "scotland" && (
            <div style={{ ...infoBox, marginBottom: 14 }}>
              <strong>Two things that work differently in Scotland:</strong> getting married or entering a civil
              partnership does <em>not</em> cancel an existing Will here (unlike England &amp; Wales, where it
              does) — so if you've made a Will before and since married, it's still valid until you replace or
              formally revoke it. And if you've divorced since a previous Will, Scots law generally treats an
              ex-spouse as if they'd died before you for the purposes of that Will, unless it says otherwise —
              we'll flag this for you on the next stage if that applies.
            </div>
          )}

          <select style={input} value={willType} onChange={(e) => setWillType(e.target.value)}>
            <option value="individual">Just my own Will</option>
            <option value="couple">Linked Wills for me and my partner</option>
          </select>

          {willType === "couple" && (
            <div style={{ marginTop: 4, marginBottom: 6 }}>
              {LINK_MODE_OPTIONS.map(([val, title, desc]) => (
                <label
                  key={val}
                  style={{
                    display: "block",
                    border: `1px solid ${linkMode === val ? "#9c6b32" : "#e3d9c8"}`,
                    background: linkMode === val ? "#faf3ea" : "#fff",
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 8,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <input type="radio" name="link_mode" checked={linkMode === val} onChange={() => setLinkMode(val)} style={{ marginTop: 3 }} />
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700 }}>{title}</div>
                      <div style={{ fontSize: 12.5, color: "#7a7266", marginTop: 2 }}>{desc}</div>
                    </div>
                  </div>
                </label>
              ))}
              <p style={{ fontSize: 12.5, color: "#7a7266", marginTop: -2 }}>
                Once you've saved this and added your partner's name on the next stage, you'll get an option there to
                create their linked Will.
              </p>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button style={btn} type="submit">
              {saved ? "Saved ✓" : "Save"}
            </button>
          </div>
          {message && !saved && <p style={{ marginTop: 12, fontSize: 13, color: "#a8541f" }}>{message}</p>}
        </form>
      )}
    </div>
  );
}

function AboutForm({ willId, userId, onDirtyChange, jurisdiction }) {
  const [loadingRow, setLoadingRow] = useState(true);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [ageError, setAgeError] = useState("");
  const [postcodeError, setPostcodeError] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    date_of_birth: "",
    address: "",
    postcode: "",
    marital_status: "single",
  });

  useEffect(() => {
    loadAbout();
  }, [willId]);

  async function loadAbout() {
    setLoadingRow(true);
    const { data, error } = await supabase.from("will_about").select("*").eq("will_id", willId).maybeSingle();
    if (!error && data) {
      setForm({
        full_name: data.full_name || "",
        date_of_birth: data.date_of_birth || "",
        address: data.address || "",
        postcode: data.postcode || "",
        marital_status: data.marital_status || "single",
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
    setAgeError("");

    if (form.postcode && !isValidUKPostcode(form.postcode)) {
      setPostcodeError("That doesn't look like a valid UK postcode — check it and try again.");
      return;
    }
    setPostcodeError("");

    if (jurisdiction === "scotland" && form.date_of_birth) {
      const eligibility = checkScotlandAgeEligibility(form.date_of_birth);
      if (eligibility.tier === "under_capacity" || eligibility.tier === "restricted") {
        setAgeError(eligibility.message);
        return;
      }
    }

    const { error } = await supabase.from("will_about").upsert(
      {
        will_id: willId,
        user_id: userId,
        full_name: form.full_name,
        date_of_birth: form.date_of_birth || null,
        address: form.address,
        postcode: form.postcode ? normalisePostcode(form.postcode) : null,
        marital_status: form.marital_status,
      },
      { onConflict: "will_id" }
    );

    if (error) {
      setMessage(error.message);
      return;
    }

    // Scotland + divorced: auto-flag for the same reason the life interest
    // option flags itself on Stage 9 — so this can't be missed by whoever
    // reviews the Will later, without us trying to write the actual
    // exclusion clause ourselves.
    if (jurisdiction === "scotland" && form.marital_status === "divorced") {
      const { data: existingNote } = await supabase
        .from("admin_notes")
        .select("id")
        .eq("will_id", willId)
        .ilike("note_text", "%ex-spouse%")
        .maybeSingle();
      if (!existingNote) {
        await supabase.from("admin_notes").insert({
          will_id: willId,
          user_id: userId,
          note_text:
            "This Will is being made after a divorce (Scotland). Under the Succession (Scotland) Act 2016, an ex-spouse/civil partner is generally treated as having died before you for benefits, powers and executor appointments under this Will, unless it expressly says otherwise — check no ex-partner is still named as a beneficiary or executor, and make sure the Will is clear either way.",
        });
      }
    }

    setSaved(true);
    onDirtyChange(false);
    setMessage("Saved.");
    setTimeout(() => setSaved(false), 1800);
  }

  if (loadingRow) return <p>Loading your answers…</p>;

  return (
    <form onSubmit={handleSave}>
      <label style={label}>Full legal name</label>
      <input style={input} type="text" value={form.full_name} onChange={(e) => update({ full_name: e.target.value })} />

      <label style={label}>Date of birth</label>
      <input style={input} type="date" value={form.date_of_birth} onChange={(e) => update({ date_of_birth: e.target.value })} />

      {jurisdiction === "scotland" &&
        form.date_of_birth &&
        (() => {
          const eligibility = checkScotlandAgeEligibility(form.date_of_birth);
          if (eligibility.tier === "under_capacity" || eligibility.tier === "restricted") {
            return (
              <div style={{ ...warningBox, marginTop: -8, marginBottom: 14 }}>
                <strong style={{ color: "#a8541f" }}>Can't continue yet.</strong> {eligibility.message}
              </div>
            );
          }
          if (eligibility.tier === "ok" && eligibility.age < 18) {
            return (
              <div style={{ ...infoBox, marginTop: -8, marginBottom: 14 }}>
                Scottish law recognises your testamentary capacity from age 16, but as someone under 18 it's
                worth having a solicitor check this Will over before you rely on it.
              </div>
            );
          }
          return null;
        })()}

      {ageError && <p style={{ marginTop: -10, marginBottom: 14, fontSize: 13, color: "#a8541f" }}>{ageError}</p>}

      <label style={label}>Home address (excluding postcode)</label>
      <textarea style={{ ...input, minHeight: 70 }} value={form.address} onChange={(e) => update({ address: e.target.value })} />

      <label style={label}>Postcode</label>
      <input
        style={{ ...input, maxWidth: 160, textTransform: "uppercase" }}
        type="text"
        value={form.postcode}
        onChange={(e) => update({ postcode: e.target.value })}
        onBlur={(e) => {
          if (e.target.value) update({ postcode: normalisePostcode(e.target.value) });
        }}
        placeholder="e.g. OL6 7RB"
      />
      {postcodeError && <p style={{ marginTop: -10, marginBottom: 14, fontSize: 13, color: "#a8541f" }}>{postcodeError}</p>}

      <label style={label}>Marital status</label>
      <select style={input} value={form.marital_status} onChange={(e) => update({ marital_status: e.target.value })}>
        <option value="single">Single</option>
        <option value="married">Married</option>
        <option value="civil_partnership">Civil partnership</option>
        <option value="divorced">Divorced</option>
        <option value="widowed">Widowed</option>
      </select>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button style={btn} type="submit">
          {saved ? "Saved ✓" : "Save"}
        </button>
      </div>
      {message && !saved && <p style={{ marginTop: 12, fontSize: 13, color: "#a8541f" }}>{message}</p>}
    </form>
  );
}

function AboutPageInner({ willId, userId }) {
  const [dirty, setDirty] = useState(false);
  const [jurisdiction, setJurisdiction] = useState("england_wales");
  return (
    <WillPageFrame
      willId={willId}
      current={1}
      desc="Choose the kind of Will you're setting up, then the same core details are used for whichever jurisdiction you picked."
      unsaved={dirty}
    >
      <WillTypeForm willId={willId} onJurisdictionChange={setJurisdiction} />
      <AboutForm willId={willId} userId={userId} onDirtyChange={setDirty} jurisdiction={jurisdiction} />
    </WillPageFrame>
  );
}

export default function AboutPage() {
  return <WillStageShell base="./">{(willId, userId) => <AboutPageInner willId={willId} userId={userId} />}</WillStageShell>;
}
