import { diffArrays, diffChars } from 'diff';

const t1 = ["فَقُطِعَ ", "دابِرُ ", "القَومِ ", "الَّذينَ ", "ظَلَموا ", "وَالحَمدُ ", "لِلَّهِ ", "رَبِّ ", "العالَمينَ"];
const t2 = ["الحَمدُ ", "لِلَّهِ ", "رَبِّ ", "العالَمينَ"];

const arrayDiff = diffArrays(t1, t2);
console.log(JSON.stringify(arrayDiff, null, 2));
