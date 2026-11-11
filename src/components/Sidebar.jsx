import { num } from "../lib/calc";
import { closedText } from "../lib/text";
import PercentChip from "./PercentChip.jsx";
import Segmented from "./Segmented.jsx";

const SORTS = [
  { value: "asc", label: "Past foiz tepada" },
  { value: "desc", label: "Yuqori foiz tepada" },
];

/* Yon panel: viloyat yig'indisi va 12 filial. Muddati o'tganlarni undirish foizi bo'yicha tartiblanadi.
   Tartib yo'nalishini shu yerda o'zgartirasiz (standart: foizi past filial tepada). */
export default function Sidebar({ rows, region, scope, onScope, myBranchId, sortDir, onSortDir, onClose }) {
  return (
    <div className="flex min-h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold tracking-tight">Filiallar</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/5"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => onScope("all")}
        aria-current={scope === "all"}
        className={`rounded-2xl border p-4 text-left transition ${
          scope === "all" ? "border-sun/50 bg-sun/15" : "border-white/10 bg-white/5 hover:bg-white/10"
        }`}
      >
        <span className="flex items-center justify-between gap-3">
          <span className="font-semibold">Hammasi, viloyat bo'yicha</span>
          <PercentChip pct={region.overdue.pct} kind="overdue" />
        </span>
        <span className="mt-1 block text-xs text-white/60">
          {region.overdue.start > 0 ? closedText(region.overdue) : "Ma'lumot yo'q"}
        </span>
        <span className="mt-0.5 block text-xs text-white/45">Kunga pros jami: {num(region.pros)}</span>
      </button>

      <div>
        <p className="mb-1.5 text-xs text-white/60">Tartib: muddati o'tganlarni undirish foizi</p>
        <Segmented small label="Tartib" options={SORTS} value={sortDir} onChange={onSortDir} className="w-full [&>button]:flex-1" />
      </div>

      <ol className="space-y-1">
        {rows.map(({ b, s }, i) => {
          const active = scope === b.id;
          const mine = b.id === myBranchId;
          return (
            <li key={b.id}>
              <button
                type="button"
                onClick={() => onScope(b.id)}
                aria-current={active}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                  active ? "border-sun/50 bg-sun/10" : "border-transparent hover:bg-white/5"
                }`}
              >
                <span className="w-5 text-sm text-white/40">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <span className="truncate">{b.name}</span>
                    {mine && (
                      <span className="shrink-0 rounded-full border border-sun/50 px-2 text-[11px] font-medium text-sun">Sizniki</span>
                    )}
                  </span>
                  <span className="block truncate text-xs text-white/55">
                    {s.overdue.start > 0 ? closedText(s.overdue) : "Ma'lumot yo'q"}
                  </span>
                </span>
                <PercentChip pct={s.overdue.pct} kind="overdue" />
              </button>
            </li>
          );
        })}
      </ol>

      <p className="mt-auto pt-2 text-xs text-white/45">
        To'ldirilgan sariq belgi foizi past ekanini bildiradi. Boshqa filiallarning yig'uvchilari bo'yicha ma'lumot ko'rinmaydi, faqat filial yig'indisi.
      </p>
    </div>
  );
}
