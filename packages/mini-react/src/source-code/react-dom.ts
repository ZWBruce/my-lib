import { isString, isNumber, isArray, isFunction } from 'lodash';

function render(element: any, container?: HTMLElement | null) {
  const dom = renderDom(element);
  container?.appendChild(dom);
}

function renderDom(element: any): any {
  if (isString(element) || isNumber(element)) {
    return document.createTextNode(`${element}`);
  }
  if (isArray(element)) {
    const dom = document.createDocumentFragment();
    element.forEach((t) => {
      dom.appendChild(renderDom(t));
    });
    return dom;
  }
  // class 组件 或者 函数组件，额外处理
  if (isFunction(element)) {
    return renderDom(element());
  }
  if (element?.type) {
    console.log(element.type, element.props);
    const { type, props } = element;
    const children = props.children;
    let dom: any;
    if (isString(type)) {
      dom = document.createElement(type);
      Object.keys(props).forEach((key) => {
        if (key === 'children') {
          return;
        }
        dom.setAttribute(key, props[key]);
      });
    } else if (isFunction(type)) {
      // 函数组件或者类组件只是解析第一层，children 需要继续解析
      if (type.prototype.isReactComponent) {
        const { type: Comp } = element;
        const comp = new Comp(props);
        dom = renderDom(comp.render());
      } else {
        const { type: fn } = element;
        dom = renderDom(fn(props));
      }
    }

    if (children) {
      dom.appendChild(renderDom(children));
    }

    return dom;
  }
}

export default { render };
