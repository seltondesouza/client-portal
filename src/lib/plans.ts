import type { PlanKey } from './stages'

export type Interval = 'month' | 'year'

// Prices in EUR. Annual = monthly x 12 x 0,85. "normal" is the crossed-out price.
export const PLANS: {
  key: PlanKey
  name: string
  price: Record<Interval, number>
  normal: Record<Interval, number>
  priceId: Record<Interval, string>
  features: string[]
  examples: string
}[] = [
  {
    key: 'estatico',
    name: 'Website Estático',
    price: { month: 17, year: 173.4 },
    normal: { month: 20, year: 204 },
    priceId: {
      month: import.meta.env.VITE_STRIPE_PRICE_STATIC_MONTH,
      year: import.meta.env.VITE_STRIPE_PRICE_STATIC_YEAR,
    },
    features: ['Até 5 páginas', 'Design responsivo', 'Formulário de contacto', 'Alojamento e manutenção'],
    examples: 'Sites de empresa, portefólios, restaurantes',
  },
  {
    key: 'ecommerce',
    name: 'Website e-Commerce',
    price: { month: 29.75, year: 303.45 },
    normal: { month: 35, year: 357 },
    priceId: {
      month: import.meta.env.VITE_STRIPE_PRICE_ECOM_MONTH,
      year: import.meta.env.VITE_STRIPE_PRICE_ECOM_YEAR,
    },
    features: [
      'Loja online',
      'Catálogo de produtos',
      'Carrinho de compras',
      'Pagamentos',
      'Gestão de encomendas',
      'Alojamento e manutenção',
    ],
    examples: 'Lojas de roupa, acessórios e eletrónica',
  },
]

export const eur = (n: number) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n)
