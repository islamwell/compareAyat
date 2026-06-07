import { compareTexts } from './src/utils';

const text1 = "الحَمدُ";
const text2 = "وَالحَمدُ";

console.log(`\nTesting ${text2} vs ${text1} (LETTER mode):`);
const diff1 = compareTexts(text2, text1, true, true, 'letter');
diff1.forEach(d => console.log(`[${d.isDifferent ? 'DIFF' : 'SAME'}] '${d.text}'`));

console.log(`\nTesting ${text2} vs ${text1} (WORD mode):`);
const diff2 = compareTexts(text2, text1, true, true, 'word');
diff2.forEach(d => console.log(`[${d.isDifferent ? 'DIFF' : 'SAME'}] '${d.text}'`));
