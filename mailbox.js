// mailbox.js：能不能收下与能消费多少
export function canAccept(backlog, capacity) {
  return backlog < capacity;
}

export function take(backlog, quota) {
  return Math.min(backlog, quota);
}
