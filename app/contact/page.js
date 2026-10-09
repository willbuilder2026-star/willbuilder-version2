import Header from "../../components/Header";
import Footer from "../../components/Footer";

export const metadata = { title: "Contact Us — Draft My Will" };

const wrap = { maxWidth: 600, margin: "0 auto", padding: "0 20px" };
const eyebrow = { fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6, color: "#7a5225", fontWeight: 700 };
const input = {
  width: "100%",
  padding: "10px 12px",
  marginTop: 6,
  marginBottom: 16,
  border: "1px solid #e3d9c8",
  borderRadius: 8,
  fontSize: 15,
  boxSizing: "border-box",
  fontFamily: "inherit",
};
const label = { fontSize: 13, fontWeight: 600, color: "#7a7266" };
const btn = {
  padding: "12px 26px",
  background: "#9c6b32",
  color: "#fff8ee",
  border: "none",
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer",
};

// TODO: replace YOUR_FORM_ID with the ID Formspree gives you after you
// create a free account and a new form at https://formspree.io
const FORM_ACTION = "https://formspree.io/f/xaenlwqb";

export default function Contact() {
  return (
    <div>
      <Header base="../" />
      <div style={{ ...wrap, padding: "50px 20px" }}>
        <div style={eyebrow}>Contact</div>
        <h1 style={{ fontSize: 30, margin: "8px 0 12px" }}>Get in touch</h1>
        <p style={{ color: "#4a5867", fontSize: 15, lineHeight: 1.6, marginBottom: 26 }}>
          Questions about your Will, an account issue, or anything else — send us a message and we'll get back
          to you by email.
        </p>

        <form action={FORM_ACTION} method="POST">
          <label style={label}>Your name</label>
          <input style={input} type="text" name="name" required />

          <label style={label}>Your email</label>
          <input style={input} type="email" name="email" required />

          <label style={label}>Message</label>
          <textarea style={{ ...input, minHeight: 130 }} name="message" required></textarea>

          <button style={btn} type="submit">
            Send message
          </button>
        </form>
      </div>
      <div style={wrap}>
        <Footer base="../" />
      </div>
    </div>
  );
}
