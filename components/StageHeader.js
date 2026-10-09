"use client";

import { useState } from "react";
import { eyebrow } from "./styles";
import { STAGE_HELP } from "../lib/stageHelp";

export default function StageHeader({ n, title, desc }) {
  const [helpOpen, setHelpOpen] = useState(false);
  const help = STAGE_HELP[n];

  return (
    <>
      <div style={eyebrow}>Stage {n} of 15</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>{title}</h1>
        {help && (
          <button
            type="button"
            onClick={() => setHelpOpen((v) => !v)}
            aria-label="Help for this page"
            title="Help for this page"
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              border: "1px solid #9c6b32",
              background: helpOpen ? "#9c6b32" : "#fff",
              color: helpOpen ? "#fff8ee" : "#9c6b32",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              flexShrink: 0,
              lineHeight: 1,
              padding: 0,
            }}
          >
            ?
          </button>
        )}
      </div>
      {desc && <p style={{ color: "#7a7266", fontSize: 14, marginTop: 6, marginBottom: helpOpen ? 12 : 20 }}>{desc}</p>}
      {help && helpOpen && (
        <div
          style={{
            background: "#f1e4d0",
            border: "1px solid #e3d9c8",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 20,
          }}
        >
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color: "#4a5867", lineHeight: 1.7 }}>
            {help.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
