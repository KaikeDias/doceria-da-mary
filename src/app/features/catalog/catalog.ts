import { Price } from '../../core/supabase/supabase';

export interface Category {
  readonly id: string;
  readonly name: string;
  // URL completa da imagem do card; vazia = sem imagem.
  readonly image: string;
  readonly label: string;
}

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly details?: string;
  readonly additionalImages?: readonly { readonly src: string; readonly alt: string }[];
  readonly priceNote?: string;
  readonly information?: readonly {
    readonly icon: 'clock' | 'snowflake' | 'info';
    readonly text: string;
  }[];
  readonly categoryId: string;
  readonly categoryLabel: string;
  // URL completa da foto principal; vazia = sem foto.
  readonly image: string;
  // null = "Sob consulta".
  readonly price: Price | null;
}

export function filterProducts(items: readonly Product[], categoryId: string): readonly Product[] {
  return categoryId === 'todos'
    ? items
    : items.filter((product) => product.categoryId === categoryId);
}

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatPrice(price: Product['price']): string {
  if (!price) return 'Sob consulta';
  return `${price.kind === 'starting-at' ? 'A partir de ' : ''}${currency.format(price.amountInCents / 100)}`;
}
