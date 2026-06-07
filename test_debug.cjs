const { diffArrays, diffChars } = require('diff');

function isSimilar(a, b) {
  const d = diffChars(a, b);
  let m = 0, c = 0;
  for (const p of d) {
    if (p.added || p.removed) c += p.value.length;
    else m += p.value.length;
  }
  return m >= c;
}

const normalizeArabicText = (t) => t;

function compareTexts(text1, text2, vowelInsensitive, mode = 'letter') {
  const processText = vowelInsensitive ? normalizeArabicText : (t) => t;
  const p1 = processText(text1);
  const p2 = processText(text2);

  const tokenize = (t) => t.match(/[^\s]+[\s]*/g) || [];
  const t1 = tokenize(p1);
  const t2 = tokenize(p2);

  const arrayDiff = diffArrays(t1, t2);
  let diffResult = [];

  if (mode === 'word') {
    for (const part of arrayDiff) {
      diffResult.push({
        value: part.value.join(''),
        added: part.added,
        removed: part.removed
      });
    }
  } else {
    for (let i = 0; i < arrayDiff.length; i++) {
      const part = arrayDiff[i];
      if (part.removed && i + 1 < arrayDiff.length && arrayDiff[i+1].added) {
        let remTokens = [...part.value];
        let addTokens = [...arrayDiff[i+1].value];
        const localDiff = [];

        while (remTokens.length > 0 && addTokens.length > 0) {
          const r = remTokens[remTokens.length - 1];
          const a = addTokens[addTokens.length - 1];
          if (isSimilar(r, a)) {
            localDiff.unshift(...diffChars(r, a));
            remTokens.pop(); addTokens.pop();
            continue;
          }
          break;
        }

        const frontDiff = [];
        while (remTokens.length > 0 && addTokens.length > 0) {
          const r = remTokens[0];
          const a = addTokens[0];
          if (isSimilar(r, a)) {
            frontDiff.push(...diffChars(r, a));
            remTokens.shift(); addTokens.shift();
            continue;
          }
          break;
        }

        for (const r of remTokens) frontDiff.push({value: r, removed: true});
        for (const a of addTokens) frontDiff.push({value: a, added: true});

        diffResult.push(...frontDiff, ...localDiff);
        i++; 
      } else if (part.added && i + 1 < arrayDiff.length && arrayDiff[i+1].removed) {
        let addedTokens = [...part.value];
        let remTokens = [...arrayDiff[i+1].value];
        const localDiff = [];

        while (remTokens.length > 0 && addedTokens.length > 0) {
          const r = remTokens[remTokens.length - 1];
          const a = addedTokens[addedTokens.length - 1];
          if (isSimilar(r, a)) {
            localDiff.unshift(...diffChars(r, a));
            remTokens.pop(); addedTokens.pop();
            continue;
          }
          break;
        }

        const frontDiff = [];
        while (remTokens.length > 0 && addedTokens.length > 0) {
          const r = remTokens[0];
          const a = addedTokens[0];
          if (isSimilar(r, a)) {
            frontDiff.push(...diffChars(r, a));
            remTokens.shift(); addedTokens.shift();
            continue;
          }
          break;
        }

        for (const r of remTokens) frontDiff.push({value: r, removed: true});
        for (const a of addedTokens) frontDiff.push({value: a, added: true});

        diffResult.push(...frontDiff, ...localDiff);
        i++;
      } else if (part.removed || part.added) {
        diffResult.push({
          value: part.value.join(''),
          added: part.added,
          removed: part.removed
        });
      } else {
        diffResult.push({
          value: part.value.join(''),
          added: false,
          removed: false
        });
      }
    }
  }

  const dispChars = Array.from(text1);
  let dispIdx = 0;
  const runs = [];

  for (const part of diffResult) {
    if (part.added) continue;

    const normLen = part.value.length;
    let matchedDispText = '';
    let normCount = 0;

    while (normCount < normLen && dispIdx < dispChars.length) {
      const ch = dispChars[dispIdx++];
      matchedDispText += ch;
      const normCh = processText(ch);
      if (normCh && normCh.length > 0) {
        normCount += normCh.length;
      }
    }

    while (dispIdx < dispChars.length) {
      const nextNorm = processText(dispChars[dispIdx]);
      if (nextNorm === '') {
        matchedDispText += dispChars[dispIdx++];
      } else {
        break;
      }
    }

    if (matchedDispText) {
      runs.push({ text: matchedDispText, isDifferent: !!part.removed });
    }
  }

  if (dispIdx < dispChars.length) {
    const remaining = dispChars.slice(dispIdx).join('');
    if (runs.length > 0) {
      runs[runs.length - 1].text += remaining;
    } else {
      runs.push({ text: remaining, isDifferent: false });
    }
  }

  return runs;
}

const tests = [
  { p1: 'فَقُطِعَ دابِرُ القَومِ الَّذينَ ظَلَموا وَالحَمدُ لِلَّهِ رَبِّ العالَمينَ', p2: 'الحَمدُ لِلَّهِ رَبِّ العالَمينَ' },
  { p1: 'وَقيلَ الحَمدُ لِلَّهِ رَبِّ العالَمينَ', p2: 'الحَمدُ لِلَّهِ رَبِّ العالَمينَ' },
  { p1: 'الحَمدُ لِلَّهِ رَبِّ العالَمينَ', p2: 'الحَمدُ لِلَّهِ رَبِّ العالَمينَ' },
  { p1: 'بِسمِ اللَّهِ الرَّحمٰنِ الرَّحيمِ', p2: 'الرَّحمٰنِ الرَّحيمِ' },
  { p1: 'مالِكِ يَومِ الدّينِ', p2: 'يَومِ الدّينِ' },
  { p1: 'إِيّاكَ نَعبُدُ وَإِيّاكَ نَستَعينُ', p2: 'إِيّاكَ نَستَعينُ' },
  { p1: 'اهدِنَا الصِّراطَ المُستَقيمَ', p2: 'الصِّراطَ المُستَقيمَ' },
  { p1: 'صِراطَ الَّذينَ أَنعَمتَ عَلَيهِم غَيرِ المَغضوبِ عَلَيهِم وَلَا الضّالّينَ', p2: 'غَيرِ المَغضوبِ عَلَيهِم' },
  { p1: 'يَعْلَمُونَ', p2: 'تَعْلَمُونَ' },
  { p1: 'وَمَا تَفْعَلُوا مِنْ خَيْرٍ فَإِنَّ اللَّهَ بِهِ عَلِيمٌ', p2: 'بِهِ عَلِيمٌ' }
];

console.log("=== RUNNING TESTS ===");
for (let i = 0; i < tests.length; i++) {
  const { p1, p2 } = tests[i];
  console.log(`\nTest ${i+1}:`);
  const result = compareTexts(p1, p2, false, 'letter');
  const rendered = result.map(r => r.isDifferent ? `[${r.text}]` : r.text).join('');
  console.log(`Rendered: ${rendered}`);
}
