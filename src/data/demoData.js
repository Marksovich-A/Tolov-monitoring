import { BRANCHES, TEST_ACCOUNT } from "../config";
import { aggregateDay, pad } from "../lib/calc";

/* Demo rejim uchun o'ydirma ma'lumotlar (haqiqiy mijoz yoki xodim yo'q) */
export const DEMO_TODAY = "2026-11-20";
export const TEST_ID = "u-test";
const DEMO_DAYS = 20;

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* 20 kunlik hisobotlar zanjiri: har kunning "boshiga" qiymati kechagi "oxiriga"dan olinadi */
function buildReports(c, rand, randInt) {
  const bigger = c.total === 500;
  let sud = randInt(5, bigger ? 30 : 15);
  let carried = randInt(30, bigger ? 90 : 55);
  let overdue = randInt(bigger ? 110 : 60, bigger ? 190 : 120);
  let prevDailyEnd = 0;
  const reports = [];

  for (let d = 1; d <= DEMO_DAYS; d++) {
    const sudEnd = Math.max(0, sud - (rand() < 0.25 ? randInt(1, 2) : 0));
    const carriedEnd = Math.max(0, carried - (rand() < 0.35 ? randInt(0, 2) : 0));
    const overdueStart = overdue + prevDailyEnd;
    const overdueEnd = Math.max(0, overdueStart - Math.round(overdueStart * (c.skill * 0.07 + rand() * 0.05)));
    const dailyStart = randInt(20, 50);
    const dailyEnd = Math.round(dailyStart * (1 - Math.min(0.99, c.skill * (0.8 + rand() * 0.2))));

    reports.push({
      date: `2026-11-${pad(d)}`,
      total: c.total,
      sud: { start: sud, end: sudEnd },
      carried: { start: carried, end: carriedEnd },
      daily: { start: dailyStart, end: dailyEnd },
      overdue: { start: overdueStart, end: overdueEnd },
    });

    sud = sudEnd;
    carried = carriedEnd;
    overdue = overdueEnd;
    prevDailyEnd = dailyEnd;
  }
  return reports;
}

/* 12 filial, har birida 3-6 yig'uvchi. Test foydalanuvchi Shovot filialida. */
export function buildDemoCollectors() {
  const rand = mulberry32(20261120);
  const randInt = (a, b) => Math.floor(rand() * (b - a + 1)) + a;
  const out = [];

  BRANCHES.forEach((b) => {
    const branchSkill = 0.6 + rand() * 0.37;
    const count = randInt(3, 6);
    for (let i = 1; i <= count; i++) {
      const c = {
        id: `${b.id}-${i}`,
        name: `Yig'uvchi ${i}`,
        branchId: b.id,
        total: rand() < 0.5 ? 300 : 500,
        skill: clamp(branchSkill + (rand() - 0.5) * 0.16, 0.55, 0.98),
      };
      out.push({ id: c.id, name: c.name, branchId: c.branchId, total: c.total, reports: buildReports(c, rand, randInt) });
    }
  });

  const test = { total: TEST_ACCOUNT.total, skill: 0.8 };
  out.push({
    id: TEST_ID,
    name: TEST_ACCOUNT.name,
    branchId: TEST_ACCOUNT.branchId,
    total: TEST_ACCOUNT.total,
    reports: buildReports(test, rand, randInt),
  });

  return out;
}

/* Hamma yig'uvchilarning hisobotlaridan filial yig'indilari (har filial, har kun) */
export function buildBranchDays(collectors) {
  const out = [];
  BRANCHES.forEach((b) => {
    const members = collectors.filter((c) => c.branchId === b.id);
    const dates = new Set();
    members.forEach((c) => c.reports.forEach((r) => dates.add(r.date)));
    [...dates].sort().forEach((date) => {
      const rows = members.flatMap((c) => c.reports.filter((r) => r.date === date));
      out.push(aggregateDay(rows, b.id, date));
    });
  });
  return out;
}
