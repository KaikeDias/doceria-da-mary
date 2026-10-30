import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, UrlTree } from '@angular/router';
import { FakeRequest, failure, fakeSupabase } from '../supabase/supabase.fake';
import { adminGuard, Auth, guestGuard, InvalidCredentials, Offline } from './auth';

const session = {
  access_token: 'token',
  refresh_token: 'refresh',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: { id: 'u1', aud: 'authenticated', email: 'mary@email.com' },
};

type Routes = Partial<Record<'token' | 'admin' | 'logout', (request: FakeRequest) => unknown>>;

function setup(routes: Routes = {}) {
  const fake = fakeSupabase((request) => {
    const path = request.url.pathname;
    if (path.endsWith('/token')) return (routes.token ?? (() => session))(request);
    if (path.endsWith('/administradores'))
      return (routes.admin ?? (() => [{ user_id: 'u1' }]))(request);
    if (path.endsWith('/logout'))
      return (routes.logout ?? (() => new Response(null, { status: 204 })))(request);
    throw new Error(`requisição inesperada: ${path}`);
  });
  TestBed.configureTestingModule({ providers: [fake.provider, provideRouter([])] });
  return { fake, auth: TestBed.inject(Auth) };
}

const offline = () => {
  throw new TypeError('Failed to fetch');
};

describe('Autenticação do painel', () => {
  it('CA01: entra com um administrador e guarda a verificação', async () => {
    const { fake, auth } = setup();
    await auth.signIn('mary@email.com', 'segredo');
    expect(fake.requests[0].body).toMatchObject({ email: 'mary@email.com', password: 'segredo' });
    expect(fake.requests[1].url.searchParams.get('user_id')).toBe('eq.u1');
    expect(await auth.isAdmin()).toBe(true);
    // A segunda verificação usa o resultado guardado.
    expect(fake.requests.filter((r) => r.url.pathname.endsWith('/administradores'))).toHaveLength(
      1,
    );
  });

  it('CA02: credenciais erradas viram InvalidCredentials', async () => {
    const { auth } = setup({
      token: () => failure(400, { code: 'invalid_credentials', msg: 'Invalid login credentials' }),
    });
    await expect(auth.signIn('mary@email.com', 'x')).rejects.toBeInstanceOf(InvalidCredentials);
  });

  it('CA03: usuário fora de administradores tem a sessão encerrada', async () => {
    const { fake, auth } = setup({ admin: () => [] });
    await expect(auth.signIn('outra@email.com', 'x')).rejects.toBeInstanceOf(InvalidCredentials);
    expect(fake.requests.at(-1)!.url.pathname).toMatch(/\/logout$/);
    expect(await auth.isAdmin()).toBe(false);
  });

  it('CA04: falha de rede vira Offline; outras falhas seguem como erro', async () => {
    expect(
      await setup({ token: offline })
        .auth.signIn('a@b.com', 'x')
        .catch((e) => e),
    ).toBeInstanceOf(Offline);
    TestBed.resetTestingModule();
    const error = await setup({ token: () => failure(500) })
      .auth.signIn('a@b.com', 'x')
      .catch((e) => e);
    expect(error).not.toBeInstanceOf(Offline);
    expect(error).not.toBeInstanceOf(InvalidCredentials);
  });

  it('CA04: falha ao consultar administradores encerra a sessão e propaga o erro', async () => {
    const { fake, auth } = setup({ admin: () => failure(500) });
    await expect(auth.signIn('mary@email.com', 'x')).rejects.toBeTruthy();
    expect(fake.requests.at(-1)!.url.pathname).toMatch(/\/logout$/);
  });

  it('CA07: sair descarta a sessão mesmo sem rede', async () => {
    const { auth } = setup({ logout: offline });
    await auth.signIn('mary@email.com', 'x');
    await auth.signOut();
    expect(await auth.isAdmin()).toBe(false);
  });

  it('CA06: guards redirecionam conforme a sessão de admin', async () => {
    const { auth } = setup();
    const router = TestBed.inject(Router);
    const run = (guard: typeof adminGuard) =>
      TestBed.runInInjectionContext(() => guard({} as never, {} as never)) as Promise<
        boolean | UrlTree
      >;
    expect(router.serializeUrl((await run(adminGuard)) as UrlTree)).toBe('/login');
    expect(await run(guestGuard)).toBe(true);
    await auth.signIn('mary@email.com', 'x');
    expect(await run(adminGuard)).toBe(true);
    expect(router.serializeUrl((await run(guestGuard)) as UrlTree)).toBe('/admin/cardapio');
    vi.spyOn(auth, 'isAdmin').mockRejectedValue(new Error('offline'));
    expect(router.serializeUrl((await run(adminGuard)) as UrlTree)).toBe('/login');
  });
});
