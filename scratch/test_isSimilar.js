import { diffChars } from 'diff';
const a = "وَالحَمدُ ";
const b = "الحَمدُ ";
const d = diffChars(a, b);
let m = 0, c = 0;
for (const p of d) {
  if (p.added || p.removed) c += p.value.length;
  else m += p.value.length;
}
console.log({m, c, isSimilar: m >= c});
