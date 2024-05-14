export function formatPrice(price: number): string {
  return (price / 100).toFixed(2);
}

export function linearGradientWithAlpha(hex: string, alpha: number) {
  function hexToRgb(hex: string, alpha: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;
    const r = parseInt(result[1] || "0", 16);
    const g = parseInt(result[2] || "0", 16);
    const b = parseInt(result[3] || "0", 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `linear-gradient(to bottom left, ${hex}, ${hexToRgb(hex, alpha.toString())})`;
}
