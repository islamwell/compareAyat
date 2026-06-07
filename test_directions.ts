import { compareTexts } from './src/utils';

const text1 = "الحَمدُ";
const text2 = "وَالحَمدُ";

console.log(`\nTesting ${text1} vs ${text2}:`);
const diff1 = compareTexts(text1, text2, true, true, 'letter');
diff1.forEach(d => console.log(`[${d.isDifferent ? 'DIFF' : 'SAME'}] '${d.text}'`));

console.log(`\nTesting ${text2} vs ${text1}:`);
const diff2 = compareTexts(text2, text1, true, true, 'letter');
diff2.forEach(d => console.log(`[${d.isDifferent ? 'DIFF' : 'SAME'}] '${d.text}'`));
