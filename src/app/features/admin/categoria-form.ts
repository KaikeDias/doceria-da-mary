import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  LucideArrowRight,
  LucideCircleAlert,
  LucideImagePlus,
  LucideInfo,
  LucideTags,
  LucideTrash2,
  LucideUpload,
  LucideX,
} from '@lucide/angular';
import { saveError } from '../../core/supabase/supabase';
import { DuplicateCategory } from './admin-menu-repository';
import { AdminCategory, MenuStore } from './menu-store';

const maxImageBytes = 2 * 1024 * 1024;
const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];

@Component({
  selector: 'app-categoria-form',
  imports: [
    NgTemplateOutlet,
    LucideArrowRight,
    LucideCircleAlert,
    LucideImagePlus,
    LucideInfo,
    LucideTags,
    LucideTrash2,
    LucideUpload,
    LucideX,
  ],
  templateUrl: './categoria-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriaForm {
  private readonly store = inject(MenuStore);
  private readonly injector = inject(Injector);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  // Mensagem de sucesso para a tela exibir.
  readonly saved = output<string>();
  // "Excluir categoria": a tela decide entre bloquear e confirmar.
  readonly remove = output<AdminCategory>();

  protected readonly saveError = saveError;
  protected readonly existing = signal<AdminCategory | undefined>(undefined);
  protected readonly name = signal('');
  protected readonly visible = signal(true);
  // URL atual ou blob: do arquivo escolhido, enviado só ao salvar.
  protected readonly image = signal('');
  private file: File | null = null;
  protected readonly imageNotice = signal('');
  // Nome recusado pelo banco por duplicidade, em minúsculas.
  private readonly taken = signal('');
  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveFailed = signal(false);

  protected readonly errors = computed(() => {
    const name = this.name().trim().toLowerCase();
    const duplicate =
      name === this.taken() ||
      this.store
        .categories()
        .some((other) => other.id !== this.existing()?.id && other.name.toLowerCase() === name);
    return {
      name: !name
        ? 'Informe o nome da categoria.'
        : duplicate
          ? 'Já existe uma categoria com esse nome.'
          : '',
      image: this.image() ? '' : 'Escolha uma imagem para a categoria.',
    };
  });
  protected readonly imageError = computed(
    () => this.imageNotice() || (this.submitted() ? this.errors().image : ''),
  );

  open(category?: AdminCategory): void {
    this.existing.set(category);
    this.name.set(category?.name ?? '');
    this.visible.set(category?.visible ?? true);
    this.setImage(category?.image ?? '', null);
    this.imageNotice.set('');
    this.taken.set('');
    this.submitted.set(false);
    this.saveFailed.set(false);
    this.dialog().nativeElement.showModal();
  }

  close(): void {
    this.dialog().nativeElement.close();
  }

  // Libera o blob: ao fechar por qualquer caminho (×, Cancelar, Esc, fundo ou depois de salvar),
  // depois da descida do painel, para a imagem não sumir no meio dela.
  protected async closed(): Promise<void> {
    const dialog = this.dialog().nativeElement;
    await Promise.allSettled(dialog.getAnimations?.().map((animation) => animation.finished) ?? []);
    if (!dialog.open) this.setImage('', null);
  }

  protected backdropClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement && !this.saving()) this.close();
  }

  protected pick(input: HTMLInputElement): void {
    this.addFile(input.files?.[0]);
    input.value = '';
  }

  protected drop(event: DragEvent): void {
    event.preventDefault();
    if (!this.saving()) this.addFile(event.dataTransfer?.files[0]);
  }

  private addFile(file: File | undefined): void {
    if (!file) return;
    if (!imageTypes.includes(file.type)) {
      this.imageNotice.set('Envie uma imagem JPG, PNG ou WEBP.');
    } else if (file.size > maxImageBytes) {
      this.imageNotice.set('Essa imagem passa de 2 MB. Escolha uma foto menor.');
    } else {
      this.imageNotice.set('');
      this.setImage(URL.createObjectURL(file), file);
    }
  }

  private setImage(url: string, file: File | null): void {
    if (this.image().startsWith('blob:')) URL.revokeObjectURL(this.image());
    this.image.set(url);
    this.file = file;
  }

  protected async save(): Promise<void> {
    if (this.saving()) return;
    this.submitted.set(true);
    const errors = this.errors();
    if (errors.name || errors.image) {
      this.focus(errors.name ? 'categoria-name' : 'categoria-image');
      return;
    }
    const name = this.name().trim();
    const existing = this.existing();
    this.saving.set(true);
    this.saveFailed.set(false);
    let imageFailed: boolean;
    try {
      ({ imageFailed } = await this.store.saveCategory(
        { name, visible: this.visible(), image: this.file ?? this.image() },
        existing,
      ));
    } catch (error) {
      if (error instanceof DuplicateCategory) {
        this.taken.set(name.toLowerCase());
        this.focus('categoria-name');
      } else {
        this.saveFailed.set(true);
      }
      return;
    } finally {
      this.saving.set(false);
    }
    this.close();
    this.saved.emit(
      (existing ? `Alterações em ${name} salvas.` : `${name} foi adicionada às categorias.`) +
        (imageFailed ? ' A imagem não foi enviada.' : ''),
    );
  }

  // Depois da renderização: o fieldset precisa ter saído de disabled.
  private focus(id: string): void {
    afterNextRender(
      () => this.dialog().nativeElement.querySelector<HTMLElement>(`#${id}`)?.focus(),
      { injector: this.injector },
    );
  }
}
