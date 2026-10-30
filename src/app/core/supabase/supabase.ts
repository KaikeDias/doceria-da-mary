import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Database } from './database.types';

export const loadError =
  'Não foi possível carregar os dados. Verifique sua conexão e tente de novo.';
export const saveError = 'Não foi possível salvar. Verifique sua conexão e tente de novo.';

export type Price = { readonly kind: 'fixed' | 'starting-at'; readonly amountInCents: number };

@Injectable({ providedIn: 'root' })
export class Supabase {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private instance?: SupabaseClient<Database>;

  // Criado só no primeiro uso e só no navegador: nenhuma chamada ao banco roda no build.
  get client(): SupabaseClient<Database> {
    if (!this.browser) throw new Error('O Supabase só pode ser usado no navegador.');
    return (this.instance ??= createClient<Database>(
      environment.supabaseUrl,
      environment.supabaseKey,
    ));
  }
}

export function publicUrl(bucket: 'produtos' | 'site', path: string): string {
  return `${environment.supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

// Caminho no bucket "produtos" de uma URL pública gerada por publicUrl.
export function productImagePath(url: string): string {
  return url.slice(publicUrl('produtos', '').length);
}

export function toPrice(preco: number | null, aPartir: boolean): Price | null {
  return preco === null
    ? null
    : { kind: aPartir ? 'starting-at' : 'fixed', amountInCents: Math.round(preco * 100) };
}

export function fromPrice(price: Price | null): { preco: number | null; preco_a_partir: boolean } {
  return {
    preco: price ? price.amountInCents / 100 : null,
    preco_a_partir: price?.kind === 'starting-at',
  };
}

export function categoryImageUrl(path: string | null): string {
  if (!path) return '';
  return path.startsWith('images/') ? path : publicUrl('site', path);
}

// Erro do supabase-js ({ data, error }) vira exceção para as telas tratarem com try/catch.
export function check<T>({ data, error }: { data: T; error: unknown }): NonNullable<T> {
  if (error) throw error;
  return data as NonNullable<T>;
}
