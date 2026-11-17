// 例文生成（buildDelegationExample / exampleOverlap）の単体検証。 node tests/aitest/example_sentence_test.mjs
import { readFileSync } from "node:fs";
const src = readFileSync(new URL("../../public/aitest/app.js", import.meta.url), "utf8");
const grab = (start, end) => src.slice(src.indexOf(start), src.indexOf(end, src.indexOf(start)));
const code = grab("const DELEGATION_EXAMPLE_PATTERNS", "function createNextInputExample")
  + grab("function exampleOverlap", "function exportCsv");
const { buildDelegationExample, exampleOverlap } = new Function(code + "; return { buildDelegationExample, exampleOverlap };")();
let fails = 0;
const check = (name, ok, detail = "") => { console.log((ok ? "PASS " : "FAIL ") + name + (ok ? "" : "  " + detail)); if (!ok) fails += 1; };

const cards = [
  { id: "rest", title: "静かに休める時間" },
  { id: "special", title: "少し特別な感じを優先" },
  { id: "burden", title: "準備の負担を見せない" }
];
let r = buildDelegationExample([], {}, {});
check("no cards → empty (template fallback)", r.text === "" && r.used.length === 0);
r = buildDelegationExample(cards, { rest: "consult", special: "consult", burden: "consult" }, {});
check("all default consult, untouched → empty", r.text === "");
r = buildDelegationExample(cards, { rest: "self" }, { rest: true });
check("one self", r.text === "「静かに休める時間」は自分で決めたいので、今の内容のまま変えないでください。", r.text);
r = buildDelegationExample(cards, { rest: "consult", special: "ai", burden: "self" }, { rest: true, special: true, burden: true });
check("order self > ai, max 2", r.used.map((u) => u.key).join() === "burden,special" && !r.text.includes("材料"), r.text);
r = buildDelegationExample(cards, { rest: "consult" }, { rest: true });
check("touched consult included", r.text.includes("考える材料を示してください"), r.text);
r = buildDelegationExample(cards, { special: "ai" }, {});
check("carried-over ai (not touched this turn) still included", r.text.includes("案を一つ出してください"), r.text);
r = buildDelegationExample([{ id: "anchor-context", title: "最初に選んだ場面" }, { id: "turn-5-record", title: "第5回の入力" }, { id: "pending-meaning", title: "x" }],
  { "anchor-context": "self", "turn-5-record": "ai", "pending-meaning": "self" }, {});
check("placeholder cards skipped", r.text === "", r.text);
const long = [{ id: "a", title: "とても長いタイトルの価値カードその一です" }, { id: "b", title: "とても長いタイトルの価値カードその二です" }];
r = buildDelegationExample(long, { a: "self", b: "self" }, {});
check("length cap keeps ≤120 chars", r.text.length <= 120 && r.used.length >= 1, `${r.text.length} ${r.text}`);
r = buildDelegationExample(cards, { rest: "self", special: "self", burden: "self" }, {});
check("never more than 2 sentences", r.used.length === 2);
check("overlap: copied example ≈1", Number(exampleOverlap("「静かに休める時間」は自分で決めたいので、今の内容のまま変えないでください。",
  "静かに休める時間は自分で決めたいので、今の内容のまま変えないでください。")) > 0.95);
check("overlap: unrelated ≈0", Number(exampleOverlap("「静かに休める時間」は自分で決めたいので。", "洋食で前菜を出したいです")) < 0.2);
check("overlap: no example → blank", exampleOverlap("", "abc") === "");
console.log(`\n${fails} failure(s)`); process.exit(fails ? 1 : 0);
