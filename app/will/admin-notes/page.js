"use client";

import WillStageShell from "../../../components/WillStageShell";
import WillPageFrame from "../../../components/WillPageFrame";
import ListStage from "../../../components/ListStage";

export default function AdminNotesPage() {
  return (
    <WillStageShell>
      {(willId, userId) => (
        <WillPageFrame
          willId={willId}
          current={11}
          desc="Practical notes for your executors — funeral wishes, digital accounts, pets, anything useful that isn't a legal instruction."
        >
          <ListStage
            willId={willId}
            userId={userId}
            table="admin_notes"
            emptyLabel="No notes added yet."
            fields={[{ key: "note_text", label: "Note", type: "textarea" }]}
          />
        </WillPageFrame>
      )}
    </WillStageShell>
  );
}
