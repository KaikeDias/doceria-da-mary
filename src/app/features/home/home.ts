import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
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

  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  constructor() {
    // No build usa os padrões (HTML pré-renderizado); no navegador, as configurações do banco.
    effect(() => this.updateSeo(this.config()));
    afterNextRender(() => {
      this.load();
      this.loadConfig();
    });
  }

  private updateSeo(config: SiteConfig): void {
    const title = `${config.name} | ${config.tagline} · ${config.region}`;
    const description = `${config.description} ${config.region}.`;
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:site_name', content: config.name });
    const phone = whatsappUrl(config.whatsapp, '') && `+55${config.whatsapp}`;
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Bakery',
      name: config.name,
      description: config.description,
      areaServed: config.region,
      ...(phone && { telephone: phone }),
      sameAs: [`https://www.instagram.com/${config.instagram}/`],
    };
    const head = this.document.head;
    const script =
      head.querySelector('#dados-estruturados') ??
      head.appendChild(
        Object.assign(this.document.createElement('script'), {
          id: 'dados-estruturados',
          type: 'application/ld+json',
        }),
      );
    // Escapa "<" para um texto do banco não fechar o <script> no HTML.
    script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
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
