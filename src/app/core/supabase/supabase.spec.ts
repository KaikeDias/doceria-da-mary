import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import {
  categoryImageUrl,
  check,
  fromPrice,
  productImagePath,
  publicUrl,
  Supabase,
  toPrice,
} from './supabase';

describe('Base Supabase', () => {
  const storage = `${environment.supabaseUrl}/storage/v1/object/public`;

  it('CA01: cria o client uma vez no navegador', () => {
    const supabase = TestBed.inject(Supabase);
    expect(supabase.client).toBe(supabase.client);
  });

  it('CA01: recusa o client fora do navegador', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const supabase = TestBed.inject(Supabase);
    expect(() => supabase.client).toThrow('O Supabase só pode ser usado no navegador.');
  });

  it('CA02: converte preço do banco para centavos e de volta', () => {
    expect(toPrice(85, true)).toEqual({ kind: 'starting-at', amountInCents: 8500 });
    expect(toPrice(18, false)).toEqual({ kind: 'fixed', amountInCents: 1800 });
    expect(toPrice(0.29, false)).toEqual({ kind: 'fixed', amountInCents: 29 });
    expect(toPrice(null, false)).toBeNull();
    expect(fromPrice({ kind: 'starting-at', amountInCents: 8500 })).toEqual({
      preco: 85,
      preco_a_partir: true,
    });
    expect(fromPrice({ kind: 'fixed', amountInCents: 1800 })).toEqual({
      preco: 18,
      preco_a_partir: false,
    });
    expect(fromPrice(null)).toEqual({ preco: null, preco_a_partir: false });
  });

  it('CA03: monta URLs de imagens de produto e de categoria', () => {
    expect(publicUrl('produtos', 'seed/brownie.webp')).toBe(
      `${storage}/produtos/seed/brownie.webp`,
    );
    expect(productImagePath(`${storage}/produtos/abc/1.webp`)).toBe('abc/1.webp');
    expect(categoryImageUrl('images/sweet-box.webp')).toBe('images/sweet-box.webp');
    expect(categoryImageUrl('logo.webp')).toBe(`${storage}/site/logo.webp`);
    expect(categoryImageUrl(null)).toBe('');
  });

  it('transforma o erro do supabase-js em exceção', () => {
    expect(check({ data: [1], error: null })).toEqual([1]);
    const error = new Error('falha');
    expect(() => check({ data: null, error })).toThrow(error);
  });
});
