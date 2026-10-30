// Dados de exemplo (os mesmos do banco) para os testes unitários.
import { Category, Product } from './catalog';
import { Catalog, CatalogRepository } from './catalog-repository';

export const categories: readonly Category[] = [
  { id: 'bolos', name: 'Bolos', image: 'images/chocolate-cake.webp', label: 'Bolos' },
  { id: 'docinhos', name: 'Docinhos', image: 'images/brigadeiros.webp', label: 'Docinhos' },
  { id: 'sobremesas', name: 'Sobremesas', image: 'images/dessert-cup.webp', label: 'Sobremesas' },
  { id: 'kits', name: 'Kits', image: 'images/sweet-box.webp', label: 'Kits e presentes' },
];

export const products: readonly Product[] = [
  {
    id: 'bolo-chocolate',
    name: 'Bolo de Chocolate',
    categoryId: 'bolos',
    categoryLabel: 'Bolos',
    image: 'images/chocolate-cake.webp',
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
    categoryLabel: 'Docinhos',
    image: 'images/brigadeiros.webp',
    description: 'Pequenos clássicos, feitos à mão e finalizados com muito carinho.',
    price: { kind: 'starting-at', amountInCents: 3600 },
  },
  {
    id: 'brownie',
    name: 'Brownie Recheado',
    categoryId: 'sobremesas',
    categoryLabel: 'Sobremesas',
    image: 'images/brownie.webp',
    description: 'Casquinha delicada, interior úmido e uma surpresa a cada mordida.',
    details:
      'Casquinha delicada por fora, interior úmido e bem chocolatudo — com uma surpresa cremosa escondida em cada mordida. Perfeito para um café da tarde ou para presentear alguém especial.',
    price: { kind: 'fixed', amountInCents: 1800 },
  },
  {
    id: 'bolo-morango',
    name: 'Bolo de Morango',
    categoryId: 'bolos',
    categoryLabel: 'Bolos',
    image: 'images/strawberry-cake.webp',
    description: 'Camadas leves, creme suave e morangos frescos para celebrar.',
    price: { kind: 'starting-at', amountInCents: 9200 },
  },
  {
    id: 'copo-felicidade',
    name: 'Copo da Felicidade',
    categoryId: 'sobremesas',
    categoryLabel: 'Sobremesas',
    image: 'images/dessert-cup.webp',
    description: 'Cremes, pedacinhos de bolo e muito sabor em cada colherada.',
    price: { kind: 'fixed', amountInCents: 2200 },
  },
  {
    id: 'caixa-docinhos',
    name: 'Caixa de Docinhos',
    categoryId: 'kits',
    categoryLabel: 'Kits e presentes',
    image: 'images/sweet-box.webp',
    description: 'Uma seleção delicada para presentear ou compartilhar bons momentos.',
    price: { kind: 'starting-at', amountInCents: 4800 },
  },
];

// Repositório falso para os testes da landing.
export function provideCatalog(
  load: () => Promise<Catalog> = async () => ({ categories, products }),
) {
  return { provide: CatalogRepository, useValue: { load } };
}
