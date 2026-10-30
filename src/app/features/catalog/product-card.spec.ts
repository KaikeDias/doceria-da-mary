import { TestBed } from '@angular/core/testing';
import { products } from './catalog.fixture';
import { ProductCard } from './product-card';

describe('Card do produto', () => {
  it('atualiza foto, descrição, preço e pedido quando o produto muda', () => {
    const fixture = TestBed.createComponent(ProductCard);
    const page = fixture.nativeElement as HTMLElement;
    for (const product of [products[0], products[2]]) {
      fixture.componentRef.setInput('product', product);
      fixture.componentRef.setInput('categoryName', product.categoryLabel);
      fixture.detectChanges();
      expect(page.querySelector('h3')?.textContent?.trim()).toBe(product.name);
      expect(page.querySelector('img')?.getAttribute('alt')).toBe(product.name);
      expect(page.querySelector('img')?.getAttribute('src')).toBe(product.image);
      expect(page.querySelector('.product-description')?.textContent?.trim()).toBe(
        product.description,
      );
      expect(page.querySelector('.product-category')?.textContent?.trim()).toBe(
        product.categoryLabel,
      );
      expect(page.querySelector('.product-price')?.textContent?.trim()).toContain(
        product.price!.kind === 'starting-at' ? 'A partir de R$' : 'R$',
      );
      const link = page.querySelector<HTMLAnchorElement>('.product-order')!;
      expect(link.textContent).toContain('Pedir no WhatsApp');
      expect(link.getAttribute('aria-label')).toContain(product.name);
      expect(new URL(link.href).searchParams.get('text')).toContain(product.name);
      expect(new URL(link.href).pathname).toBe('/5589994259584');
    }
  });

  it('sinaliza indisponibilidade quando o WhatsApp está ausente', () => {
    const fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('phone', '');
    fixture.componentRef.setInput('product', products[0]);
    fixture.componentRef.setInput('categoryName', 'Bolos');
    fixture.detectChanges();
    const link = (fixture.nativeElement as HTMLElement).querySelector('.product-order')!;
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.hasAttribute('href')).toBe(false);
  });
});
