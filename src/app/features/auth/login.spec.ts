import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { publicConfig } from '../../core/config/public-config';
import { LOGIN_REQUEST, Login, LoginCredentials, emailError, passwordError } from './login';
import { Auth, InvalidCredentials, Offline } from '../../core/auth/auth';
import { provideAdmin } from '../admin/admin.fixture';

const UNAVAILABLE = 'Login indisponível no momento. Tente novamente mais tarde.';

async function setup(request?: (c: LoginCredentials) => Promise<void>) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter(routes),
      ...provideAdmin(undefined, false),
      ...(request ? [{ provide: LOGIN_REQUEST, useValue: request }] : []),
    ],
  });
  const harness = await RouterTestingHarness.create('/login');
  const page = harness.routeNativeElement as HTMLElement;
  const email = page.querySelector<HTMLInputElement>('#login-email')!;
  const password = page.querySelector<HTMLInputElement>('#login-password')!;
  const form = page.querySelector('form')!;
  const type = async (input: HTMLInputElement, value: string) => {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    harness.detectChanges();
  };
  const submit = async () => {
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await Promise.resolve();
    harness.detectChanges();
  };
  return { harness, page, email, password, type, submit };
}

describe('Login', () => {
  it('CA01: renders the initial state at /login', async () => {
    const { harness, page, email, password } = await setup();
    expect(document.title).toBe('Login | Doceria da Mary');
    expect(email.value).toBe('');
    expect(password.value).toBe('');
    expect(password.type).toBe('password');
    expect(page.querySelector<HTMLButtonElement>('[type=submit]')?.disabled).toBe(false);
    expect(page.querySelector('#login-email-error')).toBeNull();
    expect(page.querySelector('a[href="/"]')?.textContent).toContain('Voltar ao site');
  });

  it('CA02/CA03: has desktop-only photo, heart divider and year footer', async () => {
    const { page } = await setup();
    expect(page.querySelector('aside img')?.getAttribute('src')).toBe('images/hero.webp');
    expect(page.textContent).toContain('Feito à mão');
    expect(page.textContent).toContain(`© ${new Date().getFullYear()} Doceria da Mary`);
    const photoPanel = page.querySelector('aside')!.classList;
    expect(photoPanel.contains('hidden') && photoPanel.contains('lg:block')).toBe(true);
  });

  it('CA05: validates on blur, submit, correction and trims the e-mail', async () => {
    const request = vi.fn(() => new Promise<void>(() => {}));
    const { harness, page, email, password, type, submit } = await setup(request);
    email.dispatchEvent(new Event('blur'));
    harness.detectChanges();
    expect(page.querySelector('#login-email-error')?.textContent).toContain(
      'Informe seu e-mail para continuar.',
    );
    expect(email.getAttribute('aria-describedby')).toBe('login-email-error');
    expect(email.getAttribute('aria-invalid')).toBe('true');
    expect(page.querySelector('#login-password-error')).toBeNull();

    await type(email, 'mary@email');
    await submit();
    expect(page.querySelector('#login-email-error')?.textContent).toContain(
      'Digite um e-mail válido, como nome@email.com.',
    );
    expect(page.querySelector('#login-password-error')?.textContent).toContain(
      'Informe sua senha para continuar.',
    );
    expect(document.activeElement).toBe(email);
    expect(request).not.toHaveBeenCalled();

    await type(email, '  mary@email.com  ');
    expect(page.querySelector('#login-email-error')).toBeNull();
    await submit();
    expect(document.activeElement).toBe(password);
    await type(password, ' x ');
    expect(page.querySelector('#login-password-error')).toBeNull();
    await submit();
    expect(request).toHaveBeenCalledExactlyOnceWith({ email: 'mary@email.com', password: ' x ' });
  });

  it('CA06: toggles password visibility without submitting', async () => {
    const request = vi.fn(() => Promise.resolve());
    const { page, password, type } = await setup(request);
    await type(password, 'segredo');
    const toggle = page.querySelector<HTMLButtonElement>('button[type=button]')!;
    expect(toggle.getAttribute('aria-label')).toBe('Mostrar senha');
    toggle.click();
    TestBed.tick();
    expect(password.type).toBe('text');
    expect(password.value).toBe('segredo');
    expect(toggle.getAttribute('aria-label')).toBe('Ocultar senha');
    expect(request).not.toHaveBeenCalled();
    expect(page.querySelector('#login-password-error')).toBeNull();
  });

  it('CA07: blocks duplicates while pending and ignores a late result after leaving', async () => {
    let finish!: () => void;
    const request = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const { harness, page, email, password, type, submit } = await setup(request);
    await type(email, 'mary@email.com');
    await type(password, 'abc');
    await submit();
    await submit();
    const button = page.querySelector<HTMLButtonElement>('[type=submit]')!;
    expect(request).toHaveBeenCalledTimes(1);
    expect(button.textContent).toContain('Entrando...');
    expect(button.disabled && email.disabled && password.disabled).toBe(true);
    expect(page.querySelector('form')?.getAttribute('aria-busy')).toBe('true');
    expect(email.value).toBe('mary@email.com');

    harness.fixture.destroy();
    finish();
    await Promise.resolve();
    expect(page.querySelector('[role=alert]')?.textContent?.trim()).toBe('');
  });

  it('Autenticação CA01: entra pelo Auth e abre o painel', async () => {
    const signIn = vi.fn(async () => {});
    TestBed.overrideProvider(Auth, {
      useValue: { signIn, isAdmin: vi.fn().mockResolvedValueOnce(false).mockResolvedValue(true) },
    });
    const { harness, email, password, type, submit } = await setup();
    await type(email, ' mary@email.com ');
    await type(password, 'segredo');
    await submit();
    await harness.fixture.whenStable();
    expect(signIn).toHaveBeenCalledWith('mary@email.com', 'segredo');
    expect(TestBed.inject(Router).url).toBe('/admin/cardapio');
  });

  it('Autenticação CA02–CA04: traduz credenciais inválidas e falta de conexão', async () => {
    const request = vi
      .fn<(c: LoginCredentials) => Promise<void>>()
      .mockRejectedValueOnce(new InvalidCredentials())
      .mockRejectedValueOnce(new Offline());
    const { harness, page, email, password, type, submit } = await setup(request);
    for (const message of [
      'E-mail ou senha incorretos.',
      'Sem conexão com a internet. Verifique e tente de novo.',
    ]) {
      await type(email, 'mary@email.com');
      await type(password, 'errada');
      await submit();
      await new Promise((resolve) => setTimeout(resolve));
      harness.detectChanges();
      expect(page.querySelector('[role=alert]')?.textContent).toContain(message);
      expect(password.value).toBe('');
    }
    expect(TestBed.inject(Router).url).toBe('/login');
  });

  it('Autenticação CA05: "admin" deixa de ser aceito como e-mail', () => {
    expect(emailError('admin')).toBe('Digite um e-mail válido, como nome@email.com.');
  });

  it('Autenticação CA06: com sessão de admin, /login leva ao painel', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes), ...provideAdmin()] });
    await RouterTestingHarness.create('/login');
    expect(TestBed.inject(Router).url).toBe('/admin/cardapio');
  });

  it('CA08: unexpected rejection shows the unavailable message and resets the password', async () => {
    const request = () => Promise.reject(new Error('boom'));
    const { harness, page, email, password, type, submit } = await setup(request);
    await type(email, 'mary@email.com');
    await type(password, 'abc');
    await submit();
    await new Promise((resolve) => setTimeout(resolve));
    harness.detectChanges();
    expect(page.querySelector('[role=alert]')?.textContent).toContain(UNAVAILABLE);
    expect(page.querySelector('[role=alert]')?.textContent).not.toContain('boom');
    expect(email.value).toBe('mary@email.com');
    expect(password.value).toBe('');
    expect(password.type).toBe('password');
    expect(email.disabled).toBe(false);
    expect(page.querySelector('#login-password-error')).toBeNull();
    expect(page.querySelector('[type=submit]')?.textContent).toContain('Entrar');
  });

  it('CA08: a new valid submission clears the previous notice', async () => {
    const request = vi
      .fn<(c: LoginCredentials) => Promise<void>>()
      .mockRejectedValueOnce(new Error('x'))
      .mockImplementationOnce(() => new Promise<void>(() => {}));
    const { harness, page, password, email, type, submit } = await setup(request);
    await type(email, 'mary@email.com');
    await type(password, 'abc');
    await submit();
    await new Promise((resolve) => setTimeout(resolve));
    harness.detectChanges();
    expect(page.querySelector('[role=alert]')?.textContent).toContain(UNAVAILABLE);
    await type(password, 'abc');
    await submit();
    expect(page.querySelector('[role=alert]')?.textContent?.trim()).toBe('');
  });

  it('CA10: hides the photo when it fails and keeps the form usable', async () => {
    const { harness, page } = await setup();
    page.querySelector('aside img')!.dispatchEvent(new Event('error'));
    harness.detectChanges();
    expect(page.querySelector('aside img')).toBeNull();
    expect(page.querySelector('form')).toBeTruthy();
    expect(publicConfig.apiUrl).toBeNull();
  });

  it('validates e-mail and password formats', () => {
    expect(emailError('')).toContain('Informe');
    for (const bad of ['mary@email', 'a b@c.com', 'a@@b.com', 'a@.com', 'a@b.', '@b.com']) {
      expect(emailError(bad), bad).toContain('válido');
    }
    expect(emailError('mary@email.com')).toBeNull();
    expect(passwordError('')).toContain('Informe');
    expect(passwordError(' ')).toBeNull();
  });
});
