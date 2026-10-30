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
import { whatsappUrl } from '../../core/config/contact-links';
import {
  defaultImages,
  formatPhone,
  SiteConfig,
  SiteConfigRepository,
  siteConfigDefaults,
} from '../../core/config/site-config';
import { loadError } from '../../core/supabase/supabase';

@Component({
  selector: 'app-home',
  imports: [LucideArrowRight, ProductCard, ProductDetails],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly siteConfig = inject(SiteConfigRepository);
  // Skeletons até a leitura terminar (também no HTML pré-renderizado); padrões só se ela falhar.
  protected readonly configReady = signal(false);
  protected readonly config = signal<SiteConfig>(siteConfigDefaults);
  protected readonly logo = computed(() => this.config().logo || defaultImages.logo);
  protected readonly heroImage = computed(() => this.config().heroImage || defaultImages.heroImage);
  // Botões gerais; os dos produtos montam a própria mensagem.
  protected readonly whatsappLink = computed(() =>
    this.configReady() ? whatsappUrl(this.config().whatsapp, this.config().whatsappMessage) : null,
  );
  protected readonly contactPhone = computed(() =>
    this.whatsappLink() ? `+55 ${formatPhone(this.config().whatsapp)}` : 'Número a configurar',
  );
  protected readonly instagramUrl = computed(() =>
    this.configReady() ? `https://www.instagram.com/${this.config().instagram}/` : null,
  );
  protected readonly instagramHandle = computed(() => `@${this.config().instagram}`);
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
    afterNextRender(() => {
      this.load();
      this.loadConfig();
    });
  }

  // Falha ou campo vazio mantêm os padrões, sem aviso: o cardápio segue independente.
  private async loadConfig(): Promise<void> {
    try {
      const loaded = await this.siteConfig.load();
      this.config.set(
        Object.fromEntries(
          Object.entries(loaded).map(([field, value]) => [
            field,
            value || siteConfigDefaults[field as keyof SiteConfig],
          ]),
        ) as unknown as SiteConfig,
      );
    } catch {
      // Mantém os padrões.
    }
    this.configReady.set(true);
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
