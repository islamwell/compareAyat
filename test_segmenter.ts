const text = "وَٱلْحَمْدُ لِلَّهِ";
const segmenter = new (Intl as any).Segmenter('ar', { granularity: 'word' });
const words = Array.from(segmenter.segment(text), (s: any) => s.segment);
console.log("Words:", words);
