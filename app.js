// app.js：渲染结果
import { canAccept, take } from "./mailbox.js";
import { runRotor } from "./rotor.js";

export function render(spec) {
  const sends = spec.sends || [];
  const capacity = spec.capacity || 0;
  const view = runRotor(spec);
  const backlog = view.backlog || [];
  const pressedPositions = view.pressed_positions || [];
  const accepted = view.accepted || 0;
  const consumed = view.consumed || 0;
  return { backlog: backlog, pressed: view.pressed || 0, pressed_positions: pressedPositions,
           accepted: accepted, consumed: consumed, count: sends.length,
           conserved: accepted + pressedPositions.length === sends.length,
           within_capacity: backlog.every(function (count) { return count <= capacity; }),
           tail: canAccept(0, 2) ? 1 : 0 };
}
