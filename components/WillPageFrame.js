"use client";

import StageSidebar from "./StageSidebar";
import StageHeader from "./StageHeader";
import StageNav from "./StageNav";
import StageTopBar from "./StageTopBar";
import { STAGES } from "../lib/stages";
import { card, eyebrow } from "./styles";

// Wraps every stage page: top bar + sidebar + heading + your content +
// back/continue nav, plus an "unsaved changes" banner when unsaved={true}.
export default function WillPageFrame({ willId, current, desc, unsaved, nextLabel, children }) {
  const stage = STAGES.find((s) => s.n === current);
  const base = current === 1 ? "./" : "../";

  return (
    <div>
      <StageTopBar base={base} />
      <div
        style={{
          maxWidth: 960,
          margin: "14px auto 30px",
          display: "flex",
          gap: 24,
          alignItems: "flex-start",
          padding: "0 16px 40px",
        }}
      >
      <StageSidebar base={base} current={current} willId={willId} />
      <div style={{ ...card, flex: 1, minWidth: 0 }}>
        <StageHeader n={current} title={stage.label} desc={desc} />
        {children}

        {unsaved && (
          <div
            style={{
              marginTop: 16,
              background: "#fdf1e0",
              border: "1px solid #e9c98a",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              color: "#8a5b12",
              fontWeight: 600,
            }}
          >
            ⚠ You have unsaved changes on this page — click Save before moving on, or they'll be lost.
          </div>
        )}

        <StageNav current={current} base={base} willId={willId} nextLabel={nextLabel} />
      </div>
      </div>
    </div>
  );
}
