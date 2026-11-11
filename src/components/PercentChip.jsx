import { THRESHOLDS, pctText } from "../lib/calc";

/* Uch rang bilan ifodalash: sariq to'ldirilgan = foizi past (e'tibor kerak),
   sariq chiziqli = o'rtacha, oq chiziqli = yaxshi. Rangdan tashqari matn ham bor. */
const STYLES = {
  bad: "bg-sun text-ink",
  mid: "border border-sun/60 bg-sun/10 text-sun",
  good: "border border-white/25 bg-white/10 text-white",
};
const WORDS = { bad: "past", mid: "o'rtacha", good: "yaxshi" };

function level(pct, kind) {
  const [low, high] = THRESHOLDS[kind];
  return pct < low ? "bad" : pct < high ? "mid" : "good";
}

export default function PercentChip({ pct, kind }) {
  if (pct === null) return <span className="text-white/40">–</span>;
  const l = level(pct, kind);
  return (
    <span className={`inline-block min-w-[3.6rem] rounded-full px-2.5 py-0.5 text-center text-xs font-semibold ${STYLES[l]}`}>
      <span className="sr-only">{WORDS[l]}: </span>
      {pctText(pct)}
    </span>
  );
}
