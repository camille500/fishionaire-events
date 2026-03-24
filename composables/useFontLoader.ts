const FONT_PAIRINGS: Record<string, { heading: string, body: string, weights: string }> = {
  'playfair-inter': {
    heading: 'Playfair Display',
    body: 'Inter',
    weights: '400;700',
  },
  'poppins-dmsans': {
    heading: 'Poppins',
    body: 'DM Sans',
    weights: '400;500;600;700',
  },
  'cormorant-lora': {
    heading: 'Cormorant Garamond',
    body: 'Lora',
    weights: '400;600;700',
  },
  'space-inter': {
    heading: 'Space Grotesk',
    body: 'Inter',
    weights: '400;500;700',
  },
  'abril-worksans': {
    heading: 'Abril Fatface',
    body: 'Work Sans',
    weights: '400;500;700',
  },
}

export function useFontLoader(pairingId: Ref<string | null | undefined>) {
  const fontVars = computed(() => {
    const id = pairingId.value
    if (!id || !FONT_PAIRINGS[id]) return {}
    const pairing = FONT_PAIRINGS[id]
    return {
      '--font-family-heading': `'${pairing.heading}', serif`,
      '--font-family': `'${pairing.body}', sans-serif`,
    }
  })

  useHead(() => {
    const id = pairingId.value
    if (!id || !FONT_PAIRINGS[id]) return {}
    const pairing = FONT_PAIRINGS[id]

    const families = new Set<string>()
    families.add(`${pairing.heading.replace(/ /g, '+')}:wght@${pairing.weights}`)
    if (pairing.body !== 'Inter') {
      families.add(`${pairing.body.replace(/ /g, '+')}:wght@${pairing.weights}`)
    }

    const url = `https://fonts.googleapis.com/css2?${[...families].map(f => `family=${f}`).join('&')}&display=swap`

    return {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: url },
      ],
    }
  })

  return { fontVars, FONT_PAIRINGS }
}
