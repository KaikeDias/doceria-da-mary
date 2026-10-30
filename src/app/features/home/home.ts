import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { LucideArrowRight } from '@lucide/angular';
import { Category, filterProducts, Product } from '../catalog/catalog';
import { CatalogRepository } from '../catalog/catalog-repository';
import { ProductCard } from '../catalog/product-card';
import { ProductDetails } from '../catalog/product-details';
import { publicConfig } from '../../core/config/public-config';
import { whatsappMessages, whatsappUrl } from '../../core/config/contact-links';
import { loadError } from '../../core/supabase/supabase';

@Component({
  selector: 'app-home',
  imports: [LucideArrowRight, ProductCard, ProductDetails],
  templateUrl: './home.html',
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
  private readonly repository = inject(CatalogRepository);
  protected readonly loadError = loadError;
  // A casca é pré-renderizada; o cardápio é buscado no navegador.
  protected readonly state = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly categories = signal<readonly Category[]>([]);
  protected readonly products = signal<readonly Product[]>([]);
  protected readonly selectedCategory = signal('todos');
  protected readonly selectedProduct = signal<Product | null>(null);
  protected readonly visibleProducts = computed(() =>
    filterProducts(this.products(), this.selectedCategory()),
  );

  constructor() {
    afterNextRender(() => this.load());
  }

  protected async load(): Promise<void> {
    this.state.set('loading');
    try {
      const catalog = await this.repository.load();
      this.categories.set(catalog.categories);
      this.products.set(catalog.products);
      this.state.set('ready');
    } catch {
      this.state.set('error');
    }
  }

  protected selectCategory(id: string): void {
    this.selectedCategory.set(id);
  }
}
