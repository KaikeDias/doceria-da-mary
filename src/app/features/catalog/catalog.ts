export interface Category {
  readonly id: string;
  readonly name: string;
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
  readonly image: string;
  readonly price: { readonly kind: 'fixed' | 'starting-at'; readonly amountInCents: number };
}

export const categories: readonly Category[] = [
  { id: 'bolos', name: 'Bolos', image: 'chocolate-cake', label: 'Bolos' },
  { id: 'docinhos', name: 'Docinhos', image: 'brigadeiros', label: 'Docinhos' },
  { id: 'sobremesas', name: 'Sobremesas', image: 'dessert-cup', label: 'Sobremesas' },
  { id: 'kits', name: 'Kits', image: 'sweet-box', label: 'Kits e presentes' },
];

// shortcut: conteúdo demonstrativo da referência, substituir quando o catálogo real for fornecido.
export const products: readonly Product[] = [
  {
    id: 'bolo-chocolate',
    name: 'Bolo de Chocolate',
    categoryId: 'bolos',
    image: 'chocolate-cake',
    description: 'Massa fofinha com recheio cremoso e cobertura generosa de chocolate.',
    details:
      'Massa fofinha de chocolate, recheio cremoso de brigadeiro e cobertura generosa de ganache, finalizado com rosetas de buttercream de chocolate. Um clássico feito do jeito que a gente gosta: bem servido e cheio de sabor.',
    priceNote: 'Valor varia conforme tamanho e decoração',
    price: { kind: 'starting-at', amountInCents: 8500 },
  },
  {
    id: 'brigadeiros',
    name: 'Brigadeiros Gourmet',
    categoryId: 'docinhos',
    image: 'brigadeiros',
    description: 'Pequenos clássicos, feitos à mão e finalizados com muito carinho.',
    price: { kind: 'starting-at', amountInCents: 3600 },
  },
  {
    id: 'brownie',
    name: 'Brownie Recheado',
    categoryId: 'sobremesas',
    image: 'brownie',
    description: 'Casquinha delicada, interior úmido e uma surpresa a cada mordida.',
    details:
      'Casquinha delicada por fora, interior úmido e bem chocolatudo — com uma surpresa cremosa escondida em cada mordida. Perfeito para um café da tarde ou para presentear alguém especial.',
    price: { kind: 'fixed', amountInCents: 1800 },
  },
  {
    id: 'bolo-morango',
    name: 'Bolo de Morango',
    categoryId: 'bolos',
    image: 'strawberry-cake',
    description: 'Camadas leves, creme suave e morangos frescos para celebrar.',
    price: { kind: 'starting-at', amountInCents: 9200 },
  },
  {
    id: 'copo-felicidade',
    name: 'Copo da Felicidade',
    categoryId: 'sobremesas',
    image: 'dessert-cup',
    description: 'Cremes, pedacinhos de bolo e muito sabor em cada colherada.',
    price: { kind: 'fixed', amountInCents: 2200 },
  },
  {
    id: 'caixa-docinhos',
    name: 'Caixa de Docinhos',
    categoryId: 'kits',
    image: 'sweet-box',
    description: 'Uma seleção delicada para presentear ou compartilhar bons momentos.',
    price: { kind: 'starting-at', amountInCents: 4800 },
  },
];

export function filterProducts(items: readonly Product[], categoryId: string): readonly Product[] {
  return categoryId === 'todos'
    ? items
    : items.filter((product) => product.categoryId === categoryId);
}

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatPrice(price: Product['price']): string {
  return `${price.kind === 'starting-at' ? 'A partir de ' : ''}${currency.format(price.amountInCents / 100)}`;
}
