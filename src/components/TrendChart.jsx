import { useMemo } from "react";
import { pad } from "../lib/calc";
import Panel from "./Panel.jsx";

const W = 480;
const H = 220;
const L = 34;
const R = 14;
const T = 12;
const B = 26;

/* Oy boshidan bugungacha kunlar bo'yicha foiz. `rows` kunlik qatorlar (filial yig'indilari),
   bir kunda bir nechta qator bo'lsa ular qo'shiladi. Ma'lumot bo'lmagan kunlarda chiziq uziladi. */
export default function TrendChart({ rows, today }) {
  const n = Number(today.slice(8));
  const prefix = today.slice(0, 8);

  const series = useMemo(() => {
    const byDate = new Map();
    rows.forEach((r) => {
      const a = byDate.get(r.date) ?? { daily: [0, 0], overdue: [0, 0] };
      a.daily[0] += r.daily.start;
      a.daily[1] += r.daily.end;
      a.overdue[0] += r.overdue.start;
      a.overdue[1] += r.overdue.end;
      byDate.set(r.date, a);
    });

    const out = { daily: [], overdue: [] };
    for (let d = 1; d <= n; d++) {
      const a = byDate.get(`${prefix}${pad(d)}`);
      for (const k of ["daily", "overdue"]) {
        out[k].push(a && a[k][0] > 0 ? Math.max(0, ((a[k][0] - a[k][1]) / a[k][0]) * 100) : null);
      }
    }
    return out;
  }, [rows, n, prefix]);

  const x = (i) => (n > 1 ? L + (i * (W - L - R)) / (n - 1) : L + (W - L - R) / 2);
  const y = (v) => T + (H - T - B) * (1 - v / 100);

  const path = (arr) => {
    let d = "";
    let pen = false;
    arr.forEach((v, i) => {
      if (v === null) {
        pen = false;
        return;
      }
      d += `${pen ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)} `;
      pen = true;
    });
    return d;
  };

  const last = (arr) => {
    for (let i = arr.length - 1; i >= 0; i--) if (arr[i] !== null) return i;
    return -1;
  };

  const ticks = Array.from({ length: n }, (_, i) => i + 1).filter((d) => d === 1 || d % 5 === 0);
  const li = last(series.daily);
  const lo = last(series.overdue);

  return (
    <Panel className="p-5 sm:p-6" aria-labelledby="trend-title">
      <h2 id="trend-title" className="font-display text-lg font-semibold tracking-tight">
        Shu oy bo'yicha dinamika, foizda
      </h2>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 h-auto w-full"
        role="img"
        aria-label="Oy kunlari bo'yicha kunlik mijozlar va muddati o'tganlarni yopish foizi"
      >
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="stroke-white/10" />
            <text x={L - 8} y={y(v) + 4} textAnchor="end" className="fill-white/50 text-[13px]">
              {v}
            </text>
          </g>
        ))}

        {ticks.map((d) => (
          <text key={d} x={x(d - 1)} y={H - 6} textAnchor="middle" className="fill-white/50 text-[13px]">
            {d}
          </text>
        ))}

        <path d={path(series.daily)} fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-sun" />
        <path
          d={path(series.overdue)}
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-white [stroke-dasharray:6_5]"
        />
        {li >= 0 && <circle cx={x(li)} cy={y(series.daily[li])} r="4" strokeWidth="2.5" className="fill-ink stroke-sun" />}
        {lo >= 0 && <circle cx={x(lo)} cy={y(series.overdue[lo])} r="4" strokeWidth="2.5" className="fill-ink stroke-white" />}
      </svg>

      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-white/80">
        <li className="flex items-center gap-2">
          <span className="h-0.5 w-6 rounded bg-sun" aria-hidden="true" />
          Kunlik mijozlar
        </li>
        <li className="flex items-center gap-2">
          <span className="h-0 w-6 border-t-2 border-dashed border-white" aria-hidden="true" />
          Muddati o'tganlar
        </li>
      </ul>
    </Panel>
  );
}
