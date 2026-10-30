import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { saveError } from '../../core/supabase/supabase';
import { DuplicateCategory } from './admin-menu-repository';
import { FakeAdminMenuRepository, provideAdmin } from './admin.fixture';

async function setup(repository = new FakeAdminMenuRepository()) {
  TestBed.configureTestingModule({
    providers: [provideRouter(routes), ...provideAdmin(repository)],
  });
  const harness = await RouterTestingHarness.create('/admin/categorias');
  const settle = async () => {
    await new Promise((resolve) => setTimeout(resolve));
    await harness.fixture.whenStable();
    harness.detectChanges();
  };
  await settle();
  const page = harness.fixture.nativeElement as HTMLElement;
  const dialog = page.querySelector<HTMLDialogElement>('dialog[aria-labelledby=categoria-title]')!;
  const click = (selector: string, root: ParentNode = page) => {
    root.querySelector<HTMLElement>(selector)!.click();
    harness.detectChanges();
  };
  const button = (text: string) =>
    Array.from(dialog.querySelectorAll('button')).find((b) => b.textContent?.includes(text))!;
  const nameInput = () => dialog.querySelector<HTMLInputElement>('#categoria-name')!;
  const fill = (value: string) => {
    nameInput().value = value;
    nameInput().dispatchEvent(new Event('input'));
    harness.detectChanges();
  };
  const pick = (type: string, size = 1000) => {
    const input = dialog.querySelector<HTMLInputElement>('#categoria-image')!;
    const file = new File(['x'], 'capa', { type });
    Object.defineProperty(file, 'size', { value: size });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change'));
    harness.detectChanges();
  };
  const submit = async () => {
    dialog.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    harness.detectChanges();
    await settle();
  };
  const toast = () => page.querySelector('[role=status]')?.textContent ?? '';
  return { harness, page, dialog, click, button, nameInput, fill, pick, submit, toast, settle };
}

describe('Formulário de categoria', () => {
  let blobs = 0;
  beforeEach(() => {
    // jsdom has no dialog implementation; real focus/Esc behavior is covered in Chrome.
    Object.defineProperties(HTMLDialogElement.prototype, {
      showModal: {
        configurable: true,
        value: function (this: HTMLDialogElement) {
          this.open = true;
        },
      },
      close: {
        configurable: true,
        value: function (this: HTMLDialogElement) {
          this.open = false;
          this.dispatchEvent(new Event('close'));
        },
      },
    });
    URL.createObjectURL = vi.fn(() => `blob:capa-${++blobs}`);
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).showModal;
    delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).close;
  });

  it(
    'CA01: "Adicionar categoria" abre o modal vazio; ×, Cancelar e fundo fecham',
    { timeout: 60000 },
    async () => {
      const repository = new FakeAdminMenuRepository();
      const save = vi.spyOn(repository, 'saveCategory');
      const { page, dialog, click, button } = await setup(repository);
      const add = Array.from(page.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Adicionar categoria'),
      )!;
      add.click();
      expect(dialog.open).toBe(true);
      expect(dialog.querySelector('h2')?.textContent).toContain('Nova categoria');
      expect(dialog.textContent).toContain('Crie um grupo para organizar os doces no cardápio.');
      expect(dialog.querySelector<HTMLInputElement>('#categoria-name')!.value).toBe('');
      expect(dialog.querySelector<HTMLInputElement>('[role=switch]')!.checked).toBe(true);
      expect(dialog.textContent).toContain('Nome da categoria');
      expect(dialog.textContent).toContain('Salvar categoria');
      expect(dialog.textContent).not.toContain('Excluir categoria');
      click('[aria-label=Fechar]', dialog);
      expect(dialog.open).toBe(false);
      add.click();
      button('Cancelar').click();
      expect(dialog.open).toBe(false);
      add.click();
      dialog.querySelector('form')!.click();
      expect(dialog.open).toBe(true);
      dialog.click();
      expect(dialog.open).toBe(false);
      expect(save).not.toHaveBeenCalled();
    },
  );

  it('CA05: editar abre com nome, imagem, chave e aviso de produtos', async () => {
    const { dialog, click, nameInput } = await setup();
    click('[aria-label="Editar Bolos"]');
    expect(dialog.querySelector('h2')?.textContent).toContain('Editar categoria');
    expect(dialog.textContent).toContain('As mudanças aparecem no site assim que você salvar.');
    expect(nameInput().value).toBe('Bolos');
    expect(dialog.textContent).toContain('5/30');
    expect(dialog.querySelector('img')?.getAttribute('src')).toContain('categorias/c-bolos');
    expect(dialog.textContent).toContain('Trocar imagem');
    expect(dialog.textContent).toContain(
      '2 produtos nesta categoria. Se você renomear, eles passam a aparecer com o novo nome.',
    );
    expect(dialog.textContent).toContain('Salvar alterações');
    click('[aria-label=Fechar]', dialog);
    click('[aria-label="Editar Docinhos"]');
    expect(dialog.textContent).toContain('1 produto nesta categoria.');
    click('[aria-label=Fechar]', dialog);
    click('[aria-label="Editar Datas especiais"]');
    expect(dialog.textContent).not.toContain('nesta categoria');
    expect(dialog.querySelector<HTMLInputElement>('[role=switch]')!.checked).toBe(false);
    expect(dialog.textContent).toContain('Arraste uma foto aqui ou');
  });

  it('CA02: nome obrigatório, duplicado e contador', async () => {
    const { dialog, click, fill, nameInput, submit, pick } = await setup();
    click('[aria-label="Editar Datas especiais"]');
    pick('image/png');
    fill('   ');
    await submit();
    expect(dialog.textContent).toContain('Informe o nome da categoria.');
    expect(nameInput().getAttribute('aria-invalid')).toBe('true');
    expect(nameInput().getAttribute('aria-describedby')).toContain('categoria-name-error');
    expect(document.activeElement).toBe(nameInput());
    fill('bolos');
    expect(dialog.textContent).toContain('Já existe uma categoria com esse nome.');
    expect(dialog.textContent).toContain('5/30');
    expect(nameInput().maxLength).toBe(30);
    fill('Datas especiais');
    expect(dialog.querySelector('#categoria-name-error')).toBeNull();
    expect(dialog.querySelector('.text-neutral\\/60')).toBeNull();
  });

  it('CA03: imagem obrigatória, tipo e tamanho; prévia e troca', async () => {
    const { dialog, fill, pick, submit, harness, settle } = await setup();
    const page = harness.fixture.nativeElement as HTMLElement;
    Array.from(page.querySelectorAll('button'))
      .find((b) => b.textContent?.includes('Adicionar categoria'))!
      .click();
    harness.detectChanges();
    fill('Festas');
    await submit();
    const error = () => dialog.querySelector('#categoria-image-error')!.textContent;
    expect(error()).toBe('Escolha uma imagem para a categoria.');
    expect(document.activeElement?.id).toBe('categoria-image');
    pick('image/gif');
    expect(error()).toBe('Envie uma imagem JPG, PNG ou WEBP.');
    pick('image/jpeg', 3 * 1024 * 1024);
    expect(error()).toBe('Essa imagem passa de 2 MB. Escolha uma foto menor.');
    expect(dialog.querySelector('img')).toBeNull();
    pick('image/webp');
    expect(error()).toBe('');
    const images = Array.from(dialog.querySelectorAll('img'));
    expect(images.map((img) => img.getAttribute('src'))).toEqual([
      `blob:capa-${blobs}`,
      `blob:capa-${blobs}`,
    ]);
    expect(dialog.textContent).toContain('Festas');
    const first = `blob:capa-${blobs}`;
    const drop = new Event('drop', { cancelable: true }) as DragEvent;
    const file = new File(['x'], 'outra', { type: 'image/png' });
    Object.defineProperty(drop, 'dataTransfer', { value: { files: [file] } });
    dialog.querySelector('#categoria-image')!.closest('[class*=mt-2]')!.dispatchEvent(drop);
    harness.detectChanges();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(first);
    expect(dialog.querySelector('img')?.getAttribute('src')).toBe(`blob:capa-${blobs}`);
    dialog.close();
    await settle();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(`blob:capa-${blobs}`);
  });

  it('CA04/CA06: cria com "Salvando…", bloqueio e aviso de sucesso', async () => {
    const repository = new FakeAdminMenuRepository();
    let finish!: () => void;
    const save = vi.spyOn(repository, 'saveCategory');
    save.mockImplementationOnce(async (input, existing) => {
      await new Promise<void>((done) => (finish = done));
      return FakeAdminMenuRepository.prototype.saveCategory.call(repository, input, existing);
    });
    const { page, dialog, fill, pick, toast, settle, harness } = await setup(repository);
    Array.from(page.querySelectorAll('button'))
      .find((b) => b.textContent?.includes('Adicionar categoria'))!
      .click();
    harness.detectChanges();
    fill('  Datas comemorativas ');
    pick('image/jpeg');
    dialog.querySelector<HTMLInputElement>('[role=switch]')!.click();
    harness.detectChanges();
    dialog.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    harness.detectChanges();
    expect(dialog.textContent).toContain('Salvando…');
    expect(dialog.querySelector('fieldset')!.disabled).toBe(true);
    expect(dialog.querySelector('form')!.getAttribute('aria-busy')).toBe('true');
    const cancel = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancel);
    expect(cancel.defaultPrevented).toBe(true);
    dialog.click();
    expect(dialog.open).toBe(true);
    dialog.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(save).toHaveBeenCalledTimes(1);
    const [input] = save.mock.calls[0];
    expect(input.name).toBe('Datas comemorativas');
    expect(input.visible).toBe(false);
    expect(input.image).toBeInstanceOf(File);
    finish();
    await settle();
    await settle();
    expect(dialog.open).toBe(false);
    expect(toast()).toContain('Datas comemorativas foi adicionada às categorias.');
    expect(page.querySelector('tbody')?.textContent).toContain('Datas comemorativas');
  });

  it('CA05: edição envia a imagem atual e avisa quando a nova não foi enviada', async () => {
    const repository = new FakeAdminMenuRepository();
    const save = vi.spyOn(repository, 'saveCategory');
    const { dialog, click, fill, submit, toast, pick } = await setup(repository);
    click('[aria-label="Editar Bolos"]');
    fill('Bolos e tortas');
    await submit();
    expect(save.mock.calls[0][0]).toEqual({
      name: 'Bolos e tortas',
      visible: true,
      image: repository.categories[0].image,
    });
    expect(save.mock.calls[0][1]?.id).toBe('c-bolos');
    expect(dialog.open).toBe(false);
    expect(toast()).toContain('Alterações em Bolos e tortas salvas.');

    save.mockResolvedValueOnce({ imageFailed: true });
    click('[aria-label="Editar Docinhos"]');
    pick('image/png');
    await submit();
    expect(toast()).toContain('Alterações em Docinhos salvas. A imagem não foi enviada.');
  });

  it('CA06: falha ao gravar mantém o modal e os dados; duplicado do banco vira erro de nome', async () => {
    const repository = new FakeAdminMenuRepository();
    const save = vi.spyOn(repository, 'saveCategory').mockRejectedValueOnce(new Error('offline'));
    const { dialog, click, fill, submit, nameInput } = await setup(repository);
    click('[aria-label="Editar Bolos"]');
    fill('Bolos finos');
    await submit();
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector('[role=alert]')?.textContent).toContain(saveError);
    expect(nameInput().value).toBe('Bolos finos');
    expect(dialog.querySelector('fieldset')!.disabled).toBe(false);

    save.mockRejectedValueOnce(new DuplicateCategory());
    await submit();
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector('[role=alert]')).toBeNull();
    expect(dialog.textContent).toContain('Já existe uma categoria com esse nome.');
    expect(document.activeElement).toBe(nameInput());
  });

  it('CA07/CA08: "Excluir categoria" no modal abre a exclusão e fecha o modal ao excluir', async () => {
    const { page, dialog, click, button, settle, harness } = await setup();
    const confirm = page.querySelector<HTMLDialogElement>('dialog[aria-labelledby=confirm-title]')!;
    click('[aria-label="Editar Bolos"]');
    button('Excluir categoria').click();
    harness.detectChanges();
    expect(confirm.open).toBe(true);
    expect(confirm.textContent).toContain('Não é possível excluir Bolos');
    confirm.querySelector('button')!.click();
    expect(dialog.open).toBe(true);
    click('[aria-label=Fechar]', dialog);
    click('[aria-label="Editar Datas especiais"]');
    button('Excluir categoria').click();
    harness.detectChanges();
    confirm.querySelectorAll('button')[1].click();
    await settle();
    expect(confirm.open).toBe(false);
    expect(dialog.open).toBe(false);
    expect(page.querySelector('[role=status]')?.textContent).toContain(
      'Datas especiais foi excluída.',
    );
  });
});
