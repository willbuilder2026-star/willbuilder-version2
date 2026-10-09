export const metadata = {
  title: "Draft My Will",
  description: "Will Builder — real account test build",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Source+Sans+3:wght@400;500;600;700&display=swap"
        />
        <style>{`
          h1, h2, h3, .display {
            font-family: 'Fraunces', Georgia, serif;
            font-weight: 600;
            letter-spacing: -0.01em;
            margin: 0;
          }
        `}</style>
      </head>
      <body
        style={{
          margin: 0,
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
          background: "#faf7f1",
          color: "#1c2b3a",
          minHeight: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  );
}
