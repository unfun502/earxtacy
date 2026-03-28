import { useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

/* ═══════════════════════════════════════════
   SEED DATA GENERATOR
   ═══════════════════════════════════════════ */

const STORES = [
  { key: "bardstown", name: "Bardstown Rd", tag: "FLAGSHIP", base: 145000 },
  { key: "middletown", name: "Middletown", tag: "SUBURBAN", base: 42000 },
  { key: "newalbany", name: "New Albany", tag: "ACROSS THE RIVER", base: 38000 },
  { key: "dixie", name: "Dixie Hwy", tag: "SOUTHWEST", base: 35000 },
];

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function seededRand(seed) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

function generateMonthlyData() {
  const rand = seededRand(42);
  const data = [];
  const years = [1998, 1999, 2000];
  const seasonality = [0.85, 0.78, 0.88, 0.92, 0.95, 0.88, 0.82, 0.80, 0.90, 0.95, 1.10, 1.35];
  const yearGrowth = [1.0, 1.12, 1.08];

  years.forEach((year, yi) => {
    MONTHS_SHORT.forEach((month, mi) => {
      const row = { month: `${month} '${String(year).slice(2)}`, year, monthIdx: mi, monthName: month };
      let total = 0;
      STORES.forEach((store) => {
        const jitter = 0.9 + rand() * 0.2;
        const storeSpecific = store.key === "middletown" ? (yi === 2 ? 1.15 : 1.0) :
                              store.key === "newalbany" ? (yi === 1 ? 1.1 : 0.95) :
                              store.key === "dixie" ? (mi >= 9 ? 1.08 : 0.97) : 1.0;
        const val = Math.round(store.base * seasonality[mi] * yearGrowth[yi] * jitter * storeSpecific);
        row[store.key] = val;
        total += val;
      });
      row.total = total;
      data.push(row);
    });
  });
  return data;
}

const monthlyData = generateMonthlyData();

const FORMAT_SPLIT = {
  "Compact Disc": { pct: 0.58, color: "#FF2D55" },
  "Vinyl": { pct: 0.18, color: "#FFD600" },
  "Cassette": { pct: 0.06, color: "#FF8800" },
  "Concert Tickets": { pct: 0.08, color: "#00FF88" },
  "Merch & Posters": { pct: 0.06, color: "#00BFFF" },
  "Used / Trade-Ins": { pct: 0.04, color: "#C084FC" },
};

const GENRE_DATA = [
  { genre: "Alt / Indie", value: 92 },
  { genre: "Hip-Hop", value: 78 },
  { genre: "Electronic", value: 65 },
  { genre: "Metal / Punk", value: 71 },
  { genre: "Classic Rock", value: 58 },
  { genre: "Country", value: 42 },
];

const TOP_SELLERS = [
  { rank: 1, title: "Stankonia", artist: "OutKast", format: "CD", units: 2840 },
  { rank: 2, title: "Kid A", artist: "Radiohead", format: "CD", units: 2610 },
  { rank: 3, title: "The Marshall Mathers LP", artist: "Eminem", format: "CD", units: 2380 },
  { rank: 4, title: "Californication", artist: "RHCP", format: "CD", units: 2150 },
  { rank: 5, title: "Enema of the State", artist: "blink-182", format: "CD", units: 1920 },
  { rank: 6, title: "Significant Other", artist: "Limp Bizkit", format: "CD", units: 1870 },
  { rank: 7, title: "OK Computer", artist: "Radiohead", format: "Vinyl", units: 1640 },
  { rank: 8, title: "Aquemini", artist: "OutKast", format: "CD", units: 1580 },
];

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */
const fmt = (n) => "$" + Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
const fmtK = (n) => "$" + (n / 1000).toFixed(0) + "k";
const fmtShort = (n) => n >= 1000000 ? "$" + (n/1000000).toFixed(2) + "M" : n >= 1000 ? "$" + (n/1000).toFixed(0) + "k" : "$" + n;

/* ═══════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════ */
const C = {
  bg: "#0A0A0A",
  card: "#111111",
  cardBorder: "#222222",
  pink: "#FF2D55",
  green: "#00FF88",
  yellow: "#FFD600",
  orange: "#FF8800",
  cyan: "#00BFFF",
  purple: "#C084FC",
  text: "#E0E0E0",
  muted: "#666666",
  dim: "#444444",
  white: "#FFFFFF",
};

const STORE_COLORS = {
  bardstown: C.pink,
  middletown: C.yellow,
  newalbany: C.green,
  dixie: C.cyan,
};

/* ═══════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════ */

function KPI({ label, value, sub, accent = C.pink }) {
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

function Section({ title, right, children, style: sx }) {
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

const ChartTooltip = ({ active, payload, label }) => {
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

function StoreTabs({ active, onChange }) {
  const options = [{ key: "all", label: "ALL STORES" }, ...STORES.map(s => ({ key: s.key, label: s.name.toUpperCase() }))];
  return (
    <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
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

function YearTabs({ active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {["all", "1998", "1999", "2000"].map((y) => (
        <button
          key={y}
          onClick={() => onChange(y)}
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
   MAIN DASHBOARD
   ═══════════════════════════════════════════ */

export default function EarXtacyDashboard() {
  const [activeStore, setActiveStore] = useState("all");
  const [activeYear, setActiveYear] = useState("all");

  const filteredData = useMemo(() => {
    let d = monthlyData;
    if (activeYear !== "all") d = d.filter(r => r.year === parseInt(activeYear));
    return d;
  }, [activeYear]);

  const totals = useMemo(() => {
    const t = { bardstown: 0, middletown: 0, newalbany: 0, dixie: 0, total: 0 };
    filteredData.forEach(r => {
      STORES.forEach(s => { t[s.key] += r[s.key]; });
      t.total += r.total;
    });
    return t;
  }, [filteredData]);

  const displayTotal = activeStore === "all" ? totals.total : totals[activeStore];
  const displayMonths = filteredData.length;
  const avgMonthly = Math.round(displayTotal / displayMonths);

  const storeRankData = STORES.map(s => ({
    ...s,
    total: totals[s.key],
    avg: Math.round(totals[s.key] / displayMonths),
    pct: ((totals[s.key] / totals.total) * 100).toFixed(1),
  })).sort((a, b) => b.total - a.total);

  const formatData = Object.entries(FORMAT_SPLIT).map(([name, info]) => ({
    name,
    value: Math.round(displayTotal * info.pct),
    color: info.color,
    pct: info.pct,
  }));

  const trendData = filteredData.map(r => ({
    month: r.month,
    value: activeStore === "all" ? r.total : r[activeStore],
    ...STORES.reduce((acc, s) => ({ ...acc, [s.key]: r[s.key] }), {}),
  }));

  const storeCompData = filteredData.map(r => ({
    month: r.month,
    ...STORES.reduce((acc, s) => ({ ...acc, [s.key]: r[s.key] }), {}),
  }));

  const peakMonth = filteredData.reduce((best, r) => {
    const val = activeStore === "all" ? r.total : r[activeStore];
    return val > best.val ? { val, label: r.month } : best;
  }, { val: 0, label: "" });

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      fontFamily: "'DM Mono', monospace",
      color: C.text,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Anton&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet" />

      {/* GRAIN + SCANLINE */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: "none", zIndex: 9999, opacity: 0.03, mixBlendMode: "overlay",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />

      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.8; }
          94% { opacity: 1; }
        }
      `}</style>
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, rgba(255,45,85,0.06), transparent)`,
        animation: "scanline 8s linear infinite",
        pointerEvents: "none", zIndex: 9998,
      }} />

      {/* ── HEADER ── */}
      <header style={{ borderBottom: `1px solid ${C.cardBorder}` }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 32px",
          maxWidth: 1300,
          margin: "0 auto",
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <h1 style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 32,
              color: C.white,
              margin: 0,
              letterSpacing: "0.04em",
              lineHeight: 1,
              animation: "flicker 5s infinite",
            }}>
              EAR X-TACY
            </h1>
            <span style={{
              fontSize: 10,
              color: C.pink,
              letterSpacing: "0.15em",
              fontWeight: 500,
              borderLeft: `2px solid ${C.pink}`,
              paddingLeft: 12,
            }}>SALES DASHBOARD</span>
          </div>
          <div style={{
            fontSize: 10,
            color: C.dim,
            letterSpacing: "0.1em",
            textAlign: "right",
          }}>
            <span style={{ color: C.muted }}>Louisville, KY</span>
            <br />1998 – 2000
          </div>
        </div>

        {/* MARQUEE */}
        <div style={{
          overflow: "hidden",
          borderTop: `1px solid ${C.cardBorder}`,
          background: "rgba(255,45,85,0.04)",
          padding: "5px 0",
        }}>
          <div style={{
            display: "flex",
            animation: "marquee 30s linear infinite",
            whiteSpace: "nowrap",
            width: "max-content",
          }}>
            {[0,1].map((dupeIdx) => (
              <span key={dupeIdx} style={{
                fontSize: 10,
                color: C.dim,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 400,
              }}>
                &nbsp;&nbsp;★ BARDSTOWN RD &nbsp;&nbsp;★ MIDDLETOWN &nbsp;&nbsp;★ NEW ALBANY &nbsp;&nbsp;★ DIXIE HWY &nbsp;&nbsp;★ COMPACT DISC &nbsp;&nbsp;★ VINYL &nbsp;&nbsp;★ CASSETTE &nbsp;&nbsp;★ CONCERT TIX &nbsp;&nbsp;★ MERCH &nbsp;&nbsp;★ USED &nbsp;&nbsp;★ TRADE-INS &nbsp;&nbsp;★ LOUISVILLE'S RECORD STORE &nbsp;&nbsp;
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "24px 32px 64px" }}>

        {/* FILTERS */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 8,
        }}>
          <StoreTabs active={activeStore} onChange={setActiveStore} />
          <YearTabs active={activeYear} onChange={setActiveYear} />
        </div>

        {/* KPI ROW */}
        <div style={{ display: "flex", gap: 2, flexWrap: "wrap", marginBottom: 24 }}>
          <KPI label="Total Revenue" value={fmtShort(displayTotal)} sub={`${displayMonths} months`} accent={C.pink} />
          <KPI label="Avg / Month" value={fmtShort(avgMonthly)} sub="Per active month" accent={C.yellow} />
          <KPI label="Peak Month" value={fmtShort(peakMonth.val)} sub={peakMonth.label} accent={C.green} />
          <KPI label="Locations" value="4" sub="Louisville metro" accent={C.cyan} />
          <KPI label="Top Format" value="CD" sub={`${(FORMAT_SPLIT["Compact Disc"].pct * 100).toFixed(0)}% of revenue`} accent={C.orange} />
        </div>

        {/* MAIN CHART ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, marginBottom: 2 }}>

          {/* REVENUE TREND */}
          <Section title="Revenue Trend" right={activeStore === "all" ? "All Stores" : STORES.find(s=>s.key===activeStore)?.name}>
            <ResponsiveContainer width="100%" height={280}>
              {activeStore === "all" ? (
                <AreaChart data={storeCompData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <defs>
                    {STORES.map(s => (
                      <linearGradient key={s.key} id={`g_${s.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={STORE_COLORS[s.key]} stopOpacity={s.key === "bardstown" ? 0.3 : 0.15} />
                        <stop offset="100%" stopColor={STORE_COLORS[s.key]} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="2 6" stroke="#1A1A1A" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: C.dim, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} interval={2} />
                  <YAxis tick={{ fontSize: 9, fill: C.dim, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
                  <Tooltip content={<ChartTooltip />} />
                  {STORES.map(s => (
                    <Area
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      name={s.name}
                      stroke={STORE_COLORS[s.key]}
                      strokeWidth={s.key === "bardstown" ? 2 : 1.5}
                      fill={`url(#g_${s.key})`}
                      dot={false}
                      activeDot={{ r: 3, fill: STORE_COLORS[s.key], stroke: C.card, strokeWidth: 2 }}
                    />
                  ))}
                </AreaChart>
              ) : (
                <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g_single" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={STORE_COLORS[activeStore] || C.pink} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={STORE_COLORS[activeStore] || C.pink} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 6" stroke="#1A1A1A" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: C.dim, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} interval={2} />
                  <YAxis tick={{ fontSize: 9, fill: C.dim, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name={STORES.find(s=>s.key===activeStore)?.name || "Total"}
                    stroke={STORE_COLORS[activeStore] || C.pink}
                    strokeWidth={2}
                    fill="url(#g_single)"
                    dot={false}
                    activeDot={{ r: 4, fill: STORE_COLORS[activeStore] || C.pink, stroke: C.card, strokeWidth: 2 }}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </Section>

          {/* STORE COMPARISON BAR */}
          <Section title="Store Breakdown" right="Stacked Monthly">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={storeCompData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 6" stroke="#1A1A1A" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: C.dim, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fontSize: 9, fill: C.dim, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
                <Tooltip content={<ChartTooltip />} />
                {[...STORES].reverse().map(s => (
                  <Bar key={s.key} dataKey={s.key} name={s.name} stackId="a" fill={STORE_COLORS[s.key]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Section>
        </div>

        {/* SECOND ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, marginBottom: 2 }}>

          {/* FORMAT MIX */}
          <Section title="Sales by Format" right="Revenue Split">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={formatData}
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={78}
                  paddingAngle={2}
                  dataKey="value"
                  stroke={C.card}
                  strokeWidth={2}
                >
                  {formatData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginTop: 4 }}>
              {formatData.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, color: C.muted }}>
                  <span style={{ width: 8, height: 2, background: f.color, display: "inline-block" }} />
                  {f.name}
                </div>
              ))}
            </div>
          </Section>

          {/* GENRE RADAR */}
          <Section title="Genre Strength" right="Relative Index">
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={GENRE_DATA} cx="50%" cy="50%" outerRadius={80}>
                <PolarGrid stroke="#1A1A1A" />
                <PolarAngleAxis dataKey="genre" tick={{ fontSize: 9, fill: C.muted, fontFamily: "'DM Mono'" }} />
                <Radar name="Strength" dataKey="value" stroke={C.pink} fill={C.pink} fillOpacity={0.15} strokeWidth={1.5} dot={{ r: 3, fill: C.pink }} />
              </RadarChart>
            </ResponsiveContainer>
          </Section>

          {/* STORE RANKINGS */}
          <Section title="Store Rankings" right={activeYear === "all" ? "1998–2000" : activeYear}>
            <div>
              {storeRankData.map((s, i) => (
                <div key={s.key} style={{
                  padding: "12px 0",
                  borderBottom: i < storeRankData.length - 1 ? `1px solid ${C.cardBorder}` : "none",
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 6,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        fontFamily: "'Anton', sans-serif",
                        fontSize: 20,
                        color: C.dim,
                        width: 24,
                        lineHeight: 1,
                      }}>#{i + 1}</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{s.name}</div>
                        <div style={{ fontSize: 9, color: C.dim, marginTop: 1 }}>{s.tag}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{
                        fontFamily: "'Anton', sans-serif",
                        fontSize: 18,
                        color: STORE_COLORS[s.key],
                        lineHeight: 1,
                      }}>{fmtShort(s.total)}</div>
                      <div style={{ fontSize: 9, color: C.dim, marginTop: 2 }}>{s.pct}%</div>
                    </div>
                  </div>
                  <div style={{
                    height: 3,
                    background: "#1A1A1A",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${(s.total / storeRankData[0].total) * 100}%`,
                      background: STORE_COLORS[s.key],
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* THIRD ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>

          {/* TOP SELLERS TABLE */}
          <Section title="Top Sellers" right="Across All Locations">
            <div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "28px 1fr 90px 50px 70px",
                gap: 8,
                padding: "0 0 8px",
                borderBottom: `1px solid ${C.cardBorder}`,
                fontSize: 9,
                color: C.dim,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}>
                <span>#</span><span>Title</span><span>Artist</span><span>Fmt</span><span style={{ textAlign: "right" }}>Units</span>
              </div>
              {TOP_SELLERS.map((item) => (
                <div key={item.rank} style={{
                  display: "grid",
                  gridTemplateColumns: "28px 1fr 90px 50px 70px",
                  gap: 8,
                  padding: "9px 0",
                  borderBottom: `1px solid #161616`,
                  alignItems: "center",
                  fontSize: 11,
                }}>
                  <span style={{ color: C.dim, fontFamily: "'Anton'", fontSize: 14 }}>{item.rank}</span>
                  <span style={{ color: C.text, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</span>
                  <span style={{ color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.artist}</span>
                  <span style={{
                    fontSize: 9,
                    color: item.format === "Vinyl" ? C.yellow : C.dim,
                    letterSpacing: "0.08em",
                  }}>{item.format}</span>
                  <span style={{
                    textAlign: "right",
                    color: C.green,
                    fontWeight: 500,
                  }}>{item.units.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* YEAR OVER YEAR */}
          <Section title="Year-Over-Year" right="Annual Totals">
            {(() => {
              const yoyData = [1998, 1999, 2000].map(year => {
                const yearRows = monthlyData.filter(r => r.year === year);
                const row = { year: `'${String(year).slice(2)}` };
                STORES.forEach(s => {
                  row[s.key] = yearRows.reduce((sum, r) => sum + r[s.key], 0);
                });
                row.total = yearRows.reduce((sum, r) => sum + r.total, 0);
                return row;
              });
              return (
                <div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={yoyData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="2 6" stroke="#1A1A1A" vertical={false} />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: C.muted, fontFamily: "'Anton'", letterSpacing: "0.05em" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: C.dim, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`} />
                      <Tooltip content={<ChartTooltip />} />
                      {STORES.map(s => (
                        <Bar key={s.key} dataKey={s.key} name={s.name} stackId="a" fill={STORE_COLORS[s.key]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-around",
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: `1px solid ${C.cardBorder}`,
                  }}>
                    {yoyData.map((y, i) => (
                      <div key={i} style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "'Anton'", fontSize: 22, color: C.white, letterSpacing: "0.03em" }}>
                          {fmtShort(y.total)}
                        </div>
                        <div style={{ fontSize: 9, color: C.dim, marginTop: 2 }}>
                          {i > 0 ? `${((y.total / yoyData[i-1].total - 1) * 100).toFixed(1)}% vs prior` : "Baseline"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </Section>
        </div>

        {/* FOOTER */}
        <div style={{
          marginTop: 32,
          paddingTop: 14,
          borderTop: `1px solid ${C.cardBorder}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}>
          <span style={{ fontSize: 9, color: C.dim, letterSpacing: "0.1em" }}>
            SIMULATED DATA · NOT AFFILIATED WITH EAR X-TACY RECORDS
          </span>
          <span style={{ fontSize: 9, color: C.dim, letterSpacing: "0.1em" }}>
            BUILT BY <span style={{ color: C.pink, fontWeight: 500 }}>DEVLAB502</span>
          </span>
        </div>
      </div>
    </div>
  );
}
