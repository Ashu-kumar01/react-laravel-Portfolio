/**
 * Emits robots.txt and sitemap.xml at build time.
 *
 * Static routes are always included. Project detail pages are added when the
 * API is reachable during the build; otherwise the build continues with the
 * static routes only (and logs a warning) so CI never fails on it.
 */
const STATIC_ROUTES = ['/', '/about', '/skills', '/experience', '/projects', '/services', '/resume', '/contact']

async function fetchProjectSlugs(apiBaseUrl) {
  if (!apiBaseUrl) return []
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 4000)
  try {
    const res = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/projects?per_page=50`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
    if (!res.ok) return []
    const json = await res.json()
    return (json.data ?? []).map((p) => ({ slug: p.slug, updated: p.updated_at }))
  } catch {
    return []
  } finally {
    clearTimeout(timer)
  }
}

const escapeXml = (s) => s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c])

/** Site-wide SEO settings (Admin → SEO) from GET /profile, or null when the API is unreachable. */
async function fetchSeoSettings(apiBaseUrl) {
  if (!apiBaseUrl) return null
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 4000)
  try {
    const res = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/profile`, { headers: { Accept: 'application/json' }, signal: controller.signal })
    if (!res.ok) return null
    return (await res.json())?.data?.profile ?? null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/** Replaces (or adds before </head>) a <meta attr="key" content="…"> tag. Empty content removes it. */
function setMeta(html, attr, key, content) {
  const pattern = new RegExp(`\\s*<meta\\s+${attr}="${key.replace(/[.:]/g, '\\$&')}"[^>]*>`, 'i')
  const tag = content ? `\n    <meta ${attr}="${key}" content="${escapeXml(String(content))}" />` : ''
  if (pattern.test(html)) return html.replace(pattern, tag)
  return tag ? html.replace(/\n?\s*<\/head>/i, `${tag}\n  </head>`) : html
}

/**
 * Bakes the Admin → SEO values into index.html at build time. Link-preview crawlers
 * (WhatsApp, LinkedIn, Facebook, X) don't run JavaScript, so they only see these tags;
 * in the browser useSeo() keeps them current per page.
 */
async function injectSeo(html, apiBaseUrl, warn) {
  const s = await fetchSeoSettings(apiBaseUrl)
  if (!s) {
    warn('API not reachable during build; index.html keeps its default SEO tags')
    return html
  }

  let out = html
  if (s.meta_title) {
    out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeXml(s.meta_title)}</title>`)
    out = setMeta(out, 'property', 'og:title', s.meta_title)
    out = setMeta(out, 'name', 'twitter:title', s.meta_title)
  }
  if (s.meta_description) {
    out = setMeta(out, 'name', 'description', s.meta_description)
    out = setMeta(out, 'property', 'og:description', s.meta_description)
    out = setMeta(out, 'name', 'twitter:description', s.meta_description)
  }
  if (s.meta_keywords) out = setMeta(out, 'name', 'keywords', s.meta_keywords)
  if (s.display_name) out = setMeta(out, 'property', 'og:site_name', s.display_name)
  out = setMeta(out, 'property', 'og:image', s.og_image)
  out = setMeta(out, 'name', 'twitter:image', s.og_image)
  out = setMeta(out, 'name', 'twitter:card', s.og_image ? 'summary_large_image' : 'summary')
  out = setMeta(out, 'name', 'twitter:site', s.twitter_handle)
  return out
}

export function seoFiles({ siteUrl, apiBaseUrl }) {
  return {
    name: 'portfolio-seo-files',
    apply: 'build',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return injectSeo(html, apiBaseUrl, (message) => console.warn(`[portfolio-seo-files] ${message}`))
      },
    },
    async generateBundle() {
      const base = (siteUrl || '').replace(/\/$/, '')

      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: ['User-agent: *', 'Allow: /', 'Disallow: /admin', base ? `Sitemap: ${base}/sitemap.xml` : ''].filter(Boolean).join('\n') + '\n',
      })

      if (!base) {
        this.warn('VITE_SITE_URL is not set; skipping sitemap.xml')
        return
      }

      const projects = await fetchProjectSlugs(apiBaseUrl)
      if (projects.length === 0) this.warn('API not reachable during build; sitemap.xml contains static routes only')

      const urls = [
        ...STATIC_ROUTES.map((path) => ({ loc: `${base}${path}` })),
        ...projects.map((p) => ({ loc: `${base}/projects/${p.slug}`, lastmod: p.updated?.slice(0, 10) })),
      ]

      const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls.map((u) => `  <url><loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`),
        '</urlset>',
        '',
      ].join('\n')

      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: xml })
    },
  }
}
