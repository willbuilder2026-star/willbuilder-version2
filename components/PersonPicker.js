"use client";

import { useEffect, useState } from "react";
import { fetchKnownPeople } from "../lib/willData";
import { input } from "./styles";

// A name field that offers everyone already entered elsewhere in this Will
// (partner, children, guardians, executors, beneficiaries) as a dropdown,
// with a "someone else" option that reveals a free-text box.
export default function PersonPicker({ willId, value, onChange }) {
  const [people, setPeople] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [customMode, setCustomMode] = useState(false);

  useEffect(() => {
    if (!willId) return;
    fetchKnownPeople(willId).then((names) => {
      setPeople(names);
      setLoaded(true);
      if (value && !names.includes(value)) setCustomMode(true);
    });
  }, [willId]);

  if (!loaded || people.length === 0 || customMode) {
    return (
      <div>
        <input style={input} type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Full name" />
        {loaded && people.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setCustomMode(false);
              onChange("");
            }}
            style={{ fontSize: 12, color: "#7a5225", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: -10, marginBottom: 10 }}
          >
            ← choose from people already listed on this Will instead
          </button>
        )}
      </div>
    );
  }

  return (
    <select
      style={input}
      value={people.includes(value) ? value : ""}
      onChange={(e) => {
        if (e.target.value === "__other__") {
          setCustomMode(true);
          onChange("");
        } else {
          onChange(e.target.value);
        }
      }}
    >
      <option value="" disabled>
        Choose a person…
      </option>
      {people.map((p) => (
        <option key={p} value={p}>
          {p}
        </option>
      ))}
      <option value="__other__">Someone else (type a name)…</option>
    </select>
  );
}
