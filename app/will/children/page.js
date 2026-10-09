"use client";

import WillStageShell from "../../../components/WillStageShell";
import WillPageFrame from "../../../components/WillPageFrame";
import ListStage from "../../../components/ListStage";

export default function ChildrenPage() {
  return (
    <WillStageShell>
      {(willId, userId) => (
        <WillPageFrame
          willId={willId}
          current={3}
          desc="Your children, and who should look after them if they're still under 18 when you die."
        >
          <ListStage
            heading="Children"
            emptyLabel="No children added yet."
            willId={willId}
            userId={userId}
            table="children"
            fields={[
              { key: "name", label: "Child's full name", type: "text" },
              { key: "date_of_birth", label: "Date of birth", type: "date" },
            ]}
          />
          <ListStage
            heading="Guardians"
            emptyLabel="No guardians added yet."
            willId={willId}
            userId={userId}
            table="guardians"
            fields={[
              { key: "name", label: "Guardian's full name", type: "text" },
              { key: "address", label: "Guardian's address (excluding postcode)", type: "textarea" },
              { key: "postcode", label: "Postcode", type: "postcode" },
            ]}
          />
        </WillPageFrame>
      )}
    </WillStageShell>
  );
}
