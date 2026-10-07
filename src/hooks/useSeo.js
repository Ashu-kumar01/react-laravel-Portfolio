import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { env } from '../config/env'
import { useProfile } from './usePortfolio'

const SITE_NAME = 'Ashwani Kushwaha'
const DEFAULT_TITLE = 'Ashwani Kumar Kushwaha — Frontend & PHP/Laravel Developer'
const DEFAULT_DESCRIPTION = 'Frontend & PHP/Laravel developer in Raipur with 3.8+ years of experience: responsive UI, Laravel, REST APIs, MySQL and React.js.'

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!content) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function upsertJsonLd(data) {
  const id = 'ld-json-page'
  let el = document.getElementById(id)
  if (!data) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = id
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

/**
 * Sets title, description, keywords, canonical, Open Graph, Twitter and JSON-LD
 * for the current page. Site-wide defaults come from Admin → SEO (GET /profile),
 * falling back to the constants above. Updates existing tags in place (no duplicates).
 */
export function useSeo({ title, description, image, type = 'website', jsonLd, noindex = false } = {}) {
  const { pathname } = useLocation()
  const { data } = useProfile()
  const site = data?.data?.profile ?? {}
  const siteName = site.display_name || SITE_NAME
  const defaultTitle = site.meta_title || DEFAULT_TITLE
  const defaultDescription = site.meta_description || DEFAULT_DESCRIPTION
  const keywords = site.meta_keywords
  const defaultImage = site.og_image
  const twitterHandle = site.twitter_handle

  useEffect(() => {
    const fullTitle = title ? `${title} · ${siteName}` : defaultTitle
    const desc = description || defaultDescription
    const url = `${env.siteUrl}${pathname}`
    // No share image configured → no og:image tag (better than a broken link).
    const img = image || defaultImage || null

    document.title = fullTitle
    upsertMeta('name', 'description', desc)
    upsertMeta('name', 'keywords', keywords)
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    upsertLink('canonical', url)
    upsertMeta('property', 'og:site_name', siteName)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', desc)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:image', img)
    upsertMeta('name', 'twitter:card', img ? 'summary_large_image' : 'summary')
    upsertMeta('name', 'twitter:site', twitterHandle)
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', desc)
    upsertMeta('name', 'twitter:image', img)
    upsertJsonLd(jsonLd)
  }, [title, description, image, type, jsonLd, noindex, pathname, siteName, defaultTitle, defaultDescription, keywords, defaultImage, twitterHandle])
}
