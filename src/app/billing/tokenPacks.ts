/** Tokens extra: 3 tokens = 1 USD. Mínimo de compra 5 USD. Descuento por volumen. */

export const TOKENS_PER_DOLLAR = 3;
export const TOKEN_PACK_MIN_USD = 5;
export const TOKEN_PACKS = [5, 10, 20, 50, 100, 500, 1000] as const;

export type TokenPackSize = (typeof TOKEN_PACKS)[number];

/** Descuento % según tamaño del paquete (más tokens = más ahorro). */
export function tokenPackDiscount(tokens: number): number {
  if (tokens >= 1000) return 0.25;
  if (tokens >= 500) return 0.2;
  if (tokens >= 100) return 0.15;
  if (tokens >= 50) return 0.1;
  if (tokens >= 20) return 0.05;
  return 0;
}

/** Precio lista antes de mínimo: ceil(tokens/3). */
export function tokenPackListPrice(tokens: number): number {
  return Math.ceil(Number(tokens) / TOKENS_PER_DOLLAR);
}

/** Precio final USD redondeado, con descuento y piso de $5. */
export function tokenPackPrice(tokens: number): number {
  const list = tokenPackListPrice(tokens);
  const discounted = list * (1 - tokenPackDiscount(tokens));
  return Math.max(TOKEN_PACK_MIN_USD, Math.round(discounted));
}

export function tokenPackRows() {
  return TOKEN_PACKS.map((tokens) => {
    const list = tokenPackListPrice(tokens);
    const discount = tokenPackDiscount(tokens);
    const price = tokenPackPrice(tokens);
    const effectivePerToken = price / tokens;
    return {
      tokens,
      listPrice: list,
      discount,
      discountLabel: discount ? `−${Math.round(discount * 100)}%` : '—',
      price,
      effectivePerToken,
      savings: Math.max(0, list - price),
    };
  });
}
