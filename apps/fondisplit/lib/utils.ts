export function formatPrice(price: number): string {
  return (price / 100).toFixed(2);
}

export function hexToRgb(hex: string, alpha: number) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  const r = parseInt(result[1] || "0", 16);
  const g = parseInt(result[2] || "0", 16);
  const b = parseInt(result[3] || "0", 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function linearGradientWithAlpha(hex: string, alpha: number) {
  return `linear-gradient(to bottom left, ${hex}, ${hexToRgb(hex, alpha)})`;
}

export function hasDuplicates(array: any[]) {
  return new Set(array).size !== array.length;
}

export function adjustMinorAmount(
  originalSplits: { userId: string; userName: string; amount: number }[],
  expenseAmount: number,
) {
  const splits = originalSplits.map((split) => ({
    ...split,
    amount: Math.floor(split.amount * 100),
  }));

  const totalAmount = splits.reduce((acc, split) => acc + split.amount, 0);
  const diff = Math.floor(expenseAmount * 100) - totalAmount;
  if (diff === 0) return originalSplits;

  const randomIndex = Math.floor(Math.random() * splits.length);
  if (!!splits[randomIndex]) {
    splits[randomIndex].amount += diff;
  }

  const newSplits = splits.map((split) => ({
    ...split,
    amount: split.amount / 100,
  }));
  return newSplits;
}
