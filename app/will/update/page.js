"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import WillStageShell from "../../../components/WillStageShell";
import WillPageFrame from "../../../components/WillPageFrame";
import ListStage from "../../../components/ListStage";

function UpdateInner({ willId, userId }) {
  const [jurisdiction, setJurisdiction] = useState(null);

  useEffect(() => {
    supabase
      .from("wills")
      .select("jurisdiction")
      .eq("id", willId)
      .maybeSingle()
      .then(({ data }) => setJurisdiction(data?.jurisdiction || "england_wales"));
  }, [willId]);

  return (
    <>
      {jurisdiction === "scotland" && (
        <div
          style={{
            background: "#f1e9df",
            border: "1px solid #e3d9c8",
            borderRadius: 10,
            padding: 14,
            marginBottom: 18,
            fontSize: 13,
            color: "#4a5867",
            lineHeight: 1.6,
          }}
        >
          <strong>Scotland — two things worth checking after a life change:</strong> marrying or entering a civil
          partnership does not cancel this Will, so it stays valid (and possibly outdated) until you update it.
          And if you've divorced since this Will was made, Scots law generally excludes an ex-spouse automatically
          from inheriting or acting as executor under it — but it's still worth checking the Will itself reflects
          that clearly, and logging it below.
        </div>
      )}

      <ListStage
        willId={willId}
        userId={userId}
        table="amendment_log"
        emptyLabel="No changes logged yet."
        fields={[
          {
            key: "kind",
            label: "Type of change",
            type: "select",
            default: "correction",
            options: [
              ["correction", "Correction (fixing a mistake)"],
              ["revision", "Revision (life change — new beneficiary, new address, etc.)"],
            ],
          },
          { key: "description", label: "What needs to change", type: "textarea" },
        ]}
      />

      <p style={{ fontSize: 13.5, color: "#7a7266", marginTop: 4 }}>
        To make the actual change, go back to the relevant stage and update your answers, then revisit{" "}
        <a href={`../document/?id=${willId}`} style={{ color: "#7a5225" }}>
          Document Pack
        </a>{" "}
        and{" "}
        <a href={`../signing/?id=${willId}`} style={{ color: "#7a5225" }}>
          Signing
        </a>{" "}
        to produce and sign an updated version.
      </p>
    </>
  );
}

export default function UpdatePage() {
  return (
    <WillStageShell>
      {(willId, userId) => (
        <WillPageFrame
          willId={willId}
          current={15}
          desc="You get 30 days of free changes after signing. After that, updates are available at a low cost — log any change you want to make here."
        >
          <UpdateInner willId={willId} userId={userId} />
        </WillPageFrame>
      )}
    </WillStageShell>
  );
}
