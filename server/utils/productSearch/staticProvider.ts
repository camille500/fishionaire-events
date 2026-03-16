import type { ProductSearchResult, ProductSearchProvider } from './types'
import catalog from './catalog.json'

interface CatalogItem {
  id: string
  title: string
  description: string
  imageUrl: string
  externalUrl: string
  priceCents: number
  currency: string
  category: string
}

const items: CatalogItem[] = catalog as CatalogItem[]

function toSearchResult(item: CatalogItem): ProductSearchResult {
  return {
    title: item.title,
    description: item.description,
    imageUrl: item.imageUrl,
    externalUrl: item.externalUrl,
    priceCents: item.priceCents,
    currency: item.currency,
    provider: 'static',
    externalProductId: item.id,
    category: item.category,
  }
}

function matchesQuery(item: CatalogItem, query: string): boolean {
  const q = query.toLowerCase()
  const terms = q.split(/\s+/).filter(Boolean)
  const searchable = `${item.title} ${item.description} ${item.category}`.toLowerCase()
  return terms.every((term) => searchable.includes(term))
}

export default class StaticProductProvider implements ProductSearchProvider {
  async search(query: string, options?: { category?: string, limit?: number }): Promise<ProductSearchResult[]> {
    const limit = options?.limit || 20
    let filtered = items.filter((item) => matchesQuery(item, query))
    if (options?.category) {
      filtered = filtered.filter((item) => item.category === options.category)
    }
    return filtered.slice(0, limit).map(toSearchResult)
  }

  async getPopular(category?: string, limit?: number): Promise<ProductSearchResult[]> {
    const max = limit || 20
    let filtered = items
    if (category) {
      filtered = filtered.filter((item) => item.category === category)
    }
    // Return a shuffled subset for variety
    const shuffled = [...filtered].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, max).map(toSearchResult)
  }

  getCategories(): string[] {
    return [...new Set(items.map((item) => item.category))]
  }
}
