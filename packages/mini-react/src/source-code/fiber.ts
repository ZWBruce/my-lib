import { isFunction } from 'lodash';
import { renderDom } from './react-dom';
import { commitRoot } from './commiter';

let nextUnitOfWork: any = null;
let rootFiber: any = null;

let id = 0;
// TODO 看下是否会死循环
const getFiber = ({
  element,
  stateNode = null,
  return: rtn = null,
}: {
  element: any;
  stateNode?: HTMLElement | null;
  return?: any;
}) => ({
  stateNode,
  element,
  effectTag: 'PLACEMENT',
  child: null,
  sibling: null,
  return: rtn,
  id: ++id,
});

// 每一个 fiber 节点都有两个属性：stateNode(下面别名 container，真实 dom) 和 element（虚拟 dom）
export function createRoot(element: any, container: HTMLElement | null) {
  // 创建一个 root fiber
  nextUnitOfWork = rootFiber = getFiber({
    stateNode: container,
    element: {
      props: {
        children: [element],
      },
    },
  });
}

function workLoop(deadLine: any) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    // 开始工作
    performUnitOfWork(nextUnitOfWork);
    shouldYield = deadLine.timeRemaining() > 1;
  }
  requestIdleCallback(workLoop);

  if (!nextUnitOfWork && rootFiber) {
    commitRoot(rootFiber);
    rootFiber = null;
  }
}

export function run() {
  requestIdleCallback(workLoop);
}

/**
 * 创建 fiber 节点下 dom 节点，将其挂在到父元素下
 * 构建 fiber 树：找到当前节点的 children 以及 siblings，fiber 返回的 return 属性指向父元素
 * 定位下一个工作节点
 */
function performUnitOfWork(fiber: any) {
  // 1. 创建 fiber 节点下 dom 节点，将其挂在到父元素下
  let { stateNode, element, return: parentFiber } = fiber;
  if (!stateNode) {
    // 创建 dom 节点
    stateNode = fiber.stateNode = renderDom(element);
  }
  // 挂载 构建 fiber 树 和 渲染分离
  // if (parentFiber && stateNode) {
  //   while (!parentFiber.stateNode) {
  //     parentFiber = parentFiber.return;
  //   }
  //   parentFiber.stateNode.appendChild(stateNode);
  // }

  // 2-1 将 children 转为虚拟 dom（对应 renderDom 中 type 为 function 部分）
  let children = element?.props?.children;
  const type = element?.type;

  if (isFunction(type)) {
    const { props } = element;
    let jsx;
    if (type?.prototype?.isReactComponent) {
      const { type: Comp } = element;
      const comp = new Comp(props);
      jsx = comp.render();
    } else {
      const { type: fn } = element;
      jsx = fn(props);
    }
    // 如果是 react 组件，直接把当前组件解析为 children，props.children 会在后续解析子组件时继续处理
    children = [jsx];
  }
  children = [].concat(children).flat().filter(Boolean);
  // 2-2 构建 fiber 树
  if (children?.length) {
    let prevSibling: any = null;
    children.forEach((child: any, i: number) => {
      const newFiber = getFiber({
        element: child,
        return: fiber,
      });

      if (!i) {
        fiber.child = newFiber;
      } else {
        prevSibling.sibling = newFiber;
      }
      prevSibling = newFiber;
    });
  }

  // 3. 定位下一个工作节点 child -> sibling -> return
  if (fiber.child) {
    nextUnitOfWork = fiber.child;
  } else {
    let next = fiber;
    while (next) {
      if (next.sibling) {
        nextUnitOfWork = next.sibling;
        return;
      } else {
        next = next.return;
      }
    }
    nextUnitOfWork = next;
  }
}
