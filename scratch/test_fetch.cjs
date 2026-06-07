const fetch = require('node:http');

function getJson(url) {
  return new Promise((resolve, reject) => {
    require('node:https').get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function dumpCodepoints(str) {
  return Array.from(str).map(ch => {
    const code = ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0');
    return `${ch} (U+${code})`;
  }).join(', ');
}

async function run() {
  try {
    const url1 = 'https://api.alquran.cloud/v1/ayah/1:2/quran-simple-clean';
    const url2 = 'https://api.alquran.cloud/v1/ayah/6:45/quran-simple-clean';
    
    const r1 = await getJson(url1);
    const r2 = await getJson(url2);
    
    const text1 = r1.data.text; // 1:2
    const text2 = r2.data.text; // 6:45
    
    console.log("1:2 Text:", text1);
    console.log("1:2 Codepoints:", dumpCodepoints(text1));
    console.log("\n6:45 Text:", text2);
    console.log("6:45 Codepoints:", dumpCodepoints(text2));
    
    // Now check compareTexts logic
    // Let's implement isSimilar and compareTexts here with exact options
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
    
    // Let's test the vowel normalization function as implemented in quranService
    const removeVowels = (text) => text.replace(/[\u064B-\u065F\u0670]/g, '');
    const normalizeArabicText = (text) => {
      let normalized = text.replace(/[أإآ]/g, 'ا');
      normalized = normalized.replace(/ة/g, 'ه');
      normalized = removeVowels(normalized);
      return normalized;
    };
    
    console.log("\nNormalized 1:2 (vowelInsensitive=true):", normalizeArabicText(text1));
    console.log("Normalized 6:45 (vowelInsensitive=true):", normalizeArabicText(text2));
  } catch (e) {
    console.error(e);
  }
}

run();
