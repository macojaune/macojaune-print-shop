type UmamiPayload = Record<string, string | number | boolean | null | undefined>

declare global {
  interface Window {
    umami?: {
      track?: (event: string, payload?: UmamiPayload) => void
    }
  }
}

const toSnakeCase = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()

const sanitizePayload = (payload: UmamiPayload) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== ''),
  ) as UmamiPayload

const getDestinationType = (destination: string) => {
  if (!destination) {
    return ''
  }

  if (destination.startsWith('http://') || destination.startsWith('https://')) {
    try {
      const url = new URL(destination)
      return url.origin === window.location.origin ? 'internal' : 'external'
    } catch {
      return 'external'
    }
  }

  if (destination.startsWith('/')) {
    return 'internal'
  }

  return ''
}

const createDatasetPayload = (element: HTMLElement) => {
  const payload: UmamiPayload = {}

  for (const [key, rawValue] of Object.entries(element.dataset)) {
    if (!key.startsWith('umami') || key === 'umamiEvent') {
      continue
    }

    const payloadKey = toSnakeCase(key.slice('umami'.length))
    payload[payloadKey] = rawValue
  }

  return payload
}

export default defineNuxtPlugin(() => {
  const trackUmami = (event: string, payload: UmamiPayload = {}) => {
    if (!import.meta.client || !window.umami?.track) {
      return
    }

    window.umami.track(event, sanitizePayload(payload))
  }

  if (import.meta.client) {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const element = target?.closest<HTMLElement>('[data-umami-event]')

      if (!element) {
        return
      }

      const destination = element.dataset.umamiDestination
        || (element instanceof HTMLAnchorElement ? element.href : '')
        || element.getAttribute('href')
        || ''

      const label = element.dataset.umamiLabel
        || element.getAttribute('aria-label')
        || element.textContent?.replace(/\s+/g, ' ').trim()
        || ''

      trackUmami(element.dataset.umamiEvent || 'Click', {
        source_path: window.location.pathname,
        source_url: window.location.href,
        destination,
        destination_type: element.dataset.umamiDestinationType || getDestinationType(destination),
        label,
        ...createDatasetPayload(element),
      })
    }

    document.addEventListener('click', onClick, true)

    if (import.meta.hot) {
      import.meta.hot.dispose(() => {
        document.removeEventListener('click', onClick, true)
      })
    }
  }

  return {
    provide: {
      trackUmami,
    },
  }
})
