import { useCallback, useMemo, useState } from "react";
import { BRANCHES, TEST_ACCOUNT } from "../config";
import { normalizePhone } from "../lib/phone";
import { buildBranchDays, buildDemoCollectors, DEMO_TODAY, TEST_ID } from "./demoData";

const byDate = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
const coded = (code) => Object.assign(new Error(code), { code });
const TEST_DIGITS = normalizePhone(TEST_ACCOUNT.phone);

/* ---------- Brauzer xotirasi (faqat demo rejim uchun) ---------- */
const KEYS = { accounts: "nasiya.accounts", session: "nasiya.session", reports: "nasiya.reports" };

function read(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // xotira yopiq bo'lsa (masalan, maxfiy oyna), demo shunchaki sahifa yangilanguncha ishlaydi
  }
}

/* Demo rejimda parol xotirada hash ko'rinishida turadi. Bu faqat o'rgatish uchun:
   haqiqiy rejimda parollarni Firebase Authentication saqlaydi va hech qachon ko'rinmaydi. */
async function hashPassword(phone, password) {
  const text = `${phone}:${password}`;
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return btoa(unescape(encodeURIComponent(text))); // crypto.subtle yo'q muhit uchun oddiy zaxira
  }
}

function mergeReports(existing, extra = []) {
  const dates = new Set(extra.map((r) => r.date));
  return existing.filter((r) => !dates.has(r.date)).concat(extra).sort(byDate);
}

/* Demo rejim: ma'lumotlar o'ydirma, ro'yxatdan o'tgan foydalanuvchilar va ularning hisobotlari
   brauzer xotirasida saqlanadi. Qaytaradigan obyekt shakli firebaseStore.js bilan bir xil:
   - branchDays: HAMMA filiallarning kunlik yig'indisi
   - collectors: faqat foydalanuvchining O'Z filialidagi yig'uvchilar */
export function useDemoData() {
  const base = useMemo(() => buildDemoCollectors(), []);
  const [accounts, setAccounts] = useState(() => read(KEYS.accounts, []));
  const [sessionId, setSessionId] = useState(() => read(KEYS.session, null));
  const [saved, setSaved] = useState(() => read(KEYS.reports, {}));

  const everyone = useMemo(() => {
    const list = base.map((c) => (c.id === TEST_ID ? { ...c, reports: mergeReports(c.reports, saved[c.id]) } : c));
    accounts.forEach((a) =>
      list.push({ id: a.id, name: a.name, branchId: a.branchId, total: a.total, reports: mergeReports([], saved[a.id]) })
    );
    return list;
  }, [base, accounts, saved]);

  const user = useMemo(() => {
    if (!sessionId) return null;
    if (sessionId === TEST_ID) {
      return { id: TEST_ID, name: TEST_ACCOUNT.name, phone: TEST_DIGITS, branchId: TEST_ACCOUNT.branchId, total: TEST_ACCOUNT.total };
    }
    const a = accounts.find((x) => x.id === sessionId);
    return a ? { id: a.id, name: a.name, phone: a.phone, branchId: a.branchId, total: a.total } : null;
  }, [sessionId, accounts]);

  const branchDays = useMemo(() => buildBranchDays(everyone), [everyone]);
  const collectors = useMemo(
    () => (user ? everyone.filter((c) => c.branchId === user.branchId) : []),
    [everyone, user]
  );

  const saveReport = useCallback(
    async (report) => {
      setSaved((prev) => {
        const next = { ...prev, [user.id]: mergeReports(prev[user.id] ?? [], [report]) };
        write(KEYS.reports, next);
        return next;
      });
    },
    [user]
  );

  const startSession = (id) => {
    setSessionId(id);
    write(KEYS.session, id);
  };

  const auth = useMemo(
    () => ({
      async signIn(phone, password) {
        const digits = normalizePhone(phone);
        if (!digits) throw coded("app/invalid-phone");
        if (digits === TEST_DIGITS && password === TEST_ACCOUNT.password) return startSession(TEST_ID);
        const acc = accounts.find((a) => a.phone === digits);
        const hash = await hashPassword(digits, password);
        if (!acc || acc.hash !== hash) throw coded("auth/invalid-credential");
        return startSession(acc.id);
      },

      async signUp({ name, total, branchId, phone, password }) {
        const digits = normalizePhone(phone);
        if (!digits) throw coded("app/invalid-phone");
        if (!BRANCHES.some((b) => b.id === branchId)) throw coded("app/invalid-branch");
        if (password.length < 6) throw coded("auth/weak-password");
        if (digits === TEST_DIGITS || accounts.some((a) => a.phone === digits)) throw coded("auth/email-already-in-use");

        const acc = {
          id: `u-${Date.now().toString(36)}`,
          phone: digits,
          name,
          branchId,
          total: Number(total),
          hash: await hashPassword(digits, password),
        };
        const next = [...accounts, acc];
        setAccounts(next);
        write(KEYS.accounts, next);
        startSession(acc.id);
      },

      async signOut() {
        setSessionId(null);
        write(KEYS.session, null);
      },
    }),
    [accounts]
  );

  return useMemo(
    () => ({
      mode: "demo",
      status: user ? "ready" : "signedout",
      today: DEMO_TODAY,
      user,
      branchDays,
      collectors,
      saveReport,
      auth,
    }),
    [user, branchDays, collectors, saveReport, auth]
  );
}
