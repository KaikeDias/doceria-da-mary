import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideArrowRight } from '@lucide/angular';
import { formatPrice, Product } from './catalog';
import { productWhatsappUrl } from '../../core/config/contact-links';

@Component({
  selector: 'app-product-card',
  imports: [LucideArrowRight],
  styleUrl: './product-card.css',
  template: `
    <article class="product-card">
      <img
        [src]="'images/' + product().image + '.webp'"
        [alt]="product().name"
        width="808"
        height="462"
        loading="lazy"
      />
      <div class="product-content">
        <p class="eyebrow product-category">{{ categoryName() }}</p>
        <h3>{{ product().name }}</h3>
        <p class="product-description">{{ product().description }}</p>
        <div class="product-bottom">
          <p class="product-price">{{ price() }}</p>
          <a
            class="product-order"
            [attr.href]="whatsappLink()"
            [attr.aria-disabled]="!whatsappLink() ? 'true' : null"
            [attr.aria-label]="'Pedir ' + product().name + ' pelo WhatsApp (abre em nova aba)'"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="desktop-order">Pedir no </span>WhatsApp
            <svg lucideArrowRight aria-hidden="true" [size]="16"></svg>
          </a>
        </div>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly categoryName = input.required<string>();
  protected readonly price = computed(() => formatPrice(this.product().price));
  protected readonly whatsappLink = computed(() => productWhatsappUrl(this.product().name));
}
