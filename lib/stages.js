// Single source of truth for the 15-stage order, used by the sidebar and
// the back/continue nav so every page stays consistent automatically.
export const STAGES = [
  { n: 1, slug: "", label: "About your Will" },
  { n: 2, slug: "partner", label: "Partner & Family" },
  { n: 3, slug: "children", label: "Children & Guardians" },
  { n: 4, slug: "executors", label: "Executors" },
  { n: 5, slug: "property", label: "Property" },
  { n: 6, slug: "pensions", label: "Pensions" },
  { n: 7, slug: "gifts", label: "Specific Gifts" },
  { n: 8, slug: "charity", label: "Charity Gifts" },
  { n: 9, slug: "residuary", label: "Residuary Estate" },
  { n: 10, slug: "contingencies", label: "Contingencies" },
  { n: 11, slug: "admin-notes", label: "Admin Notes" },
  { n: 12, slug: "review", label: "Final Review" },
  { n: 13, slug: "document", label: "Document Pack" },
  { n: 14, slug: "signing", label: "Signing" },
  { n: 15, slug: "update", label: "Updating" },
];

// base = "./" when called from Stage 1 (app/will/page.js), "../" from any
// other stage (app/will/<slug>/page.js) — same convention as Header/Footer.
export function stageHref(base, slug, willId) {
  return `${base}${slug}${slug ? "/" : ""}?id=${willId}`;
}

export function dashboardHref(base) {
  return `${base}../app/`;
}

export function siteRootHref(base) {
  return `${base}../`;
}
