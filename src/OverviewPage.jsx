import { useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";
import { C, STORES, STORE_COLORS, FORMAT_SPLIT, GENRE_DATA, TOP_SELLERS, monthlyData } from "./data";
import { fmtK, fmtShort } from "./helpers";
import { KPI, Section, ChartTooltip } from "./components";

export default function OverviewPage({ activeStore, activeYear, filteredData, totals, displayTotal, displayMonths }) {
  const avgMonthly = Math.round(displayTotal / displayMonths);

  const storeRankData = STORES.map((s) => ({
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

  const trendData = filteredData.map((r) => ({
    month: r.month,
    value: activeStore === "all" ? r.total : r[activeStore],
    ...STORES.reduce((acc, s) => ({ ...acc, [s.key]: r[s.key] }), {}),
  }));

  const storeCompData = filteredData.map((r) => ({
    month: r.month,
    ...STORES.reduce((acc, s) => ({ ...acc, [s.key]: r[s.key] }), {}),
  }));

  const peakMonth = filteredData.reduce((best, r) => {
    const val = activeStore === "all" ? r.total : r[activeStore];
    return val > best.val ? { val, label: r.month } : best;
  }, { val: 0, label: "" });

  const yoyData = [1998, 1999, 2000].map((year) => {
    const yearRows = monthlyData.filter((r) => r.year === year);
    const row = { year: `'${String(year).slice(2)}` };
    STORES.forEach((s) => {
      row[s.key] = yearRows.reduce((sum, r) => sum + r[s.key], 0);
    });
    row.total = yearRows.reduce((sum, r) => sum + r.total, 0);
    return row;
  });

  return (
    <>
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
        <Section title="Revenue Trend" right={activeStore === "all" ? "All Stores" : STORES.find((s) => s.key === activeStore)?.name}>
          <ResponsiveContainer width="100%" height={280}>
            {activeStore === "all" ? (
              <AreaChart data={storeCompData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  {STORES.map((s) => (
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
                {STORES.map((s) => (
                  <Area key={s.key} type="monotone" dataKey={s.key} name={s.name}
                    stroke={STORE_COLORS[s.key]} strokeWidth={s.key === "bardstown" ? 2 : 1.5}
                    fill={`url(#g_${s.key})`} dot={false}
                    activeDot={{ r: 3, fill: STORE_COLORS[s.key], stroke: C.card, strokeWidth: 2 }} />
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
                <Area type="monotone" dataKey="value"
                  name={STORES.find((s) => s.key === activeStore)?.name || "Total"}
                  stroke={STORE_COLORS[activeStore] || C.pink} strokeWidth={2}
                  fill="url(#g_single)" dot={false}
                  activeDot={{ r: 4, fill: STORE_COLORS[activeStore] || C.pink, stroke: C.card, strokeWidth: 2 }} />
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
              {[...STORES].reverse().map((s) => (
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
              <Pie data={formatData} cx="50%" cy="50%" innerRadius={46} outerRadius={78}
                paddingAngle={2} dataKey="value" stroke={C.card} strokeWidth={2}>
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
        <Section title="Store Rankings" right={activeYear === "all" ? "1998\u20132000" : activeYear}>
          <div>
            {storeRankData.map((s, i) => (
              <div key={s.key} style={{
                padding: "12px 0",
                borderBottom: i < storeRankData.length - 1 ? `1px solid ${C.cardBorder}` : "none",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 20, color: C.dim, width: 24, lineHeight: 1 }}>#{i + 1}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{s.name}</div>
                      <div style={{ fontSize: 9, color: C.dim, marginTop: 1 }}>{s.tag}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 18, color: STORE_COLORS[s.key], lineHeight: 1 }}>{fmtShort(s.total)}</div>
                    <div style={{ fontSize: 9, color: C.dim, marginTop: 2 }}>{s.pct}%</div>
                  </div>
                </div>
                <div style={{ height: 3, background: "#1A1A1A", overflow: "hidden" }}>
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
              display: "grid", gridTemplateColumns: "28px 1fr 90px 50px 70px",
              gap: 8, padding: "0 0 8px", borderBottom: `1px solid ${C.cardBorder}`,
              fontSize: 9, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              <span>#</span><span>Title</span><span>Artist</span><span>Fmt</span><span style={{ textAlign: "right" }}>Units</span>
            </div>
            {TOP_SELLERS.map((item) => (
              <div key={item.rank} style={{
                display: "grid", gridTemplateColumns: "28px 1fr 90px 50px 70px",
                gap: 8, padding: "9px 0", borderBottom: "1px solid #161616",
                alignItems: "center", fontSize: 11,
              }}>
                <span style={{ color: C.dim, fontFamily: "'Anton'", fontSize: 14 }}>{item.rank}</span>
                <span style={{ color: C.text, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</span>
                <span style={{ color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.artist}</span>
                <span style={{ fontSize: 9, color: item.format === "Vinyl" ? C.yellow : C.dim, letterSpacing: "0.08em" }}>{item.format}</span>
                <span style={{ textAlign: "right", color: C.green, fontWeight: 500 }}>{item.units.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* YEAR OVER YEAR */}
        <Section title="Year-Over-Year" right="Annual Totals">
          <div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={yoyData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 6" stroke="#1A1A1A" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: C.muted, fontFamily: "'Anton'", letterSpacing: "0.05em" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: C.dim, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                <Tooltip content={<ChartTooltip />} />
                {STORES.map((s) => (
                  <Bar key={s.key} dataKey={s.key} name={s.name} stackId="a" fill={STORE_COLORS[s.key]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
            <div style={{
              display: "flex", justifyContent: "space-around", marginTop: 14,
              paddingTop: 12, borderTop: `1px solid ${C.cardBorder}`,
            }}>
              {yoyData.map((y, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Anton'", fontSize: 22, color: C.white, letterSpacing: "0.03em" }}>
                    {fmtShort(y.total)}
                  </div>
                  <div style={{ fontSize: 9, color: C.dim, marginTop: 2 }}>
                    {i > 0 ? `${((y.total / yoyData[i - 1].total - 1) * 100).toFixed(1)}% vs prior` : "Baseline"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
