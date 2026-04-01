export function formatINR(paise: number | bigint): string {
  const amount = typeof paise === "bigint" ? Number(paise) / 100 : paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function paiseToINR(paise: number | bigint): number {
  return typeof paise === "bigint" ? Number(paise) / 100 : paise / 100;
}

export function getPlatformFee(amountINR: number): number {
  if (amountINR <= 10000) return 800;
  if (amountINR <= 30000) return 1000;
  if (amountINR <= 60000) return 1300;
  if (amountINR <= 100000) return 1500;
  return 2000;
}

export function calculateTotal(bidAmountINR: number): {
  platformFee: number;
  gst: number;
  tcs: number;
  total: number;
} {
  const platformFee = getPlatformFee(bidAmountINR);
  const gst = Math.round(platformFee * 0.18);
  const tcs = Math.round(bidAmountINR * 0.01);
  return {
    platformFee,
    gst,
    tcs,
    total: bidAmountINR + platformFee + gst + tcs,
  };
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return "Ended";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
