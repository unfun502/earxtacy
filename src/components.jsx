import { C, STORES, STORE_COLORS } from "./data";
import { fmt } from "./helpers";

/* ═══════════════════════════════════════════
   KPI CARD
   ═══════════════════════════════════════════ */
export function KPI({ label, value, sub, accent = C.pink }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.cardBorder}`,
      padding: "20px 22px",
      flex: "1 1 180px",
      position: "relative",
      minWidth: 170,
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, width: 4, height: "100%",
        background: accent,
      }} />
      <div style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: C.muted,
        marginBottom: 8,
      }}>{label}</div>
      <div style={{
        fontFamily: "'Anton', sans-serif",
        fontSize: 30,
        color: C.white,
        lineHeight: 1,
        letterSpacing: "0.02em",
      }}>{value}</div>
      {sub && (
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          color: C.dim,
          marginTop: 6,
        }}>{sub}</div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SECTION PANEL
   ═══════════════════════════════════════════ */
export function Section({ title, right, children, style: sx }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.cardBorder}`,
      padding: "22px 24px 16px",
      ...sx,
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        marginBottom: 18,
        borderBottom: `1px solid ${C.cardBorder}`,
        paddingBottom: 10,
      }}>
        <h2 style={{
          fontFamily: "'Anton', sans-serif",
          fontSize: 18,
          fontWeight: 400,
          color: C.text,
          margin: 0,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}>{title}</h2>
        {right && <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          color: C.dim,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}>{right}</span>}
      </div>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════
   CHART TOOLTIP
   ═══════════════════════════════════════════ */
export const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1A1A1A",
      border: `1px solid ${C.cardBorder}`,
      padding: "10px 14px",
    }}>
      <div style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 10,
        color: C.muted,
        marginBottom: 6,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 12,
          color: p.color || C.text,
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: 3,
        }}>
          <span style={{
            width: 8, height: 2, background: p.color || C.pink,
            display: "inline-block",
          }} />
          <span style={{ color: C.muted }}>{p.name}:</span> {fmt(p.value)}
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════
   NAV TABS (OVERVIEW | SALES | EXPENSES)
   ═══════════════════════════════════════════ */
export function NavTabs({ active, onChange }) {
  const pages = [
    { key: "overview", label: "OVERVIEW" },
    { key: "sales", label: "SALES" },
    { key: "expenses", label: "EXPENSES" },
  ];
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {pages.map((p) => (
        <button
          key={p.key}
          onClick={() => { onChange(p.key); window.umami?.track("page_change", { page: p.key }); }}
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.12em",
            padding: "7px 20px",
            border: active === p.key ? `1px solid ${C.pink}` : `1px solid ${C.cardBorder}`,
            background: active === p.key ? C.pink : "transparent",
            color: active === p.key ? C.white : C.muted,
            cursor: "pointer",
            transition: "all 0.15s",
            textTransform: "uppercase",
          }}
        >{p.label}</button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   STORE FILTER TABS
   ═══════════════════════════════════════════ */
export function StoreTabs({ active, onChange }) {
  const options = [
    { key: "all", label: "ALL STORES" },
    ...STORES.map((s) => ({ key: s.key, label: s.name.toUpperCase() })),
  ];
  return (
    <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => { onChange(o.key); window.umami?.track("store_filter", { store: o.key }); }}
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.12em",
            padding: "7px 16px",
            border: active === o.key ? `1px solid ${C.pink}` : `1px solid ${C.cardBorder}`,
            background: active === o.key ? C.pink : "transparent",
            color: active === o.key ? C.white : C.muted,
            cursor: "pointer",
            transition: "all 0.15s",
            textTransform: "uppercase",
          }}
        >{o.label}</button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   YEAR FILTER TABS
   ═══════════════════════════════════════════ */
export function YearTabs({ active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {["all", "1998", "1999", "2000"].map((y) => (
        <button
          key={y}
          onClick={() => { onChange(y); window.umami?.track("year_filter", { year: y }); }}
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.1em",
            padding: "5px 12px",
            border: active === y ? `1px solid ${C.yellow}` : `1px solid ${C.cardBorder}`,
            background: active === y ? "rgba(255,214,0,0.12)" : "transparent",
            color: active === y ? C.yellow : C.dim,
            cursor: "pointer",
            textTransform: "uppercase",
          }}
        >{y === "all" ? "ALL YRS" : `'${y.slice(2)}`}</button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   ICON ARRAY (10×10 GRID)
   ═══════════════════════════════════════════ */
export function IconArray({ segments, size = 18, gap = 2, columns = 10 }) {
  const squares = [];
  segments.forEach((seg) => {
    for (let i = 0; i < seg.count; i++) {
      squares.push(seg.color);
    }
  });
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, ${size}px)`,
      gap,
    }}>
      {squares.map((color, i) => (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            background: color,
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}
