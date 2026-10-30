import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { SiteConfigRepository } from '../../core/config/site-config';
import { FakeSiteConfigRepository, siteConfig } from '../../core/config/site-config.fixture';
import { loadError } from '../../core/supabase/supabase';
import { provideAdmin } from './admin.fixture';

async function setup(repository = new FakeSiteConfigRepository()) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(routes),
      ...provideAdmin(),
      { provide: SiteConfigRepository, useValue: repository },
    ],
  });
  const harness = await RouterTestingHarness.create('/admin/configuracoes');
  const settle = async () => {
    await new Promise((resolve) => setTimeout(resolve));
    await harness.fixture.whenStable();
    harness.detectChanges();
  };
  await settle();
  const page = harness.fixture.nativeElement as HTMLElement;
  const field = (key: string) =>
    page.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#config-${key}`)!;
  const fill = (key: string, value: string) => {
    field(key).value = value;
    field(key).dispatchEvent(new Event('input'));
    harness.detectChanges();
  };
  const pick = (key: string, type: string, size = 1000) => {
    const input = field(key) as HTMLInputElement;
    const file = new File(['x'], key, { type });
    Object.defineProperty(file, 'size', { value: size });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change'));
    harness.detectChanges();
  };
  const submit = async () => {
    page.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    harness.detectChanges();
    await settle();
  };
  const button = (text: string) =>
    Array.from(page.querySelectorAll('button')).find((b) => b.textContent?.includes(text))!;
  const bar = () => page.querySelector('#config-status')!.textContent!.replace(/\s+/g, ' ');
  const toast = () => page.querySelector('.toast')!.textContent!.trim();
  const alert = () => page.querySelector('form [role=alert]')?.textContent?.replace(/\s+/g, ' ');
  const errorOf = (key: string) => page.querySelector(`#config-${key}-error`)?.textContent?.trim();
  return {
    harness,
    page,
    repository,
    field,
    fill,
    pick,
    submit,
    button,
    bar,
    toast,
    alert,
    errorOf,
    settle,
  };
}

const mb = 1024 * 1024;

describe('Configurações do site', () => {
  let blobs = 0;
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => `blob:imagem-${++blobs}`);
    URL.revokeObjectURL = vi.fn();
  });

  it(
    'CA01: menu leva à tela com cabeçalho, atalhos e valores do banco',
    { timeout: 60000 },
    async () => {
      const { page, field } = await setup();
      expect(page.querySelector('h1')?.textContent).toContain('Configurações do site');
      expect(page.querySelector('aside a[aria-current=page]')?.textContent).toContain(
        'Configurações',
      );
      const links = Array.from(page.querySelectorAll<HTMLAnchorElement>('main nav a'));
      expect(links.map((a) => [a.textContent?.trim(), a.getAttribute('href')])).toEqual([
        ['1Identidade', '/admin/configuracoes#identidade'],
        ['2Contato', '/admin/configuracoes#contato'],
        ['3Atendimento', '/admin/configuracoes#atendimento'],
        ['4Conteúdo do site', '/admin/configuracoes#conteudo'],
      ]);
      for (const { id } of [
        { id: 'identidade' },
        { id: 'contato' },
        { id: 'atendimento' },
        { id: 'conteudo' },
      ])
        expect(page.querySelector(`section#${id} h2`)).toBeTruthy();
      expect(field('name').value).toBe('Doceria da Mary');
      expect(field('whatsapp').value).toBe('(11) 98765-4321');
      expect(field('heroTitle').value).toBe(siteConfig.heroTitle);
      expect(
        page.querySelector<HTMLImageElement>('img[alt="Logo atual"]')!.getAttribute('src'),
      ).toBe('logo.png');
      expect(
        page
          .querySelector<HTMLImageElement>('img[alt="Imagem principal atual"]')!
          .getAttribute('src'),
      ).toBe('images/hero.webp');
    },
  );

  it('CA02: carregando, erro e "Tentar de novo"', async () => {
    const repository = new FakeSiteConfigRepository();
    repository.failLoad = true;
    const { page, button, settle } = await setup(repository);
    expect(page.querySelector('[role=alert]')?.textContent).toContain(loadError);
    repository.failLoad = false;
    let release!: () => void;
    const load = repository.load.bind(repository);
    repository.load = () => new Promise((resolve) => (release = () => resolve(load())));
    button('Tentar de novo').click();
    await settle();
    expect(page.textContent).toContain('Carregando configurações…');
    release();
    await settle();
    expect(page.querySelector('#config-name')).toBeTruthy();
  });

  it('CA03: estado pendente acompanha as alterações', async () => {
    const { fill, bar, button } = await setup();
    expect(bar()).toContain('Nenhuma alteração pendente');
    expect(button('Salvar alterações').disabled).toBe(true);
    fill('hours', 'Terça a sábado, das 10h às 19h');
    expect(bar()).toContain('Alterações não salvas · o site ainda mostra a versão anterior');
    expect(button('Salvar alterações').disabled).toBe(false);
    fill('hours', siteConfig.hours + ' ');
    expect(bar()).toContain('Nenhuma alteração pendente');
  });

  it('CA04: contadores, limites e prévia do WhatsApp', async () => {
    const { page, field, fill } = await setup();
    expect(field('description').getAttribute('maxlength')).toBe('160');
    expect(field('ordersText').getAttribute('maxlength')).toBe('300');
    expect(field('heroTitle').getAttribute('maxlength')).toBe('70');
    expect(page.querySelector('#config-description-help')?.textContent).toContain('41/160');
    fill('heroTitle', 'Doces');
    expect(page.querySelector('#config-heroTitle-help')?.textContent).toContain('5/70');
    fill('name', 'Mary Doces');
    fill('whatsapp', '21x912345678');
    fill('whatsappMessage', 'Oi!');
    expect(field('whatsapp').value).toBe('(21) 91234-5678');
    const preview = page.querySelector('figure')!.textContent!.replace(/\s+/g, ' ');
    expect(preview).toContain('Mary Doces');
    expect(preview).toContain('+55 (21) 91234-5678');
    expect(preview).toContain('Oi!');
    expect(preview).toContain('Prévia de como o cliente envia a mensagem.');
  });

  it('CA05: salvar com erros mostra a contagem, as mensagens e foca o primeiro', async () => {
    const { repository, field, fill, submit, alert, errorOf } = await setup();
    fill('whatsapp', '1198765');
    fill('instagram', 'doceria da mary');
    fill('email', 'mary@');
    fill('heroTitle', '');
    await submit();
    expect(alert()).toContain('Falta corrigir 4 campos antes de salvar.');
    expect(errorOf('whatsapp')).toBe('Número incompleto. Use DDD + número, como (11) 99999-9999.');
    expect(errorOf('instagram')).toBe('Use só letras, números, ponto ou _, sem espaços.');
    expect(errorOf('email')).toBe('Confira o e-mail, como nome@exemplo.com.');
    expect(errorOf('heroTitle')).toBe('O título principal não pode ficar vazio.');
    expect(field('whatsapp').getAttribute('aria-invalid')).toBe('true');
    expect(field('whatsapp').getAttribute('aria-describedby')).toContain('config-whatsapp-error');
    expect(document.activeElement).toBe(field('whatsapp'));
    expect(repository.saves).toHaveLength(0);
    fill('whatsapp', '11987654321');
    fill('instagram', 'doceriadamary');
    fill('email', '');
    expect(alert()).toContain('Falta corrigir 1 campo antes de salvar.');
    fill('heroTitle', 'Doces');
    expect(alert()).toBeUndefined();
  });

  it('CA06: obrigatório vazio é recusado; e-mail e endereço vazios viram nulo no banco', async () => {
    const { repository, fill, submit, errorOf, field } = await setup();
    fill('tagline', ' ');
    await submit();
    expect(errorOf('tagline')).toBe('Preencha este campo.');
    expect(document.activeElement).toBe(field('tagline'));
    fill('tagline', 'Doces');
    fill('email', '');
    fill('address', '');
    await submit();
    expect(repository.saves[0].config).toMatchObject({ email: '', address: '', tagline: 'Doces' });
  });

  it('CA07: Instagram e WhatsApp colados são gravados normalizados', async () => {
    const { repository, fill, field, submit } = await setup();
    fill('instagram', 'https://www.instagram.com/mary.doces/');
    fill('whatsapp', '+55 (11) 91111-2222');
    await submit();
    expect(repository.saves[0].config).toMatchObject({
      instagram: 'mary.doces',
      whatsapp: '11911112222',
    });
    expect(field('instagram').value).toBe('mary.doces');
  });

  it('CA08: tipo e tamanho inválidos descartam o arquivo', async () => {
    const { page, pick, errorOf } = await setup();
    pick('logo', 'image/png', 3 * mb);
    expect(errorOf('logo')).toBe('Essa imagem passa de 2 MB. Escolha uma foto menor.');
    pick('logo', 'image/webp');
    expect(errorOf('logo')).toBe('Envie uma imagem PNG ou JPG.');
    pick('heroImage', 'image/jpeg', 6 * mb);
    expect(errorOf('heroImage')).toBe('Essa imagem passa de 5 MB. Escolha uma foto menor.');
    pick('heroImage', 'image/gif');
    expect(errorOf('heroImage')).toBe('Envie uma imagem JPG, PNG ou WEBP.');
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(page.querySelector('#config-logo')!.getAttribute('aria-invalid')).toBe('true');
    pick('logo', 'image/png', 2 * mb);
    expect(errorOf('logo')).toBe('');
  });

  it('CA09: trocar e remover imagens', async () => {
    const repository = new FakeSiteConfigRepository();
    const oldHero = 'https://teste.supabase.co/site/configuracoes/hero-velha.webp';
    repository.config = { ...siteConfig, heroImage: oldHero };
    const { page, pick, button, submit } = await setup(repository);
    const logo = () => page.querySelector<HTMLImageElement>('img[alt="Logo atual"]')!;
    const hero = () => page.querySelector<HTMLImageElement>('img[alt="Imagem principal atual"]')!;
    const removeButtons = () =>
      Array.from(page.querySelectorAll('button')).filter(
        (b) => b.textContent?.trim() === 'Remover',
      );
    expect(removeButtons()).toHaveLength(1);
    pick('logo', 'image/png');
    pick('logo', 'image/jpeg');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(`blob:imagem-${blobs - 1}`);
    expect(logo().getAttribute('src')).toBe(`blob:imagem-${blobs}`);
    removeButtons()[1].click();
    await submit();
    expect(hero().getAttribute('src')).toBe('images/hero.webp');
    const { config, previous, files } = repository.saves[0];
    expect(files.logo?.type).toBe('image/jpeg');
    expect(files.heroImage).toBeUndefined();
    expect(config.heroImage).toBe('');
    expect(previous.heroImage).toBe(oldHero);
    expect(logo().getAttribute('src')).toBe(
      'https://teste.supabase.co/site/configuracoes/logo-nova.png',
    );
    expect(button('Salvar alterações').disabled).toBe(true);
  });

  it('CA10: salvando bloqueia tudo; sucesso mostra o aviso fechável e "Tudo salvo"', async () => {
    const repository = new FakeSiteConfigRepository();
    let release!: () => void;
    repository.pending = new Promise((resolve) => (release = resolve));
    const { page, fill, submit, bar, button, toast, settle, field } = await setup(repository);
    fill('hours', 'Terça a sábado');
    await submit();
    expect(bar()).toContain('Salvando alterações…');
    expect(page.querySelector('button[type=submit]')?.textContent).toContain('Salvando…');
    expect(page.querySelector('fieldset')!.disabled).toBe(true);
    expect(page.querySelector('form')!.getAttribute('aria-busy')).toBe('true');
    release();
    await settle();
    expect(bar()).toContain('Tudo salvo');
    expect(toast()).toContain('Alterações salvas! O site já mostra as novas informações.');
    page.querySelector<HTMLButtonElement>('[aria-label="Fechar aviso"]')!.click();
    await settle();
    expect(toast()).toBe('');
    fill('hours', 'Terça a domingo');
    expect(bar()).toContain('Alterações não salvas');
    expect(field('hours').value).toBe('Terça a domingo');
  });

  it('CA11: falha mantém os valores e "Tentar de novo" repete a gravação', async () => {
    const repository = new FakeSiteConfigRepository();
    repository.failSave = true;
    const { fill, submit, alert, button, field, settle, toast } = await setup(repository);
    fill('hours', 'Terça a sábado');
    await submit();
    expect(alert()).toContain(
      'Não conseguimos salvar agora. Suas alterações continuam aqui. Verifique a internet e tente de novo.',
    );
    expect(field('hours').value).toBe('Terça a sábado');
    repository.failSave = false;
    button('Tentar de novo').click();
    await settle();
    expect(repository.saves).toHaveLength(2);
    expect(alert()).toBeUndefined();
    expect(toast()).toContain('Alterações salvas!');
  });

  it('CA12: "Visualizar site" abre a landing em nova aba', async () => {
    const { page } = await setup();
    const link = page.querySelector<HTMLAnchorElement>('form a[target=_blank]')!;
    expect(link.getAttribute('href')).toBe('/');
    expect(link.rel).toContain('noopener');
    expect(link.textContent).toContain('Visualizar site');
    expect(link.textContent).toContain('(abre em nova aba)');
  });

  it('RNF03: revoga o blob: ao sair da tela', async () => {
    const { harness, pick } = await setup();
    pick('logo', 'image/png');
    harness.fixture.destroy();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(`blob:imagem-${blobs}`);
  });
});
