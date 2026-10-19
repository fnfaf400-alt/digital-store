export function formatMoney(cents: number, currency = "SAR"): string {
  const value = (cents / 100).toFixed(2);
  const symbols: Record<string, string> = {
    SAR: "ر.س",
    USD: "$",
    EUR: "€",
  };
  return `${value} ${symbols[currency] ?? currency}`;
}
