import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import manifestJSON from '__STATIC_CONTENT_MANIFEST';
const assetManifest = JSON.parse(manifestJSON);

// ── Security headers ─────────────────────────────────────────
function buildCSP() {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://analytics.devlab502.net",
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    "font-src fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://analytics.devlab502.net https://*.ingest.us.sentry.io",
  ].join('; ');
}

function addSecurityHeaders(headers) {
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  headers.set('Content-Security-Policy', buildCSP());
}

// ── Static asset serving ─────────────────────────────────────
async function handleStaticAsset(request, env, ctx) {
  const event = { request, waitUntil: ctx.waitUntil.bind(ctx) };
  const options = {
    ASSET_NAMESPACE: env.__STATIC_CONTENT,
    ASSET_MANIFEST: assetManifest,
  };

  try {
    const response = await getAssetFromKV(event, options);
    const headers = new Headers(response.headers);
    addSecurityHeaders(headers);
    return injectAnalytics(new Response(response.body, { status: response.status, headers }), env);
  } catch {
    // SPA fallback — serve index.html for client-side routing
    try {
      const fallbackEvent = {
        request: new Request(`${new URL(request.url).origin}/index.html`, request),
        waitUntil: ctx.waitUntil.bind(ctx),
      };
      const notFoundResponse = await getAssetFromKV(fallbackEvent, options);
      const headers = new Headers(notFoundResponse.headers);
      addSecurityHeaders(headers);
      return injectAnalytics(new Response(notFoundResponse.body, { status: 200, headers }), env);
    } catch {
      return new Response('Not Found', { status: 404 });
    }
  }
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
  async fetch(request, env, ctx) {
    return handleStaticAsset(request, env, ctx);
  },
};
