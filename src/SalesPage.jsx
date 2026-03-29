import { useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, Treemap,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  C, STORES, STORE_COLORS, CATALOG, GENRE_COLORS, GENRES, MERCH_TYPES, monthlyData,
} from "./data";
import { fmt, fmtShort, fmtNum } from "./helpers";
import { KPI, Section, ChartTooltip, IconArray } from "./components";

/* ═══════════════════════════════════════════
   TREEMAP CUSTOM CONTENT RENDERER
   ═══════════════════════════════════════════ */
const CustomTreemapContent = (props) => {
  const { x, y, width, height, name, value, color, depth } = props;
  if (depth !== 1) return null;
  const showName = width > 55 && height > 35;
  const showValue = width > 55 && height > 50;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height}
        fill={color} fillOpacity={0.8}
        stroke={C.card} strokeWidth={2} />
      {showName && (
        <text x={x + width / 2} y={y + height / 2 - (showValue ? 6 : 0)}
          textAnchor="middle" dominantBaseline="central"
          fill={C.white} fontFamily="'Anton', sans-serif" fontSize={13}
          letterSpacing="0.06em">
          {name}
        </text>
      )}
      {showValue && (
        <text x={x + width / 2} y={y + height / 2 + 12}
          textAnchor="middle" dominantBaseline="central"
          fill="rgba(255,255,255,0.7)" fontFamily="'DM Mono', monospace" fontSize={9}>
          {fmt(value)}
        </text>
      )}
    </g>
  );
};

/* ═══════════════════════════════════════════
   LEDGER FILTER SELECT
   ═══════════════════════════════════════════ */
function LedgerSelect({ label, value, onChange, options, disabled }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <label style={{
        fontFamily: "'DM Mono', monospace", fontSize: 8, color: C.dim,
        letterSpacing: "0.12em", textTransform: "uppercase",
      }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          fontFamily: "'DM Mono', monospace", fontSize: 10,
          letterSpacing: "0.06em", textTransform: "uppercase",
          background: disabled ? "#0D0D0D" : C.card,
          border: `1px solid ${value !== "all" && !disabled ? C.pink : C.cardBorder}`,
          color: disabled ? C.dim : (value !== "all" ? C.text : C.muted),
          padding: "5px 8px",
          cursor: disabled ? "not-allowed" : "pointer",
          outline: "none",
          minWidth: 90,
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SALES PAGE
   ═══════════════════════════════════════════ */

export default function SalesPage({ activeStore, activeYear, filteredData, totals, displayTotal, displayMonths }) {
  // ── LEDGER FILTERS ──
  const [filters, setFilters] = useState({
    category: "all",
    genre: "all",
    format: "all",
    merchType: "all",
    condition: "all",
    sortBy: "revenue",
    sortDir: "desc",
  });
  const [ledgerPage, setLedgerPage] = useState(0);
  const PAGE_SIZE = 50;

  const setFilter = (key, value) => {
    const next = { ...filters, [key]: value };
    // Reset dependent filters
    if (key === "category") {
      if (value === "Merch") { next.genre = "all"; next.format = "all"; next.condition = "all"; }
      if (value === "Music") { next.merchType = "all"; }
    }
    setFilters(next);
    setLedgerPage(0);
    window.umami?.track("ledger_filter", { filter: key, value });
  };

  const toggleSort = (col) => {
    if (filters.sortBy === col) {
      setFilters({ ...filters, sortDir: filters.sortDir === "desc" ? "asc" : "desc" });
    } else {
      setFilters({ ...filters, sortBy: col, sortDir: "desc" });
    }
    setLedgerPage(0);
    window.umami?.track("ledger_sort", { column: col });
  };

  // ── STORE/YEAR SCALING ──
  // Scale catalog units proportionally based on store + year revenue share
  const revenueShareMultiplier = useMemo(() => {
    if (activeStore === "all" && activeYear === "all") return 1;
    const totalAllTime = monthlyData.reduce((s, r) => s + r.total, 0);
    return displayTotal / totalAllTime;
  }, [activeStore, activeYear, displayTotal]);

  const storeShareMultiplier = useMemo(() => {
    if (activeStore === "all") return null; // use full storeUnits
    return null; // handled per-item via storeUnits
  }, [activeStore]);

  function getItemUnits(item) {
    if (activeStore === "all") {
      const yearMult = activeYear === "all" ? 1 : (() => {
        const totalAll = monthlyData.reduce((s, r) => s + r.total, 0);
        return displayTotal / totalAll;
      })();
      return {
        unitsNew: Math.round(item.unitsNew * yearMult),
        unitsUsed: Math.round(item.unitsUsed * yearMult),
      };
    }
    const su = item.storeUnits[activeStore];
    if (!su) return { unitsNew: 0, unitsUsed: 0 };
    const yearMult = activeYear === "all" ? 1 : (() => {
      const totalAll = monthlyData.reduce((s, r) => s + r.total, 0);
      return displayTotal / totalAll;
    })();
    return {
      unitsNew: Math.round(su.unitsNew * yearMult),
      unitsUsed: Math.round(su.unitsUsed * yearMult),
    };
  }

  // ── NEW VS USED CALCULATIONS ──
  const newUsedSplit = useMemo(() => {
    let totalNew = 0, totalUsed = 0;
    CATALOG.forEach((item) => {
      if (item.category !== "Music") return;
      const u = getItemUnits(item);
      totalNew += u.unitsNew * item.priceNew;
      totalUsed += u.unitsUsed * item.priceUsed;
    });
    const total = totalNew + totalUsed;
    const pctNew = total > 0 ? Math.round((totalNew / total) * 100) : 90;
    const pctUsed = 100 - pctNew;
    return { totalNew, totalUsed, total, pctNew, pctUsed };
  }, [activeStore, activeYear, displayTotal]);

  // New vs Used trend data
  const newUsedTrendData = useMemo(() => {
    return filteredData.map((r) => {
      const rev = activeStore === "all" ? r.total : r[activeStore];
      return {
        month: r.month,
        new: Math.round(rev * (newUsedSplit.pctNew / 100)),
        used: Math.round(rev * (newUsedSplit.pctUsed / 100)),
      };
    });
  }, [filteredData, activeStore, newUsedSplit]);

  // ── GENRE TREEMAP ──
  const genreTreemapData = useMemo(() => {
    const genreTotals = {};
    CATALOG.forEach((item) => {
      if (item.category !== "Music" || !item.genre) return;
      const u = getItemUnits(item);
      const rev = u.unitsNew * item.priceNew + u.unitsUsed * item.priceUsed;
      genreTotals[item.genre] = (genreTotals[item.genre] || 0) + rev;
    });
    return Object.entries(genreTotals)
      .map(([name, value]) => ({
        name,
        value: Math.round(value),
        color: GENRE_COLORS[name] || C.dim,
      }))
      .sort((a, b) => b.value - a.value);
  }, [activeStore, activeYear, displayTotal]);

  const maxGenreVal = genreTreemapData[0]?.value || 1;

  // ── MERCH BY TYPE ──
  const merchByType = useMemo(() => {
    const typeTotals = {};
    CATALOG.forEach((item) => {
      if (item.category !== "Merch") return;
      const u = getItemUnits(item);
      const rev = u.unitsNew * item.priceNew;
      const type = item.merchType || "Other";
      if (!typeTotals[type]) typeTotals[type] = { units: 0, revenue: 0 };
      typeTotals[type].units += u.unitsNew;
      typeTotals[type].revenue += rev;
    });
    return Object.entries(typeTotals)
      .map(([type, data]) => ({ type, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [activeStore, activeYear, displayTotal]);

  // Top merch items
  const topMerch = useMemo(() => {
    return CATALOG
      .filter((i) => i.category === "Merch")
      .map((item) => {
        const u = getItemUnits(item);
        return { ...item, scaledUnits: u.unitsNew, scaledRevenue: Math.round(u.unitsNew * item.priceNew) };
      })
      .sort((a, b) => b.scaledRevenue - a.scaledRevenue)
      .slice(0, 8);
  }, [activeStore, activeYear, displayTotal]);

  // ── FILTERED LEDGER ──
  const { filteredItems, totalFilteredRevenue, totalFilteredCount } = useMemo(() => {
    let items = CATALOG.map((item) => {
      const u = getItemUnits(item);
      let unitDisplay, revDisplay;
      if (filters.condition === "New") {
        unitDisplay = u.unitsNew;
        revDisplay = Math.round(u.unitsNew * item.priceNew);
      } else if (filters.condition === "Used") {
        unitDisplay = u.unitsUsed;
        revDisplay = Math.round(u.unitsUsed * item.priceUsed);
      } else {
        unitDisplay = u.unitsNew + u.unitsUsed;
        revDisplay = Math.round(u.unitsNew * item.priceNew + u.unitsUsed * item.priceUsed);
      }
      return { ...item, unitDisplay, revDisplay };
    });

    // Apply filters
    if (filters.category !== "all") items = items.filter((i) => i.category === filters.category);
    if (filters.genre !== "all") items = items.filter((i) => i.genre === filters.genre);
    if (filters.format !== "all") items = items.filter((i) => i.format === filters.format);
    if (filters.merchType !== "all") items = items.filter((i) => i.merchType === filters.merchType);
    if (filters.condition === "Used") items = items.filter((i) => i.unitDisplay > 0);
    if (filters.condition === "New") items = items.filter((i) => i.unitDisplay > 0);

    // Sort
    const dir = filters.sortDir === "desc" ? -1 : 1;
    items.sort((a, b) => {
      switch (filters.sortBy) {
        case "revenue": return (a.revDisplay - b.revDisplay) * dir;
        case "units": return (a.unitDisplay - b.unitDisplay) * dir;
        case "title": return a.title.localeCompare(b.title) * -dir;
        case "artist": return a.artist.localeCompare(b.artist) * -dir;
        case "price": return (a.priceNew - b.priceNew) * dir;
        default: return (a.revDisplay - b.revDisplay) * dir;
      }
    });

    const totalFilteredRevenue = items.reduce((s, i) => s + i.revDisplay, 0);
    return { filteredItems: items, totalFilteredRevenue, totalFilteredCount: items.length };
  }, [filters, activeStore, activeYear, displayTotal]);

  const pageCount = Math.ceil(totalFilteredCount / PAGE_SIZE);
  const pagedItems = filteredItems.slice(ledgerPage * PAGE_SIZE, (ledgerPage + 1) * PAGE_SIZE);

  // ── RENDER ──
  const merchColors = [C.pink, C.yellow, C.green, C.cyan, C.orange, C.purple, "#8B6914", "#6B8A7A"];

  return (
    <>
      {/* KPI ROW */}
      <div style={{ display: "flex", gap: 2, flexWrap: "wrap", marginBottom: 24 }}>
        <KPI label="Music Revenue" value={fmtShort(newUsedSplit.total)} sub="All formats" accent={C.pink} />
        <KPI label="New Sales" value={`${newUsedSplit.pctNew}%`} sub={fmtShort(newUsedSplit.totalNew)} accent={C.yellow} />
        <KPI label="Used Sales" value={`${newUsedSplit.pctUsed}%`} sub={fmtShort(newUsedSplit.totalUsed)} accent={C.purple} />
        <KPI label="Catalog Items" value={fmtNum(CATALOG.length)} sub="Music + Merch" accent={C.green} />
        <KPI label="Merch Revenue" value={fmtShort(merchByType.reduce((s, m) => s + m.revenue, 0))} sub={`${merchByType.length} categories`} accent={C.cyan} />
      </div>

      {/* ROW 1: Icon Array + New vs Used Trend */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 2, marginBottom: 2 }}>
        <Section title="New vs Used Split" right="Revenue Ratio">
          <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
            <IconArray
              segments={[
                { count: newUsedSplit.pctNew, color: C.pink },
                { count: newUsedSplit.pctUsed, color: C.purple },
              ]}
              size={16} gap={2} columns={10}
            />
          </div>
          <div style={{
            display: "flex", justifyContent: "center", gap: 20, marginTop: 12,
            fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.08em",
          }}>
            <span><span style={{ color: C.pink }}>{newUsedSplit.pctNew}% NEW</span> · {fmtShort(newUsedSplit.totalNew)}</span>
            <span><span style={{ color: C.purple }}>{newUsedSplit.pctUsed}% USED</span> · {fmtShort(newUsedSplit.totalUsed)}</span>
          </div>
        </Section>

        <Section title="New vs Used Trend" right="Monthly Revenue">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={newUsedTrendData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="g_new" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.pink} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={C.pink} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g_used" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.purple} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={C.purple} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 6" stroke="#1A1A1A" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: C.dim, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 9, fill: C.dim, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="new" name="New" stackId="nu" stroke={C.pink} fill="url(#g_new)" strokeWidth={1.5} dot={false} />
              <Area type="monotone" dataKey="used" name="Used" stackId="nu" stroke={C.purple} fill="url(#g_used)" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {/* ROW 2: Genre Treemap + Genre Bars */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 2, marginBottom: 2 }}>
        <Section title="Genre Revenue" right="Treemap">
          <ResponsiveContainer width="100%" height={300}>
            <Treemap
              data={genreTreemapData}
              dataKey="value"
              nameKey="name"
              content={<CustomTreemapContent />}
              animationDuration={300}
            />
          </ResponsiveContainer>
        </Section>

        <Section title="Genre Breakdown" right="By Revenue">
          <div>
            {genreTreemapData.map((g, i) => (
              <div key={g.name} style={{
                padding: "8px 0",
                borderBottom: i < genreTreemapData.length - 1 ? `1px solid ${C.cardBorder}` : "none",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: C.text }}>{g.name}</span>
                  <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 14, color: g.color }}>{fmtShort(g.value)}</span>
                </div>
                <div style={{ height: 3, background: "#1A1A1A", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${(g.value / maxGenreVal) * 100}%`,
                    background: g.color,
                    transition: "width 0.5s ease",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* ROW 3: Merch by Type + Top Merch */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, marginBottom: 2 }}>
        <Section title="Merch by Category" right="Revenue">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={merchByType} layout="vertical" margin={{ top: 8, right: 16, left: 70, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 6" stroke="#1A1A1A" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9, fill: C.dim, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="type" tick={{ fontSize: 10, fill: C.muted, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} width={65} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="revenue" name="Revenue" fill={C.cyan}>
                {merchByType.map((_, i) => (
                  <rect key={i} fill={merchColors[i % merchColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Top Merch Items" right="By Revenue">
          <div>
            <div style={{
              display: "grid", gridTemplateColumns: "28px 1fr 70px 60px 80px",
              gap: 6, padding: "0 0 8px", borderBottom: `1px solid ${C.cardBorder}`,
              fontSize: 9, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              <span>#</span><span>Item</span><span>Type</span><span>Price</span><span style={{ textAlign: "right" }}>Revenue</span>
            </div>
            {topMerch.map((item, i) => (
              <div key={item.id} style={{
                display: "grid", gridTemplateColumns: "28px 1fr 70px 60px 80px",
                gap: 6, padding: "8px 0", borderBottom: "1px solid #161616",
                alignItems: "center", fontSize: 11,
              }}>
                <span style={{ color: C.dim, fontFamily: "'Anton'", fontSize: 14 }}>{i + 1}</span>
                <span style={{ color: C.text, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</span>
                <span style={{ color: C.muted, fontSize: 9 }}>{item.merchType}</span>
                <span style={{ color: C.dim }}>{fmt(item.priceNew)}</span>
                <span style={{ textAlign: "right", color: C.green, fontWeight: 500 }}>{fmt(item.scaledRevenue)}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* ROW 4: SALES LEDGER */}
      <Section title="Sales Ledger" right={`${fmtNum(totalFilteredCount)} items · ${fmt(totalFilteredRevenue)} total`}>

        {/* FILTER ROW */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${C.cardBorder}` }}>
          <LedgerSelect label="Category" value={filters.category} onChange={(v) => setFilter("category", v)}
            options={[{ value: "all", label: "All" }, { value: "Music", label: "Music" }, { value: "Merch", label: "Merch" }]} />
          <LedgerSelect label="Genre" value={filters.genre} onChange={(v) => setFilter("genre", v)}
            disabled={filters.category === "Merch"}
            options={[{ value: "all", label: "All" }, ...GENRES.map((g) => ({ value: g, label: g }))]} />
          <LedgerSelect label="Format" value={filters.format} onChange={(v) => setFilter("format", v)}
            disabled={filters.category === "Merch"}
            options={[{ value: "all", label: "All" }, { value: "CD", label: "CD" }, { value: "Vinyl", label: "Vinyl" }, { value: "Cassette", label: "Cassette" }]} />
          <LedgerSelect label="Merch Type" value={filters.merchType} onChange={(v) => setFilter("merchType", v)}
            disabled={filters.category === "Music"}
            options={[{ value: "all", label: "All" }, ...MERCH_TYPES.map((t) => ({ value: t, label: t }))]} />
          <LedgerSelect label="Condition" value={filters.condition} onChange={(v) => setFilter("condition", v)}
            disabled={filters.category === "Merch"}
            options={[{ value: "all", label: "All" }, { value: "New", label: "New" }, { value: "Used", label: "Used" }]} />
          <LedgerSelect label="Sort By" value={filters.sortBy} onChange={(v) => setFilters({ ...filters, sortBy: v })}
            options={[
              { value: "revenue", label: "Revenue" }, { value: "units", label: "Units" },
              { value: "title", label: "Title" }, { value: "artist", label: "Artist" },
              { value: "price", label: "Price" },
            ]} />
        </div>

        {/* TABLE HEADER */}
        <div style={{
          display: "grid", gridTemplateColumns: "1.5fr 1fr 65px 75px 55px 45px 65px 60px 80px",
          gap: 6, padding: "0 0 8px", borderBottom: `1px solid ${C.cardBorder}`,
          fontSize: 9, color: C.dim, letterSpacing: "0.08em", textTransform: "uppercase",
        }}>
          <SortHeader label="Title" col="title" current={filters.sortBy} dir={filters.sortDir} onClick={toggleSort} />
          <SortHeader label="Artist" col="artist" current={filters.sortBy} dir={filters.sortDir} onClick={toggleSort} />
          <span>Category</span>
          <span>Genre/Type</span>
          <span>Format</span>
          <span>Cond</span>
          <SortHeader label="Price" col="price" current={filters.sortBy} dir={filters.sortDir} onClick={toggleSort} align="right" />
          <SortHeader label="Units" col="units" current={filters.sortBy} dir={filters.sortDir} onClick={toggleSort} align="right" />
          <SortHeader label="Revenue" col="revenue" current={filters.sortBy} dir={filters.sortDir} onClick={toggleSort} align="right" />
        </div>

        {/* TABLE ROWS */}
        {pagedItems.map((item, i) => (
          <div key={item.id} style={{
            display: "grid", gridTemplateColumns: "1.5fr 1fr 65px 75px 55px 45px 65px 60px 80px",
            gap: 6, padding: "7px 0", borderBottom: "1px solid #161616",
            alignItems: "center", fontSize: 10,
            background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
          }}>
            <span style={{ color: C.text, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</span>
            <span style={{ color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.artist}</span>
            <span style={{ color: C.dim, fontSize: 9 }}>{item.category}</span>
            <span style={{ color: C.dim, fontSize: 9, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.genre || item.merchType || "\u2014"}</span>
            <span style={{ color: item.format === "Vinyl" ? C.yellow : C.dim, fontSize: 9 }}>{item.format}</span>
            <span style={{ color: item.unitsUsed > 0 ? C.purple : C.dim, fontSize: 9 }}>{item.unitsUsed > 0 ? "N+U" : "NEW"}</span>
            <span style={{ textAlign: "right", color: C.muted }}>{fmt(item.priceNew)}</span>
            <span style={{ textAlign: "right", color: C.text }}>{fmtNum(item.unitDisplay)}</span>
            <span style={{ textAlign: "right", color: C.green, fontWeight: 500 }}>{fmt(item.revDisplay)}</span>
          </div>
        ))}

        {/* PAGINATION */}
        {pageCount > 1 && (
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            paddingTop: 12, marginTop: 8, borderTop: `1px solid ${C.cardBorder}`,
          }}>
            <span style={{ fontSize: 10, color: C.dim }}>
              Showing {ledgerPage * PAGE_SIZE + 1}–{Math.min((ledgerPage + 1) * PAGE_SIZE, totalFilteredCount)} of {fmtNum(totalFilteredCount)} items
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => setLedgerPage(Math.max(0, ledgerPage - 1))} disabled={ledgerPage === 0}
                style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 10, padding: "4px 10px",
                  background: ledgerPage === 0 ? "#0D0D0D" : C.card,
                  border: `1px solid ${C.cardBorder}`, color: ledgerPage === 0 ? C.dim : C.muted,
                  cursor: ledgerPage === 0 ? "not-allowed" : "pointer",
                }}>PREV</button>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.muted, padding: "4px 8px" }}>
                {ledgerPage + 1} / {pageCount}
              </span>
              <button onClick={() => setLedgerPage(Math.min(pageCount - 1, ledgerPage + 1))} disabled={ledgerPage >= pageCount - 1}
                style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 10, padding: "4px 10px",
                  background: ledgerPage >= pageCount - 1 ? "#0D0D0D" : C.card,
                  border: `1px solid ${C.cardBorder}`, color: ledgerPage >= pageCount - 1 ? C.dim : C.muted,
                  cursor: ledgerPage >= pageCount - 1 ? "not-allowed" : "pointer",
                }}>NEXT</button>
            </div>
          </div>
        )}
      </Section>
    </>
  );
}

/* ═══════════════════════════════════════════
   SORTABLE COLUMN HEADER
   ═══════════════════════════════════════════ */
function SortHeader({ label, col, current, dir, onClick, align }) {
  const isActive = current === col;
  const arrow = isActive ? (dir === "desc" ? " ↓" : " ↑") : "";
  return (
    <span
      onClick={() => onClick(col)}
      style={{
        cursor: "pointer",
        color: isActive ? C.pink : C.dim,
        textAlign: align || "left",
        userSelect: "none",
      }}
    >{label}{arrow}</span>
  );
}
