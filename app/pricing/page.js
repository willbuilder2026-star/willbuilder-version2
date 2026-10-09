import Header from "../../components/Header";
import Footer from "../../components/Footer";

export const metadata = { title: "Pricing — Draft My Will" };

const wrap = { maxWidth: 800, margin: "0 auto", padding: "0 20px" };
const eyebrow = { fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6, color: "#7a5225", fontWeight: 700 };
const card = { background: "#fff", border: "1px solid #e3d9c8", borderRadius: 12, padding: 24 };

const tiers = [
  {
    h: "Single Will",
    price: "£49",
    p: "A complete, jurisdiction-correct Will for one person.",
    items: ["All 15 guided stages", "Family & Estate Map", "Full document pack & signing guide", "30 days of free changes"],
  },
  {
    h: "Couples' Wills",
    price: "£79",
    p: "Two separate, legally independent Wills — linked, never joint.",
    items: ["Everything in Single Will, for both of you", "Share the basics, or mirror everything", "Independent gifting and executors", "30 days of free changes"],
  },
  {
    h: "Update / Revision",
    price: "£15",
    p: "Life changes — your Will should keep up.",
    items: ["Re-open any stage", "Re-issue your document pack", "New signing instructions"],
  },
];

export default function Pricing() {
  return (
    <div>
      <Header base="../" />
      <div style={{ ...wrap, padding: "50px 20px" }}>
        <div style={eyebrow}>Pricing</div>
        <h1 style={{ fontSize: 30, margin: "8px 0 12px" }}>Simple, transparent pricing</h1>
        <p style={{ color: "#4a5867", fontSize: 16, lineHeight: 1.6 }}>
          No solicitor hourly rates and no hidden extras — just a one-off price for your Will, 30 days of free
          changes included, and a low-cost update whenever life changes after that.
        </p>

        <div style={{ marginTop: 30, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {tiers.map((t, i) => (
            <div key={i} style={card}>
              <h3 style={{ fontSize: 17, margin: 0 }}>{t.h}</h3>
              <div style={{ fontSize: 28, fontWeight: 700, marginTop: 10, color: "#1c2b3a" }}>{t.price}</div>
              <p style={{ fontSize: 13.5, color: "#4a5867", marginTop: 6 }}>{t.p}</p>
              <ul style={{ marginTop: 14, paddingLeft: 18, fontSize: 13.5, color: "#4a5867", lineHeight: 1.9 }}>
                {t.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <a
          href="../app/"
          style={{
            display: "inline-block",
            marginTop: 30,
            padding: "13px 26px",
            borderRadius: 8,
            fontWeight: 600,
            textDecoration: "none",
            fontSize: 15,
            background: "#9c6b32",
            color: "#fff8ee",
          }}
        >
          Start your Will
        </a>
      </div>
      <div style={wrap}>
        <Footer base="../" />
      </div>
    </div>
  );
}
