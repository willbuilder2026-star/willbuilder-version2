import Header from "../../components/Header";
import Footer from "../../components/Footer";

export const metadata = { title: "How it works — Draft My Will" };

const wrap = { maxWidth: 800, margin: "0 auto", padding: "0 20px" };
const eyebrow = { fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6, color: "#7a5225", fontWeight: 700 };
const card = { background: "#fff", border: "1px solid #e3d9c8", borderRadius: 12, padding: 22, marginTop: 16 };

const stages = [
  ["About you", "Your name, address and marital status."],
  ["Partner & family", "Details of your spouse, civil partner or long-term partner."],
  ["Children & guardians", "Who your children are, and who should look after them if needed."],
  ["Executors", "Who will carry out the wishes in your Will."],
  ["Property", "Any homes or land you own, and how they're held."],
  ["Pensions", "How your pension arrangements fit alongside your Will."],
  ["Specific gifts", "Named items or sums you want to leave to particular people."],
  ["Charity gifts", "Any amounts or items you'd like to leave to charity."],
  ["Residuary estate", "How everything left over is split, shown on a live Family & Estate Map."],
  ["Beneficiary contingencies", "What happens if a beneficiary can't inherit."],
  ["Admin notes", "Practical notes for your executors — funeral wishes, digital accounts, and so on."],
  ["Final review", "Check every answer together before anything is finalised."],
  ["Document pack", "Your Will is drafted, in the correct format for your jurisdiction."],
  ["Signing", "Clear instructions for signing and witnessing correctly."],
  ["Updating", "Free changes for 30 days, then a low-cost update whenever life changes."],
];

export default function HowItWorks() {
  return (
    <div>
      <Header base="../" />
      <div style={{ ...wrap, padding: "50px 20px" }}>
        <div style={eyebrow}>How it works</div>
        <h1 style={{ fontSize: 30, margin: "8px 0 12px" }}>Fifteen short stages, at your own pace</h1>
        <p style={{ color: "#4a5867", fontSize: 16, lineHeight: 1.6 }}>
          Nothing is timed and nothing is lost — every answer is saved as you go, so you can stop and pick up
          again whenever suits you. Here's everything the questionnaire covers, in order.
        </p>

        <div style={{ marginTop: 30 }}>
          {stages.map(([h, p], i) => (
            <div key={i} style={card}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ fontWeight: 700, color: "#7a5225", minWidth: 26 }}>{i + 1}.</div>
                <div>
                  <h3 style={{ fontSize: 16, margin: 0 }}>{h}</h3>
                  <p style={{ fontSize: 14, color: "#4a5867", marginTop: 6 }}>{p}</p>
                </div>
              </div>
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
