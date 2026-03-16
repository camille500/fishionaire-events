export interface ProductSearchResult {
  title: string
  description: string
  imageUrl: string
  externalUrl: string
  priceCents: number
  currency: string
  provider: string
  externalProductId: string
  category: string
}

export interface ProductSearchProvider {
  search(query: string, options?: { category?: string, limit?: number }): Promise<ProductSearchResult[]>
  getPopular(category?: string, limit?: number): Promise<ProductSearchResult[]>
  getCategories(): string[]
}
