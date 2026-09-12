import { Order, StoreConfig } from '../types';

export function generateWhatsAppOrderUrl(order: Order, config: StoreConfig): string {
  // Normalize whatsapp phone number (only digits)
  const phone = config.whatsapp.replace(/\D/g, '');

  const itemsList = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.productName}*\n   • Tamanho: *${item.size}* | Cor: *${item.color}*\n   • Qtd: ${item.quantity}x de R$ ${item.unitPrice.toFixed(2).replace('.', ',')} = *R$ ${item.subtotal.toFixed(2).replace('.', ',')}*`
    )
    .join('\n\n');

  let deliveryInfo = '';
  if (order.deliveryType === 'delivery' && order.address) {
    const a = order.address;
    deliveryInfo = `📍 *Endereço de Entrega:*\n${a.street}, nº ${a.number}${a.complement ? ` (${a.complement})` : ''}\nBairro: ${a.neighborhood}\nCidade: ${a.city} - ${a.state}\nCEP: ${a.zipCode}`;
  } else {
    deliveryInfo = `🏪 *Forma de Retirada:*\nRetirar na Loja / Boutique:\n${config.address}`;
  }

  const paymentText =
    order.paymentMethod === 'pix'
      ? `🔑 *Pagamento via PIX*\nChave: \`${config.pixKey}\``
      : order.paymentMethod === 'cartao_credito'
      ? `💳 *Pagamento com Cartão de Crédito*`
      : `💬 *A combinar no WhatsApp*`;

  const notesText = order.notes ? `\n📝 *Observações:* ${order.notes}\n` : '';

  const message = `🛍️ *NOVO PEDIDO - ${config.name.toUpperCase()}* 🛍️\n` +
    `----------------------------------------\n` +
    `🔖 *Pedido:* #${order.orderNumber}\n` +
    `👤 *Cliente:* ${order.customerName}\n` +
    `📱 *WhatsApp:* ${order.customerWhatsapp}\n` +
    `----------------------------------------\n` +
    `📦 *ITENS DO PEDIDO:*\n\n${itemsList}\n` +
    `----------------------------------------\n` +
    `💰 *VALOR TOTAL: R$ ${order.totalAmount.toFixed(2).replace('.', ',')}*\n` +
    `💳 *Forma de Pagamento:* ${paymentText}\n` +
    `----------------------------------------\n` +
    `${deliveryInfo}\n${notesText}` +
    `----------------------------------------\n` +
    `✨ Olá! Acabei de montar meu pedido pelo site e aguardo a confirmação. Muito obrigada! 💕`;

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encoded}`;
}

export function openWhatsAppChat(phone: string, text?: string): void {
  const cleanPhone = phone.replace(/\D/g, '');
  const url = text
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${cleanPhone}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
