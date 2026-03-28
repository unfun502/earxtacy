# Ear X-tacy Sales Dashboard — Implementation Spec

## Overview

A 3-page React dashboard modeling record sales data for Ear X-tacy, Louisville's legendary independent record store, during its late-90s peak (1998–2000). This is a portfolio demo for DevLab502 showcasing financial data visualization for small business owners.

**Target stack:** React (single-file `.jsx` artifact or Vite app), Recharts for charts, all fake data generated inline. No backend.

---

## Design System

### Aesthetic: "Gig Poster Brutalist"
- Dark mode only (`#0A0A0A` background)
- Zero border-radius everywhere — hard square edges
- 2px gaps between panels (tight, dense layout)
- Feels like a POS terminal in the back office of a record store

### Typography
- **Display:** `Anton` (Google Fonts) — tall condensed sans, all uppercase, show poster energy
- **Body/Data:** `DM Mono` (Google Fonts) — monospace, receipt/zine typewriter feel
- All section headers uppercase, generous letter-spacing (`0.06em`–`0.15em`)

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `pink` | `#FF2D55` | Primary accent, Bardstown Rd store, CTA highlights |
| `yellow` | `#FFD600` | Middletown store, secondary accent |
| `green` | `#00FF88` | New Albany store, positive metrics |
| `cyan` | `#00BFFF` | Dixie Hwy store, tertiary accent |
| `orange` | `#FF8800` | Cassette format, warning states |
| `purple` | `#C084FC` | Used/trade-ins, R&B genre |
| `bg` | `#0A0A0A` | Page background |
| `card` | `#111111` | Card/panel background |
| `cardBorder` | `#222222` | All borders |
| `text` | `#E0E0E0` | Primary text |
| `muted` | `#666666` | Secondary labels |
| `dim` | `#444444` | Tertiary, axis ticks, subtle elements |

### Store Color Map
- Bardstown Rd → `pink` (#FF2D55)
- Middletown → `yellow` (#FFD600)
- New Albany → `green` (#00FF88)
- Dixie Hwy → `cyan` (#00BFFF)

### Atmospheric Effects
- **Grain overlay:** Fixed position SVG noise texture, `opacity: 0.03`, `mix-blend-mode: overlay`
- **CRT scanline:** A 2px horizontal line that slowly scrolls down the viewport via CSS animation (`8s linear infinite`), colored `rgba(255,45,85,0.06)`
- **Title flicker:** Subtle opacity flicker on the "EAR X-TACY" wordmark (`animation: flicker 5s infinite`)
- **Scrolling marquee:** Horizontal ticker below the header with store names, format types, "LOUISVILLE'S RECORD STORE" — pure CSS animation

---

## Global Layout

### Header (persistent across all pages)
- Left: "EAR X-TACY" in Anton 32px + "SALES DASHBOARD" in pink with left border accent
- Right: "Louisville, KY" / "1998 – 2000"
- Below header: scrolling marquee ticker
- **Navigation tabs** between header and content: `OVERVIEW` | `SALES` | `EXPENSES`
  - Style: Same as existing store filter tabs — DM Mono, 10px, uppercase, `0.12em` letter-spacing
  - Active state: pink background + white text
  - Inactive: transparent bg, muted text, cardBorder border

### Filter Controls (persistent, below nav)
- **Store filter:** `ALL STORES` | `BARDSTOWN RD` | `MIDDLETOWN` | `NEW ALBANY` | `DIXIE HWY`
  - Pink border + bg when active
- **Year filter:** `ALL YRS` | `'98` | `'99` | `'00`
  - Yellow border + translucent yellow bg when active
- These filters should affect data on all three pages

### Footer (persistent)
- Left: "SIMULATED DATA · NOT AFFILIATED WITH EAR X-TACY RECORDS"
- Right: "BUILT BY DEVLAB502" (DevLab502 in pink)

---

## Page 1: OVERVIEW

This page already exists from the previous iteration. Keep the existing layout with these panels:

### KPI Row (5 cards)
- Total Revenue, Avg/Month, Peak Month, Locations (4), Top Format (CD, 58%)
- Each has a 4px colored left-edge accent bar
- All values react to store + year filters

### Row 1 (2 columns)
1. **Revenue Trend** — Area chart
   - When "All Stores" selected: 4 layered areas with gradient fills, one per store
   - When single store selected: single area with gradient
   - X-axis: `Jan '98` through `Dec '00` (or filtered year)

2. **Store Breakdown** — Stacked bar chart
   - Monthly stacked bars, one color per store
   - Always shows all 4 stores regardless of store filter (this is a comparison view)

### Row 2 (3 columns)
1. **Sales by Format** — Donut chart
   - Segments: CD (58%, pink), Vinyl (18%, yellow), Cassette (6%, orange), Concert Tickets (8%, green), Merch & Posters (6%, cyan), Used/Trade-Ins (4%, purple)
   - Legend below chart with colored dash indicators

2. **Genre Strength** — Radar chart
   - Axes: Alternative, Hip-Hop, Electronic, Metal/Punk, Classic Rock, Country
   - Single pink radar fill at 15% opacity

3. **Store Rankings** — Ranked list with progress bars
   - Each store: rank number (Anton), name, tag, total revenue, percentage
   - Thin 3px horizontal bar showing relative size vs #1
   - Reacts to year filter

### Row 3 (2 columns)
1. **Top Sellers** — Table (rank, title, artist, format, units)
   - 8 rows
   - Vinyl format highlighted in yellow

2. **Year-Over-Year** — Stacked bar (3 bars for '98/'99/'00)
   - Below chart: large Anton numbers with YoY % change

---

## Page 2: SALES

### Row 1: New vs Used Split

1. **Icon Array: New vs Used Revenue Split** (full width or 2/3 width)
   - 100 squares arranged in a 10×10 grid
   - 90 squares filled with pink (New), 10 with purple (Used)
   - Each square should be a small rectangle with 2px gap
   - Label below: "90% NEW · 10% USED" with total dollar values
   - Optional hover: show what each square represents in dollar terms
   - This is a visual representation of the 90/10 new-vs-used split

2. **New vs Used Trend** (1/3 width, or stack below)
   - Stacked area chart over time showing new vs used revenue
   - New = pink area, Used = purple area

### Row 2: Genre Deep Dive

1. **Genre Revenue Treemap** (2/3 width)
   - Recharts `<Treemap>` component
   - Each genre gets a colored rectangle proportional to revenue
   - Genre colors: Alternative=pink, Hip-Hop=green, Electronic=cyan, Metal/Punk=orange, Classic Rock=yellow, Country=#8B6914, R&B/Soul=purple, Jazz/Blues=#6B8A7A
   - Each rectangle shows genre name + dollar amount
   - Custom content renderer for the treemap cells (genre name in Anton, value in DM Mono)

2. **Genre Breakdown Bars** (1/3 width)
   - Horizontal bar chart or simple ranked list with bars
   - Each genre with its color, total revenue, and percentage
   - Sorted by revenue descending

### Row 3: Merch Sales

1. **Merchandise by Type** — Bar chart or horizontal bars
   - Categories: T-Shirt, Poster, Sticker, Patch, Pin, Tote Bag
   - Show units sold and revenue
   - T-Shirts should be the clear leader

2. **Top Merch Items** — Small table
   - Item name, type, unit price, units sold, total revenue
   - 6-8 rows

### Row 4: Sales Ledger (full width)

This is the interactive filterable table — the centerpiece of the Sales page.

**Table columns:**
- Title (string)
- Artist (string, "—" for merch)
- Category (Music / Merch)
- Genre (for music) or Merch Type (for merch)
- Format (CD / Vinyl / Cassette / "—" for merch)
- New/Used indicator
- Unit Price (new price shown, with used price in parentheses if applicable)
- Units Sold (combined new + used, with breakdown on hover or in a sub-row)
- Total Revenue

**Filter controls** (row of filter dropdowns/buttons above the table):
- **Category:** All | Music | Merch
- **Genre:** All | Alternative | Hip-Hop | Electronic | Metal/Punk | Classic Rock | Country | R&B/Soul | Jazz/Blues (disabled when Merch selected)
- **Format:** All | CD | Vinyl | Cassette (disabled when Merch selected)
- **Merch Type:** All | T-Shirt | Poster | Sticker | Patch | Pin | Tote Bag (only enabled when Merch or All selected)
- **Condition:** All | New | Used
- **Sort by:** dropdown or clickable column headers (Revenue desc default)

**Filter UI styling:**
- Small select-style dropdowns or button groups matching the store/year tab aesthetic
- DM Mono, 10px, uppercase
- Active filters get a subtle colored border or background tint

**Table styling:**
- No visible borders between cells — use subtle `#161616` row separators
- Header row: DM Mono 9px, dim color, uppercase, letter-spaced
- Data rows: DM Mono 11px
- Hover state: row background shifts to `#1A1A1A`
- Revenue column right-aligned, green-tinted
- Alternating row backgrounds optional (very subtle, like `#0D0D0D` / `#111111`)
- Show total count of filtered items and total revenue at bottom

**Data notes:**
- The catalog should have ~30 music items and ~10 merch items
- Each music item has `unitsNew` and `unitsUsed` (with used being roughly 10% of total across the catalog, but varying per item — used vinyl should be proportionally higher than used CD)
- Merch items have `unitsNew` only (`unitsUsed` = 0)
- Items represent grouped sales (e.g., "2,640 copies of Stankonia on CD"), not individual transactions
- Revenue = (unitsNew × priceNew) + (unitsUsed × priceUsed)

---

## Page 3: EXPENSES

### KPI Row (4-5 cards)
- Total Expenses (across period), Payroll % of Revenue, Highest Single Expense (Payroll), Rent Total
- Same card style as overview KPIs

### Row 1: Expense Category Overview

1. **Expense Breakdown Donut** (1/3 width)
   - Segments: Payroll (largest, ~48%), Inventory (~28%), Rent (~12%), Advertising (~8%), Other (~4%)
   - Use pink for payroll, cyan for inventory, yellow for rent, orange for advertising, dim for other

2. **Expense Trend** — Stacked area chart (2/3 width)
   - Monthly or quarterly stacked areas by expense category
   - Shows how total expenses grew over the 3-year period

### Row 2: Payroll Deep Dive (2 columns)

1. **Payroll by Store** — Stacked bar or grouped bar
   - Quarterly data showing payroll costs per store
   - Bardstown Rd clearly highest (larger staff for flagship)
   - Use store colors

2. **Payroll by Role** — Horizontal bar chart or ranked list with bars
   - Roles: Store Managers (4), Asst. Managers (4), Floor Staff FT (12), Floor Staff PT (18), Buyer/Inventory (2), Admin (1)
   - Show count, avg pay, and percentage of total payroll
   - 41 total employees

### Row 3: Rent & Inventory (2 columns)

1. **Rent by Location** — Simple comparison
   - Each store: name, square footage, monthly rent, annual rent
   - Could be a table or horizontal bars
   - Bardstown Rd: 8,200 sqft, $6,800/mo
   - Middletown: 3,400 sqft, $3,200/mo
   - New Albany: 2,800 sqft, $2,400/mo
   - Dixie Hwy: 2,600 sqft, $2,100/mo

2. **Inventory Spend** — Bar chart
   - Quarterly bars showing new stock purchases vs used inventory acquisition
   - New stock in pink, used in purple
   - Q4 spikes visible (holiday stocking)
   - ~90/10 split mirrors the sales ratio

### Row 4: Advertising (full width or 2 columns)

1. **Ad Spend by Channel** — Treemap or horizontal bars
   - Billboards (I-64, I-65): $4,200/mo — 38.5% (largest)
   - Radio (WFPK, WLRS): $3,100/mo — 28.4%
   - LEO Weekly / Print: $1,800/mo — 16.5%
   - In-Store Promos: $1,200/mo — 11.0%
   - Event Sponsorships: $600/mo — 5.5%

2. **Ad Spend Icon Array** (optional, for visual variety)
   - Similar to the new/used icon array but showing ad channel proportions
   - 100 icons, each colored by channel
   - Reinforces that billboards + radio = ~67% of ad budget

---

## Data Architecture

All data should be generated inline (no external files). Use a seeded random function for deterministic "jitter" on monthly figures so numbers feel organic but are reproducible.

### Monthly Revenue Data
- Generated per store × per month × per year
- Base values: Bardstown ~$145k/mo, Middletown ~$42k, New Albany ~$38k, Dixie ~$35k
- Apply seasonality multipliers (Dec highest at 1.35×, Feb lowest at 0.78×)
- Apply year-over-year growth (1.0, 1.12, 1.08)
- Apply per-store jitter and quirks (Middletown surges in 2000, etc.)

### Catalog Data
- Array of ~30 music items + ~10 merch items
- Each item: id, title, artist, genre, format, category, priceNew, priceUsed, unitsNew, unitsUsed, merchType (if applicable)
- Revenue computed dynamically: `(unitsNew * priceNew) + (unitsUsed * priceUsed)`

### Expense Data
- Payroll: quarterly by store, plus role breakdown
- Rent: static per-store monthly/annual
- Advertising: per-channel monthly/annual with percentages
- Inventory: quarterly new stock + used acquisition costs

---

## Component Structure Suggestion

```
EarXtacyDashboard (root)
├── Header (logo, nav tabs, marquee)
├── FilterBar (store tabs + year tabs) 
├── OverviewPage
│   ├── KPIRow
│   ├── RevenueTrendChart
│   ├── StoreBreakdownChart
│   ├── FormatDonut
│   ├── GenreRadar
│   ├── StoreRankings
│   ├── TopSellersTable
│   └── YearOverYearChart
├── SalesPage
│   ├── IconArray (new vs used)
│   ├── NewUsedTrendChart
│   ├── GenreTreemap
│   ├── GenreBreakdownBars
│   ├── MerchByTypeChart
│   ├── TopMerchTable
│   └── SalesLedger (filterable table)
│       ├── LedgerFilters
│       └── LedgerTable
├── ExpensesPage
│   ├── ExpenseKPIRow
│   ├── ExpenseDonut
│   ├── ExpenseTrendChart
│   ├── PayrollByStoreChart
│   ├── PayrollByRoleList
│   ├── RentComparison
│   ├── InventorySpendChart
│   ├── AdSpendBars
│   └── AdSpendIconArray (optional)
└── Footer
```

---

## Chart Type Summary

| Chart Type | Where Used |
|-----------|-----------|
| Area (layered/single) | Revenue trend (Overview), New vs Used trend (Sales), Expense trend (Expenses) |
| Stacked Bar | Store breakdown (Overview), YoY (Overview), Payroll by store (Expenses), Inventory (Expenses) |
| Donut/Pie | Format mix (Overview), Expense breakdown (Expenses) |
| Radar | Genre strength (Overview) |
| Treemap | Genre revenue (Sales), Ad spend (Expenses, optional) |
| Icon Array | New vs Used split (Sales), Ad spend (Expenses, optional) |
| Horizontal Bars | Genre breakdown (Sales), Merch by type (Sales), Payroll by role (Expenses), Ad channels (Expenses) |
| Ranked List + Progress Bars | Store rankings (Overview) |
| Data Table | Top sellers (Overview), Top merch (Sales), Sales ledger (Sales), Rent comparison (Expenses) |

---

## Implementation Notes

- This should be a single `.jsx` file for artifact rendering, or can be split into files if building as a Vite app
- All Recharts components should use `<ResponsiveContainer>` for fluid sizing
- The Sales Ledger filtering should use React state (`useState`) with `useMemo` for filtered/sorted data
- The icon array is a custom SVG or div-grid component, not a Recharts component
- Keep the existing V2 code as the starting point — the Overview page structure is already built
- The treemap cells need a custom `<Treemap content={...}>` renderer to style the text inside each cell
- All tooltip components should use the existing `ChartTooltip` pattern (dark bg, DM Mono, colored dots)

---

## Notes for Claude Code

- Start with the existing `ear-xtacy-dashboard.jsx` as the base
- Build page navigation first, then flesh out each page one at a time
- The Sales Ledger is the most complex single component — build it last
- Test that all filters (store + year) properly cascade across pages
- The icon array is simple: a flex/grid of 100 small squares with conditional coloring
- For the treemap, Recharts' `<Treemap>` with a custom `content` prop works well
- Keep all inline styles consistent with the existing pattern (no CSS modules or styled-components)
