import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideArrowRight } from '@lucide/angular';
import { formatPrice, Product } from './catalog';
import { productWhatsappUrl } from '../../core/config/contact-links';
import { siteConfigDefaults } from '../../core/config/site-config';

@Component({
  selector: 'app-product-card',
  imports: [LucideArrowRight],
  host: { class: 'block min-w-0' },
  template: `
    <article
      class="product-card h-full overflow-hidden rounded-[20px] bg-white shadow-[0_6px_20px_#5a3a2e06] transition-[transform,box-shadow] duration-220 ease-[cubic-bezier(0.2,0.7,0.2,1)] mouse:hover:[transform:translateY(-6px)_scale(1.02)] mouse:hover:shadow-[0_18px_36px_#5a3a2e1f] motion-reduce:transition-none motion-reduce:duration-0 motion-reduce:mouse:hover:transform-none max-desktop:rounded-[18px]"
    >
      <button
        type="button"
        class="product-photo btn btn-ghost block h-auto min-h-0 w-full rounded-none border-0 bg-transparent p-0 focus-visible:outline-offset-[-5px]"
        [attr.aria-label]="'Ver detalhes de ' + product().name"
        (click)="details.emit(product())"
      >
        @if (product().image) {
          <img
            [src]="product().image"
            [alt]="product().name"
            width="808"
            height="462"
            loading="lazy"
            class="block aspect-[1.725] w-full object-cover max-desktop:aspect-[1.6]"
          />
        } @else {
          <span class="block aspect-[1.725] w-full bg-base-200 max-desktop:aspect-[1.6]"></span>
        }
      </button>
      <div
        class="product-content p-6 max-desktop:px-5 max-desktop:pt-4.5 max-desktop:pb-4 max-[361px]:px-4"
      >
        <p
          class="eyebrow product-category text-[10px] tracking-[1.6px] font-body leading-normal font-medium tracking-[2px] text-brand-text uppercase max-desktop:text-[10px] max-desktop:tracking-[1.6px]"
        >
          {{ categoryName() }}
        </p>
        <h3
          class="mt-2.5 font-display text-[30px] leading-[1.15] font-medium text-neutral max-desktop:mt-2"
        >
          <button
            type="button"
            class="product-name btn btn-link h-auto min-h-11 max-w-full justify-start rounded-none border-0 bg-transparent p-0 text-left align-baseline whitespace-normal text-inherit no-underline [font:inherit]"
            [attr.aria-label]="'Ver detalhes de ' + product().name"
            (click)="details.emit(product())"
          >
            {{ product().name }}
          </button>
        </h3>
        <p
          class="product-description mt-3 min-h-[45px] text-sm leading-[1.6] max-desktop:mt-2.5 max-desktop:min-h-0"
        >
          {{ product().description }}
        </p>
        <div
          class="product-bottom mt-6 flex flex-wrap items-center justify-between gap-2 max-desktop:mt-5"
        >
          <p class="product-price text-sm font-semibold text-neutral max-[361px]:text-xs">
            {{ price() }}
          </p>
          <a
            class="product-order btn btn-link -my-2 inline-flex h-auto min-h-11 items-center gap-1.5 rounded-none border-0 bg-transparent p-0 text-[13px] font-medium whitespace-nowrap text-brand-text no-underline max-[361px]:text-xs"
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
  // WhatsApp das configurações do site (DDD + número).
  readonly phone = input(siteConfigDefaults.whatsapp);
  readonly categoryName = input.required<string>();
  readonly details = output<Product>();
  protected readonly price = computed(() => formatPrice(this.product().price));
  protected readonly whatsappLink = computed(() =>
    productWhatsappUrl(this.phone(), this.product().name),
  );
}
