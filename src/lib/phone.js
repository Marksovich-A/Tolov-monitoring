/* Telefon raqam bilan kirish.
   Firebase telefon + parol juftligini bevosita qo'llamaydi, shuning uchun raqam
   ichkarida soxta email'ga aylantiriladi: 998901234567@kunlik.local
   Bu manzilga hech qachon xat yuborilmaydi. */
const DOMAIN = "kunlik.local";

/* "+998 90 123 45 67", "998901234567" yoki "90 123 45 67" -> "998901234567", noto'g'ri bo'lsa null */
export function normalizePhone(input) {
  const digits = String(input ?? "").replace(/\D/g, "");
  if (digits.length === 9) return "998" + digits;
  if (digits.length === 12 && digits.startsWith("998")) return digits;
  return null;
}

export const phoneToEmail = (digits) => `${digits}@${DOMAIN}`;

export function formatPhone(d) {
  return `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}`;
}

/* Ko'rsatish uchun: 12 raqamli bo'lsa chiroyli, aks holda o'zi */
export const phoneLabel = (digits) => (/^\d{12}$/.test(digits ?? "") ? formatPhone(digits) : (digits ?? ""));
