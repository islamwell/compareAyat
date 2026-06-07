const { diffArrays, diffChars } = require('diff');

function isSimilar(a, b, ignoreWhiteSpace = true) {
  const normA = ignoreWhiteSpace ? a.replace(/\s+/g, '') : a;
  const normB = ignoreWhiteSpace ? b.replace(/\s+/g, '') : b;
  const d = diffChars(normA, normB);
  let m = 0, c = 0;
  for (const p of d) {
    if (p.added || p.removed) c += p.value.length;
    else m += p.value.length;
  }
  return m >= c;
}

const removeVowels = (text) => {
  return text.replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0640]/g, '');
};

const normalizeArabicText = (text) => {
  if (!text) return '';
  let normalized = text.replace(/[أإآٱ]/g, 'ا');
  normalized = normalized.replace(/ة/g, 'ه');
  normalized = normalized.replace(/[ىی]/g, 'ي');
  normalized = removeVowels(normalized);
  return normalized;
};

const compareTexts = (text1, text2, vowelInsensitive, ignoreWhiteSpace, mode = 'letter') => {
  const processText = vowelInsensitive ? normalizeArabicText : (t) => t;
  const p1 = processText(text1);
  const p2 = processText(text2);

  const tokenize = (t) => t.match(/[\s]*[^\s]+[\s]*/g) || [];
  const t1 = tokenize(p1);
  const t2 = tokenize(p2);

  const arrayDiff = diffArrays(t1, t2);
  const diffResult = [];

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
        const remTokens = [...part.value];
        const addTokens = [...arrayDiff[i+1].value];
        const localDiff = [];

        while (remTokens.length > 0 && addTokens.length > 0) {
          const r = remTokens[remTokens.length - 1];
          const a = addTokens[addTokens.length - 1];
          if (r.trim() === '' && a.trim() === '') {
            localDiff.unshift({value: r, removed: true});
            remTokens.pop(); addTokens.pop();
            continue;
          } else if (r.trim() === '') {
            localDiff.unshift({value: r, removed: true});
            remTokens.pop();
            continue;
          } else if (a.trim() === '') {
            localDiff.unshift({value: a, added: true});
            addTokens.pop();
            continue;
          } else if (isSimilar(r, a, ignoreWhiteSpace)) {
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
          if (r.trim() === '' && a.trim() === '') {
            frontDiff.push({value: r, removed: true});
            remTokens.shift(); addTokens.shift();
            continue;
          } else if (r.trim() === '') {
            frontDiff.push({value: r, removed: true});
            remTokens.shift();
            continue;
          } else if (a.trim() === '') {
            frontDiff.push({value: a, added: true});
            addTokens.shift();
            continue;
          } else if (isSimilar(r, a, ignoreWhiteSpace)) {
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
        const addedTokens = [...part.value];
        const remTokens = [...arrayDiff[i+1].value];
        const localDiff = [];

        while (remTokens.length > 0 && addedTokens.length > 0) {
          const r = remTokens[remTokens.length - 1];
          const a = addedTokens[addedTokens.length - 1];
          if (r.trim() === '' && a.trim() === '') {
            localDiff.unshift({value: r, removed: true});
            remTokens.pop(); addedTokens.pop();
            continue;
          } else if (r.trim() === '') {
            localDiff.unshift({value: r, removed: true});
            remTokens.pop();
            continue;
          } else if (a.trim() === '') {
            localDiff.unshift({value: a, added: true});
            addedTokens.pop();
            continue;
          } else if (isSimilar(r, a, ignoreWhiteSpace)) {
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
          if (r.trim() === '' && a.trim() === '') {
            frontDiff.push({value: r, removed: true});
            remTokens.shift(); addedTokens.shift();
            continue;
          } else if (r.trim() === '') {
            frontDiff.push({value: r, removed: true});
            remTokens.shift();
            continue;
          } else if (a.trim() === '') {
            frontDiff.push({value: a, added: true});
            addedTokens.shift();
            continue;
          } else if (isSimilar(r, a, ignoreWhiteSpace)) {
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
    if (part.added) continue; // Not in text1

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
};

// 10 Test Cases representing different Arabic prefixes, spacing, spelling & diacritic styles
const testCases = [
  {
    name: "1. Uthmani style vs standard diacritics (1:2)",
    t1: "ٱلۡحَمۡدُ لِلَّهِ رَبِّ ٱلۡعَـٰلَمِینَ", // Uthmani style with Wasla, sukun, Farsi Yeh
    t2: "الحمد لله رب العالمين", // Clean standard text
    vowelInsensitive: true
  },
  {
    name: "2. Surah 6:45 prefix matching with Surah 1:2",
    t1: "فَقُطِعَ دابِرُ القَومِ الَّذينَ ظَلَموا وَالحَمدُ لِلَّهِ رَبِّ العالَمينَ",
    t2: "الحَمدُ لِلَّهِ رَبِّ العالَمينَ",
    vowelInsensitive: true
  },
  {
    name: "3. 'الرحمن الرحيم' identical comparison",
    t1: "الرَّحْمَٰنِ الرَّحِيمِ",
    t2: "الرحمن الرحيم",
    vowelInsensitive: true
  },
  {
    name: "4. Prefix matching 'يا أيها الذين آمنوا' vs 'ويا أيها الذين آمنوا'",
    t1: "ويا أيها الذين آمنوا",
    t2: "يا أيها الذين آمنوا",
    vowelInsensitive: true
  },
  {
    name: "5. 'ألم تر' vs 'ألم تَرَ كَيْفَ'",
    t1: "أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ",
    t2: "ألم تر كيف",
    vowelInsensitive: true
  },
  {
    name: "6. Nominative vs Genitive diacritics ('يوم الدين' U+064F vs U+0650)",
    t1: "يَوْمُ الدِّينِ",
    t2: "يَوْمِ الدِّينِ",
    vowelInsensitive: true
  },
  {
    name: "7. Suffix/Spacing difference (ignoreWhiteSpace test)",
    t1: "إِيّاكَ  نَعبُدُ   وَإِيّاكَ  نَستَعينُ",
    t2: "إياك نعبد وإياك نستعين",
    vowelInsensitive: true
  },
  {
    name: "8. Alif Maksura vs Yeh ('صلى' vs 'صلي')",
    t1: "عَلىٰ هُدًى",
    t2: "علي هدي",
    vowelInsensitive: true
  },
  {
    name: "9. Taa Marbuta vs Haa ('جنة' vs 'جنه')",
    t1: "فِي جَنَّةٍ عَالِيَةٍ",
    t2: "في جنه عاليه",
    vowelInsensitive: true
  },
  {
    name: "10. Prefix combination 'وسخر لكم' vs 'ألم تر أن الله سخر لكم'",
    t1: "أَلَمْ تَرَ أَنَّ اللَّهَ سَخَّرَ لَكُم",
    t2: "وسخر لكم",
    vowelInsensitive: true
  }
];

testCases.forEach((tc) => {
  console.log(`\n========================================`);
  console.log(tc.name);
  console.log(`t1: ${tc.t1}`);
  console.log(`t2: ${tc.t2}`);
  const result = compareTexts(tc.t1, tc.t2, tc.vowelInsensitive, true, 'letter');
  const rendered = result.map(r => r.isDifferent ? `[${r.text}]` : `(${r.text})`).join('');
  console.log(`Rendered runs: ${rendered}`);
});
