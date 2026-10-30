// `phone`: DDD + número, como gravado em Configurações; o link usa o código do país (55).
export function whatsappUrl(phone: string, message: string): string | null {
  if (!/^\d{10,11}$/.test(phone)) return null;
  return `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
}

export function productWhatsappUrl(phone: string, productName: string): string | null {
  return whatsappUrl(
    phone,
    `Olá, Mary! Vi o produto "${productName}" no cardápio do site e gostaria de saber mais e fazer um pedido.`,
  );
}
