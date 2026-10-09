"use client";

import WillStageShell from "../../../components/WillStageShell";
import WillPageFrame from "../../../components/WillPageFrame";
import ListStage from "../../../components/ListStage";

export default function ExecutorsPage() {
  return (
    <WillStageShell>
      {(willId, userId) => (
        <WillPageFrame
          willId={willId}
          current={4}
          desc="Who will carry out the wishes in your Will. Add a reserve executor as a backup in case your first choice can't act."
        >
          <ListStage
            willId={willId}
            userId={userId}
            table="executors"
            emptyLabel="No executors added yet."
            fields={[
              { key: "name", label: "Executor's full name", type: "person" },
              { key: "address", label: "Executor's address (excluding postcode)", type: "textarea" },
              { key: "postcode", label: "Postcode", type: "postcode" },
              {
                key: "role",
                label: "Role",
                type: "select",
                default: "primary",
                options: [
                  ["primary", "Primary"],
                  ["reserve", "Reserve (backup)"],
                ],
              },
            ]}
          />
        </WillPageFrame>
      )}
    </WillStageShell>
  );
}
