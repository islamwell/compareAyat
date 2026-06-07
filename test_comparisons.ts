import { compareTexts } from './src/utils';
import { normalizeArabicText } from './src/quranService';

const text1_1_2 = "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ";
const text2_1_2 = "الحَمدُ لِلَّهِ رَبِّ العالَمينَ";

const text1_6_45 = "فَقُطِعَ دَابِرُ ٱلْقَوْمِ ٱلَّذِينَ ظَلَمُوا۟ ۚ وَٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ";
const text2_6_45 = "فَقُطِعَ دَابِرُ القَومِ الَّذينَ ظَلَموا وَالحَمدُ لِلَّهِ رَبِّ العالَمينَ";

function test(name: string, t1: string, t2: string) {
  console.log(`\nTesting ${name}:`);
  const diff = compareTexts(t1, t2, true, true, 'letter');
  
  const hasDiff = diff.some(d => d.isDifferent);
  console.log(`Is different? ${hasDiff}`);
  if (hasDiff) {
    diff.forEach(d => {
      console.log(`[${d.isDifferent ? 'DIFF' : 'SAME'}] '${d.text}'`);
    });
  }
}

test('1:2', text1_1_2, text2_1_2);
test('6:45', text1_6_45, text2_6_45);
