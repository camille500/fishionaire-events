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

export function deriveAccentVariants(hex: string): Record<string, string> {
  const [r, g, b] = hexToRgb(hex)

  const lightHex = rgbToHex(mix(r, 255, 0.3), mix(g, 255, 0.3), mix(b, 255, 0.3))
  const darkHex = rgbToHex(mix(r, 0, 0.25), mix(g, 0, 0.25), mix(b, 0, 0.25))

  return {
    '--color-accent': hex,
    '--color-accent-light': lightHex,
    '--color-accent-dark': darkHex,
    '--color-accent-bg': `rgba(${r}, ${g}, ${b}, 0.08)`,
    '--color-accent-dim': `rgba(${r}, ${g}, ${b}, 0.04)`,
    '--gradient-accent': `linear-gradient(135deg, ${hex}, ${lightHex})`,
    '--shadow-accent': `0 0 20px rgba(${r}, ${g}, ${b}, 0.15)`,
    '--shadow-accent-sm': `0 4px 12px rgba(${r}, ${g}, ${b}, 0.1)`,
    '--shadow-accent-lg': `0 12px 40px rgba(${r}, ${g}, ${b}, 0.3)`,
    '--glow-subtle': `rgba(${r}, ${g}, ${b}, 0.06)`,
  }
}
