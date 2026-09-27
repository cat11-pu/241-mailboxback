// rotor.js：轮转投递与消费（基线：一律给空表）
import { canAccept, take } from "./mailbox.js";

export function runRotor(spec) {
  return { backlog: [], pressed: 0, pressed_positions: [], accepted: 0, consumed: 0 };
}
