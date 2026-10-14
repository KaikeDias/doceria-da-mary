import { productWhatsappUrl, whatsappMessages, whatsappUrl } from './contact-links';
import { publicConfig } from './public-config';

describe('Links do WhatsApp', () => {
  it('usa o número central e codifica acentos e caracteres reservados', () => {
    const message = 'Olá! Gostaria de bolo & café? #pedido + opções';
    const url = new URL(whatsappUrl(message)!);
    expect(url.origin).toBe('https://wa.me');
    expect(url.pathname).toBe(`/${publicConfig.contact.whatsapp}`);
    expect(url.searchParams.get('text')).toBe(message);
    expect(url.hash).toBe('');
    expect(whatsappUrl(message)).toContain(encodeURIComponent(message));
  });

  it('não gera link sem número internacional válido', () => {
    for (const phone of [
      null,
      '',
      '+5589994259584',
      '55 (89) 99425-9584',
      'abc',
      '012345678',
      '1234567890123456',
    ]) {
      expect(whatsappUrl('Olá!', phone)).toBeNull();
    }
  });

  it('distingue mensagens de pedido, apresentação, encomenda e dúvidas', () => {
    const messages = Object.values(whatsappMessages);
    expect(new Set(messages).size).toBe(4);
    for (const message of messages) {
      expect(new URL(whatsappUrl(message)!).searchParams.get('text')).toBe(message);
    }
  });

  it('inclui o nome do produto exatamente como informado', () => {
    const name = 'Bolo de Morango & Chocolate';
    const message = new URL(productWhatsappUrl(name)!).searchParams.get('text');
    expect(message).toContain(`"${name}"`);
    expect(message).toContain('cardápio do site');
  });
});
