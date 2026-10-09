import Header from "../../components/Header";
import Footer from "../../components/Footer";

export const metadata = { title: "Privacy Policy — Draft My Will" };

const wrap = { maxWidth: 750, margin: "0 auto", padding: "0 20px" };
const h2 = { fontSize: 18, marginTop: 28, marginBottom: 8 };
const p = { fontSize: 14.5, color: "#4a5867", lineHeight: 1.7 };

export default function Privacy() {
  return (
    <div>
      <Header base="../" />
      <div style={{ ...wrap, padding: "50px 20px 60px" }}>
        <h1 style={{ fontSize: 28 }}>Privacy Policy</h1>
        <p style={{ ...p, fontStyle: "italic" }}>
          Placeholder template — replace with your finalised policy before launch. Consider having a solicitor
          review it, since it will describe how you handle sensitive personal and family data.
        </p>

        <h2 style={h2}>1. Who we are</h2>
        <p style={p}>[Company name], [company number if applicable], [registered address]. Contact: [email address].</p>

        <h2 style={h2}>2. What we collect</h2>
        <p style={p}>
          Account details (name, email), and the answers you give us while completing your Will — including
          details about your family, property, and beneficiaries.
        </p>

        <h2 style={h2}>3. Why we collect it</h2>
        <p style={p}>To create, store and let you update your Will, and to contact you about your account.</p>

        <h2 style={h2}>4. How we store it</h2>
        <p style={p}>
          Your data is stored securely with [database provider name] and protected so that only you can access
          your own records.
        </p>

        <h2 style={h2}>5. Who we share it with</h2>
        <p style={p}>We do not sell your data. It is only shared with service providers needed to run this website (e.g. hosting, email).</p>

        <h2 style={h2}>6. Your rights</h2>
        <p style={p}>
          Under UK GDPR, you can ask to see, correct, or delete your data at any time — contact us using the
          details on our <a href="../contact/" style={{ color: "#7a5225" }}>Contact page</a>.
        </p>

        <h2 style={h2}>7. Changes to this policy</h2>
        <p style={p}>We'll update this page if our practices change. Last updated: [date].</p>
      </div>
      <div style={wrap}>
        <Footer base="../" />
      </div>
    </div>
  );
}
