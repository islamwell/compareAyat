import { diffArrays, diffChars } from 'diff';

// Replicate the utils.ts logic precisely
const removeVowels = (text) => text.replace(/[\u064B-\u065F\u0670]/g, '');
const normalizeArabicText = (text) => {
  let normalized = text.replace(/[أإآ]/g, 'ا');
  normalized = normalized.replace(/ة/g, 'ه');
  normalized = removeVowels(normalized);
  return normalized;
};

const compareTexts = (text1, text2, vowelInsensitive, ignoreWhiteSpace, mode = 'letter') => {
  const processText = vowelInsensitive ? normalizeArabicText : (t) => t;
  let p1 = processText(text1);
  let p2 = processText(text2);
  
  if (ignoreWhiteSpace) {
    // Actually wait, my code currently doesn't mutate p1 and p2 for ignoreWhiteSpace.
    // It only passes it to isSimilar.
  }

  const tokenize = (t) => t.match(/[\s]*[^\s]+[\s]*/g) || [];
  const t1 = tokenize(p1);
  const t2 = tokenize(p2);

  const arrayDiff = diffArrays(t1, t2);
  const diffResult = [];

  function isSimilar(a, b, ignoreSpace = true) {
    const normA = ignoreSpace ? a.replace(/\s+/g, '') : a;
    const normB = ignoreSpace ? b.replace(/\s+/g, '') : b;
    const d = diffChars(normA, normB);
    let m = 0, c = 0;
    for (const p of d) {
      if (p.added || p.removed) c += p.value.length;
      else m += p.value.length;
    }
    return m >= c;
  }

  let addTokens = [];
  let remTokens = [];

  for (const part of arrayDiff) {
    if (part.added) {
      addTokens.push(...part.value);
    } else if (part.removed) {
      remTokens.push(...part.value);
    } else {
      if (remTokens.length > 0 || addTokens.length > 0) {
        let localDiff = [];
        while (remTokens.length > 0 && addTokens.length > 0) {
          const r = remTokens[remTokens.length - 1];
          const a = addTokens[addTokens.length - 1];
          if (r === a) {
            localDiff.unshift({value: r, added: false, removed: false});
            remTokens.pop(); addTokens.pop();
            continue;
          } else if (isSimilar(r, a, ignoreWhiteSpace)) {
            localDiff.unshift(...diffChars(r, a));
            remTokens.pop(); addTokens.pop();
            continue;
          }
          break;
        }

        let frontDiff = [];
        while (remTokens.length > 0 && addTokens.length > 0) {
          const r = remTokens[0];
          const a = addTokens[0];
          if (r === a) {
            frontDiff.push({value: r, added: false, removed: false});
            remTokens.shift(); addTokens.shift();
            continue;
          } else if (isSimilar(r, a, ignoreWhiteSpace)) {
            frontDiff.push(...diffChars(r, a));
            remTokens.shift(); addTokens.shift();
            continue;
          }
          break;
        }

        if (remTokens.length > 0) {
          diffResult.push({value: remTokens.join(''), added: false, removed: true});
        }
        if (addTokens.length > 0) {
          diffResult.push({value: addTokens.join(''), added: true, removed: false});
        }
        diffResult.push(...frontDiff);
        diffResult.push(...localDiff);
        
        remTokens = [];
        addTokens = [];
      }
      diffResult.push({value: part.value.join(''), added: false, removed: false});
    }
  }

  if (remTokens.length > 0 || addTokens.length > 0) {
    let localDiff = [];
    while (remTokens.length > 0 && addTokens.length > 0) {
      const r = remTokens[remTokens.length - 1];
      const a = addTokens[addTokens.length - 1];
      if (r === a) {
        localDiff.unshift({value: r, added: false, removed: false});
        remTokens.pop(); addTokens.pop();
        continue;
      } else if (isSimilar(r, a, ignoreWhiteSpace)) {
        localDiff.unshift(...diffChars(r, a));
        remTokens.pop(); addTokens.pop();
        continue;
      }
      break;
    }

    let frontDiff = [];
    while (remTokens.length > 0 && addTokens.length > 0) {
      const r = remTokens[0];
      const a = addTokens[0];
      if (r === a) {
        frontDiff.push({value: r, added: false, removed: false});
        remTokens.shift(); addTokens.shift();
        continue;
      } else if (isSimilar(r, a, ignoreWhiteSpace)) {
        frontDiff.push(...diffChars(r, a));
        remTokens.shift(); addTokens.shift();
        continue;
      }
      break;
    }

    if (remTokens.length > 0) {
      diffResult.push({value: remTokens.join(''), added: false, removed: true});
    }
    if (addTokens.length > 0) {
      diffResult.push({value: addTokens.join(''), added: true, removed: false});
    }
    diffResult.push(...frontDiff);
    diffResult.push(...localDiff);
  }

  const finalHighlights = [];
  const dispChars = Array.from(text1);
  let dispIdx = 0;

  for (const part of diffResult) {
    if (part.added) continue; 
    const textToMatch = part.value;
    let normCount = 0;
    const normLen = Array.from(textToMatch).length;
    let matchedDispText = '';

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

    if (matchedDispText.length > 0) {
      finalHighlights.push({
        text: matchedDispText,
        isDifferent: part.removed === true
      });
    }
  }

  return finalHighlights;
};

const text1 = "فَقُطِعَ دابِرُ القَومِ الَّذينَ ظَلَموا وَالحَمدُ لِلَّهِ رَبِّ العالَمينَ";
const text2 = "الحَمدُ لِلَّهِ رَبِّ العالَمينَ";

console.log("TESTING WITH DIACRITICS");
console.log(JSON.stringify(compareTexts(text1, text2, false, true), null, 2));

console.log("TESTING WITHOUT DIACRITICS");
console.log(JSON.stringify(compareTexts(text1, text2, true, true), null, 2));
