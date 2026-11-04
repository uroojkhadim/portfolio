import { useEffect } from 'react'
import { usePortfolioData } from '../context/DataContext'

/**
 * Applies the CMS-managed site metadata to the public document head.
 * The static values in index.html remain the fallback when the API is
 * unavailable (for example during a cold start).
 */
export function useSiteSettings() {
  const { settings, about } = usePortfolioData()

  useEffect(() => {
    if (!settings) return

    const title = settings.seo_title || settings.site_title
    if (title) document.title = title

    const setMeta = (selector, attr, value) => {
      if (!value) return
      let tag = document.head.querySelector(selector)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute(attr, selector.match(/\[(?:name|property)="([^"]+)"\]/)?.[1] || '')
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', value)
    }

    setMeta('meta[name="description"]', 'name', settings.seo_description || settings.site_description)
    setMeta('meta[name="keywords"]', 'name', settings.seo_keywords)
    setMeta('meta[property="og:title"]', 'property', settings.seo_title || settings.site_title)
    setMeta('meta[property="og:description"]', 'property', settings.seo_description || settings.site_description)

    const author = settings.copyright_name || about?.name
    if (author) setMeta('meta[name="author"]', 'name', author)
  }, [settings, about])
}

export function resolveFooterText(template, fallbackName) {
  if (!template) return null
  return template
    .replace(/\{year\}/gi, String(new Date().getFullYear()))
    .replace(/\{name\}/gi, fallbackName || '')
}
