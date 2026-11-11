import { KEYS, LABELS, num, pctText } from "../lib/calc";
import Fill from "./Fill.jsx";
import Panel from "./Panel.jsx";

/* Har bir ko'rsatkich uchun "yopilgan / qolgan" chizig'i: sariq qism yopilgan, shtrixli qism qolgan */
export default function ClosingBars({ totals }) {
  return (
    <Panel className="p-5 sm:p-6" aria-labelledby="closing-title">
      <h2 id="closing-title" className="font-display text-lg font-semibold tracking-tight">
        Qancha mijoz yopildi
      </h2>

      <div className="mt-2 divide-y divide-white/10">
        {KEYS.map((k) => {
          const f = totals[k];
          const closed = f.pct === null ? 0 : Math.min(100, Math.max(0, f.pct));
          const note = f.diff >= 0 ? `${num(f.diff)} ta yopildi` : `${num(-f.diff)} ta oshdi`;
          return (
            <div key={k} className="grid gap-2 py-4 sm:grid-cols-[7.5rem_minmax(0,1fr)_6.5rem] sm:items-center sm:gap-5">
              <div className="flex items-baseline justify-between sm:block">
                <p className="font-semibold leading-snug">{LABELS[k]}</p>
                <p className="text-sm font-semibold text-sun sm:hidden">{f.pct === null ? "–" : pctText(f.pct)}</p>
              </div>

              <div>
                <div
                  className="hatch h-3.5 overflow-hidden rounded-full bg-white/10"
                  role="img"
                  aria-label={`${LABELS[k]}: ${num(f.start)} tadan ${note}`}
                >
                  <Fill value={closed} />
                </div>
                <div className="mt-1.5 flex justify-between text-xs text-white/60">
                  <span>Boshiga: {num(f.start)}</span>
                  <span>Oxiriga: {num(f.end)}</span>
                </div>
              </div>

              <div className="hidden text-right sm:block">
                <p className="font-display text-2xl font-semibold leading-none tracking-tight">
                  {f.pct === null ? "–" : pctText(f.pct)}
                </p>
                <p className="mt-1 text-xs text-white/60">{note}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
