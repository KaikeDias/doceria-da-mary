import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  LucideChevronLeft,
  LucideChevronRight,
  LucideClock,
  LucideInfo,
  LucideSnowflake,
  LucideX,
} from '@lucide/angular';
import { formatPrice, Product } from './catalog';
import { productWhatsappUrl } from '../../core/config/contact-links';
import { siteConfigDefaults } from '../../core/config/site-config';

@Component({
  selector: 'app-product-details',
  imports: [
    LucideChevronLeft,
    LucideChevronRight,
    LucideClock,
    LucideInfo,
    LucideSnowflake,
    LucideX,
  ],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetails implements OnDestroy {
  readonly product = input.required<Product>();
  // WhatsApp das configurações do site (DDD + número).
  readonly phone = input(siteConfigDefaults.whatsapp);
  readonly closed = output<void>();
  protected readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  protected readonly selectedImage = linkedSignal({ source: this.product, computation: () => 0 });
  protected readonly failedImages = signal<ReadonlySet<string>>(new Set());
  protected readonly images = computed(() => [
    { src: this.product().image, alt: `${this.product().name} — foto 1` },
    ...(this.product().additionalImages ?? []),
  ]);
  protected readonly currentImage = computed(() => this.images()[this.selectedImage()]);
  protected readonly categoryName = computed(() => this.product().categoryLabel);
  protected readonly priceLabel = computed(() =>
    this.product().price?.kind === 'starting-at' ? 'A partir de' : 'Preço',
  );
  protected readonly amount = computed(() => {
    const price = this.product().price;
    return formatPrice(price && { ...price, kind: 'fixed' });
  });
  protected readonly priceNote = computed(() =>
    this.product().price?.kind === 'fixed'
      ? null
      : (this.product().priceNote ?? 'Consulte as opções e o valor final pelo WhatsApp'),
  );
  protected readonly whatsappLink = computed(() =>
    productWhatsappUrl(this.phone(), this.product().name),
  );
  private readonly document = inject(DOCUMENT);
  private returnFocus: HTMLElement | null = null;
  private previousOverflow = '';
  private opened = false;
  private backdropPress = false;

  constructor() {
    afterNextRender(() => {
      this.returnFocus = this.document.activeElement as HTMLElement;
      this.previousOverflow = this.document.documentElement.style.overflow;
      this.document.documentElement.style.overflow = 'hidden';
      // Native dialog makes the background inert.
      this.dialog().nativeElement.showModal();
      this.opened = true;
    });
  }

  protected moveImage(direction: number): void {
    this.selectedImage.update(
      (index) => (index + direction + this.images().length) % this.images().length,
    );
  }

  protected imageFailed(src: string): void {
    this.failedImages.update((images) => new Set([...images, src]));
  }

  protected startBackdropPress(event: PointerEvent): void {
    this.backdropPress = event.target === this.dialog().nativeElement;
    if (this.backdropPress) event.preventDefault();
  }

  protected closeFromBackdrop(event: MouseEvent): void {
    if (this.backdropPress && event.target === this.dialog().nativeElement) this.close();
    this.backdropPress = false;
  }

  protected close(): void {
    this.closed.emit();
  }

  protected keepFocus(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;
    const controls = Array.from(
      this.dialog().nativeElement.querySelectorAll<HTMLElement>('button, a[href]'),
    ).filter((control) => control.getClientRects().length > 0);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && this.document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && this.document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  ngOnDestroy(): void {
    if (!this.opened) return;
    this.dialog().nativeElement.close();
    this.document.documentElement.style.overflow = this.previousOverflow;
    const target = this.returnFocus?.isConnected
      ? this.returnFocus
      : this.document.querySelector<HTMLElement>('.filter-group button');
    target?.focus({ preventScroll: true });
  }
}
