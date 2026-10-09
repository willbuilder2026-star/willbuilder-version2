"use client";

import WillStageShell from "../../../components/WillStageShell";
import WillPageFrame from "../../../components/WillPageFrame";
import ListStage from "../../../components/ListStage";

export default function CharityPage() {
  return (
    <WillStageShell>
      {(willId, userId) => (
        <WillPageFrame willId={willId} current={8} desc="Any amounts or items you'd like to leave to charity.">
          <ListStage
            willId={willId}
            userId={userId}
            table="charity_gifts"
            emptyLabel="No charitable gifts added yet."
            fields={[
              { key: "charity_name", label: "Charity name", type: "text" },
              { key: "amount", label: "Amount (e.g. '£500' or '10% of residue')", type: "text" },
            ]}
          />
        </WillPageFrame>
      )}
    </WillStageShell>
  );
}
