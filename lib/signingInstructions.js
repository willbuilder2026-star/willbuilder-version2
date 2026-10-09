// Jurisdiction-specific signing & witnessing instructions — shared between
// the on-screen Stage 14 (Signing) page and the Document Pack PDF (Stage 13),
// so the two never drift apart.
export const SIGNING_INSTRUCTIONS = {
  england_wales: [
    "Print your Will document and check it carefully.",
    "Sign and date it in the presence of two independent witnesses, both present in the same room at the same time.",
    "Your witnesses must be 18 or over, and must not be beneficiaries or married to a beneficiary — otherwise that gift can become invalid.",
    "Both witnesses then sign and print their names and addresses, watching you sign (or you watching them, in turn).",
  ],
  scotland: [
    "Print your Will document and check it carefully.",
    "Sign it on every page, in the presence of one witness aged 16 or over.",
    "Your witness should not be a beneficiary.",
    "Your witness then signs and prints their name and address on the final page, having watched you sign.",
  ],
  northern_ireland: [
    "Print your Will document and check it carefully.",
    "Sign and date it in the presence of two independent witnesses, both present in the same room at the same time.",
    "Your witnesses must be 18 or over, and must not be beneficiaries or married to a beneficiary.",
    "Both witnesses then sign and print their names and addresses.",
  ],
};

// General do's and don'ts that apply whichever jurisdiction — shown
// underneath the jurisdiction-specific steps both on-screen and in the PDF.
export const SIGNING_WARNINGS = [
  "Do not make handwritten alterations to the document after it's been signed and witnessed — these can invalidate the change, or the whole Will.",
  "Do not remove or replace any page once it's signed.",
  "Do not use a beneficiary, or a beneficiary's spouse or civil partner, as a witness — this can invalidate that person's gift.",
  "Do not sign electronically — a Will must be signed on paper, in person.",
  "Read the document fully before signing — if anything looks wrong, go back and fix that stage rather than signing, so your answers stay in sync.",
];
