import { productWhatsappUrl, whatsappUrl } from './contact-links';

describe('Links do WhatsApp', () => {
  it('Landing CA02: adiciona o 55 e codifica acentos e caracteres reservados', () => {
    const message = 'Olá! Gostaria de bolo & café? #pedido + opções';
    const url = new URL(whatsappUrl('89994259584', message)!);
    expect(url.origin).toBe('https://wa.me');
    expect(url.pathname).toBe('/5589994259584');
    expect(url.searchParams.get('text')).toBe(message);
    expect(url.hash).toBe('');
    expect(whatsappUrl('8999425958', message)).toContain(encodeURIComponent(message));
  });

  it('Landing CA02: não gera link sem DDD + número válido', () => {
    for (const phone of ['', '5589994259584', '(89) 99425-9584', 'abc', '899942595']) {
      expect(whatsappUrl(phone, 'Olá!')).toBeNull();
    }
  });

  it('Landing CA02: inclui o nome do produto exatamente como informado', () => {
    const name = 'Bolo de Morango & Chocolate';
    const url = new URL(productWhatsappUrl('89994259584', name)!);
    expect(url.pathname).toBe('/5589994259584');
    expect(url.searchParams.get('text')).toContain(`"${name}"`);
    expect(url.searchParams.get('text')).toContain('cardápio do site');
    expect(productWhatsappUrl('', name)).toBeNull();
  });
});
