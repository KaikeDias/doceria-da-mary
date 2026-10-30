// Configurações em memória (as mesmas do banco) para os testes unitários.
import {
  SiteConfig,
  siteConfigDefaults,
  SiteConfigRepository,
  SiteImageFiles,
} from './site-config';

export const siteConfig: SiteConfig = {
  name: 'Doceria da Mary',
  tagline: 'Doces artesanais',
  description: 'Doces artesanais para momentos especiais.',
  logo: '',
  whatsapp: '11987654321',
  instagram: 'doceriadamary',
  email: '',
  whatsappMessage: 'Olá, Mary! Gostaria de fazer uma encomenda.',
  hours: 'Segunda a sábado, das 9h às 18h',
  region: 'Toda a cidade e região',
  address: '',
  ordersText: 'Encomendas com pelo menos 2 dias de antecedência.',
  heroTitle: 'Adoçando seus momentos mais especiais.',
  heroSubtitle: 'Doces artesanais feitos com afeto.',
  heroImage: '',
  about: 'A Doceria da Mary nasceu do prazer de transformar ingredientes simples.',
  ordersTitle: 'Tem uma ocasião especial chegando?',
};

export class FakeSiteConfigRepository implements SiteConfigRepository {
  config = siteConfig;
  failLoad = false;
  failSave = false;
  saves: { config: SiteConfig; previous: SiteConfig; files: SiteImageFiles }[] = [];
  // Promessa da gravação em andamento, para testar o estado "Salvando…".
  pending?: Promise<void>;

  async load(): Promise<SiteConfig> {
    if (this.failLoad) throw new Error('offline');
    return this.config;
  }

  async save(config: SiteConfig, previous: SiteConfig, files: SiteImageFiles): Promise<SiteConfig> {
    this.saves.push({ config, previous, files });
    await this.pending;
    if (this.failSave) throw new Error('offline');
    const url = (name: string) => `https://teste.supabase.co/site/configuracoes/${name}`;
    this.config = {
      ...config,
      logo: files.logo ? url('logo-nova.png') : config.logo,
      heroImage: files.heroImage ? url('hero-nova.webp') : config.heroImage,
    };
    return this.config;
  }
}

// Repositório falso para os testes da landing; por padrão devolve os valores padrão.
export function provideSiteConfig(
  load: () => Promise<SiteConfig> = async () => siteConfigDefaults,
) {
  return { provide: SiteConfigRepository, useValue: { load } };
}
