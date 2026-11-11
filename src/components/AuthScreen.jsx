import { useState } from "react";
import { APP_TITLE, BRANCHES, TOTAL_OPTIONS, testHint } from "../config";
import Panel from "./Panel.jsx";
import Segmented from "./Segmented.jsx";

const MESSAGES = {
  "app/invalid-phone": "Telefon raqamini to'g'ri kiriting, masalan: 90 123 45 67.",
  "app/invalid-branch": "Filialingizni tanlang.",
  "auth/invalid-credential": "Telefon raqam yoki parol noto'g'ri.",
  "auth/email-already-in-use": "Bu raqam bilan allaqachon ro'yxatdan o'tilgan.",
  "auth/weak-password": "Parol kamida 6 ta belgidan iborat bo'lsin.",
  "auth/too-many-requests": "Juda ko'p urinish. Bir ozdan keyin qayta urinib ko'ring.",
  "auth/network-request-failed": "Internet bilan aloqa yo'q. Qayta urinib ko'ring.",
};

const MODES = [
  { value: "signin", label: "Kirish" },
  { value: "signup", label: "Ro'yxatdan o'tish" },
];

const field =
  "w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-white placeholder:text-white/35 focus:border-sun focus:outline-none";

/* Telefon raqam va parol bilan kirish yoki ro'yxatdan o'tish */
export default function AuthScreen({ auth, mode: dataMode }) {
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({ name: "", branchId: "", total: "300", phone: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const signup = mode === "signup";
  const hint = testHint(dataMode);
  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  async function run(action) {
    setError("");
    setBusy(true);
    try {
      await action();
    } catch (err) {
      setError(MESSAGES[err.code] ?? "Kirib bo'lmadi. Qayta urinib ko'ring.");
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (signup && !form.name.trim()) return setError("Ismingizni kiriting.");
    if (signup && !form.branchId) return setError(MESSAGES["app/invalid-branch"]);
    run(() =>
      signup
        ? auth.signUp({ name: form.name.trim(), total: form.total, branchId: form.branchId, phone: form.phone, password: form.password })
        : auth.signIn(form.phone, form.password)
    );
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sun">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <rect x="2" y="4" width="20" height="4" rx="1.5" fill="#0a0a0a" />
              <rect x="2" y="10" width="14" height="4" rx="1.5" fill="#0a0a0a" />
              <rect x="2" y="16" width="8" height="4" rx="1.5" fill="#0a0a0a" />
            </svg>
          </span>
          <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{APP_TITLE}</h1>
        </div>

        <Panel className="p-6 sm:p-8">
          <Segmented label="Kirish usuli" options={MODES} value={mode} onChange={(m) => { setMode(m); setError(""); }} className="w-full [&>button]:flex-1" />

          <form className="mt-6 grid gap-4" onSubmit={handleSubmit} noValidate>
            {signup && (
              <>
                <label className="grid gap-1.5 text-sm font-medium">
                  Ismingiz
                  <input type="text" className={field} value={form.name} onChange={set("name")} autoComplete="name" />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-sm font-medium">
                    Filial
                    <select className={field} value={form.branchId} onChange={set("branchId")}>
                      <option value="" className="bg-ink">
                        Tanlang
                      </option>
                      {BRANCHES.map((b) => (
                        <option key={b.id} value={b.id} className="bg-ink">
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium">
                    Oylik mijozlar soni
                    <select className={field} value={form.total} onChange={set("total")}>
                      {TOTAL_OPTIONS.map((t) => (
                        <option key={t} value={t} className="bg-ink">
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </>
            )}

            <label className="grid gap-1.5 text-sm font-medium">
              Telefon raqam
              <input
                type="tel"
                inputMode="tel"
                placeholder="90 123 45 67"
                className={field}
                value={form.phone}
                onChange={set("phone")}
                autoComplete="tel"
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium">
              Parol
              <input
                type="password"
                className={field}
                value={form.password}
                onChange={set("password")}
                autoComplete={signup ? "new-password" : "current-password"}
              />
            </label>

            {error && (
              <p role="alert" className="rounded-xl border border-sun/40 bg-sun/10 px-3.5 py-2.5 text-sm font-medium text-sun">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-sun px-5 py-3 font-semibold text-ink transition hover:brightness-95 disabled:opacity-60"
            >
              {busy ? "Kutilmoqda..." : signup ? "Ro'yxatdan o'tish" : "Kirish"}
            </button>
          </form>
        </Panel>

        {hint && (
          <Panel tone="sun" className="mt-4 p-4 sm:p-5">
            <p className="text-sm font-semibold">Sinab ko'rish uchun test hisob</p>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-white/60">Telefon</dt>
              <dd className="font-medium">{hint.phone}</dd>
              <dt className="text-white/60">Parol</dt>
              <dd className="font-medium">{hint.password}</dd>
            </dl>
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => auth.signIn(hint.phone, hint.password))}
              className="mt-3 rounded-lg border border-sun/60 px-3.5 py-1.5 text-sm font-semibold text-sun transition hover:bg-sun hover:text-ink disabled:opacity-60"
            >
              Test hisob bilan kirish
            </button>
          </Panel>
        )}
      </div>
    </main>
  );
}
