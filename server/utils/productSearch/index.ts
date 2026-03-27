import type { ProductSearchProvider } from './types'
import StaticProductProvider from './staticProvider'

export function getProductSearchProvider(): ProductSearchProvider {
  // Future: check runtime config for affiliate API keys and return
  // the appropriate provider (BolComProvider, CoolblueProvider, etc.)
  return new StaticProductProvider()
}
