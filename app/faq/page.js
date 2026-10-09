import Header from "../../components/Header";
import Footer from "../../components/Footer";

export const metadata = { title: "FAQs — Draft My Will" };

const wrap = { maxWidth: 800, margin: "0 auto", padding: "0 20px" };
const eyebrow = { fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6, color: "#7a5225", fontWeight: 700 };

const faqs = [
  ["Is this legally binding?", "Yes, once it's printed, signed and witnessed correctly for your jurisdiction. We give you clear, jurisdiction-specific instructions for doing this."],
  ["Which parts of the UK do you cover?", "England & Wales, Scotland, and Northern Ireland, each with their own signing and legal requirements built in."],
  ["Do I need a solicitor as well?", "Most straightforward Wills don't need one. If your situation is unusually complex, we'll flag that so you can seek advice for that specific part."],
  ["What if I need to change my Will later?", "You get 30 days of free changes after finishing, and a low-cost update option after that — your answers are stored so you never start from scratch."],
  ["Is my information kept private?", "Yes — see our Privacy Policy for details on how your data is stored and protected."],
  ["Do I have to pay before I start?", "No. Creating an account and starting your Will is free. You only pay when you're ready to generate your final document."],
];

export default function FAQ() {
  return (
    <div>
      <Header base="../" />
      <div style={{ ...wrap, padding: "50px 20px" }}>
        <div style={eyebrow}>FAQs</div>
        <h1 style={{ fontSize: 30, margin: "8px 0 24px" }}>Common questions</h1>

        {faqs.map(([q, a], i) => (
          <details key={i} style={{ background: "#fff", border: "1px solid #e3d9c8", borderRadius: 12, padding: "16px 20px", marginBottom: 12 }}>
            <summary style={{ fontWeight: 600, fontSize: 15, cursor: "pointer" }}>{q}</summary>
            <p style={{ fontSize: 14, color: "#4a5867", marginTop: 10, lineHeight: 1.6 }}>{a}</p>
          </details>
        ))}

        <p style={{ marginTop: 24, fontSize: 14, color: "#4a5867" }}>
          Can't find your answer? <a href="../contact/" style={{ color: "#7a5225", fontWeight: 600 }}>Get in touch</a>.
        </p>
      </div>
      <div style={wrap}>
        <Footer base="../" />
      </div>
    </div>
  );
}
