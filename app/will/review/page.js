"use client";

import { useEffect, useState } from "react";
import { fetchWillData, JURISDICTION_LABELS } from "../../../lib/willData";
import { formatUKDate, sortChildren, sortExecutors } from "../../../lib/willText";
import WillStageShell from "../../../components/WillStageShell";
import WillPageFrame from "../../../components/WillPageFrame";

const section = { marginTop: 22 };
const sectionTitle = { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 15, fontWeight: 700 };
const editLink = { color: "#7a5225", fontSize: 13, fontWeight: 600, textDecoration: "none" };
const body = { fontSize: 14, color: "#4a5867", marginTop: 6, lineHeight: 1.6 };

function Review({ willId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchWillData(willId).then(setData);
  }, [willId]);

  if (!data) return <p>Loading your answers…</p>;

  const { will, about, partner, guardians, properties, pensions, pensionEntries, gifts, charityGifts, beneficiaries, adminNotes } = data;
  const children = sortChildren(data.children);
  const executors = sortExecutors(data.executors);

  return (
    <div>
      <p style={{ fontSize: 13, color: "#7a7266" }}>
        Jurisdiction: <strong>{JURISDICTION_LABELS[will?.jurisdiction] || will?.jurisdiction}</strong>
      </p>

      <div style={section}>
        <div style={sectionTitle}>
          About you <a href={`../?id=${willId}`} style={editLink}>Edit</a>
        </div>
        <div style={body}>
          {about?.full_name || "—"}
          {about?.date_of_birth ? `, born ${formatUKDate(about.date_of_birth)}` : ""}
          {about?.marital_status ? ` · ${about.marital_status.replace("_", " ")}` : ""}
          <br />
          {about?.address || ""}
          {about?.postcode ? `, ${about.postcode}` : ""}
        </div>
      </div>

      <div style={section}>
        <div style={sectionTitle}>
          Partner <a href={`../partner/?id=${willId}`} style={editLink}>Edit</a>
        </div>
        <div style={body}>{partner?.has_partner ? partner.partner_name : "No partner recorded"}</div>
      </div>

      <div style={section}>
        <div style={sectionTitle}>
          Children & Guardians <a href={`../children/?id=${willId}`} style={editLink}>Edit</a>
        </div>
        <div style={body}>
          Children: {children.length ? children.map((c) => c.name).join(", ") : "none"}
          <br />
          Guardians: {guardians.length ? guardians.map((g) => g.name).join(", ") : "none"}
        </div>
      </div>

      <div style={section}>
        <div style={sectionTitle}>
          Executors <a href={`../executors/?id=${willId}`} style={editLink}>Edit</a>
        </div>
        <div style={body}>{executors.length ? executors.map((e) => `${e.name} (${e.role})`).join(", ") : "None added"}</div>
      </div>

      <div style={section}>
        <div style={sectionTitle}>
          Property <a href={`../property/?id=${willId}`} style={editLink}>Edit</a>
        </div>
        <div style={body}>{properties.length ? properties.map((p) => p.description).join("; ") : "None added"}</div>
      </div>

      <div style={section}>
        <div style={sectionTitle}>
          Pensions <a href={`../pensions/?id=${willId}`} style={editLink}>Edit</a>
        </div>
        <div style={body}>
          {pensions && !pensions.simple_mode
            ? pensionEntries.length
              ? pensionEntries.map((p) => p.provider || "Pension").join(", ")
              : "Detailed mode selected — no pensions added yet"
            : "Handled simply (outside the Will)"}
        </div>
      </div>

      <div style={section}>
        <div style={sectionTitle}>
          Specific gifts <a href={`../gifts/?id=${willId}`} style={editLink}>Edit</a>
        </div>
        <div style={body}>{gifts.length ? gifts.map((g) => `${g.item} → ${g.beneficiary}`).join("; ") : "None added"}</div>
      </div>

      <div style={section}>
        <div style={sectionTitle}>
          Charity gifts <a href={`../charity/?id=${willId}`} style={editLink}>Edit</a>
        </div>
        <div style={body}>{charityGifts.length ? charityGifts.map((c) => `${c.charity_name} (${c.amount || "—"})`).join("; ") : "None added"}</div>
      </div>

      <div style={section}>
        <div style={sectionTitle}>
          Residuary estate <a href={`../residuary/?id=${willId}`} style={editLink}>Edit</a>
        </div>
        <div style={body}>{beneficiaries.length ? beneficiaries.map((b) => `${b.name} (${b.share_percent}%)`).join(", ") : "None added"}</div>
      </div>

      <div style={section}>
        <div style={sectionTitle}>
          Admin notes <a href={`../admin-notes/?id=${willId}`} style={editLink}>Edit</a>
        </div>
        <div style={body}>{adminNotes.length ? adminNotes.map((n) => n.note_text).join("; ") : "None added"}</div>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <WillStageShell>
      {(willId) => (
        <WillPageFrame willId={willId} current={12} desc="Check everything together before moving on to your document." nextLabel="Looks right — continue to Stage 13: Document Pack">
          <Review willId={willId} />
        </WillPageFrame>
      )}
    </WillStageShell>
  );
}
