import { useEffect, useMemo, useRef, useState } from "react";
import { KEYS, LABELS, autoStarts, flow, longDate, num, outstanding, pctText, previousReport } from "../lib/calc";

const EMPTY = {
  total: "",
  sud_start: "",
  sud_end: "",
  carried_start: "",
  carried_end: "",
  daily_start: "",
  daily_end: "",
  overdue_start: "",
  overdue_end: "",
};

const str = (v) => (v === undefined || v === null ? "" : String(v));

const inputClass =
  "w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-right text-white focus:border-sun focus:outline-none";

/* Mobil ekranda har bir katak o'z yorlig'i bilan, keng ekranda yorliqsiz jadval qatori */
function Cell({ label, children }) {
  return (
    <div className="grid gap-1 text-xs text-white/60 sm:contents">
      <span className="sm:hidden">{label}</span>
      {children}
    </div>
  );
}

const outputClass = "px-3 py-2 text-right text-base text-white/85 sm:text-sm";

/* Bugungi hisobotni kiritish oynasi.
   Kun boshiga qiymatlari kechagi hisobotdan olinadi (birinchi hisobotda o'zingiz kiritasiz). */
export default function ReportDialog({ open, onClose, onSave, me, today }) {
  const ref = useRef(null);
  const [vals, setVals] = useState(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const auto = useMemo(() => (me ? autoStarts(previousReport(me.reports, today)) : null), [me, today]);

  /* Oyna ochilganda maydonlarni to'ldirish (bugun hisobot bor bo'lsa, shuni ko'rsatadi) */
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      const ex = me?.reports.find((r) => r.date === today);
      setVals({
        total: str(ex?.total ?? me?.total),
        sud_start: str(ex?.sud.start),
        sud_end: str(ex?.sud.end),
        carried_start: str(ex?.carried.start),
        carried_end: str(ex?.carried.end),
        daily_start: str(ex?.daily.start),
        daily_end: str(ex?.daily.end),
        overdue_start: str(ex?.overdue.start),
        overdue_end: str(ex?.overdue.end),
      });
      setError("");
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
    // faqat `open` o'zgarganda ishlaydi, yozayotgan paytda maydonlarni tiklamaydi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const n = (name) => Number(vals[name]);
  const starts = auto ?? { sud: n("sud_start"), carried: n("carried_start"), overdue: n("overdue_start") };
  const report = {
    total: n("total"),
    sud: { start: starts.sud, end: n("sud_end") },
    carried: { start: starts.carried, end: n("carried_end") },
    daily: { start: n("daily_start"), end: n("daily_end") },
    overdue: { start: starts.overdue, end: n("overdue_end") },
  };

  function validate() {
    const required = ["total", "sud_end", "carried_end", "daily_start", "daily_end", "overdue_end"];
    if (!auto) required.push("sud_start", "carried_start", "overdue_start");
    const bad = required.some((name) => {
      const raw = vals[name].trim();
      return raw === "" || !Number.isInteger(Number(raw)) || Number(raw) < 0;
    });
    if (bad) return "Barcha maydonlarni 0 yoki undan katta butun son bilan to'ldiring.";
    if (report.daily.end > report.daily.start) {
      return "Kunlik mijozlarda kun oxiriga soni kun boshiga sonidan katta bo'lmasin.";
    }
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    try {
      await onSave({ date: today, ...report });
      onClose();
    } catch {
      setError("Saqlab bo'lmadi. Internetni tekshirib, qayta urinib ko'ring.");
    } finally {
      setSaving(false);
    }
  }

  const input = (name, label) => (
    <input
      type="number"
      min="0"
      step="1"
      inputMode="numeric"
      value={vals[name]}
      aria-label={label}
      className={inputClass}
      onChange={(e) => setVals((v) => ({ ...v, [name]: e.target.value }))}
    />
  );

  const pros = outstanding(report);

  return (
    <dialog
      ref={ref}
      aria-labelledby="form-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // fon bosilganda yopiladi
      }}
      className="m-auto max-h-[92vh] w-[min(42rem,94vw)] overflow-y-auto rounded-2xl border border-white/15 bg-[#121212]/95 p-0 text-white shadow-2xl shadow-black/60 backdrop-blur-xl backdrop:bg-black/70"
    >
      <form onSubmit={handleSubmit} noValidate>
        <header className="px-5 pb-2 pt-6 sm:px-7">
          <h2 id="form-title" className="font-display text-2xl font-semibold tracking-tight">
            Bugungi hisobot
          </h2>
          <p className="text-sm text-white/60">{longDate(today)}</p>
        </header>

        <div className="px-5 pb-1 sm:px-7">
          <label className="flex items-center justify-between gap-4 border-b border-white/10 py-3 font-medium">
            <span className="whitespace-nowrap">Jami mijoz soni</span>
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={vals.total}
              className={`${inputClass} !w-32`}
              onChange={(e) => setVals((v) => ({ ...v, total: e.target.value }))}
            />
          </label>

          <div
            aria-hidden="true"
            className="hidden items-center gap-3 border-b border-white/10 py-2 text-xs text-white/60 sm:grid sm:grid-cols-[1.6fr_1fr_1fr_0.8fr_0.9fr]"
          >
            <span />
            <span className="text-right">Kun boshiga</span>
            <span className="text-right">Kun oxiriga</span>
            <span className="text-right">Farqi</span>
            <span className="text-right">Foizi</span>
          </div>

          {KEYS.map((k) => {
            const f = flow(report[k].start, report[k].end);
            const startCell =
              k === "daily" ? (
                input("daily_start", `${LABELS[k]}, kun boshiga`)
              ) : auto ? (
                <output className={outputClass}>{num(auto[k])}</output>
              ) : (
                input(`${k}_start`, `${LABELS[k]}, kun boshiga`)
              );
            return (
              <div
                key={k}
                className="grid grid-cols-2 gap-x-3 gap-y-2 border-b border-white/10 py-3 sm:grid-cols-[1.6fr_1fr_1fr_0.8fr_0.9fr] sm:items-center sm:gap-3 sm:py-2"
              >
                <p className="col-span-2 font-semibold sm:col-span-1">{LABELS[k]}</p>
                <Cell label="Kun boshiga">{startCell}</Cell>
                <Cell label="Kun oxiriga">{input(`${k}_end`, `${LABELS[k]}, kun oxiriga`)}</Cell>
                <Cell label="Farqi">
                  <output className={outputClass}>{Number.isFinite(f.diff) ? num(f.diff) : "–"}</output>
                </Cell>
                <Cell label="Foizi">
                  <output className={outputClass}>{f.pct === null || !Number.isFinite(f.pct) ? "–" : pctText(f.pct)}</output>
                </Cell>
              </div>
            );
          })}

          <p className="mt-3 text-sm text-white/55">
            {auto
              ? "Kun boshiga qiymatlari kechagi hisobotdan olinadi. Kunlik mijozlarning kun boshiga sonini o'zingiz kiritasiz."
              : "Bu birinchi hisobot, shuning uchun kun boshiga qiymatlarini o'zingiz kiriting. Keyingi kunlarda ular avtomatik olinadi."}
          </p>
          <p className="mt-3">
            Kunga pros: <strong className="font-display text-xl text-sun">{Number.isFinite(pros) ? num(pros) : "–"}</strong>
          </p>
          {error && (
            <p role="alert" className="mt-3 rounded-xl border border-sun/40 bg-sun/10 px-3.5 py-2.5 text-sm font-medium text-sun">
              {error}
            </p>
          )}
        </div>

        <footer className="flex justify-end gap-3 px-5 pb-6 pt-5 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/20 px-4 py-2.5 font-medium text-white/85 transition hover:bg-white/10"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-sun px-5 py-2.5 font-semibold text-ink transition hover:brightness-95 disabled:opacity-60"
          >
            {saving ? "Saqlanmoqda..." : "Hisobotni saqlash"}
          </button>
        </footer>
      </form>
    </dialog>
  );
}
