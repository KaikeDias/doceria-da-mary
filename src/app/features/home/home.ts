import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { LucideArrowRight, LucideMenu, LucideX, LucideMessageCircle } from '@lucide/angular';
import { categories, products, filterProducts } from '../catalog/catalog';
import { ProductCard } from '../catalog/product-card';
import { publicConfig } from '../../core/config/public-config';
import { whatsappMessages, whatsappUrl } from '../../core/config/contact-links';

@Component({
  selector: 'app-home',
  imports: [LucideArrowRight, LucideMenu, LucideX, LucideMessageCircle, ProductCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly contact = publicConfig.contact;
  protected readonly contactPhone =
    this.contact.whatsapp?.replace(/^(\d{2})(\d{2})(\d{5})(\d{4})$/, '+$1 ($2) $3-$4') ??
    'Número a configurar';
  protected readonly instagramHandle = this.contact.instagram
    ? `@${new URL(this.contact.instagram).pathname.replaceAll('/', '')}`
    : 'Perfil a configurar';
  protected readonly contactLinks = {
    order: whatsappUrl(whatsappMessages.order),
    hero: whatsappUrl(whatsappMessages.hero),
    customOrder: whatsappUrl(whatsappMessages.customOrder),
    questions: whatsappUrl(whatsappMessages.questions),
  };
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
