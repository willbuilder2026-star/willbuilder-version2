import { STAGES, stageHref } from "../lib/stages";

export default function StageSidebar({ base, current, willId }) {
  return (
    <nav
      style={{
        width: 200,
        flexShrink: 0,
        display: "none",
      }}
      className="will-sidebar"
    >
      <div style={{ position: "sticky", top: 20 }}>
        {STAGES.map((s) => {
          const active = s.n === current;
          return (
            <a
              key={s.n}
              href={stageHref(base, s.slug, willId)}
              style={{
                display: "block",
                fontSize: 13,
                padding: "7px 10px",
                borderRadius: 7,
                marginBottom: 2,
                textDecoration: "none",
                color: active ? "#fff8ee" : "#4a5867",
                background: active ? "#9c6b32" : "transparent",
                fontWeight: active ? 700 : 500,
              }}
            >
              {s.n}. {s.label}
            </a>
          );
        })}
      </div>
      <style>{`
        @media (min-width: 760px) {
          .will-sidebar { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
