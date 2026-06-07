const text = "وَٱلْحَمْدُ لِلَّهِ بِالْحَقِّ وَالْأَرْضِ";
const regex = /\s+|(?:\u0648\u064E?|\u0641\u064E?|\u0628\u0650?|\u0643\u064E?)(?=[\u0627\u0671]\u0644)|\S+/gu;
console.log(text.match(regex));
