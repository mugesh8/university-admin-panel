function asString(value) {
  return String(value ?? '').trim()
}

export function parseStringArray(value) {
  if (Array.isArray(value)) return value.map((item) => asString(item)).filter(Boolean)
  const raw = asString(value)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.map((item) => asString(item)).filter(Boolean)
  } catch {
    return []
  }
  return []
}

export function stripHtml(value) {
  return asString(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function sanitizeFaqHtml(html) {
  const raw = asString(html)
  if (!raw) return ''
  if (typeof window === 'undefined' || typeof window.DOMParser === 'undefined') {
    return raw
  }
  const parser = new window.DOMParser()
  const doc = parser.parseFromString(raw, 'text/html')
  const allowedTags = new Set(['P', 'BR', 'UL', 'OL', 'LI', 'STRONG', 'B', 'EM', 'I', 'A'])

  const walk = (node) => {
    const children = Array.from(node.childNodes)
    children.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child
        if (!allowedTags.has(el.tagName)) {
          el.replaceWith(...Array.from(el.childNodes))
          return
        }
        Array.from(el.attributes).forEach((attribute) => {
          if (el.tagName === 'A' && attribute.name === 'href') return
          el.removeAttribute(attribute.name)
        })
        if (el.tagName === 'A') {
          const href = asString(el.getAttribute('href'))
          if (!/^https?:\/\//i.test(href) && !/^mailto:/i.test(href)) {
            el.removeAttribute('href')
          } else {
            el.setAttribute('target', '_blank')
            el.setAttribute('rel', 'noopener noreferrer')
          }
        }
      }
      walk(child)
    })
  }

  walk(doc.body)
  return doc.body.innerHTML
}
