/* ═══════════════════════════════════════════
   SEEDED RANDOM & FORMATTERS
   ═══════════════════════════════════════════ */

export function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const fmt = (n) =>
  "$" + Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 });

export const fmtK = (n) => "$" + (n / 1000).toFixed(0) + "k";

export const fmtShort = (n) =>
  n >= 1000000
    ? "$" + (n / 1000000).toFixed(2) + "M"
    : n >= 1000
      ? "$" + (n / 1000).toFixed(0) + "k"
      : "$" + n;

export const fmtNum = (n) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 0 });

export function pickWeighted(rand, items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}
