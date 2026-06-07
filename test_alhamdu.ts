import { compareTexts } from './src/utils';

const text1 = "ٱلْحَمْدُ";
const text2 = "وَٱلْحَمْدُ";

console.log(`\nTesting:`);
const diff = compareTexts(text1, text2, true, true, 'letter');

const hasDiff = diff.some(d => d.isDifferent);
console.log(`Is different? ${hasDiff}`);
diff.forEach(d => {
  console.log(`[${d.isDifferent ? 'DIFF' : 'SAME'}] '${d.text}'`);
});
