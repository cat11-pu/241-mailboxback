// mailbox.js：能不能收下与能消费多少（基线：一律给真与零）
export function canAccept(backlog, capacity) {
  return true;
}

export function take(backlog, quota) {
  return 0;
}
