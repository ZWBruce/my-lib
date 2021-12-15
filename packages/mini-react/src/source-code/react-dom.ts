import { isString, isNumber, isFunction } from 'lodash';
export { createRoot as render } from './fiber';

// function render(element: any, container?: HTMLElement | null) {
//   const dom = renderDom(element);
//   container?.appendChild(dom);
// }

function mountAttributes(props: Record<string, any>, dom: HTMLElement) {
  for (const k in props) {
    if (k === 'children') {
      return;
    }
    const value = props[k];
    if (k === 'style') {
      for (const k in value) {
        dom.style[k as any] = value[k];
      }
    } else if (k === 'className') {
      const classNames = value.split(/\s+/);
      dom.classList.add(...classNames);
    } else if (k.startsWith('on')) {
      const eventName = k.substring(2).toLowerCase();
      dom.addEventListener(eventName, value);
    } else {
      dom.setAttribute(k, value);
    }
  }
}

// 抽离递归逻辑
export function renderDom(element: any): any {
  if (isString(element) || isNumber(element)) {
    return document.createTextNode(`${element}`);
  }
  // if (isArray(element)) {
  //   const dom = document.createDocumentFragment();
  //   element.forEach((t) => {
  //     dom.appendChild(renderDom(t));
  //   });
  //   return dom;
  // }
  // class 组件 或者 函数组件，额外处理
  if (isFunction(element)) {
    console.log('element isFunction');
    return renderDom(element());
  }
  // 根据组件 type 判断是原生 dom 还是 react 组件，并根据 type 创建元素、把 props 传给元素
  if (element?.type) {
    const { type, props } = element;
    // const children = props.children;
    let dom: any;
    if (isString(type)) {
      dom = document.createElement(type);
      // class 组件 或者 函数组件，已经在 fiber 里处理，这里为避免传入 false 报错，返回空节点
    } else if (isFunction(type)) {
      dom = document.createDocumentFragment();
      //   // 函数组件或者类组件只是解析第一层，children 需要继续解析
      //   if (type.prototype.isReactComponent) {
      //     const { type: Comp } = element;
      //     const comp = new Comp(props);
      //     dom = renderDom(comp.render());
      //   } else {
      //     const { type: fn } = element;
      //     dom = renderDom(fn(props));
      //   }
    }

    mountAttributes(props, dom);

    // if (children) {
    //   dom.appendChild(renderDom(children));
    // }

    return dom;
  }
}
