// rotor.js：按邮箱背压轮转投递与消费
import { canAccept, take } from "./mailbox.js";

function isPositiveInteger(value) {
  return Number.isInteger(value) && value >= 1;
}

function failure(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export function runRotor(spec) {
  const options = spec || {};
  const capacity = options.capacity;
  const quota = options.quota;
  if (!isPositiveInteger(capacity) || !isPositiveInteger(quota)) {
    throw failure("E_BAD_PARAM", "capacity 与 quota 必须是正整数");
  }
  const sends = options.sends || [];

  // 一次扫描：顺手校验投递目标并确定邮箱数量（空投递表 => 零个邮箱）。
  let actorCount = 0;
  for (const actor of sends) {
    if (!isPositiveInteger(actor)) {
      throw failure("E_BAD_SEND", "投递的 actor 必须是不小于 1 的整数");
    }
    if (actor > actorCount) {
      actorCount = actor;
    }
  }

  const backlog = new Array(actorCount).fill(0);
  const acceptedTo = new Array(actorCount).fill(0);
  // settledAt[j]：邮箱 j 已经结清过的、由“别的 actor 被收下”引发的消费轮数。
  const settledAt = new Array(actorCount).fill(0);
  let acceptedTotal = 0;
  let consumed = 0;
  let pressed = 0;
  const pressedPositions = [];

  // 结清邮箱 index 欠着的消费：连续 k 轮各取 min(积压, quota)，
  // 合计恰为 min(积压, k*quota)，所以不必逐轮回放。
  function settle(index) {
    const drainRounds = acceptedTotal - acceptedTo[index] - settledAt[index];
    if (drainRounds > 0) {
      const got = take(backlog[index], drainRounds * quota);
      backlog[index] -= got;
      consumed += got;
      settledAt[index] += drainRounds;
    }
  }

  sends.forEach(function (actor, position) {
    const index = actor - 1;
    settle(index);
    if (canAccept(backlog[index], capacity)) {
      backlog[index] += 1;
      acceptedTotal += 1;
      acceptedTo[index] += 1;
    } else {
      pressed += 1;
      pressedPositions.push(position + 1);
    }
  });

  for (let index = 0; index < actorCount; index += 1) {
    settle(index);
  }

  return {
    backlog: backlog,
    pressed: pressed,
    pressed_positions: pressedPositions,
    accepted: acceptedTotal,
    consumed: consumed
  };
}
