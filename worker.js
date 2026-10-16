/**
 * Serves the Vite build from Workers Static Assets (binding ASSETS), adding
 * security headers, cache rules and Umami injection. Every request runs through
 * here (run_worker_first in wrangler.toml); unknown paths get the SPA shell
 * (index.html, 200) from not_found_handling, as the old KV fallback did.
 * Asset reads are not KV operations.
 */

// ── Security headers ─────────────────────────────────────────
function buildCSP() {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://analytics.devlab502.net",
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    "font-src fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://analytics.devlab502.net https://*.ingest.us.sentry.io",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join('; ');
}

function addSecurityHeaders(headers) {
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('Content-Security-Policy', buildCSP());
}

// ── Static asset serving ─────────────────────────────────────
// HTML (by path, or any text/html response such as the SPA fallback for
// /.env probes) must revalidate on every load so deploys show up at once.
// Hashed Vite bundles under /assets/ never change, so cache them for a year.
// Anything else keeps the asset layer's default (revalidate).
function isHtml(path, response) {
  return (
    !path.includes('.') ||
    path.endsWith('.html') ||
    (response.headers.get('content-type') || '').includes('text/html')
  );
}

async function handleStaticAsset(request, env) {
  const path = new URL(request.url).pathname;
  const asset = await env.ASSETS.fetch(request);
  const headers = new Headers(asset.headers);
  addSecurityHeaders(headers);
  if (isHtml(path, asset)) headers.set('Cache-Control', 'no-cache');
  else if (path.startsWith('/assets/')) headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return injectAnalytics(
    new Response(asset.body, { status: asset.status, statusText: asset.statusText, headers }),
    env
  );
}

// ── Analytics injection ──────────────────────────────────────
function injectAnalytics(response, env) {
  const ct = response.headers.get('content-type') || '';
  if (ct.includes('text/html') && env.UMAMI_SITE_ID) {
    return new HTMLRewriter()
      .on('head', {
        element(el) {
          el.append(`<script defer src="https://analytics.devlab502.net/script.js" data-website-id="${env.UMAMI_SITE_ID}"></script>`, { html: true });
        },
      })
      .transform(response);
  }
  return response;
}

// ── Main handler ─────────────────────────────────────────────
export default {
  async fetch(request, env) {
    return handleStaticAsset(request, env);
  },
};
