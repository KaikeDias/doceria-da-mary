import { publicConfig } from './public-config';

export const whatsappMessages = {
  order: 'Olá, Mary! Vim pelo site e gostaria de fazer um pedido.',
  hero: 'Olá, Mary! Conheci a Doceria da Mary pelo site e gostaria de saber mais sobre os doces.',
  customOrder:
    'Olá, Mary! Gostaria de fazer uma encomenda especial. Podemos conversar sobre a ocasião e as opções?',
  questions:
    'Olá, Mary! Vim pelo site e gostaria de tirar algumas dúvidas sobre os doces e as encomendas.',
};

export function whatsappUrl(
  message: string,
  phone: string | null = publicConfig.contact.whatsapp,
): string | null {
  if (!phone || !/^[1-9]\d{7,14}$/.test(phone)) return null;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function productWhatsappUrl(productName: string): string | null {
  return whatsappUrl(
    `Olá, Mary! Vi o produto "${productName}" no cardápio do site e gostaria de saber mais e fazer um pedido.`,
  );
}
