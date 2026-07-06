const wToA: Record<string, string> = {
  "0": "٠",
  "1": "١",
  "2": "٢",
  "3": "٣",
  "4": "٤",
  "5": "٥",
  "6": "٦",
  "7": "٧",
  "8": "٨",
  "9": "٩",
};
const aToW: Record<string, string> = {
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
};

export function toArabic(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return "";
  return String(val).replace(/[0-9]/g, (c) => wToA[c] ?? c);
}
export function toWestern(val: string): string {
  if (!val) return "";
  return val.replace(/[٠-٩]/g, (c) => aToW[c] ?? c);
}
