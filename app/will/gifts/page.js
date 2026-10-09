"use client";

import WillStageShell from "../../../components/WillStageShell";
import WillPageFrame from "../../../components/WillPageFrame";
import ListStage from "../../../components/ListStage";

export default function GiftsPage() {
  return (
    <WillStageShell>
      {(willId, userId) => (
        <WillPageFrame
          willId={willId}
          current={7}
          desc="Anything specific you want to leave to a particular person: named items (a car, jewellery, a keepsake), an ISA, a savings or bank account, a specific sum of cash, or shares. Anything you don't list here just goes into the residuary estate later, split between your main beneficiaries."
        >
          <ListStage
            willId={willId}
            userId={userId}
            table="gifts"
            emptyLabel="No specific gifts added yet."
            fields={[
              { key: "item", label: "Item, account or amount (e.g. 'my car', 'my Nationwide ISA', '£1,000 in cash')", type: "text" },
              { key: "beneficiary", label: "Who it goes to", type: "person" },
            ]}
          />
        </WillPageFrame>
      )}
    </WillStageShell>
  );
}
