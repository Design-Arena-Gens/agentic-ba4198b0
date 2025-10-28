export function toPriceString(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function parsePriceToCents(value: number | string) {
  if (typeof value === "number") {
    return Math.round(value * 100);
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error("Invalid price value");
  }
  return Math.round(parsed * 100);
}
