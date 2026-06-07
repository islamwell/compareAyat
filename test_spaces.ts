import { compareTexts } from './src/utils';

const text1 = "وَ الحَمدُ";
const text2 = "وَالحَمدُ";

console.log(`\nTesting ${text1} vs ${text2}:`);
const diff1 = compareTexts(text1, text2, true, true, 'letter');
diff1.forEach(d => console.log(`[${d.isDifferent ? 'DIFF' : 'SAME'}] '${d.text}'`));
