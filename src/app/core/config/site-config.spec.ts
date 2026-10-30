import { TestBed } from '@angular/core/testing';
import { FakeRequest, failure, fakeSupabase } from '../supabase/supabase.fake';
import { publicUrl } from '../supabase/supabase';
import {
  formatPhone,
  normalizeInstagram,
  normalizeWhatsapp,
  SiteConfigRepository,
  validateSiteConfig,
} from './site-config';
import { siteConfig } from './site-config.fixture';

const row = {
  id: 1,
  nome_doceria: 'Doceria da Mary',
  texto_apresentacao: 'Doces artesanais',
  descricao: 'Doces artesanais para momentos especiais.',
  logo_path: 'configuracoes/logo-velha.png',
  whatsapp: '11987654321',
  instagram: 'doceriadamary',
  email_contato: null,
  mensagem_whatsapp: 'Olá, Mary! Gostaria de fazer uma encomenda.',
  horario_atendimento: 'Segunda a sábado, das 9h às 18h',
  regiao_atendida: 'Toda a cidade e região',
  endereco: null,
  texto_encomendas: 'Encomendas com pelo menos 2 dias de antecedência.',
  hero_titulo: 'Adoçando seus momentos mais especiais.',
  hero_subtitulo: 'Doces artesanais feitos com afeto.',
  hero_imagem_path: null,
  sobre_texto: 'A Doceria da Mary nasceu do prazer de transformar ingredientes simples.',
  cta_encomendas_titulo: 'Tem uma ocasião especial chegando?',
  updated_at: '2026-10-30T00:00:00Z',
};

const oldLogo = publicUrl('site', 'configuracoes/logo-velha.png');

function setup(respond: (request: FakeRequest) => unknown = () => null) {
  const fake = fakeSupabase(respond);
  TestBed.configureTestingModule({ providers: [fake.provider] });
  const calls = () =>
    fake.requests.map(
      ({ method, url }) => `${method} ${url.pathname.replace(/^\/(rest|storage)\/v1\//, '')}`,
    );
  return { fake, calls, repository: TestBed.inject(SiteConfigRepository) };
}

const storageOk = ({ method, url }: FakeRequest) =>
  method === 'POST' && url.pathname.includes('/storage/') ? { Key: 'ok' } : null;

describe('Configurações do site', () => {
  it('CA07: normaliza WhatsApp e Instagram colados', () => {
    expect(normalizeWhatsapp('+55 (11) 98765-4321')).toBe('11987654321');
    expect(normalizeWhatsapp('(11) 8765-4321')).toBe('1187654321');
    expect(normalizeWhatsapp('11a98765432199')).toBe('11987654321');
    expect(normalizeWhatsapp('5511')).toBe('5511');
    expect(normalizeInstagram('https://www.instagram.com/doceriadamary/')).toBe('doceriadamary');
    expect(normalizeInstagram('instagram.com/doceria.mary?igsh=1')).toBe('doceria.mary');
    expect(normalizeInstagram(' @doceria_mary ')).toBe('doceria_mary');
    expect(normalizeInstagram('doceria da mary')).toBe('doceria da mary');
  });

  it('CA04: formata o telefone enquanto se digita', () => {
    expect(formatPhone('')).toBe('');
    expect(formatPhone('11')).toBe('11');
    expect(formatPhone('119876')).toBe('(11) 9876');
    expect(formatPhone('1187654321')).toBe('(11) 8765-4321');
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
  });

  it('CA05/CA06: valida obrigatórios e formatos', () => {
    expect(validateSiteConfig(siteConfig)).toEqual({});
    expect(
      validateSiteConfig({
        ...siteConfig,
        whatsapp: '1198765',
        instagram: 'doceria da mary',
        email: 'mary@',
        heroTitle: '  ',
        tagline: '',
      }),
    ).toEqual({
      tagline: 'Preencha este campo.',
      whatsapp: 'Número incompleto. Use DDD + número, como (11) 99999-9999.',
      instagram: 'Use só letras, números, ponto ou _, sem espaços.',
      email: 'Confira o e-mail, como nome@exemplo.com.',
      heroTitle: 'O título principal não pode ficar vazio.',
    });
    expect(validateSiteConfig({ ...siteConfig, whatsapp: '', instagram: '' })).toEqual({
      whatsapp: 'Preencha este campo.',
      instagram: 'Preencha este campo.',
    });
    expect(validateSiteConfig({ ...siteConfig, email: ' contato@mary.com ' })).toEqual({});
  });

  it('CA01: lê a linha única e monta as URLs das imagens', async () => {
    const { fake, repository } = setup(() => row);
    const config = await repository.load();
    expect(fake.requests[0].url.pathname).toBe('/rest/v1/configuracoes_site');
    expect(fake.requests[0].url.searchParams.get('id')).toBe('eq.1');
    expect(config).toEqual({ ...siteConfig, logo: oldLogo });
  });

  it('CA01: colunas nulas viram campos vazios', async () => {
    const nulls = Object.fromEntries(Object.keys(row).map((key) => [key, null]));
    const { repository } = setup(() => ({ ...nulls, nome_doceria: 'Mary', hero_titulo: 'Oi' }));
    const config = await repository.load();
    expect(config.name).toBe('Mary');
    expect(config.heroTitle).toBe('Oi');
    expect(Object.values(config).filter((value) => value === '')).toHaveLength(15);
  });

  it('CA06: grava todos os campos, com opcionais vazios como nulo e sem espaços nas pontas', async () => {
    const { fake, calls, repository } = setup();
    const saved = await repository.save(
      { ...siteConfig, name: ' Doceria da Mary ', email: '  ', address: 'Rua A, 1' },
      siteConfig,
      {},
    );
    expect(calls()).toEqual(['PATCH configuracoes_site']);
    expect(fake.requests[0].url.searchParams.get('id')).toBe('eq.1');
    expect(fake.requests[0].body).toEqual({
      ...Object.fromEntries(
        Object.entries(row).filter(([key]) => !['id', 'updated_at'].includes(key)),
      ),
      logo_path: null,
      endereco: 'Rua A, 1',
    });
    expect(saved).toEqual({ ...siteConfig, address: 'Rua A, 1' });
  });

  it('CA09: envia imagens novas, grava os caminhos e apaga as anteriores', async () => {
    const { fake, calls, repository } = setup(storageOk);
    const logo = new File(['x'], 'logo', { type: 'image/jpeg' });
    const heroImage = new File(['x'], 'hero', { type: 'image/webp' });
    const saved = await repository.save(
      { ...siteConfig, logo: 'blob:1', heroImage: 'blob:2' },
      { ...siteConfig, logo: oldLogo },
      { logo, heroImage },
    );
    expect(calls()).toEqual([
      expect.stringMatching(/^POST object\/site\/configuracoes\/logo-[\w-]+\.jpg$/),
      expect.stringMatching(/^POST object\/site\/configuracoes\/hero-[\w-]+\.webp$/),
      'PATCH configuracoes_site',
      'DELETE object/site',
    ]);
    const body = fake.requests[2].body as { logo_path: string; hero_imagem_path: string };
    expect(body.logo_path).toMatch(/^configuracoes\/logo-[\w-]+\.jpg$/);
    expect(body.hero_imagem_path).toMatch(/^configuracoes\/hero-[\w-]+\.webp$/);
    expect(fake.requests[3].body).toEqual({ prefixes: ['configuracoes/logo-velha.png'] });
    expect(saved.logo).toBe(publicUrl('site', body.logo_path));
    expect(saved.heroImage).toBe(publicUrl('site', body.hero_imagem_path));
  });

  it('CA09: remover grava nulo e apaga o arquivo anterior; manter não apaga nada', async () => {
    const { fake, calls, repository } = setup();
    await repository.save(siteConfig, { ...siteConfig, logo: oldLogo }, {});
    expect(calls()).toEqual(['PATCH configuracoes_site', 'DELETE object/site']);
    expect((fake.requests[0].body as { logo_path: null }).logo_path).toBeNull();
    TestBed.resetTestingModule();
    const same = setup();
    const kept = { ...siteConfig, logo: oldLogo };
    await same.repository.save(kept, kept, {});
    expect(same.calls()).toEqual(['PATCH configuracoes_site']);
    expect((same.fake.requests[0].body as { logo_path: string }).logo_path).toBe(
      'configuracoes/logo-velha.png',
    );
  });

  it('CA11: falha no envio não altera a linha', async () => {
    const { calls, repository } = setup(({ url }) =>
      url.pathname.includes('/storage/') ? failure(400) : null,
    );
    const logo = new File(['x'], 'logo', { type: 'image/png' });
    await expect(repository.save(siteConfig, siteConfig, { logo })).rejects.toBeTruthy();
    expect(calls()).toEqual([expect.stringMatching(/^POST object\/site\/configuracoes\/logo-/)]);
  });

  it('CA11: falha na gravação apaga o arquivo enviado e não apaga o anterior', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { calls, repository } = setup((request) =>
      request.method === 'PATCH'
        ? failure(500)
        : request.method === 'DELETE'
          ? failure(500)
          : storageOk(request),
    );
    const logo = new File(['x'], 'logo', { type: 'image/png' });
    await expect(
      repository.save(siteConfig, { ...siteConfig, logo: oldLogo }, { logo }),
    ).rejects.toBeTruthy();
    expect(calls()).toEqual([
      expect.stringMatching(/^POST object\/site\/configuracoes\/logo-[\w-]+\.png$/),
      'PATCH configuracoes_site',
      'DELETE object/site',
    ]);
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});
