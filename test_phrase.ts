import { compareTexts } from './src/utils';

const text1 = "ظَلَمُوا۟ ۚ وَٱلْحَمْدُ";
const text2 = "ظَلَموا وَالحَمدُ";

console.log(`\nTesting:`);
const diff = compareTexts(text1, text2, true, true, 'letter');

diff.forEach(d => {
  console.log(`[${d.isDifferent ? 'DIFF' : 'SAME'}] '${d.text}'`);
});
