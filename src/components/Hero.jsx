import { num, pctText, periodLabel } from "../lib/calc";
import Fill from "./Fill.jsx";
import Panel from "./Panel.jsx";

const PREFIX = { day: "Bugun", week: "Bu hafta", month: "Shu oy" };

/* Asosiy natija: muddati o'tgan mijozlardan qanchadan qanchasi undirildi */
export default function Hero({ period, today, scopeLabel, f }) {
  const prefix = PREFIX[period];
  let headline;
  if (f.pct === null) headline = `${prefix} hali ma'lumot kiritilmagan`;
  else if (f.pct >= 0) headline = `${prefix} muddati o'tganlarning ${pctText(f.pct)} undirildi`;
  else headline = `${prefix} muddati o'tganlar ${pctText(-f.pct)} ga oshdi`;

  const grew = f.diff < 0;
  const filled = f.pct === null ? 0 : Math.min(100, Math.max(0, f.pct));

  return (
    <Panel tone="sun" className="p-5 sm:p-8" aria-live="polite">
      <p className="text-sm text-white/70">
        {scopeLabel}, {periodLabel(period, today)}
      </p>
      <h1 className="mt-2 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
        {headline}
      </h1>

      <div className="mt-7 grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-end sm:gap-10">
        <div>
          <p className="font-display text-5xl font-bold leading-none tracking-tight text-sun sm:text-6xl">
            {num(Math.abs(f.diff))}
            <span className="text-white/45"> / {num(f.start)}</span>
          </p>
          <p className="mt-2 text-sm text-white/70">
            {grew ? "ta mijozga oshdi" : "ta mijoz undirildi"}, kun boshidagi muddati o'tganlardan
          </p>
        </div>

        <div>
          <div className="h-3.5 overflow-hidden rounded-full bg-white/15">
            <Fill value={filled} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-white/65">
            <span>0%</span>
            <span>Oxirida {num(f.end)} ta qoldi</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}
