import { filterProducts, formatPrice } from './catalog';
import { products } from './catalog.fixture';

describe('Catálogo demonstrativo', () => {
  it('retorna todos os produtos e filtra sem alterar os dados', () => {
    expect(filterProducts(products, 'todos')).toBe(products);
    expect(filterProducts(products, 'bolos').map((product) => product.id)).toEqual([
      'bolo-chocolate',
      'bolo-morango',
    ]);
    expect(filterProducts(products, 'sem-produtos')).toEqual([]);
    expect(products).toHaveLength(6);
  });

  it('formata preços em centavos e distingue preços iniciais', () => {
    expect(formatPrice({ kind: 'fixed', amountInCents: 1800 })).toBe('R$\u00a018,00');
    expect(formatPrice({ kind: 'starting-at', amountInCents: 8500 })).toBe(
      'A partir de R$\u00a085,00',
    );
    expect(formatPrice({ kind: 'fixed', amountInCents: 1250 })).toBe('R$\u00a012,50');
  });
});
