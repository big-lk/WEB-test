// 設定画面の事前選択（applySetupPreset）の単体検証。 node tests/aitest/setup_preset_test.mjs
import { readFileSync } from "node:fs";
const src = readFileSync(new URL("../../public/aitest/app.js", import.meta.url), "utf8");
const code = src.slice(src.indexOf("function applySetupPreset"), src.indexOf("let setupPreset"));
const applySetupPreset = new Function(code + "; return applySetupPreset;")();
const html = readFileSync(new URL("../../public/aitest/index.html", import.meta.url), "utf8");
let fails = 0;
const check = (name, ok, detail = "") => { console.log((ok ? "PASS " : "FAIL ") + name + (ok ? "" : "  " + detail)); if (!ok) fails += 1; };

// 設定画面にある選択肢を index.html から読み、それだけを持つ偽のフォームを作る
const radios = [...html.matchAll(/<input type="radio" name="(condition|experimentVariant)" value="([^"]+)"( checked)?/g)]
  .map((m) => ({ name: m[1], value: m[2], checked: Boolean(m[3]) }));
const makeForm = () => {
  const items = radios.map((r) => ({ ...r }));
  return { items, querySelector(sel) {
    const m = sel.match(/^input\[name="([^"]+)"\]\[value="([^"]+)"\]$/);
    const hit = m && items.find((r) => r.name === m[1] && r.value === m[2]);
    if (hit) return { set checked(v) { items.filter((r) => r.name === hit.name).forEach((r) => { r.checked = false; }); hit.checked = v; } };
    return null;
  } };
};
const selected = (form, name) => form.items.find((r) => r.name === name && r.checked)?.value;
const query = (obj) => (key) => (key in obj ? obj[key] : null);

check("form has both UI choices and generic_unranked", radios.some((r) => r.value === "UI_B") && radios.some((r) => r.value === "generic_unranked"));
let f = makeForm(), a = applySetupPreset(f, query({}));
check("no parameters → nothing changes (UI A / standard stay selected)",
  Object.keys(a).length === 0 && selected(f, "condition") === "UI_A" && selected(f, "experimentVariant") === "standard");
f = makeForm(); a = applySetupPreset(f, query({ condition: "UI_B", variant: "generic_unranked" }));
check("both parameters → both preselected", selected(f, "condition") === "UI_B" && selected(f, "experimentVariant") === "generic_unranked"
  && a.condition === "UI_B" && a.experimentVariant === "generic_unranked", JSON.stringify(a));
f = makeForm(); a = applySetupPreset(f, query({ condition: "UI_B" }));
check("condition only → variant untouched", selected(f, "condition") === "UI_B" && selected(f, "experimentVariant") === "standard" && !("experimentVariant" in a));
f = makeForm(); a = applySetupPreset(f, query({ condition: "UI_C", variant: "no_such_variant" }));
check("unknown values are ignored", Object.keys(a).length === 0 && selected(f, "condition") === "UI_A" && selected(f, "experimentVariant") === "standard");
f = makeForm(); a = applySetupPreset(f, query({ condition: 'UI_B"][x', variant: "generic_unranked" }));
check("values with other characters are ignored", !("condition" in a) && selected(f, "condition") === "UI_A" && a.experimentVariant === "generic_unranked");
console.log(`\n${fails} failure(s)`); process.exit(fails ? 1 : 0);
