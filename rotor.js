// rotor.js：轮转投递与消费（一次扫描，每条投递只判一遍）
import { canAccept, take } from "./mailbox.js";

function isPositiveInteger(value) {
  return Number.isInteger(value) && value >= 1;
}

export function runRotor(spec) {
  const capacity = spec.capacity;
  const quota = spec.quota;
  const sends = spec.sends || [];

  if (!isPositiveInteger(capacity) || !isPositiveInteger(quota)) {
    const error = new Error("capacity and quota must be positive integers");
    error.code = "E_BAD_PARAM";
    throw error;
  }

  const backlog = [];
  const pressedPositions = [];
  let pressed = 0;
  let accepted = 0;
  let consumed = 0;

  for (let i = 0; i < sends.length; i++) {
    const actor = sends[i];
    if (!Number.isInteger(actor) || actor < 1) {
      const error = new Error("send actor must be an integer not less than 1");
      error.code = "E_BAD_SEND";
      throw error;
    }

    while (backlog.length < actor) backlog.push(0);
    const spot = actor - 1;

    if (canAccept(backlog[spot], capacity)) {
      backlog[spot] += 1;
      accepted += 1;
      for (let other = 0; other < backlog.length; other++) {
        if (other === spot) continue;
        const used = take(backlog[other], quota);
        backlog[other] -= used;
        consumed += used;
      }
    } else {
      pressed += 1;
      pressedPositions.push(i + 1);
    }
  }

  return {
    backlog: backlog,
    pressed: pressed,
    pressed_positions: pressedPositions,
    accepted: accepted,
    consumed: consumed
  };
}
