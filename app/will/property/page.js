"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import WillStageShell from "../../../components/WillStageShell";
import WillPageFrame from "../../../components/WillPageFrame";
import ListStage from "../../../components/ListStage";

const BASE_FIELDS = [
  { key: "description", label: "Property description / address", type: "textarea" },
  {
    key: "ownership_type",
    label: "Ownership type",
    type: "select",
    default: "sole",
    options: [
      ["sole", "Sole owner"],
      ["joint_tenants", "Joint tenants (passes automatically to the other owner)"],
      ["tenants_in_common", "Tenants in common (your share passes via your Will)"],
    ],
  },
];

// Scotland doesn't use "joint tenants / tenants in common" — title and
// survivorship work differently there, and a survivorship/special
// destination can mean a property passes outside the Will altogether.
// We ask the question rather than mapping the England & Wales terminology
// across, and don't guess when the answer isn't known.
const SCOTLAND_FIELDS = [
  {
    key: "scotland_title_position",
    label: "How is the title held? (Scotland)",
    type: "select",
    default: "not_sure",
    options: [
      ["sole", "I'm the sole owner on the title"],
      ["joint_survivorship", "Jointly owned, with a survivorship/special destination"],
      ["joint_no_survivorship", "Jointly owned, no survivorship destination"],
      ["not_sure", "Not sure — need to check the title deeds"],
    ],
  },
];

function PropertyForm({ willId, userId }) {
  const [jurisdiction, setJurisdiction] = useState(null);

  useEffect(() => {
    supabase
      .from("wills")
      .select("jurisdiction")
      .eq("id", willId)
      .maybeSingle()
      .then(({ data }) => setJurisdiction(data?.jurisdiction || "england_wales"));
  }, [willId]);

  if (jurisdiction === null) return <p>Loading…</p>;

  const isScotland = jurisdiction === "scotland";
  const fields = isScotland ? [...BASE_FIELDS, ...SCOTLAND_FIELDS] : BASE_FIELDS;

  return (
    <div>
      {isScotland && (
        <div
          style={{
            background: "#f6e6dc",
            border: "1px solid #e9c3a8",
            borderRadius: 10,
            padding: 14,
            marginBottom: 16,
            fontSize: 13,
            color: "#4a5867",
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: "#a8541f" }}>Scottish property can pass outside your Will.</strong> If a property
          has a survivorship or special destination on the title, it can go straight to the other owner regardless
          of what your Will says. If you're not sure which applies, say so below rather than guessing — check your
          title deeds or ask a solicitor before relying on this Will for that property.
        </div>
      )}
      <ListStage
        willId={willId}
        userId={userId}
        table="properties"
        emptyLabel="No property added yet."
        fields={fields}
      />
    </div>
  );
}

export default function PropertyPage() {
  return (
    <WillStageShell>
      {(willId, userId) => (
        <WillPageFrame willId={willId} current={5} desc="Any homes or land you own — including property abroad — and how you hold them.">
          <PropertyForm willId={willId} userId={userId} />
        </WillPageFrame>
      )}
    </WillStageShell>
  );
}
