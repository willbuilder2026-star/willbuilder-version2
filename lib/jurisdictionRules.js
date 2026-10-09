// Single source of truth for the handful of things that genuinely differ
// by jurisdiction — age rules, post-death terminology, witness counts —
// so the rest of the app reads from here instead of scattering
// `if (jurisdiction === "scotland")` checks everywhere.
//
// This only covers mechanical facts (ages set by statute, terminology,
// witness counts). It deliberately does NOT contain anything that needs
// legal drafting — clause wording, legal-rights calculations, trust
// mechanics — those stay out of this file until a solicitor has reviewed
// them (see the "Will Builder LPA and Scotland Legal Review Specification"
// working doc).
export const JURISDICTION_RULES = {
  england_wales: {
    label: "England & Wales",
    witnessCount: 2,
    postDeathTerm: "probate",
    postDeathProcessLabel: "Grant of Probate",
    // No statutory age restriction captured here yet — not part of this
    // round of fixes, so behaviour is unchanged from before.
    minTestamentaryAge: null,
    restrictedAgeBand: null,
  },
  northern_ireland: {
    label: "Northern Ireland",
    witnessCount: 2,
    postDeathTerm: "probate",
    postDeathProcessLabel: "Grant of Probate",
    minTestamentaryAge: null,
    restrictedAgeBand: null,
  },
  scotland: {
    label: "Scotland",
    witnessCount: 1,
    postDeathTerm: "confirmation",
    postDeathProcessLabel: "Confirmation",
    // Age of Legal Capacity (Scotland) Act 1991 — testamentary capacity
    // from age 12. Below that, the standard journey isn't available at
    // all. 12-15 is flagged as a high-risk group pending a Scottish
    // solicitor's sign-off on whether/how to serve it (see spec doc,
    // section 7) — so for now the service holds at 16+, same as the
    // spec's own "16-17: still consider enhanced safeguarding" guidance.
    minTestamentaryAge: 12,
    restrictedAgeBand: [12, 15],
    serviceMinAge: 16,
  },
};

export function getJurisdictionRule(jurisdiction) {
  return JURISDICTION_RULES[jurisdiction] || JURISDICTION_RULES.england_wales;
}

// Years-of-age calculation from a "YYYY-MM-DD" date of birth. Returns null
// if there's nothing to calculate from yet.
export function calcAge(dateOfBirthISO) {
  if (!dateOfBirthISO) return null;
  const dob = new Date(dateOfBirthISO);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear = today.getMonth() > dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

// Scotland-specific age eligibility check. Other jurisdictions are left
// exactly as they were (no age gate was in place before this change, and
// adding one for England & Wales / Northern Ireland wasn't part of this
// fix) — this only ever returns a restriction for Scotland.
//
// tier: "ok" | "under_capacity" | "restricted" | "unknown"
export function checkScotlandAgeEligibility(dateOfBirthISO) {
  const age = calcAge(dateOfBirthISO);
  if (age === null) return { tier: "unknown", age: null };
  const rule = JURISDICTION_RULES.scotland;
  if (age < rule.minTestamentaryAge) {
    return {
      tier: "under_capacity",
      age,
      message:
        "Scottish law doesn't recognise testamentary capacity below age 12 (Age of Legal Capacity (Scotland) Act 1991), so this service can't be used at this age.",
    };
  }
  if (age < rule.serviceMinAge) {
    return {
      tier: "restricted",
      age,
      message:
        "Scottish law recognises testamentary capacity from age 12, but this service currently holds at age 16+ for this age group, pending a Scottish solicitor's review of the right safeguards. Please speak to a solicitor directly if a Will is needed below this age.",
    };
  }
  return { tier: "ok", age };
}
