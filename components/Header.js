const link = { color: "#4a5867", textDecoration: "none", fontSize: 14 };
const cta = {
  background: "#9c6b32",
  color: "#fff8ee",
  padding: "9px 18px",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: 600,
  fontSize: 14,
};

// base = the relative path back to the site root.
// "./"  when this page lives at the root (app/page.js)
// "../" when this page lives one folder deep (app/contact/page.js, app/pricing/page.js, etc.)
export default function Header({ base = "./" }) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(250, 247, 241, 0.88)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid #e3d9c8",
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "0 20px",
          height: 58,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <a href={base} style={{ display: "flex", alignItems: "center", gap: 9, fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 17, color: "#1c2b3a", textDecoration: "none" }}>
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: "linear-gradient(155deg, #9c6b32, #7a5225)",
              color: "#fff8ee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              flex: "none",
            }}
          >
            D
          </span>
          Draft My Will
        </a>
        <nav style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <a href={`${base}how-it-works/`} style={link}>How it works</a>
          <a href={`${base}pricing/`} style={link}>Pricing</a>
          <a href={`${base}faq/`} style={link}>FAQs</a>
          <a href={`${base}contact/`} style={link}>Contact</a>
          <a href={`${base}app/`} style={cta}>Sign up / Log in</a>
        </nav>
      </div>
    </header>
  );
}
