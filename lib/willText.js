import { JURISDICTION_LABELS } from "./willData";
import { buildFamilyMapModel } from "./familyMap";
import { getJurisdictionRule } from "./jurisdictionRules";

// Supabase date inputs give "YYYY-MM-DD" — display everything to the
// person in UK format, DD/MM/YYYY.
export function formatUKDate(iso) {
  if (!iso) return "";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}

// Oldest child first (earliest date of birth). Children with no date of
// birth recorded are pushed to the end rather than jumping to the top.
export function sortChildren(children) {
  return [...children].sort((a, b) => (a.date_of_birth || "9999-99-99").localeCompare(b.date_of_birth || "9999-99-99"));
}

// Primary executor(s) always listed before reserve executor(s), keeping the
// order they were added within each group.
export function sortExecutors(executors) {
  return [...executors].sort((a, b) => {
    if (a.role === b.role) return 0;
    return a.role === "primary" ? -1 : 1;
  });
}

// Structured sections (rather than one flat string) so the PDF renderer can
// bold headings and bullet the list items properly, instead of guessing
// from plain text.
export function buildWillSections(jurisdiction, data) {
  const { about, partner, guardians, properties, pensionEntries, gifts, charityGifts, beneficiaries, adminNotes, settings } = data;
  const spouseMode = settings?.spouse_mode || (settings?.spouse_first ? "outright" : "off");
  const children = sortChildren(data.children);
  const executors = sortExecutors(data.executors);
  const sections = [];
  const push = (type, text) => sections.push({ type, text });

  // Sections are numbered sequentially based on what's actually included,
  // rather than fixed numbers — otherwise leaving out (say) Guardians or
  // Property makes the document jump straight from "2." to "4.", which
  // looks broken on a legal-style document.
  let sectionNumber = 0;
  const pushHeading = (title) => {
    sectionNumber += 1;
    push("heading", `${sectionNumber}. ${title}`);
  };

  push("para", "I hereby revoke all former Wills and testamentary dispositions made by me.");

  if (partner?.has_partner && partner.partner_name) {
    pushHeading("FAMILY");
    push("para", `I am ${about?.marital_status === "married" ? "married to" : "in a relationship with"} ${partner.partner_name}.`);
  }

  if (children.length > 0) {
    pushHeading("CHILDREN");
    children.forEach((c) => push("bullet", `${c.name}${c.date_of_birth ? ` (born ${formatUKDate(c.date_of_birth)})` : ""}`));
  }

  if (guardians.length > 0) {
    pushHeading("GUARDIANS");
    push("para", "If I die while any of my children are under 18, I appoint the following as guardian(s):");
    guardians.forEach((g) => push("bullet", `${g.name}${g.address ? `, of ${g.address}${g.postcode ? `, ${g.postcode}` : ""}` : ""}`));
  }

  pushHeading("EXECUTORS");
  const jurRule = getJurisdictionRule(jurisdiction);
  if (executors.length > 0) {
    push("para", "I appoint the following as Executor(s) of this my Will:");
    executors.forEach((e) => push("bullet", `${e.name}${e.address ? `, of ${e.address}${e.postcode ? `, ${e.postcode}` : ""}` : ""} (${e.role === "reserve" ? "reserve" : "primary"})`));
    push(
      "para",
      `After my death, my executor(s) will generally need to apply for ${jurRule.postDeathProcessLabel} before they can deal with my estate.`
    );
  } else {
    push("para", "[No executors added yet.]");
  }

  if (properties.length > 0) {
    pushHeading("PROPERTY");
    properties.forEach((p) => push("bullet", `${p.description}${p.ownership_type ? ` (held as: ${p.ownership_type.replace(/_/g, " ")})` : ""}`));
  }

  if (pensionEntries.length > 0) {
    pushHeading("PENSIONS");
    pensionEntries.forEach((p) => {
      push("bullet", p.provider || "[Pension provider not named]");
      if (p.notes) push("para", p.notes);
    });
  }

  if (gifts.length > 0) {
    pushHeading("SPECIFIC GIFTS");
    gifts.forEach((g) => push("bullet", `I give ${g.item} to ${g.beneficiary}.`));
  }

  if (charityGifts.length > 0) {
    pushHeading("CHARITABLE GIFTS");
    charityGifts.forEach((c) => push("bullet", `I give ${c.amount || "an amount to be confirmed"} to ${c.charity_name}.`));
  }

  pushHeading("RESIDUARY ESTATE");
  const partnerName = partner?.has_partner ? partner.partner_name : "";

  if (spouseMode === "outright" && partnerName) {
    push("para", `I give the whole of the remainder of my estate (after debts, expenses and the above gifts) to my partner, ${partnerName}, absolutely.`);
    push("para", `If ${partnerName} does not survive me, I give the remainder of my estate as follows instead:`);
  } else if (spouseMode === "life_interest" && partnerName) {
    push(
      "para",
      `I give my partner, ${partnerName}, a life interest in the remainder of my estate (after debts, expenses and the above gifts), on terms to be set out in a properly drafted trust clause — [CLAUSE PENDING PROFESSIONAL LEGAL REVIEW: life interest trust for ${partnerName}, including trustee powers and the circumstances in which the interest ends]. Subject to that life interest, on my partner's death the remainder of my estate shall pass as follows:`
    );
  } else {
    push("para", "I give the remainder of my estate (after debts, expenses and the above gifts) as follows:");
  }

  if (beneficiaries.length > 0) {
    // Built via the same model the Family & Estate Map uses, so the
    // document and the map can never disagree about what happens to a
    // predeceasing beneficiary's share.
    const { beneficiaries: mapBeneficiaries } = buildFamilyMapModel(data);
    mapBeneficiaries.forEach((b) => {
      let contingencyText = "";
      if (b.effectiveContingency === "to_children") {
        const namedList = b.children.map((c) => `${c.name} (${c.share}%)`).join(", ");
        contingencyText = ` (if they predecease me, this share shall pass to the following: ${namedList})`;
      } else if (b.effectiveContingency === "redistribute") {
        contingencyText = " (if they predecease me, this share shall be redistributed among the surviving beneficiaries below, in proportion to their shares)";
      }
      push("bullet", `${b.share}% to ${b.name}${contingencyText}`);
    });
  } else {
    push("para", "[No residuary beneficiaries added yet.]");
  }

  if (adminNotes.length > 0) {
    pushHeading("NOTES FOR MY EXECUTORS (not legally binding, for guidance only)");
    adminNotes.forEach((n) => push("bullet", n.note_text));
  }

  push("para", "");
  push("para", "SIGNED by the above-named Testator as their last Will in our presence and then by us in theirs:");
  push("para", "");
  push("signature", "Signature: _______________________   Date: _______________");
  push("para", "");
  if (jurisdiction === "scotland") {
    push("para", "Witnessed by one witness (Scotland requires one witness on a formal Will):");
    push("signature", "Witness signature: _______________________  Name: _______________  Address: _______________");
  } else {
    push("para", "Witnessed by two independent witnesses, both present at the same time:");
    push("signature", "Witness 1 signature: _______________________  Name: _______________  Address: _______________");
    push("signature", "Witness 2 signature: _______________________  Name: _______________  Address: _______________");
  }

  return sections;
}

export function openingLines(about) {
  const lines = [`This is the last Will and Testament of ${about?.full_name || "[Full name]"}`];
  if (about?.date_of_birth) lines.push(`Born: ${formatUKDate(about.date_of_birth)}`);
  if (about?.address) lines.push(`Of: ${about.address}${about?.postcode ? `, ${about.postcode}` : ""}`);
  return lines;
}

// Plain-text version, for the copy button and the .txt download.
export function buildWillText(jurisdiction, data) {
  const jur = JURISDICTION_LABELS[jurisdiction] || jurisdiction;
  const lines = ["LAST WILL AND TESTAMENT", `(${jur})`, "", ...openingLines(data.about), ""];
  buildWillSections(jurisdiction, data).forEach((s) => {
    lines.push(s.type === "bullet" ? `• ${s.text}` : s.text);
  });
  return lines.join("\n");
}
