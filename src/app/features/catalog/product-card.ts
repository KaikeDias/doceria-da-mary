import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideArrowRight } from '@lucide/angular';
import { formatPrice, Product } from './catalog';
import { productWhatsappUrl } from '../../core/config/contact-links';

@Component({
  selector: 'app-product-card',
  imports: [LucideArrowRight],
  styleUrl: './product-card.css',
  template: `
    <article class="product-card">
      <button
        type="button"
        class="product-photo"
        [attr.aria-label]="'Ver detalhes de ' + product().name"
        (click)="details.emit(product())"
      >
        <img
          [src]="'images/' + product().image + '.webp'"
          [alt]="product().name"
          width="808"
          height="462"
          loading="lazy"
        />
      </button>
      <div class="product-content">
        <p class="eyebrow product-category">{{ categoryName() }}</p>
        <h3>
          <button
            type="button"
            class="product-name"
            [attr.aria-label]="'Ver detalhes de ' + product().name"
            (click)="details.emit(product())"
          >
            {{ product().name }}
          </button>
        </h3>
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
            Pedir no WhatsApp
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
  readonly details = output<Product>();
  protected readonly price = computed(() => formatPrice(this.product().price));
  protected readonly whatsappLink = computed(() => productWhatsappUrl(this.product().name));
}
