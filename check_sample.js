import fs from "node:fs";
import { canAccept, take } from "./mailbox.js";
import { runRotor } from "./rotor.js";
import { render } from "./app.js";

// 验收断言：上面每条值收进 emit，最后与期望值逐项比对，不符就非零退出。
const __lines = [];
function emit(label, value) { __lines.push([String(label).replace(/ =$/, ""), value]); }


const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/sends.json", "utf8"));
const view = render(spec);

emit("收尾积压表 =", JSON.stringify(view.backlog));
emit("背压条数 =", view.pressed);
emit("背压位置列表 =", JSON.stringify(view.pressed_positions));
emit("接受条数 =", view.accepted);
emit("消费条数 =", view.consumed);
emit("投递条数 =", view.count);
emit("守恒复核 =", view.conserved);
emit("容量复核 =", view.within_capacity);
emit("收下判定样例 =", view.tail);


// ---- 异常路径探针：真调用实现，看它报出什么码（不是从样例里抄）----
try {
  runRotor({ capacity: 0, quota: 1, sends: [] });
  emit("参数写错的错误码", "没有报错");
} catch (error) {
  emit("参数写错的错误码", error && error.code ? error.code : String(error.message));
}
try {
  runRotor({ capacity: 2, quota: 1, sends: [0] });
  emit("投递写错的错误码", "没有报错");
} catch (error) {
  emit("投递写错的错误码", error && error.code ? error.code : String(error.message));
}


// ---- 期望值（参考模型算出，与题面给的验收数值一致）----
const EXPECTED = {
  "收尾积压表": [
    2,
    0
  ],
  "背压条数": 2,
  "背压位置列表": [
    3,
    6
  ],
  "接受条数": 4,
  "消费条数": 2,
  "投递条数": 6,
  "守恒复核": true,
  "容量复核": true,
  "收下判定样例": 1,
  "参数写错的错误码": "E_BAD_PARAM",
  "投递写错的错误码": "E_BAD_SEND"
};
// 有的值在收进来之前已经 stringify 过，比较前先试着解析回来，避免类型错配把正确实现判成不过。
function __same(got, want) {
  if (typeof got === "string") {
    try { const parsed = JSON.parse(got); if (JSON.stringify(parsed) === JSON.stringify(want)) return true; } catch (error) { /* 不是 JSON 就按原文比 */ }
  }
  return JSON.stringify(got) === JSON.stringify(want);
}
let __bad = 0;
for (const [label, want] of Object.entries(EXPECTED)) {
  const found = __lines.find((pair) => pair[0] === label);
  if (!found) { __bad += 1; console.log("缺失验收项 " + label); continue; }
  const got = found[1];
  if (__same(got, want)) { console.log("一致 " + label + " = " + JSON.stringify(got)); }
  else { __bad += 1; console.log("不一致 " + label + " 期望 " + JSON.stringify(want) + " 实际 " + JSON.stringify(got)); }
}
console.log("验收项 " + (Object.keys(EXPECTED).length - __bad) + "/" + Object.keys(EXPECTED).length + " 通过");
process.exit(__bad === 0 ? 0 : 1);
