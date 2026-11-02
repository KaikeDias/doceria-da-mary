import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  LucideArrowLeft,
  LucideArrowRight,
  LucideChevronRight,
  LucideCircleAlert,
  LucideEye,
  LucideImage,
  LucideImagePlus,
  LucideX,
} from '@lucide/angular';
import { formatPrice } from '../catalog/catalog';
import { saveError } from '../../core/supabase/supabase';
import { AdminMenuRepository } from './admin-menu-repository';
import { MenuStore } from './menu-store';

const maxImages = 5;
const maxImageBytes = 5 * 1024 * 1024;
const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];

// Mantém só o que cabe num preço: até 5 dígitos inteiros e 2 decimais.
export function limitPrice(text: string): string {
  const [, whole, separator, decimals] = /^(\d*)(?:([.,])(\d*))?/.exec(
    text.replace(/[^\d.,]/g, ''),
  )!;
  return whole.slice(0, 5) + (separator ? separator + decimals.slice(0, 2) : '');
}

// Centavos (até 99.999,99); null = vazio ("Sob consulta"); NaN = inválido.
export function parsePrice(text: string): number | null {
  const value = text.trim();
  if (!value) return null;
  if (!/^\d{1,5}([.,]\d{1,2})?$/.test(value)) return NaN;
  return Math.round(Number(value.replace(',', '.')) * 100);
}

@Component({
  selector: 'app-produto-form',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    LucideArrowLeft,
    LucideArrowRight,
    LucideChevronRight,
    LucideCircleAlert,
    LucideEye,
    LucideImage,
    LucideImagePlus,
    LucideX,
  ],
  templateUrl: './produto-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProdutoForm {
  private readonly store = inject(MenuStore);
  private readonly repository = inject(AdminMenuRepository);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  // As rotas só ativam com o store carregado e, na edição, com um id existente (menuReady).
  protected readonly existing = this.store.find(
    inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '',
  );

  protected readonly categories = this.store.categories;
  protected readonly saveError = saveError;
  // Arquivos novos por URL blob:, enviados só ao salvar.
  private readonly draftId = crypto.randomUUID();
  private readonly files = new Map<string, File>();
  protected readonly name = signal(this.existing?.name ?? '');
  protected readonly categoryId = signal(this.existing?.categoryId ?? '');
  protected readonly description = signal(this.existing?.description ?? '');
  protected readonly price = signal(
    this.existing?.price
      ? (this.existing.price.amountInCents / 100).toFixed(2).replace('.', ',')
      : '',
  );
  protected readonly startingAt = signal(this.existing?.price?.kind === 'starting-at');
  protected readonly images = signal<readonly string[]>(this.existing?.images ?? []);
  protected readonly imageNotice = signal('');
  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveFailed = signal(false);

  private readonly cents = computed(() => parsePrice(this.price()));
  protected readonly hasPrice = computed(() => !!this.cents());
  protected readonly errors = computed(() => ({
    name: this.name().trim() ? '' : 'Informe o nome do produto.',
    category: this.categoryId() ? '' : 'Escolha uma categoria.',
    price:
      Number.isNaN(this.cents()) || this.cents() === 0
        ? 'Informe um preço válido de até 99.999,99, como 85,00.'
        : '',
  }));
  protected readonly previewPrice = computed(() =>
    this.hasPrice()
      ? formatPrice({
          kind: this.startingAt() ? 'starting-at' : 'fixed',
          amountInCents: this.cents()!,
        })
      : 'Sob consulta',
  );
  protected readonly previewCategory = computed(
    () =>
      this.categories().find((category) => category.id === this.categoryId())?.name ?? 'Categoria',
  );

  protected addFiles(files: FileList | null | undefined): void {
    const all = Array.from(files ?? []);
    const accepted = all.filter(
      (file) => imageTypes.includes(file.type) && file.size <= maxImageBytes,
    );
    const room = maxImages - this.images().length;
    this.imageNotice.set(
      [
        accepted.length < all.length ? 'Envie fotos JPG, PNG ou WEBP de até 5 MB.' : '',
        accepted.length > room ? 'Você pode enviar até 5 fotos.' : '',
      ]
        .filter(Boolean)
        .join(' '),
    );
    const urls = accepted.slice(0, Math.max(room, 0)).map((file) => {
      const url = URL.createObjectURL(file);
      this.files.set(url, file);
      return url;
    });
    this.images.update((images) => [...images, ...urls]);
  }

  protected setPrice(input: HTMLInputElement): void {
    // Reescreve o campo: o [value] não reage quando o valor limitado não muda.
    input.value = limitPrice(input.value);
    this.price.set(input.value);
  }

  protected pick(input: HTMLInputElement): void {
    this.addFiles(input.files);
    input.value = '';
  }

  protected drop(event: DragEvent): void {
    event.preventDefault();
    if (!this.saving()) this.addFiles(event.dataTransfer?.files);
  }

  protected remove(index: number): void {
    const url = this.images()[index];
    if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    this.files.delete(url);
    this.images.update((images) => images.filter((_, i) => i !== index));
  }

  protected makeMain(index: number): void {
    this.images.update((images) => [images[index], ...images.filter((_, i) => i !== index)]);
  }

  protected async save(): Promise<void> {
    if (this.saving()) return;
    this.submitted.set(true);
    const errors = this.errors();
    const invalid = (['name', 'category', 'price'] as const).find((field) => errors[field]);
    if (invalid) {
      this.host.nativeElement.querySelector<HTMLElement>(`#produto-${invalid}`)?.focus();
      return;
    }
    const name = this.name().trim();
    const cents = this.cents();
    this.saving.set(true);
    this.saveFailed.set(false);
    let failedUploads: number;
    try {
      ({ failedUploads } = await this.repository.saveProduct(
        {
          id: this.draftId,
          name,
          categoryId: this.categoryId(),
          description: this.description().trim(),
          price:
            cents === null
              ? null
              : { kind: this.startingAt() ? 'starting-at' : 'fixed', amountInCents: cents },
          images: this.images().map((url) => this.files.get(url) ?? url),
        },
        this.existing,
      ));
    } catch {
      this.saving.set(false);
      this.saveFailed.set(true);
      return;
    }
    const lost =
      failedUploads === 0
        ? ''
        : failedUploads === 1
          ? ' 1 foto não foi enviada.'
          : ` ${failedUploads} fotos não foram enviadas.`;
    this.store.flash.set(
      (this.existing ? `Alterações em ${name} salvas.` : `${name} foi adicionado ao cardápio.`) +
        lost,
    );
    this.router.navigate(['/admin/cardapio']);
  }
}
