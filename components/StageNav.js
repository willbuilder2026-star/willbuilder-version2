import { STAGES, stageHref, dashboardHref } from "../lib/stages";
import { btn } from "./styles";

// Every page gets the same wording automatically: "← Back to Stage X: …"
// and "Save & Continue to Stage Y: … →", driven off the shared STAGES list.
export default function StageNav({ current, base, willId, nextLabel }) {
  const backStage = STAGES.find((s) => s.n === current - 1);
  const nextStage = STAGES.find((s) => s.n === current + 1);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 24,
        paddingTop: 18,
        borderTop: "1px solid #e3d9c8",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      {backStage ? (
        <a href={stageHref(base, backStage.slug, willId)} style={{ color: "#7a5225", fontSize: 14 }}>
          ← Back to Stage {backStage.n}: {backStage.label}
        </a>
      ) : (
        <span />
      )}

      {nextStage ? (
        <a href={stageHref(base, nextStage.slug, willId)} style={{ ...btn, textDecoration: "none", display: "inline-block" }}>
          {nextLabel || `Save & Continue to Stage ${nextStage.n}: ${nextStage.label}`} →
        </a>
      ) : (
        <a href={dashboardHref(base)} style={{ ...btn, textDecoration: "none", display: "inline-block" }}>
          Finish — back to your Wills
        </a>
      )}
    </div>
  );
}
