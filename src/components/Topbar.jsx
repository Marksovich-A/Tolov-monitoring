import { APP_TITLE } from "../config";
import { phoneLabel } from "../lib/phone";
import Segmented from "./Segmented.jsx";

const PERIODS = [
  { value: "day", label: "Bugun" },
  { value: "week", label: "Hafta" },
  { value: "month", label: "Oy" },
];

export default function Topbar({ period, onPeriod, user, mode, onSignOut, onOpenForm, onMenu }) {
  return (
    <header className="z-30 lg:sticky lg:top-0 border-b border-white/10 bg-ink/60 backdrop-blur-xl">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
        <div className="flex w-full min-w-0 items-center gap-3 lg:w-auto">
          <button
            type="button"
            onClick={onMenu}
            aria-label="Filiallar ro'yxatini ochish"
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 lg:hidden"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h10" />
            </svg>
          </button>
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-sun">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <rect x="2" y="4" width="20" height="4" rx="1.5" fill="#0a0a0a" />
              <rect x="2" y="10" width="14" height="4" rx="1.5" fill="#0a0a0a" />
              <rect x="2" y="16" width="8" height="4" rx="1.5" fill="#0a0a0a" />
            </svg>
          </span>
          <span className="min-w-0 truncate font-display text-base font-semibold tracking-tight sm:text-lg">{APP_TITLE}</span>
        </div>

        <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:gap-3 lg:ml-auto lg:w-auto lg:justify-end">
          <Segmented label="Davr" options={PERIODS} value={period} onChange={onPeriod} />

          <div className="flex items-center gap-2 sm:gap-3">
            {mode === "demo" && (
              <span className="hidden rounded-full border border-sun/40 px-2.5 py-0.5 text-xs text-sun xl:inline">Demo ma'lumotlar</span>
            )}
            <span className="hidden text-sm text-white/60 2xl:inline">
              {user.name}, {phoneLabel(user.phone)}
            </span>
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-xl border border-white/15 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
            >
              Chiqish
            </button>
            <button
              type="button"
              onClick={onOpenForm}
              className="rounded-xl bg-sun px-3.5 py-2 text-sm font-semibold text-ink transition hover:brightness-95"
            >
              Bugungi hisobot
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
