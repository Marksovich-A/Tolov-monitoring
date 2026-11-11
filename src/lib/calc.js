/* =========================================================
   Hisob-kitob qoidalari (toza funksiyalar, React'ga bog'liq emas)

     farqi      = kun boshiga - kun oxiriga
     foizi      = farqi / kun boshiga * 100
     kunga pros = SUD + o'tgan oydan qolgan + kunlik + muddati o'tgan
                  (hammasi kun oxiriga)
     ertangi kun boshiga:
       SUD, o'tgan oydan qolgan = bugungi kun oxiriga
       muddati o'tgan           = bugungi muddati o'tgan oxiriga
                                  + bugungi to'lamagan kunlik mijozlar

   Filial yig'indisi ("branchDays") har kuni uchun yig'uvchilar hisobotlarining
   yig'indisi. U hisobot bilan bir xil shaklda, shuning uchun bir xil
   funksiyalar ishlaydi.
   ========================================================= */

export const KEYS = ["sud", "carried", "daily", "overdue"];

export const LABELS = {
  sud: "SUD",
  carried: "O'tgan oydan qolganlar",
  daily: "Kunlik mijozlar",
  overdue: "Muddati o'tgan",
};

/* Foiz rangi chegaralari: [past, yaxshi]. Past < birinchi, yaxshi >= ikkinchi. */
export const THRESHOLDS = { daily: [50, 80], overdue: [10, 15] };

export const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
export const WEEKDAYS = ["yakshanba", "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba"];

/* ---------- Format ---------- */
export const sum = (arr) => arr.reduce((a, b) => a + b, 0);
export const pad = (n) => String(n).padStart(2, "0");
export const num = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
export const pctText = (p) => p.toFixed(1).replace(".", ",") + "%";

/* ---------- Sana ---------- */
export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseISO = (iso) => new Date(iso + "T00:00:00");

export function longDate(iso) {
  const d = parseISO(iso);
  return `${d.getDate()}-${MONTHS[d.getMonth()]}, ${WEEKDAYS[d.getDay()]}`;
}

/* Tanlangan davr: bugun, shu hafta (dushanbadan) yoki shu oy (1-sanadan) */
export function periodRange(period, today) {
  if (period === "day") return { from: today, to: today };
  if (period === "week") {
    const t = parseISO(today);
    const start = new Date(t);
    start.setDate(t.getDate() - ((t.getDay() + 6) % 7));
    return { from: toISO(start), to: today };
  }
  return { from: today.slice(0, 8) + "01", to: today };
}

export function periodLabel(period, today) {
  if (period === "day") return longDate(today);
  const { from, to } = periodRange(period, today);
  const a = parseISO(from);
  const b = parseISO(to);
  return `${a.getDate()}–${b.getDate()}-${MONTHS[b.getMonth()]}`;
}

/* ---------- Ko'rsatkichlar ---------- */

/* Bitta ko'rsatkich: boshiga, oxiriga, farqi, foizi */
export const flow = (start, end) => ({
  start,
  end,
  diff: start - end,
  pct: start > 0 ? ((start - end) / start) * 100 : null,
});

export const outstanding = (r) => r.sud.end + r.carried.end + r.daily.end + r.overdue.end;

const byDate = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0);

/* Kunlik qatorlar (hisobotlar yoki filial yig'indilari) bo'yicha tanlangan davr yig'indisi.
   Kunlik mijozlar har kuni yangidan boshlanadi, shuning uchun ular kunlar
   bo'yicha qo'shiladi. Qolganlarida davr boshi va oxiri olinadi. */
export function summarizeRows(allRows, range, fallbackTotal = 0) {
  const rows = allRows.filter((r) => r.date >= range.from && r.date <= range.to).sort(byDate);
  const out = { total: fallbackTotal, pros: 0, empty: rows.length === 0 };

  if (rows.length === 0) {
    KEYS.forEach((k) => (out[k] = flow(0, 0)));
    return out;
  }

  const first = rows[0];
  const last = rows[rows.length - 1];
  out.total = last.total;
  out.pros = outstanding(last);
  KEYS.forEach((k) => {
    out[k] =
      k === "daily"
        ? flow(sum(rows.map((r) => r.daily.start)), sum(rows.map((r) => r.daily.end)))
        : flow(first[k].start, last[k].end);
  });
  return out;
}

/* Bir nechta yig'indini qo'shish (filiallar yoki yig'uvchilar bo'yicha jami) */
export function totalsOf(list) {
  const t = { total: sum(list.map((s) => s.total)), pros: sum(list.map((s) => s.pros)) };
  KEYS.forEach((k) => {
    t[k] = flow(sum(list.map((s) => s[k].start)), sum(list.map((s) => s[k].end)));
  });
  return t;
}

/* Foiz bo'yicha tartiblash. dir: "asc" (past foiz tepada) yoki "desc" (yuqori foiz tepada).
   Ma'lumoti yo'q (foizi null) elementlar doim oxirida turadi. */
export function sortByPct(items, getPct, dir = "asc") {
  const sign = dir === "asc" ? 1 : -1;
  return items.slice().sort((a, b) => {
    const pa = getPct(a);
    const pb = getPct(b);
    if (pa === null && pb === null) return 0;
    if (pa === null) return 1;
    if (pb === null) return -1;
    return (pa - pb) * sign;
  });
}

/* ---------- Filial yig'indisi ---------- */

export const emptyDay = (branchId, date) => ({
  branchId,
  date,
  total: 0,
  sud: { start: 0, end: 0 },
  carried: { start: 0, end: 0 },
  daily: { start: 0, end: 0 },
  overdue: { start: 0, end: 0 },
});

/* Bir kunlik hisobotlar yig'indisi (demo ma'lumot uchun) */
export function aggregateDay(rows, branchId, date) {
  const out = emptyDay(branchId, date);
  rows.forEach((r) => {
    out.total += r.total;
    KEYS.forEach((k) => {
      out[k].start += r[k].start;
      out[k].end += r[k].end;
    });
  });
  return out;
}

/* Yig'uvchi hisobotini saqlaganda filial yig'indisini yangilash:
   yangi qiymat minus eski qiymat (eski bo'lmasa 0). Firestore tranzaksiyasi ichida ishlatiladi. */
export function applyDelta(agg, oldReport, next) {
  const out = { ...agg, total: agg.total + next.total - (oldReport?.total ?? 0) };
  KEYS.forEach((k) => {
    out[k] = {
      start: agg[k].start + next[k].start - (oldReport?.[k].start ?? 0),
      end: agg[k].end + next[k].end - (oldReport?.[k].end ?? 0),
    };
  });
  return out;
}

/* ---------- Hisobot kiritish ---------- */

/* Berilgan sanadan oldingi oxirgi hisobot (hisobotlar sana bo'yicha tartiblangan) */
export function previousReport(reports, date) {
  for (let i = reports.length - 1; i >= 0; i--) {
    if (reports[i].date < date) return reports[i];
  }
  return null;
}

/* Kechagi hisobotdan bugungi "kun boshiga" qiymatlari */
export function autoStarts(prev) {
  if (!prev) return null;
  return {
    sud: prev.sud.end,
    carried: prev.carried.end,
    overdue: prev.overdue.end + prev.daily.end,
  };
}
