import assert from "node:assert";
import { canAccept, take } from "../mailbox.js";
import { runRotor } from "../rotor.js";
import { render } from "../app.js";

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

check("canAccept returns a flag", () => {
  assert.strictEqual(typeof canAccept(0, 2), "boolean");
});

check("take returns a number", () => {
  assert.strictEqual(typeof take(0, 2), "number");
});

check("runRotor returns backlog", () => {
  assert.ok(Array.isArray(runRotor({ capacity: 1, quota: 1, sends: [] }).backlog));
});

check("render counts sends", () => {
  assert.strictEqual(typeof render({ capacity: 1, quota: 1, sends: [] }).count, "number");
});

check("render exposes conserved flag", () => {
  assert.strictEqual(typeof render({ capacity: 1, quota: 1, sends: [] }).conserved, "boolean");
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
