import { useEffect, useMemo, useState } from "react";
import { BRANCHES, branchName } from "../config";
import { periodLabel, periodRange, sortByPct, summarizeRows, totalsOf } from "../lib/calc";
import ClosingBars from "./ClosingBars.jsx";
import Hero from "./Hero.jsx";
import Panel from "./Panel.jsx";
import ReportDialog from "./ReportDialog.jsx";
import ReportTable from "./ReportTable.jsx";
import Sidebar from "./Sidebar.jsx";
import Toast from "./Toast.jsx";
import Topbar from "./Topbar.jsx";
import TrendChart from "./TrendChart.jsx";

/* Asosiy sahifa: holatni saqlaydi va bo'laklarni bir-biriga ulaydi.

   Ko'rinish qoidasi: viloyat va hamma filiallarning YIG'INDISI hammaga ochiq (branchDays).
   Yig'uvchilar bo'yicha batafsil jadval faqat foydalanuvchining o'z filialida ko'rinadi (collectors). */
export default function Dashboard({ data }) {
  const { user, collectors, branchDays, today, mode, saveReport, auth } = data;

  const [scope, setScope] = useState("all"); // "all" yoki filial id si
  const [period, setPeriod] = useState("day");
  const [sortDir, setSortDir] = useState("asc"); // "asc": past foiz tepada
  const [drawer, setDrawer] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (!drawer) return undefined;
    const onKey = (e) => e.key === "Escape" && setDrawer(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer]);

  const range = useMemo(() => periodRange(period, today), [period, today]);

  const daysByBranch = useMemo(() => {
    const map = new Map();
    branchDays.forEach((d) => {
      if (!map.has(d.branchId)) map.set(d.branchId, []);
      map.get(d.branchId).push(d);
    });
    return map;
  }, [branchDays]);

  const branchRows = useMemo(
    () => BRANCHES.map((b) => ({ b, s: summarizeRows(daysByBranch.get(b.id) ?? [], range) })),
    [daysByBranch, range]
  );
  const sortedBranches = useMemo(() => sortByPct(branchRows, (r) => r.s.overdue.pct, sortDir), [branchRows, sortDir]);
  const region = useMemo(() => totalsOf(branchRows.map((r) => r.s)), [branchRows]);

  const isAll = scope === "all";
  const isMine = scope === user.branchId;
  const current = isAll ? region : branchRows.find((r) => r.b.id === scope).s;
  const chartRows = isAll ? branchDays : daysByBranch.get(scope) ?? [];
  const scopeLabel = isAll ? `Viloyat bo'yicha, ${BRANCHES.length} filial` : `${branchName(scope)} filiali`;

  /* Faqat o'z filialidagi yig'uvchilar */
  const collectorRows = useMemo(
    () =>
      sortByPct(
        collectors.map((c) => ({ c, s: summarizeRows(c.reports, range, c.total) })),
        (r) => r.s.overdue.pct,
        sortDir
      ),
    [collectors, range, sortDir]
  );
  const collectorTotals = useMemo(() => totalsOf(collectorRows.map((r) => r.s)), [collectorRows]);

  const me = collectors.find((c) => c.id === user.id) ?? { id: user.id, total: user.total, reports: [] };

  async function handleSave(report) {
    await saveReport(report);
    setToast("Hisobot saqlandi");
  }

  const selectScope = (id) => {
    setScope(id);
    setDrawer(false);
  };

  const sidebar = (onClose) => (
    <Sidebar
      rows={sortedBranches}
      region={region}
      scope={scope}
      onScope={selectScope}
      myBranchId={user.branchId}
      sortDir={sortDir}
      onSortDir={setSortDir}
      onClose={onClose}
    />
  );

  const note = `${periodLabel(period, today)}. Farqi = kun boshiga − kun oxiriga, foizi = farqi / kun boshiga.${
    period === "day" ? "" : " Kunlik mijozlar kunlar yig'indisi, qolganlari davr boshi va oxiri bo'yicha."
  }`;

  return (
    <div className="lg:grid lg:grid-cols-[20rem_minmax(0,1fr)]">
      {/* Kompyuterda doimiy yon panel */}
      <aside className="sticky top-0 hidden h-screen overflow-y-auto border-r border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl lg:block">
        {sidebar(null)}
      </aside>

      {/* Telefonda yon panel chap tomondan chiqadi */}
      <div className={`fixed inset-0 z-40 lg:hidden ${drawer ? "" : "pointer-events-none"}`}>
        <div
          onClick={() => setDrawer(false)}
          className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${drawer ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          inert={!drawer}
          className={`absolute inset-y-0 left-0 w-[88%] max-w-sm overflow-y-auto border-r border-white/10 bg-ink/90 p-5 backdrop-blur-xl transition-transform duration-300 ${
            drawer ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebar(() => setDrawer(false))}
        </aside>
      </div>

      <div className="min-w-0">
        <Topbar
          period={period}
          onPeriod={setPeriod}
          user={user}
          mode={mode}
          onSignOut={() => auth.signOut()}
          onOpenForm={() => setFormOpen(true)}
          onMenu={() => setDrawer(true)}
        />

        <main className="mx-auto grid max-w-7xl gap-4 px-4 pb-16 pt-5 sm:gap-6 sm:px-6 sm:pt-8">
          <Hero period={period} today={today} scopeLabel={scopeLabel} f={current.overdue} />

          <div className="grid gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] xl:items-start">
            <ClosingBars totals={current} />
            <TrendChart rows={chartRows} today={today} />
          </div>

          {isMine ? (
            <ReportTable
              title={`${branchName(user.branchId)} filiali yig'uvchilari`}
              rows={collectorRows}
              totals={collectorTotals}
              meId={user.id}
              note={note}
            />
          ) : (
            <Panel className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-sun/40 bg-sun/10 text-sun">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V8a4 4 0 018 0v3" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg font-semibold tracking-tight">
                  {isAll ? "Yig'uvchilar bo'yicha ma'lumot o'z filialingizda" : "Bu filialning yig'uvchilari ko'rinmaydi"}
                </h2>
                <p className="mt-1 text-sm text-white/65">
                  {isAll
                    ? "Viloyat va filiallar yig'indisi hammaga ochiq. Kim nechta undirganini faqat o'z filialingizda ko'rasiz."
                    : "Boshqa filiallar uchun faqat filial yig'indisi ochiq. Kim nechta undirgani ko'rsatilmaydi."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setScope(user.branchId)}
                className="rounded-xl border border-sun/60 px-4 py-2.5 text-sm font-semibold text-sun transition hover:bg-sun hover:text-ink"
              >
                {branchName(user.branchId)} filialiga o'tish
              </button>
            </Panel>
          )}
        </main>
      </div>

      <ReportDialog open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} me={me} today={today} />
      <Toast text={toast} />
    </div>
  );
}
