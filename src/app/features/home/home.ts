import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { LucideArrowRight, LucideMenu, LucideX, LucideMessageCircle } from '@lucide/angular';
import { categories, products, filterProducts } from '../catalog/catalog';
import { ProductCard } from '../catalog/product-card';

@Component({
  selector: 'app-home',
  imports: [LucideArrowRight, LucideMenu, LucideX, LucideMessageCircle, ProductCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly categories = categories;
  protected readonly selectedCategory = signal('todos');
  protected readonly menuOpen = signal(false);
  protected readonly visibleProducts = computed(() =>
    filterProducts(products, this.selectedCategory()),
  );
  protected selectCategory(id: string): void {
    this.selectedCategory.set(id);
  }
  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
