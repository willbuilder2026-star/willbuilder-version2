"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { isValidUKPostcode, normalisePostcode } from "../lib/postcode";
import { input, label, btnSmall, rowItem } from "./styles";
import PersonPicker from "./PersonPicker";

// Generic "add / edit / list / delete" form for a Supabase table keyed by
// will_id. fields: [{ key, label, type: "text"|"date"|"textarea"|"select"|"person"|"postcode", options?, default? }]
export default function ListStage({ willId, userId, table, fields, heading, emptyLabel = "Nothing added yet." }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null); // null = adding new
  const blank = () => Object.fromEntries(fields.map((f) => [f.key, f.default ?? ""]));
  const [form, setForm] = useState(blank());

  useEffect(() => {
    if (willId) load();
  }, [willId]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("will_id", willId)
      .order("created_at", { ascending: true });
    if (!error) setRows(data || []);
    setLoading(false);
  }

  function startEdit(row) {
    setError("");
    setEditingId(row.id);
    setForm(Object.fromEntries(fields.map((f) => [f.key, row[f.key] ?? f.default ?? ""])));
    window.scrollTo?.({ top: window.scrollY }); // no-op, keeps position; form is inline below the list
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(blank());
    setError("");
  }

  function validate() {
    for (const f of fields) {
      if (f.type === "postcode" && form[f.key] && !isValidUKPostcode(form[f.key])) {
        setError(`"${form[f.key]}" doesn't look like a valid UK postcode.`);
        return false;
      }
    }
    return true;
  }

  async function submitRow(e) {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    const payload = {};
    for (const f of fields) {
      let v = form[f.key] || null;
      if (f.type === "postcode" && v) v = normalisePostcode(v);
      payload[f.key] = v;
    }

    if (editingId) {
      const { error } = await supabase.from(table).update(payload).eq("id", editingId);
      if (error) {
        setError(error.message);
        return;
      }
      setEditingId(null);
    } else {
      const { error } = await supabase.from(table).insert({ will_id: willId, user_id: userId, ...payload });
      if (error) {
        setError(error.message);
        return;
      }
    }
    setForm(blank());
    load();
  }

  async function removeRow(id) {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (!error) {
      if (editingId === id) cancelEdit();
      load();
    }
  }

  function displayValue(f, row) {
    const v = row[f.key];
    if (f.type === "select" && f.options) {
      const found = f.options.find(([val]) => val === v);
      return found ? found[1] : v;
    }
    return v;
  }

  return (
    <div style={{ marginBottom: 22 }}>
      {heading && <h3 style={{ fontSize: 15, marginBottom: 8 }}>{heading}</h3>}

      {loading ? (
        <p style={{ fontSize: 13.5, color: "#7a7266" }}>Loading…</p>
      ) : rows.length === 0 ? (
        <p style={{ fontSize: 13.5, color: "#7a7266" }}>{emptyLabel}</p>
      ) : (
        rows.map((row) => (
          <div key={row.id} style={{ ...rowItem, borderColor: editingId === row.id ? "#9c6b32" : "#e3d9c8" }}>
            <div>
              {fields.map((f) => (
                <div key={f.key} style={{ marginBottom: 2 }}>
                  <strong>{f.label}:</strong> {displayValue(f, row) || "—"}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button type="button" style={btnSmall} onClick={() => startEdit(row)}>
                Edit
              </button>
              <button type="button" style={{ ...btnSmall, background: "#f6e6dc", color: "#a8541f" }} onClick={() => removeRow(row.id)}>
                Remove
              </button>
            </div>
          </div>
        ))
      )}

      <form
        onSubmit={submitRow}
        style={{
          marginTop: 14,
          background: editingId ? "#fdf1e0" : "#faf7f1",
          border: `1px solid ${editingId ? "#e9c98a" : "#e3d9c8"}`,
          borderRadius: 10,
          padding: 14,
        }}
      >
        {editingId && <div style={{ fontSize: 12, fontWeight: 700, color: "#8a5b12", marginBottom: 8 }}>Editing — changes replace the entry above</div>}

        {fields.map((f) => (
          <div key={f.key}>
            <label style={label}>{f.label}</label>
            {f.type === "person" ? (
              <PersonPicker willId={willId} value={form[f.key]} onChange={(v) => setForm({ ...form, [f.key]: v })} />
            ) : f.type === "postcode" ? (
              <input
                style={{ ...input, maxWidth: 160, textTransform: "uppercase" }}
                type="text"
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                onBlur={(e) => {
                  if (e.target.value) setForm((old) => ({ ...old, [f.key]: normalisePostcode(e.target.value) }));
                }}
                placeholder="e.g. OL6 7RB"
              />
            ) : f.type === "textarea" ? (
              <textarea
                style={{ ...input, minHeight: 60 }}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            ) : f.type === "select" ? (
              <select
                style={input}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              >
                {f.options.map(([val, lbl]) => (
                  <option key={val} value={val}>
                    {lbl}
                  </option>
                ))}
              </select>
            ) : (
              <input
                style={input}
                type={f.type || "text"}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            )}
          </div>
        ))}
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" style={btnSmall}>
            {editingId ? "Save changes" : "+ Add"}
          </button>
          {editingId && (
            <button type="button" style={{ ...btnSmall, background: "#eee", color: "#4a5867" }} onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
        {error && <p style={{ marginTop: 10, fontSize: 13, color: "#a8541f" }}>{error}</p>}
      </form>
    </div>
  );
}
