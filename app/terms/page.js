import Header from "../../components/Header";
import Footer from "../../components/Footer";

export const metadata = { title: "Terms & Conditions — Draft My Will" };

const wrap = { maxWidth: 750, margin: "0 auto", padding: "0 20px" };
const h2 = { fontSize: 18, marginTop: 28, marginBottom: 8 };
const p = { fontSize: 14.5, color: "#4a5867", lineHeight: 1.7 };

export default function Terms() {
  return (
    <div>
      <Header base="../" />
      <div style={{ ...wrap, padding: "50px 20px 60px" }}>
        <h1 style={{ fontSize: 28 }}>Terms &amp; Conditions</h1>
        <p style={{ ...p, fontStyle: "italic" }}>
          Placeholder template — replace with finalised wording, ideally reviewed by a solicitor, before
          launch.
        </p>

        <h2 style={h2}>1. What we provide</h2>
        <p style={p}>
          A guided online questionnaire that produces a Will document based on the answers you give. We are not
          a firm of solicitors, and this service does not replace independent legal advice for complex
          situations.
        </p>

        <h2 style={h2}>2. Your responsibilities</h2>
        <p style={p}>You're responsible for the accuracy of the information you provide, and for signing and witnessing your Will correctly using the instructions we give you.</p>

        <h2 style={h2}>3. Payment</h2>
        <p style={p}>[Pricing and refund policy to be confirmed — see our Pricing page.]</p>

        <h2 style={h2}>4. Changes and updates</h2>
        <p style={p}>Free changes are included for 30 days after your Will is finished. After that, updates are available at [price/terms to confirm].</p>

        <h2 style={h2}>5. Limitation of liability</h2>
        <p style={p}>[Standard liability wording to be confirmed with a solicitor before launch.]</p>

        <h2 style={h2}>6. Governing law</h2>
        <p style={p}>These terms are governed by the law of England and Wales, Scotland, or Northern Ireland, according to which jurisdiction your Will is written for.</p>

        <h2 style={h2}>7. Contact</h2>
        <p style={p}>
          Questions about these terms — see our <a href="../contact/" style={{ color: "#7a5225" }}>Contact page</a>.
        </p>
      </div>
      <div style={wrap}>
        <Footer base="../" />
      </div>
    </div>
  );
}
