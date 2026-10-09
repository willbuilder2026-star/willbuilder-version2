"use client";

import { buildFamilyMapModel, buildFamilyMapSvg } from "../lib/familyMap";

// Read-only — it draws whatever has actually been entered on this stage,
// rather than being a separate thing to edit, so it can never say
// something different from the Will itself.
export default function FamilyEstateMap({ data }) {
  if (!data) return null;
  const model = buildFamilyMapModel(data);

  if (model.beneficiaries.length === 0) {
    return (
      <p style={{ fontSize: 13.5, color: "#7a7266" }}>
        Add a residuary beneficiary below to see your Family &amp; Estate Map.
      </p>
    );
  }

  const svg = buildFamilyMapSvg(model);

  return (
    <div style={{ border: "1px solid #e3d9c8", borderRadius: 12, background: "#fff", overflow: "hidden" }}>
      <div style={{ padding: "10px 16px", background: "#f1e4d0", fontSize: 12.5, color: "#4a5867", borderBottom: "1px solid #e3d9c8" }}>
        Generated from what you've entered below — it updates automatically as you add, edit or remove beneficiaries.
      </div>
      <div style={{ padding: 16, overflowX: "auto" }} dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}
