function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function mix(c: number, target: number, amount: number): number {
  return Math.round(c + (target - c) * amount)
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')
}

export interface AccentVariantOptions {
  secondaryHex?: string | null
  gradientAngle?: number
}

export function deriveAccentVariants(hex: string, options?: AccentVariantOptions): Record<string, string> {
  const [r, g, b] = hexToRgb(hex)
  const angle = options?.gradientAngle ?? 135

  const lightHex = rgbToHex(mix(r, 255, 0.3), mix(g, 255, 0.3), mix(b, 255, 0.3))
  const darkHex = rgbToHex(mix(r, 0, 0.25), mix(g, 0, 0.25), mix(b, 0, 0.25))

  const vars: Record<string, string> = {
    '--color-accent': hex,
    '--color-accent-light': lightHex,
    '--color-accent-dark': darkHex,
    '--color-accent-bg': `rgba(${r}, ${g}, ${b}, 0.08)`,
    '--color-accent-dim': `rgba(${r}, ${g}, ${b}, 0.04)`,
    '--gradient-accent': `linear-gradient(${angle}deg, ${hex}, ${lightHex})`,
    '--shadow-accent': `0 0 20px rgba(${r}, ${g}, ${b}, 0.15)`,
    '--shadow-accent-sm': `0 4px 12px rgba(${r}, ${g}, ${b}, 0.1)`,
    '--shadow-accent-lg': `0 12px 40px rgba(${r}, ${g}, ${b}, 0.3)`,
    '--glow-subtle': `rgba(${r}, ${g}, ${b}, 0.06)`,
  }

  if (options?.secondaryHex) {
    const [r2, g2, b2] = hexToRgb(options.secondaryHex)
    const secondaryLight = rgbToHex(mix(r2, 255, 0.3), mix(g2, 255, 0.3), mix(b2, 255, 0.3))
    const secondaryDark = rgbToHex(mix(r2, 0, 0.25), mix(g2, 0, 0.25), mix(b2, 0, 0.25))

    vars['--color-accent-secondary'] = options.secondaryHex
    vars['--color-accent-secondary-light'] = secondaryLight
    vars['--color-accent-secondary-dark'] = secondaryDark
    vars['--color-accent-secondary-bg'] = `rgba(${r2}, ${g2}, ${b2}, 0.08)`
    vars['--color-accent-secondary-dim'] = `rgba(${r2}, ${g2}, ${b2}, 0.04)`
    vars['--gradient-accent'] = `linear-gradient(${angle}deg, ${hex}, ${options.secondaryHex})`
    vars['--gradient-accent-subtle'] = `linear-gradient(${angle}deg, rgba(${r}, ${g}, ${b}, 0.08), rgba(${r2}, ${g2}, ${b2}, 0.08))`
  }

  return vars
}
