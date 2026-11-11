import { num } from "./calc";

/* "1 240 dan 156 ta undirildi" yoki o'sgan bo'lsa "1 240 dan 36 taga oshdi" */
export function closedText(f) {
  return f.diff >= 0
    ? `${num(f.start)} dan ${num(f.diff)} ta undirildi`
    : `${num(f.start)} dan ${num(-f.diff)} taga oshdi`;
}
