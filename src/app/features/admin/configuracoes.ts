import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  LucideCheck,
  LucideCircleAlert,
  LucideCircleCheck,
  LucideExternalLink,
  LucideUpload,
  LucideWifiOff,
  LucideX,
} from '@lucide/angular';
import {
  ConfigConflict,
  defaultImages,
  formatPhone,
  limits,
  normalizeInstagram,
  normalizeWhatsapp,
  SiteConfig,
  SiteConfigField,
  SiteConfigRepository,
  SiteImageFiles,
  validateSiteConfig,
} from '../../core/config/site-config';
import { loadError } from '../../core/supabase/supabase';

type ImageField = 'logo' | 'heroImage';

const imageRules: Record<ImageField, { types: string[]; mb: number; typeError: string }> = {
  logo: { types: ['image/png', 'image/jpeg'], mb: 2, typeError: 'Envie uma imagem PNG ou JPG.' },
  heroImage: {
    types: ['image/jpeg', 'image/png', 'image/webp'],
    mb: 5,
    typeError: 'Envie uma imagem JPG, PNG ou WEBP.',
  },
};

@Component({
  selector: 'app-configuracoes',
  imports: [
    NgTemplateOutlet,
    LucideCheck,
    LucideCircleAlert,
    LucideCircleCheck,
    LucideExternalLink,
    LucideUpload,
    LucideWifiOff,
    LucideX,
  ],
  templateUrl: './configuracoes.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Configuracoes {
  private readonly repository = inject(SiteConfigRepository);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly loadError = loadError;
  protected readonly defaultImages = defaultImages;
  protected readonly sections = [
    { id: 'identidade', label: 'Identidade' },
    { id: 'contato', label: 'Contato' },
    { id: 'atendimento', label: 'Atendimento' },
    { id: 'conteudo', label: 'Conteúdo do site' },
  ];

  protected readonly state = signal<'loading' | 'ready' | 'error'>('loading');
  private readonly loaded = signal<SiteConfig | null>(null);
  // Valores como digitados; imagens com a URL salva ou o blob: do arquivo escolhido.
  protected readonly form = signal<SiteConfig>({} as SiteConfig);
  private files: { -readonly [K in ImageField]?: File } = {};
  protected readonly imageNotice = signal<Record<ImageField, string>>({ logo: '', heroImage: '' });
  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveFailed = signal(false);
  protected readonly conflict = signal(false);
  private readonly justSaved = signal(false);
  protected readonly message = signal('');
  private messageTimer?: ReturnType<typeof setTimeout>;

  // Como vai ser gravado: Instagram só com o usuário.
  private readonly normalized = computed(() => ({
    ...this.form(),
    instagram: normalizeInstagram(this.form().instagram),
  }));
  protected readonly errors = computed(() => validateSiteConfig(this.normalized()));
  protected readonly errorCount = computed(() => Object.keys(this.errors()).length);
  private readonly dirty = computed(() => {
    const loaded = this.loaded();
    const current = this.normalized();
    return (
      !!loaded &&
      (Object.keys(loaded) as SiteConfigField[]).some((f) => current[f].trim() !== loaded[f])
    );
  });
  protected readonly status = computed(() =>
    this.saving() ? 'saving' : this.dirty() ? 'dirty' : this.justSaved() ? 'saved' : 'clean',
  );
  protected readonly phone = computed(() => formatPhone(this.form().whatsapp ?? ''));

  // Acesso por chave para os templates de campo (o contexto do ng-template não é tipado).
  protected value(field: SiteConfigField): string {
    return this.form()[field];
  }

  protected error(field: SiteConfigField): string | undefined {
    return this.errors()[field];
  }

  protected limit(field: SiteConfigField): number | undefined {
    return limits[field];
  }

  protected notice(field: ImageField): string {
    return this.imageNotice()[field];
  }

  constructor() {
    this.load();
    inject(DestroyRef).onDestroy(() => {
      this.revokeBlobs();
      clearTimeout(this.messageTimer);
    });
  }

  protected async load(): Promise<void> {
    this.revokeBlobs();
    this.files = {};
    this.saveFailed.set(false);
    this.conflict.set(false);
    this.state.set('loading');
    try {
      const config = await this.repository.load();
      this.loaded.set(config);
      this.form.set(config);
      this.state.set('ready');
    } catch {
      this.state.set('error');
    }
  }

  protected edit(field: SiteConfigField, input: HTMLInputElement | HTMLTextAreaElement): void {
    if (field === 'whatsapp') {
      const digits = normalizeWhatsapp(input.value);
      // O signal pode não mudar (letra digitada): a máscara é reaplicada direto no campo.
      input.value = formatPhone(digits);
      this.update(field, digits);
    } else {
      this.update(field, input.value);
    }
  }

  private update(field: SiteConfigField, value: string): void {
    this.form.update((form) => ({ ...form, [field]: value }));
    this.justSaved.set(false);
  }

  protected pick(field: ImageField, input: HTMLInputElement): void {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const rules = imageRules[field];
    const notice = !rules.types.includes(file.type)
      ? rules.typeError
      : file.size > rules.mb * 1024 * 1024
        ? `Essa imagem passa de ${rules.mb} MB. Escolha uma foto menor.`
        : '';
    this.imageNotice.update((notices) => ({ ...notices, [field]: notice }));
    if (!notice) this.setImage(field, URL.createObjectURL(file), file);
  }

  // Volta para a imagem padrão do site.
  protected remove(field: ImageField): void {
    this.imageNotice.update((notices) => ({ ...notices, [field]: '' }));
    this.setImage(field, '');
  }

  private setImage(field: ImageField, url: string, file?: File): void {
    const current = this.form()[field];
    if (current.startsWith('blob:')) URL.revokeObjectURL(current);
    this.files[field] = file;
    this.update(field, url);
  }

  private revokeBlobs(): void {
    for (const field of ['logo', 'heroImage'] as const) {
      const url = this.form()[field];
      if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
    }
  }

  protected async save(): Promise<void> {
    if (this.saving() || !this.dirty()) return;
    this.submitted.set(true);
    const errors = this.errors();
    // As chaves do formulário estão na ordem da tela.
    const first = Object.keys(this.form()).find((field) => errors[field as SiteConfigField]);
    if (first) {
      this.host.nativeElement.querySelector<HTMLElement>(`#config-${first}`)?.focus();
      return;
    }
    this.saving.set(true);
    this.saveFailed.set(false);
    this.conflict.set(false);
    try {
      const saved = await this.repository.save(
        this.normalized(),
        this.loaded()!,
        this.files as SiteImageFiles,
      );
      this.revokeBlobs();
      this.files = {};
      this.loaded.set(saved);
      this.form.set(saved);
      this.submitted.set(false);
      this.justSaved.set(true);
      this.notify('Alterações salvas! O site já mostra as novas informações.');
    } catch (error) {
      this.conflict.set(error instanceof ConfigConflict);
      this.saveFailed.set(true);
    } finally {
      this.saving.set(false);
    }
  }

  private notify(text: string): void {
    clearTimeout(this.messageTimer);
    this.message.set(text);
    this.messageTimer = setTimeout(() => this.message.set(''), 5000);
  }
}
