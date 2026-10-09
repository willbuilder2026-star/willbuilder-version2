import Header from "../components/Header";
import Footer from "../components/Footer";
import { STAGES } from "../lib/stages";
import { buildFamilyMapSvg } from "../lib/familyMap";

export const metadata = {
  title: "Draft My Will — get your affairs sorted",
};

const wrap = { maxWidth: 1080, margin: "0 auto", padding: "0 24px" };
const btn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "11px 22px",
  borderRadius: 8,
  fontWeight: 600,
  textDecoration: "none",
  fontSize: 15,
};
const card = { background: "#fff", border: "1px solid #e3d9c8", borderRadius: 12, padding: 22 };
const eyebrow = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  fontSize: 12,
  letterSpacing: "0.09em",
  textTransform: "uppercase",
  color: "#7a5225",
  fontWeight: 700,
};
const eyebrowDot = { content: '""', width: 7, height: 7, borderRadius: "50%", background: "#9c6b32", display: "inline-block" };
const sectionTag = { ...eyebrow };
const sectionHead = { maxWidth: "62ch", marginBottom: 28 };

// ---- Example Family & Estate Map, hard-coded for the homepage. This is
// NOT generated from anyone's real data — it's a fixed illustration so
// visitors can see what their own live map will look like once they start
// their Will. The real, editable-by-answers version lives on Stage 9.
const exampleMapModel = {
  testatorName: "Alex Whitfield",
  hasPartner: true,
  partnerName: "Jordan Whitfield",
  beneficiaries: [
    { name: "Sam Whitfield", share: 33, effectiveContingency: "none", children: [] },
    { name: "Robin Whitfield", share: 33, effectiveContingency: "none", children: [] },
    {
      name: "Charlie Whitfield",
      share: 34,
      effectiveContingency: "to_children",
      children: [
        { name: "Finley", share: 17 },
        { name: "Rowan", share: 17 },
      ],
    },
  ],
};
const exampleMapSvg = buildFamilyMapSvg(exampleMapModel);

const stageBlurbs = {
  1: "Personal details, identity and domicile — entered once, reused everywhere.",
  2: "Marital or civil partnership status and immediate family.",
  3: "Names guardians for children under 18, and records each child's date of birth.",
  4: "Who carries out your instructions, plus a reserve executor as backup.",
  5: "Any homes or land you own, and how each is held.",
  6: "A separate section, because pensions are usually paid via provider nomination rather than the Will itself. Add as many as you have, or skip the detail if you've already nominated.",
  7: "Named items, sums of money and accounts recorded as specific gifts before the residue is dealt with.",
  8: "Optional gifts to registered charities.",
  9: "Everything left after specific gifts, split by percentage — with the Family & Estate Map generated live as you go.",
  10: "What happens if a beneficiary dies before you, explained in plain English.",
  11: "Overseas property, business interests and similar matters, flagged for whoever administers your estate — never a block to finishing.",
  12: "A plain-English summary of the whole plan, checked for anything missing or that doesn't add up.",
  13: "A cover page, the jurisdiction-specific legal Will, a Family & Estate Summary, and signing guidance — all in one PDF.",
  14: "Clear, jurisdiction-specific signing and witnessing instructions.",
  15: "30 days of free unlimited amendments after signing. Genuine corrections stay free forever.",
};

const principles = [
  { g: "F", h: "Family & Estate Map", p: "Generated live from your own answers — never drawn by hand — so it always matches your Will exactly." },
  { g: "N", h: "Named contingencies", p: "Choose per beneficiary: their share passes to specific people they choose — their own children, or anyone else — or is redistributed among the others." },
  { g: "P", h: "As many pensions as you need", p: "Add each pension separately, or skip the detail entirely if you've already nominated beneficiaries with your provider." },
  { g: "A", h: "No advice gate", p: "Flagging something that might benefit from outside advice never blocks completion — it's logged as an Estate Administration Note." },
  { g: "E", h: "Estate Administration Notes", p: "A separate, non-testamentary section for things executors may need to chase — overseas property, business interests, pension processes." },
  { g: "C", h: "Corrections vs. revisions", p: "A misspelling or wrong date of birth is a free correction, forever. A change of mind is a low-cost revision after the first 30 days." },
];

const jurisdictions = [
  { name: "England & Wales", flag: "linear-gradient(#c8102e 0 33%, #fff 33% 66%, #c8102e 66% 100%)", items: ["Two independent witnesses, both present at the same time", "Guardian appointment for under-18 children", "Standard attestation and revocation clauses"] },
  { name: "Scotland", flag: "linear-gradient(#0065bf,#0065bf)", items: ["Signing in the presence of one witness aged 16 or over", "Scots succession rules built into the drafting", "Own reviewed clause library, kept distinct from England & Wales"] },
  { name: "Northern Ireland", flag: "linear-gradient(#0a5b2c 0 33%, #fff 33% 66%, #ff8300 66% 100%)", items: ["Execution rules aligned with NI probate practice", "Own reviewed clause library", "Shared questionnaire, jurisdiction-specific from the Document Pack onward"] },
];

const timeline = [
  { when: "Day 0", what: "Purchase", desc: "Document pack generated: cover page, jurisdiction-specific Will, Family & Estate Summary, and a Signing & Witnessing Guide." },
  { when: "Days 1–30", what: "Free unlimited amendments", desc: "Any change of mind about your wishes is free and unlimited while the Will is fresh." },
  { when: "Day 31+", what: "Low-cost revisions", desc: "Changes to your wishes become a paid revision, distinguished clearly from a correction before payment is requested." },
  { when: "Any time", what: "Free corrections, always", desc: "Misspellings, wrong dates of birth, wrong addresses and similar data-entry mistakes are corrected free, indefinitely." },
  { when: "On signing", what: "A new, executed version", desc: "An executed Will is never overwritten. Every new executed Will is a new version, with its own signing process." },
];

export default function Landing() {
  return (
    <div>
      <Header base="./" />

      <header style={{ ...wrap, padding: "56px 24px 40px", borderBottom: "1px solid #e3d9c8" }}>
        <div style={eyebrow}>
          <span style={eyebrowDot} />
          UK Will writing, done properly
        </div>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.1rem)", lineHeight: 1.15, marginTop: 14, maxWidth: "15ch" }}>
          A Will you can actually afford to keep up to date.
        </h1>
        <p style={{ color: "#4a5867", fontSize: 17, marginTop: 18, lineHeight: 1.6, maxWidth: "56ch" }}>
          Answer a guided set of questions in plain English, see exactly how your estate will be split with a live
          Family &amp; Estate Map, and get a proper Will document — covering England &amp; Wales, Scotland and
          Northern Ireland.
        </p>
        <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="./app/" style={{ ...btn, background: "#9c6b32", color: "#fff8ee" }}>
            Start your Will — it's free to begin
          </a>
          <a href="#family-map" style={{ ...btn, background: "#f1e4d0", color: "#7a5225" }}>
            See the Family &amp; Estate Map ↓
          </a>
        </div>
        <p style={{ marginTop: 14, fontSize: 13, color: "#7a7266" }}>
          You can read everything on this site without an account. You only need to sign up when you're ready to
          start writing your Will.
        </p>
        <div style={{ display: "flex", gap: 28, marginTop: 36, flexWrap: "wrap" }}>
          {[
            ["15", "guided stages"],
            ["3", "jurisdictions covered"],
            ["30 days", "free unlimited amendments"],
            ["∞", "free genuine corrections"],
          ].map(([n, l]) => (
            <div key={l} style={{ minWidth: 120 }}>
              <b style={{ display: "block", fontFamily: "'Fraunces', serif", fontSize: "1.7rem", fontWeight: 600 }}>{n}</b>
              <span style={{ fontSize: 13, color: "#7a7266" }}>{l}</span>
            </div>
          ))}
        </div>
      </header>

      <section id="family-map" style={{ ...wrap, padding: "52px 24px", borderBottom: "1px solid #e3d9c8" }}>
        <div style={sectionHead}>
          <div style={sectionTag}>Signature feature</div>
          <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.1rem)", marginTop: 8 }}>The Family &amp; Estate Map</h2>
          <p style={{ color: "#4a5867", marginTop: 10, fontSize: "1.02rem" }}>
            Generated straight from the answers you give on Stage 9 — never drawn by hand — so it always matches your
            Will exactly. You (and your partner, if you have one) sit on the left; beneficiaries run left to right,
            and whoever you've chosen for a share to pass to — their own children, or anyone else — branches off on
            the right.
          </p>
        </div>
        <div style={{ background: "#fff", border: "1px solid #e3d9c8", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", background: "#f1e4d0", fontSize: 13.5, color: "#4a5867", borderBottom: "1px solid #e3d9c8" }}>
            <b style={{ color: "#1c2b3a" }}>Example only — this one can't be edited.</b> It's a fixed illustration so
            you can see what your own map will look like. Once you start your Will, your real map is generated live
            from your own answers on Stage 9.
          </div>
          <div style={{ padding: 16, overflowX: "auto" }} dangerouslySetInnerHTML={{ __html: exampleMapSvg }} />
        </div>
      </section>

      <section style={{ ...wrap, padding: "52px 24px", borderBottom: "1px solid #e3d9c8" }}>
        <div style={sectionHead}>
          <div style={sectionTag}>Product structure</div>
          <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.1rem)", marginTop: 8 }}>The 15-stage journey</h2>
          <p style={{ color: "#4a5867", marginTop: 10, fontSize: "1.02rem" }}>
            Data collection is kept separate from legal drafting throughout, so the same guided questionnaire drives
            three different jurisdictions' documents.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {STAGES.map((s) => (
            <div key={s.n} style={card}>
              <div style={{ fontSize: 12, color: "#7a7266", fontWeight: 600 }}>Stage {s.n}</div>
              <h3 style={{ fontSize: 15, marginTop: 4 }}>{s.label}</h3>
              <p style={{ fontSize: 13, color: "#4a5867", marginTop: 8, lineHeight: 1.5 }}>{stageBlurbs[s.n]}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ ...wrap, padding: "52px 24px", borderBottom: "1px solid #e3d9c8" }}>
        <div style={sectionHead}>
          <div style={sectionTag}>Locked-in decisions</div>
          <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.1rem)", marginTop: 8 }}>What makes this different from a static template</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {principles.map((x) => (
            <div key={x.h} style={{ ...card, display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: "#f1e4d0",
                  color: "#7a5225",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontFamily: "'Fraunces', serif",
                }}
              >
                {x.g}
              </div>
              <h3 style={{ fontSize: 15, fontFamily: "'Source Sans 3', sans-serif", fontWeight: 700 }}>{x.h}</h3>
              <p style={{ fontSize: 13.5, color: "#4a5867" }}>{x.p}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ ...wrap, padding: "52px 24px", borderBottom: "1px solid #e3d9c8" }}>
        <div style={sectionHead}>
          <div style={sectionTag}>Coverage</div>
          <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.1rem)", marginTop: 8 }}>One questionnaire, three legal outputs</h2>
          <p style={{ color: "#4a5867", marginTop: 10, fontSize: "1.02rem" }}>
            Common data collection feeds jurisdiction-specific rules, clause libraries and execution guidance.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {jurisdictions.map((j) => (
            <div key={j.name} style={card}>
              <h3 style={{ fontSize: 16, fontFamily: "'Source Sans 3', sans-serif", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 20, height: 14, borderRadius: 2, flex: "none", border: "1px solid #e3d9c8", background: j.flag }} />
                {j.name}
              </h3>
              <ul style={{ margin: "12px 0 0", paddingLeft: 18, fontSize: 13.5, color: "#4a5867", lineHeight: 1.9 }}>
                {j.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section style={{ ...wrap, padding: "52px 24px" }}>
        <div style={sectionHead}>
          <div style={sectionTag}>Stage 15</div>
          <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.1rem)", marginTop: 8 }}>Updating and pricing</h2>
          <p style={{ color: "#4a5867", marginTop: 10, fontSize: "1.02rem" }}>
            The distinction that matters: a <b>correction</b> fixes a mistake; a <b>revision</b> changes a wish. Only
            revisions are ever paid, and only after the free window closes.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #e3d9c8", borderRadius: 14, overflow: "hidden", background: "#fff" }}>
          {timeline.map((t, i) => (
            <div
              key={t.when}
              style={{
                display: "grid",
                gridTemplateColumns: "130px 1fr",
                gap: 16,
                padding: "18px 22px",
                borderBottom: i === timeline.length - 1 ? "none" : "1px solid #e3d9c8",
              }}
            >
              <div style={{ fontWeight: 700, fontFamily: "'Fraunces', serif", color: "#7a5225" }}>{t.when}</div>
              <div>
                <b style={{ display: "block", marginBottom: 3 }}>{t.what}</b>
                <span style={{ color: "#4a5867", fontSize: 14 }}>{t.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: "#1c2b3a", color: "#fff8ee" }}>
        <div style={{ ...wrap, padding: "50px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div>
            <h2 style={{ fontSize: 24 }}>Ready to get your affairs sorted?</h2>
            <p style={{ color: "#cdbfa8", marginTop: 8, fontSize: 15 }}>
              Creating an account is free — you only pay when your Will is ready to finish.
            </p>
          </div>
          <a href="./app/" style={{ ...btn, background: "#9c6b32", color: "#fff8ee" }}>
            Start your Will
          </a>
        </div>
      </section>

      <div style={wrap}>
        <Footer base="./" />
      </div>
    </div>
  );
}
