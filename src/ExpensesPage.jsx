import { useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  C, STORES, STORE_COLORS, EXPENSE_CATEGORIES,
  PAYROLL_ROLES, RENT_DATA, AD_CHANNELS, expenseData,
} from "./data";
import { fmt, fmtShort, fmtNum } from "./helpers";
import { KPI, Section, ChartTooltip, IconArray } from "./components";

export default function ExpensesPage({ activeStore, activeYear, filteredData, totals, displayTotal, displayMonths }) {
  const filteredExpenses = useMemo(() => {
    let d = expenseData;
    if (activeYear !== "all") d = d.filter((r) => r.year === parseInt(activeYear));
    return d;
  }, [activeYear]);

  const expenseTotals = useMemo(() => {
    const t = { payroll: 0, inventory: 0, rent: 0, advertising: 0, utilities: 0, total: 0 };
    filteredExpenses.forEach((r) => {
      t.payroll += r.payroll;
      t.inventory += r.inventory;
      t.rent += r.rent;
      t.advertising += r.advertising;
      t.utilities += r.utilities;
      t.total += r.totalExpenses;
    });
    return t;
  }, [filteredExpenses]);

  // Expense breakdown donut data
  const donutData = EXPENSE_CATEGORIES.map((cat) => ({
    name: cat.name,
    value: expenseTotals[cat.key],
    color: cat.color,
  }));

  // Expense trend (stacked area)
  const trendData = filteredExpenses.map((r) => ({
    month: r.month,
    Payroll: r.payroll,
    Inventory: r.inventory,
    Rent: r.rent,
    Advertising: r.advertising,
    "Utilities & Other": r.utilities,
  }));

  // Payroll by store (quarterly aggregation)
  const payrollByStoreData = useMemo(() => {
    const quarters = {};
    filteredExpenses.forEach((r) => {
      const q = `Q${Math.floor(r.monthIdx / 3) + 1} '${String(r.year).slice(2)}`;
      if (!quarters[q]) quarters[q] = { quarter: q };
      STORES.forEach((s) => {
        quarters[q][s.key] = (quarters[q][s.key] || 0) + (r.payrollByStore[s.key] || 0);
      });
    });
    return Object.values(quarters);
  }, [filteredExpenses]);

  // Payroll by role totals
  const totalPayroll = expenseTotals.payroll;
  const payrollRoleData = PAYROLL_ROLES.map((role) => {
    const annualCost = role.avgMonthly * 12 * role.count;
    const periodMonths = filteredExpenses.length;
    const periodCost = Math.round(annualCost * (periodMonths / 12));
    return { ...role, periodCost, pct: ((periodCost / totalPayroll) * 100).toFixed(1) };
  }).sort((a, b) => b.periodCost - a.periodCost);
  const maxRoleCost = payrollRoleData[0]?.periodCost || 1;

  // Rent data with year-appropriate values
  const rentDisplayData = useMemo(() => {
    const yi = activeYear === "all" ? 2 : parseInt(activeYear) - 1998;
    return RENT_DATA.map((r) => {
      const monthlyRent = r.rents[yi] || r.rents[2];
      const cam = Math.round(r.sqft * 0.50);
      return {
        ...r,
        monthlyRent,
        cam,
        totalMonthly: monthlyRent + cam,
        annual: (monthlyRent + cam) * 12,
      };
    });
  }, [activeYear]);

  // Inventory by quarter (new vs used)
  const inventoryData = useMemo(() => {
    const quarters = {};
    filteredExpenses.forEach((r) => {
      const q = `Q${Math.floor(r.monthIdx / 3) + 1} '${String(r.year).slice(2)}`;
      if (!quarters[q]) quarters[q] = { quarter: q, newStock: 0, usedAcq: 0 };
      quarters[q].newStock += r.inventoryNew;
      quarters[q].usedAcq += r.inventoryUsed;
    });
    return Object.values(quarters);
  }, [filteredExpenses]);

  // Ad spend by channel
  const adSpendData = useMemo(() => {
    const totals = {};
    filteredExpenses.forEach((r) => {
      Object.entries(r.adByChannel).forEach(([ch, val]) => {
        totals[ch] = (totals[ch] || 0) + val;
      });
    });
    return AD_CHANNELS.map((ch) => ({
      channel: ch.channel,
      value: totals[ch.channel] || 0,
      color: ch.color,
    })).sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);
  const maxAdSpend = adSpendData[0]?.value || 1;

  // Ad spend icon array
  const adIconSegments = useMemo(() => {
    const totalAd = adSpendData.reduce((s, d) => s + d.value, 0);
    return adSpendData.map((d) => ({
      count: Math.max(1, Math.round((d.value / totalAd) * 100)),
      color: d.color,
      label: d.channel,
    }));
  }, [adSpendData]);
  // Normalize to exactly 100 squares
  const adTotal = adIconSegments.reduce((s, d) => s + d.count, 0);
  if (adTotal !== 100 && adIconSegments.length > 0) {
    adIconSegments[0].count += 100 - adTotal;
  }

  const payrollPct = displayTotal > 0 ? ((expenseTotals.payroll / displayTotal) * 100).toFixed(1) : "0";

  return (
    <>
      {/* KPI ROW */}
      <div style={{ display: "flex", gap: 2, flexWrap: "wrap", marginBottom: 24 }}>
        <KPI label="Total Expenses" value={fmtShort(expenseTotals.total)} sub={`${filteredExpenses.length} months`} accent={C.pink} />
        <KPI label="Payroll % of Revenue" value={`${payrollPct}%`} sub="Largest expense" accent={C.yellow} />
        <KPI label="Top Category" value="PAYROLL" sub={fmtShort(expenseTotals.payroll)} accent={C.green} />
        <KPI label="Total Rent" value={fmtShort(expenseTotals.rent)} sub="4 locations" accent={C.cyan} />
        <KPI label="Profit Margin" value={`${displayTotal > 0 ? ((1 - expenseTotals.total / displayTotal) * 100).toFixed(1) : 0}%`} sub="Revenue − Expenses" accent={C.orange} />
      </div>

      {/* ROW 1: Donut + Trend */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 2, marginBottom: 2 }}>
        <Section title="Expense Breakdown" right="By Category">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={46} outerRadius={78}
                paddingAngle={2} dataKey="value" stroke={C.card} strokeWidth={2}>
                {donutData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginTop: 4 }}>
            {donutData.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, color: C.muted }}>
                <span style={{ width: 8, height: 2, background: d.color, display: "inline-block" }} />
                {d.name}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Expense Trend" right="Monthly Stacked">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <linearGradient key={cat.key} id={`exp_${cat.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={cat.color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={cat.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="2 6" stroke="#1A1A1A" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: C.dim, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 9, fill: C.dim, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              {EXPENSE_CATEGORIES.map((cat) => (
                <Area key={cat.key} type="monotone" dataKey={cat.name} name={cat.name}
                  stackId="expenses" stroke={cat.color} fill={`url(#exp_${cat.key})`}
                  strokeWidth={1.5} dot={false} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {/* ROW 2: Payroll by Store + Payroll by Role */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, marginBottom: 2 }}>
        <Section title="Payroll by Store" right="Quarterly">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={payrollByStoreData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 6" stroke="#1A1A1A" vertical={false} />
              <XAxis dataKey="quarter" tick={{ fontSize: 9, fill: C.dim, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: C.dim, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              {[...STORES].reverse().map((s) => (
                <Bar key={s.key} dataKey={s.key} name={s.name} stackId="a" fill={STORE_COLORS[s.key]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Payroll by Role" right={`${PAYROLL_ROLES.reduce((s, r) => s + r.count, 0)} Employees`}>
          <div>
            {payrollRoleData.map((role, i) => (
              <div key={role.role} style={{
                padding: "10px 0",
                borderBottom: i < payrollRoleData.length - 1 ? `1px solid ${C.cardBorder}` : "none",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{role.role}</span>
                    <span style={{ fontSize: 9, color: C.dim, marginLeft: 8 }}>{role.count} staff</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 16, color: C.pink }}>{fmtShort(role.periodCost)}</span>
                    <span style={{ fontSize: 9, color: C.dim, marginLeft: 6 }}>{role.pct}%</span>
                  </div>
                </div>
                <div style={{ height: 3, background: "#1A1A1A", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${(role.periodCost / maxRoleCost) * 100}%`,
                    background: C.pink,
                    transition: "width 0.5s ease",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* ROW 3: Rent + Inventory */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, marginBottom: 2 }}>
        <Section title="Rent by Location" right={activeYear === "all" ? "Current Rates" : activeYear}>
          <div>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 70px 80px 70px 90px",
              gap: 8, padding: "0 0 8px", borderBottom: `1px solid ${C.cardBorder}`,
              fontSize: 9, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              <span>Location</span><span>Sqft</span><span>Rent/Mo</span><span>CAM/Mo</span><span style={{ textAlign: "right" }}>Annual</span>
            </div>
            {rentDisplayData.map((r) => (
              <div key={r.key} style={{
                display: "grid", gridTemplateColumns: "1fr 70px 80px 70px 90px",
                gap: 8, padding: "9px 0", borderBottom: "1px solid #161616",
                alignItems: "center", fontSize: 11,
              }}>
                <div>
                  <span style={{ color: C.text, fontWeight: 500 }}>{r.store}</span>
                </div>
                <span style={{ color: C.muted }}>{fmtNum(r.sqft)}</span>
                <span style={{ color: C.text }}>{fmt(r.monthlyRent)}</span>
                <span style={{ color: C.dim }}>{fmt(r.cam)}</span>
                <span style={{ textAlign: "right", color: C.green, fontWeight: 500 }}>{fmt(r.annual)}</span>
              </div>
            ))}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 70px 80px 70px 90px",
              gap: 8, padding: "10px 0 0", borderTop: `1px solid ${C.cardBorder}`,
              marginTop: 4, fontSize: 11, fontWeight: 500,
            }}>
              <span style={{ color: C.muted }}>TOTAL</span>
              <span style={{ color: C.muted }}>{fmtNum(rentDisplayData.reduce((s, r) => s + r.sqft, 0))}</span>
              <span style={{ color: C.text }}>{fmt(rentDisplayData.reduce((s, r) => s + r.monthlyRent, 0))}</span>
              <span style={{ color: C.dim }}>{fmt(rentDisplayData.reduce((s, r) => s + r.cam, 0))}</span>
              <span style={{ textAlign: "right", color: C.green }}>{fmt(rentDisplayData.reduce((s, r) => s + r.annual, 0))}</span>
            </div>
          </div>
        </Section>

        <Section title="Inventory Spend" right="Quarterly New vs Used">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={inventoryData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 6" stroke="#1A1A1A" vertical={false} />
              <XAxis dataKey="quarter" tick={{ fontSize: 9, fill: C.dim, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: C.dim, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="newStock" name="New Stock" stackId="inv" fill={C.pink} />
              <Bar dataKey="usedAcq" name="Used Acquisition" stackId="inv" fill={C.purple} />
            </BarChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {/* ROW 4: Ad Spend */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 2 }}>
        <Section title="Ad Spend by Channel" right="Total Period">
          <div>
            {adSpendData.map((d, i) => (
              <div key={d.channel} style={{
                padding: "10px 0",
                borderBottom: i < adSpendData.length - 1 ? `1px solid ${C.cardBorder}` : "none",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: C.text }}>{d.channel}</span>
                  <div>
                    <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 16, color: d.color }}>{fmtShort(d.value)}</span>
                    <span style={{ fontSize: 9, color: C.dim, marginLeft: 6 }}>
                      {((d.value / adSpendData.reduce((s, x) => s + x.value, 0)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div style={{ height: 3, background: "#1A1A1A", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${(d.value / maxAdSpend) * 100}%`,
                    background: d.color,
                    transition: "width 0.5s ease",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Ad Budget Split" right="100 = Total Budget">
          <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
            <IconArray segments={adIconSegments} size={16} gap={2} columns={10} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", marginTop: 8 }}>
            {adSpendData.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, color: C.muted }}>
                <span style={{ width: 8, height: 2, background: d.color, display: "inline-block" }} />
                {d.channel.split(" (")[0]}
              </div>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}
