// mailbox.js：能不能收下与这一轮能消费多少（纯函数，无副作用）
export function canAccept(backlog, capacity) {
  return backlog < capacity;
}

export function take(backlog, quota) {
  return Math.min(backlog, quota);
}
