import { Injectable, signal } from '@angular/core';
import { Product, products } from '../catalog/catalog';

export interface MenuItem {
  readonly id: string;
  readonly name: string;
  readonly categoryId: string;
  readonly description: string;
  // null = "Sob consulta".
  readonly price: Product['price'] | null;
  // Caminhos completos; a primeira é a principal.
  readonly images: readonly string[];
  readonly published: boolean;
}

// shortcut: publicação só em memória (sem backend), trocar pelo estado salvo quando houver API.
const hiddenByDefault = new Set(['caixa-docinhos']);

@Injectable({ providedIn: 'root' })
export class MenuStore {
  readonly items = signal<readonly MenuItem[]>(
    products.map((product) => ({
      id: product.id,
      name: product.name,
      categoryId: product.categoryId,
      description: product.description,
      price: product.price,
      images: [`images/${product.image}.webp`],
      published: !hiddenByDefault.has(product.id),
    })),
  );
  // Mensagem de sucesso que a lista exibe ao abrir depois de salvar o formulário.
  readonly flash = signal('');

  find(id: string): MenuItem | undefined {
    return this.items().find((item) => item.id === id);
  }

  save(item: MenuItem): void {
    this.items.update((items) =>
      items.some((other) => other.id === item.id)
        ? items.map((other) => (other.id === item.id ? item : other))
        : [...items, item],
    );
  }
}
