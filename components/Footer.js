const link = { color: "#7a7266", textDecoration: "none" };

export default function Footer({ base = "./" }) {
  return (
    <footer style={{ borderTop: "1px solid #e3d9c8", padding: "26px 0", marginTop: 40 }}>
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "0 20px",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14,
          fontSize: 13,
          color: "#7a7266",
        }}
      >
        <div>Not legal advice. &copy; Draft My Will {new Date().getFullYear()}.</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <a href={`${base}privacy/`} style={link}>Privacy Policy</a>
          <a href={`${base}terms/`} style={link}>Terms &amp; Conditions</a>
          <a href={`${base}contact/`} style={link}>Contact Us</a>
        </div>
      </div>
    </footer>
  );
}
