const str = "فَقُطِعَ دابِرُ القَومِ الَّذينَ ظَلَموا وَالحَمدُ لِلَّهِ رَبِّ العالَمينَ";

const regexOld = /[^\s]+[\s]*/g;
const regexNew = /[\s]*[^\s]+[\s]*/g;

console.log("Old Tokenization:", JSON.stringify(str.match(regexOld)));
console.log("New Tokenization:", JSON.stringify(str.match(regexNew)));
