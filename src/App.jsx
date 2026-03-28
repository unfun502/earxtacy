import { useState, useMemo } from "react";
import { C, STORES, monthlyData } from "./data";
import { NavTabs, StoreTabs, YearTabs } from "./components";
import OverviewPage from "./OverviewPage";
import SalesPage from "./SalesPage";
import ExpensesPage from "./ExpensesPage";

export default function App() {
  const [activePage, setActivePage] = useState("overview");
  const [activeStore, setActiveStore] = useState("all");
  const [activeYear, setActiveYear] = useState("all");

  const filteredData = useMemo(() => {
    let d = monthlyData;
    if (activeYear !== "all") d = d.filter((r) => r.year === parseInt(activeYear));
    return d;
  }, [activeYear]);

  const totals = useMemo(() => {
    const t = { bardstown: 0, middletown: 0, newalbany: 0, dixie: 0, total: 0 };
    filteredData.forEach((r) => {
      STORES.forEach((s) => { t[s.key] += r[s.key]; });
      t.total += r.total;
    });
    return t;
  }, [filteredData]);

  const displayTotal = activeStore === "all" ? totals.total : totals[activeStore];
  const displayMonths = filteredData.length;

  const pageProps = { activeStore, activeYear, filteredData, totals, displayTotal, displayMonths };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      fontFamily: "'DM Mono', monospace",
      color: C.text,
    }}>
      {/* GRAIN OVERLAY */}
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

      {/* CRT SCANLINE */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg, transparent, rgba(255,45,85,0.06), transparent)",
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
            }}>EAR X-TACY</h1>
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
            {[0, 1].map((i) => (
              <span key={i} style={{
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

        {/* NAV + FILTERS */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <NavTabs active={activePage} onChange={setActivePage} />
            <StoreTabs active={activeStore} onChange={setActiveStore} />
          </div>
          <YearTabs active={activeYear} onChange={setActiveYear} />
        </div>

        {/* PAGE CONTENT */}
        {activePage === "overview" && <OverviewPage {...pageProps} />}
        {activePage === "sales" && <SalesPage {...pageProps} />}
        {activePage === "expenses" && <ExpensesPage {...pageProps} />}

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
