/* Loyiha sozlamalari. Nom, filiallar va test hisobni shu yerdan o'zgartirasiz. */

export const APP_TITLE = "Bir Zum Nasiya to'lov monitoringi";

/* 12 ta filial. `id` Firestore'da va xavfsizlik qoidalarida ishlatiladi (firestore.rules bilan bir xil bo'lsin). */
export const BRANCHES = [
  { id: "bogot", name: "Bog'ot" },
  { id: "gurlan", name: "Gurlan" },
  { id: "xonqa", name: "Xonqa" },
  { id: "hazorasp", name: "Hazorasp" },
  { id: "xiva", name: "Xiva" },
  { id: "qoshkopir", name: "Qo'shko'pir" },
  { id: "shovot", name: "Shovot" },
  { id: "urganch", name: "Urganch" },
  { id: "yangiariq", name: "Yangiariq" },
  { id: "yangibozor", name: "Yangibozor" },
  { id: "tuproqqala", name: "Tuproqqal'a" },
  { id: "amudaryo", name: "Amudaryo" },
];

export const branchName = (id) => BRANCHES.find((b) => b.id === id)?.name ?? id;

/* Yig'uvchining oylik mijozlar soni variantlari */
export const TOTAL_OPTIONS = [300, 500];

/* Demo rejimdagi test hisob (o'ydirma, hamma ko'rishi mumkin) */
export const TEST_ACCOUNT = {
  phone: "90 000 00 00",
  password: "test123",
  name: "Test foydalanuvchi",
  branchId: "shovot",
  total: 500,
};

/* Kirish oynasida ko'rsatiladigan test hisob.
   Demo rejimda doim bor. Firebase rejimida .env dagi VITE_TEST_PHONE va VITE_TEST_PASSWORD bo'lsa chiqadi. */
export function testHint(mode) {
  if (mode === "demo") return { phone: TEST_ACCOUNT.phone, password: TEST_ACCOUNT.password };
  const phone = import.meta.env.VITE_TEST_PHONE;
  const password = import.meta.env.VITE_TEST_PASSWORD;
  return phone && password ? { phone, password } : null;
}
