import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { LucideInfo, LucidePencil, LucidePlus, LucideTags, LucideTrash2 } from '@lucide/angular';
import { categories, products } from '../catalog/catalog';

// shortcut: "Datas especiais" não existe no catálogo; categoria demonstrativa da referência, trocar pela lista real.
const initialItems = [
  ...categories.map((category) => ({ id: category.id, name: category.label, visible: true })),
  { id: 'datas-especiais', name: 'Datas especiais', visible: false },
];

@Component({
  selector: 'app-categorias',
  imports: [NgTemplateOutlet, LucideInfo, LucidePencil, LucidePlus, LucideTags, LucideTrash2],
  templateUrl: './categorias.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Categorias {
  protected readonly items = signal(initialItems);

  protected productCount(id: string): string {
    const count = products.filter((product) => product.categoryId === id).length;
    if (count === 0) return 'Nenhum produto';
    return `${count} ${count === 1 ? 'produto' : 'produtos'}`;
  }

  protected toggle(id: string): void {
    this.items.update((items) =>
      items.map((item) => (item.id === id ? { ...item, visible: !item.visible } : item)),
    );
  }
}
