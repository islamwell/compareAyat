const { diffArrays } = require('diff');
const p1 = 'فَقُطِعَ دابِرُ القَومِ الَّذينَ ظَلَموا وَالحَمدُ لِلَّهِ رَبِّ العالَمينَ';
const p2 = 'الحَمدُ لِلَّهِ رَبِّ العالَمينَ';

const tokenize = (t) => t.match(/[^\s]+[\s]*/g) || [];
const t1 = tokenize(p1);
const t2 = tokenize(p2);

console.log("Tokens 1:", t1);
console.log("Tokens 2:", t2);
console.log("Diff:", JSON.stringify(diffArrays(t1, t2), null, 2));
