import { num } from "../lib/calc";
import PercentChip from "./PercentChip.jsx";
import Panel from "./Panel.jsx";

const cell = "px-1.5 py-2.5 text-right";
const groupStart = "border-l border-white/10";

/* Bitta ko'rsatkich guruhi: boshiga, farqi, oxiriga (+ foizi) */
function FlowCells({ f, withPct = false, kind }) {
  return (
    <>
      <td className={`${cell} ${groupStart}`}>{num(f.start)}</td>
      <td className={cell}>{num(f.diff)}</td>
      <td className={cell}>{num(f.end)}</td>
      {withPct && (
        <td className={cell}>
          <PercentChip pct={f.pct} kind={kind} />
        </td>
      )}
    </>
  );
}

function SubHead({ withPct = false }) {
  const th = "px-1.5 py-2 text-right text-xs font-medium text-white/60";
  return (
    <>
      <th className={`${th} ${groupStart}`}>Boshiga</th>
      <th className={th}>Farqi</th>
      <th className={th}>Oxiriga</th>
      {withPct && <th className={th}>Foizi</th>}
    </>
  );
}

const group = `${groupStart} bg-white/5 px-1.5 py-2.5 text-center text-xs font-semibold`;
const sticky = "sticky left-0 z-10 bg-[#0f0f0f]";

/* Faqat foydalanuvchining O'Z filiali: har bir yig'uvchi bitta qator, pastda filial jami.
   "Boshiga" = kun boshiga, "Oxiriga" = kun oxiriga. */
export default function ReportTable({ title, rows, totals, meId, note }) {
  return (
    <Panel className="overflow-hidden" aria-labelledby="tb-title">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 pb-3 pt-5 sm:px-6">
        <h2 id="tb-title" className="font-display text-lg font-semibold tracking-tight">
          {title}
        </h2>
        <p className="max-w-xl text-xs text-white/55">{note}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-[13px]">
          <thead>
            <tr className="border-y border-white/10">
              <th rowSpan="2" className={`${sticky} px-3 py-2.5 text-left text-xs font-semibold`}>
                Yig'uvchi
              </th>
              <th rowSpan="2" className={`${groupStart} px-2 py-2.5 text-right text-xs font-semibold`}>
                Jami mijoz
              </th>
              <th colSpan="3" className={group}>
                SUD
              </th>
              <th colSpan="3" className={group}>
                O'tgan oydan qolganlar
              </th>
              <th colSpan="4" className={group}>
                Kunlik mijozlar
              </th>
              <th colSpan="4" className={group}>
                Muddati o'tgan
              </th>
              <th rowSpan="2" className={`${groupStart} px-3 py-2.5 text-right text-xs font-semibold`}>
                Kunga pros
              </th>
            </tr>
            <tr className="border-b border-white/10">
              <SubHead />
              <SubHead />
              <SubHead withPct />
              <SubHead withPct />
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {rows.map(({ c, s }) => {
              const isMe = c.id === meId;
              return (
                <tr key={c.id} className={isMe ? "bg-sun/10" : "hover:bg-white/5"}>
                  <th
                    scope="row"
                    className={`${sticky} whitespace-nowrap px-3 py-2.5 text-left font-medium ${isMe ? "shadow-[inset_3px_0_0_var(--color-sun)]" : ""}`}
                  >
                    {c.name}
                    {isMe && <span className="ml-2 rounded-full border border-sun/50 px-2 text-[11px] font-medium text-sun">Siz</span>}
                  </th>
                  <td className={`${cell} ${groupStart}`}>{num(s.total)}</td>
                  <FlowCells f={s.sud} />
                  <FlowCells f={s.carried} />
                  <FlowCells f={s.daily} withPct kind="daily" />
                  <FlowCells f={s.overdue} withPct kind="overdue" />
                  <td className={`${cell} ${groupStart} px-3 font-semibold`}>{num(s.pros)}</td>
                </tr>
              );
            })}
          </tbody>

          <tfoot>
            <tr className="border-t-2 border-sun/60 bg-white/5 font-semibold">
              <th scope="row" className={`${sticky} px-3 py-2.5 text-left`}>
                Filial jami
              </th>
              <td className={`${cell} ${groupStart}`}>{num(totals.total)}</td>
              <FlowCells f={totals.sud} />
              <FlowCells f={totals.carried} />
              <FlowCells f={totals.daily} withPct kind="daily" />
              <FlowCells f={totals.overdue} withPct kind="overdue" />
              <td className={`${cell} ${groupStart} px-3`}>{num(totals.pros)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Panel>
  );
}
