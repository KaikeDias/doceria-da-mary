import { inject, Injectable } from '@angular/core';
import { TablesUpdate } from '../supabase/database.types';
import { check, publicUrl, Supabase } from '../supabase/supabase';

// Configurações do site (`configuracoes_site`). Vazio = sem valor.
export interface SiteConfig {
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
  // URL pública no bucket "site"; vazia = imagem padrão do site.
  readonly logo: string;
  // DDD + número, só dígitos (sem o 55).
  readonly whatsapp: string;
  // Só o usuário, sem @ nem link.
  readonly instagram: string;
  readonly email: string;
  readonly whatsappMessage: string;
  readonly hours: string;
  readonly region: string;
  readonly address: string;
  readonly ordersText: string;
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly heroImage: string;
  readonly about: string;
  readonly ordersTitle: string;
}

export type SiteConfigField = keyof SiteConfig;

// Valores da landing antes de ler o banco (HTML pré-renderizado), se a leitura falhar ou se um
// campo estiver vazio.
export const siteConfigDefaults: SiteConfig = {
  name: 'Doceria da Mary',
  tagline: 'Doces artesanais',
  description: 'Doces artesanais para momentos especiais.',
  logo: '',
  whatsapp: '89994259584',
  instagram: 'doceriadamarypl',
  email: '',
  whatsappMessage: 'Olá, Mary! Vim pelo site e gostaria de fazer um pedido.',
  hours: '',
  region: 'Paes Landim, Piauí',
  address: '',
  ordersText: '',
  heroTitle: 'Adoçando seus momentos mais especiais.',
  heroSubtitle:
    'Doces artesanais feitos com afeto, ingredientes escolhidos com cuidado e aquele sabor que transforma qualquer ocasião em memória.',
  heroImage: '',
  about:
    'A Doceria da Mary nasceu do prazer de transformar ingredientes simples em momentos cheios de afeto. Cada doce é preparado com cuidado, da escolha dos sabores ao último detalhe da apresentação.',
  ordersTitle: 'Tem uma ocasião especial chegando?',
};

// Imagens padrão quando nenhuma foi enviada.
export const defaultImages = { logo: 'logo.webp', heroImage: 'images/hero.webp' } as const;

export const limits: Partial<Record<SiteConfigField, number>> = {
  description: 160,
  ordersText: 300,
  heroTitle: 70,
};

const optional: readonly SiteConfigField[] = ['email', 'address', 'logo', 'heroImage'];

export function normalizeWhatsapp(value: string): string {
  const digits = value.replace(/\D/g, '');
  // Número colado com o código do país.
  return (/^55\d{10,11}$/.test(digits) ? digits.slice(2) : digits).slice(0, 11);
}

export function normalizeInstagram(value: string): string {
  return value
    .trim()
    .replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .replace(/[/?#].*$/, '');
}

// "(11) 98765-4321"; incompleto fica sem o hífen enquanto se digita.
export function formatPhone(digits: string): string {
  if (digits.length < 3) return digits;
  const rest = digits.slice(2);
  return `(${digits.slice(0, 2)}) ${digits.length >= 10 ? `${rest.slice(0, -4)}-${rest.slice(-4)}` : rest}`;
}

// Erros por campo, na ordem da tela; só os campos inválidos aparecem.
export function validateSiteConfig(config: SiteConfig): Partial<Record<SiteConfigField, string>> {
  const errors: Partial<Record<SiteConfigField, string>> = {};
  for (const [field, value] of Object.entries(config) as [SiteConfigField, string][]) {
    if (!value.trim() && !optional.includes(field)) errors[field] = 'Preencha este campo.';
  }
  if (errors.heroTitle) errors.heroTitle = 'O título principal não pode ficar vazio.';
  if (config.whatsapp && config.whatsapp.length < 10)
    errors.whatsapp = 'Número incompleto. Use DDD + número, como (11) 99999-9999.';
  if (config.instagram && !/^[A-Za-z0-9._]{1,30}$/.test(config.instagram))
    errors.instagram = 'Use só letras, números, ponto ou _, sem espaços.';
  if (config.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email.trim()))
    errors.email = 'Confira o e-mail, como nome@exemplo.com.';
  return errors;
}

export interface SiteImageFiles {
  readonly logo?: File;
  readonly heroImage?: File;
}

@Injectable({ providedIn: 'root', useFactory: () => inject(SupabaseSiteConfigRepository) })
export abstract class SiteConfigRepository {
  abstract load(): Promise<SiteConfig>;
  // Devolve o que ficou salvo (com as URLs das imagens enviadas).
  abstract save(
    config: SiteConfig,
    previous: SiteConfig,
    files: SiteImageFiles,
  ): Promise<SiteConfig>;
}

const siteUrl = (path: string | null) => (path ? publicUrl('site', path) : '');
const sitePath = (url: string) => (url ? url.slice(publicUrl('site', '').length) : null);

@Injectable({ providedIn: 'root' })
export class SupabaseSiteConfigRepository implements SiteConfigRepository {
  private readonly supabase = inject(Supabase);

  async load(): Promise<SiteConfig> {
    const row = check(
      await this.supabase.client.from('configuracoes_site').select('*').eq('id', 1).single(),
    );
    return {
      name: row.nome_doceria,
      tagline: row.texto_apresentacao ?? '',
      description: row.descricao ?? '',
      logo: siteUrl(row.logo_path),
      whatsapp: row.whatsapp ?? '',
      instagram: row.instagram ?? '',
      email: row.email_contato ?? '',
      whatsappMessage: row.mensagem_whatsapp ?? '',
      hours: row.horario_atendimento ?? '',
      region: row.regiao_atendida ?? '',
      address: row.endereco ?? '',
      ordersText: row.texto_encomendas ?? '',
      heroTitle: row.hero_titulo,
      heroSubtitle: row.hero_subtitulo ?? '',
      heroImage: siteUrl(row.hero_imagem_path),
      about: row.sobre_texto ?? '',
      ordersTitle: row.cta_encomendas_titulo ?? '',
    };
  }

  async save(config: SiteConfig, previous: SiteConfig, files: SiteImageFiles): Promise<SiteConfig> {
    const db = this.supabase.client;
    const uploaded: string[] = [];
    const images = { logo: config.logo, heroImage: config.heroImage };
    try {
      for (const field of ['logo', 'heroImage'] as const) {
        const file = files[field];
        if (!file) continue;
        const prefix = field === 'logo' ? 'logo' : 'hero';
        const path = `configuracoes/${prefix}-${crypto.randomUUID()}.${file.type.split('/')[1].replace('jpeg', 'jpg')}`;
        check(await db.storage.from('site').upload(path, file, { contentType: file.type }));
        uploaded.push(path);
        images[field] = publicUrl('site', path);
      }
      const text = (value: string) => value.trim() || null;
      const row: TablesUpdate<'configuracoes_site'> = {
        nome_doceria: config.name.trim(),
        texto_apresentacao: text(config.tagline),
        descricao: text(config.description),
        logo_path: sitePath(images.logo),
        whatsapp: text(config.whatsapp),
        instagram: text(config.instagram),
        email_contato: text(config.email),
        mensagem_whatsapp: text(config.whatsappMessage),
        horario_atendimento: text(config.hours),
        regiao_atendida: text(config.region),
        endereco: text(config.address),
        texto_encomendas: text(config.ordersText),
        hero_titulo: config.heroTitle.trim(),
        hero_subtitulo: text(config.heroSubtitle),
        hero_imagem_path: sitePath(images.heroImage),
        sobre_texto: text(config.about),
        cta_encomendas_titulo: text(config.ordersTitle),
      };
      check(await db.from('configuracoes_site').update(row).eq('id', 1));
    } catch (error) {
      await this.removeFiles(uploaded);
      throw error;
    }
    await this.removeFiles(
      (['logo', 'heroImage'] as const)
        .filter((field) => previous[field] && previous[field] !== images[field])
        .map((field) => sitePath(previous[field])!),
    );
    const trimmed = Object.fromEntries(
      Object.entries(config).map(([field, value]) => [field, value.trim()]),
    ) as unknown as SiteConfig;
    return { ...trimmed, ...images };
  }

  // Arquivo órfão no Storage não afeta o site; a falha só é registrada.
  private async removeFiles(paths: string[]): Promise<void> {
    if (!paths.length) return;
    const { error } = await this.supabase.client.storage.from('site').remove(paths);
    if (error) console.error('Falha ao remover imagens do Storage', error);
  }
}
