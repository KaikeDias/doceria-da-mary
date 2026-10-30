import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  host: { class: 'mary-site grid min-h-dvh place-items-center px-5 text-center' },
  template: `
    <main>
      <img src="logo.webp" alt="" width="64" height="64" class="mx-auto" />
      <h1 class="mt-6 font-display text-[48px] leading-[1.1] font-medium text-neutral">
        Página não encontrada
      </h1>
      <p class="mt-4 text-base">O endereço que você procurou não existe ou foi alterado.</p>
      <a routerLink="/" class="btn btn-primary mt-8 min-h-[52px] px-7 text-sm">
        Voltar para o início
      </a>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {
  constructor() {
    const meta = inject(Meta);
    meta.addTag({ name: 'robots', content: 'noindex' });
    inject(DestroyRef).onDestroy(() => meta.removeTag('name="robots"'));
  }
}
