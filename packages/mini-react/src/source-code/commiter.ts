export function commitRoot(fiber: any) {
  commit(fiber.child);
}

// 深度遍历，先 child，后 sibling
function commit(fiber: any) {
  if (!fiber) {
    return;
  }

  commit(fiber.child);
  const parentDom = fiber.return.stateNode;
  parentDom?.appendChild(fiber.stateNode);
  commit(fiber.sibling);
}
