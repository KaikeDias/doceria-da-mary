import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideArrowRight } from '@lucide/angular';
import { formatPrice, Product } from './catalog';

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
          <button
            type="button"
            class="product-order"
            disabled
            [attr.aria-label]="'Pedir ' + product().name + ' pelo WhatsApp — número a configurar'"
          >
            <span class="desktop-order">Pedir no </span>WhatsApp
            <svg lucideArrowRight aria-hidden="true" [size]="16"></svg>
          </button>
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
}
