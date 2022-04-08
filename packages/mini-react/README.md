学习资源：https://juejin.cn/post/7030673003583111176
https://juejin.cn/post/6844903861434449933 荒山大佬
## fiber 核心思路：

1. 每个 fiber 节点中有虚拟 dom 信息（element）和真实 dom 属性（stateNode）
2. 每遍历到一个 fiber 节点就根据 element 属性创建真实 dom 节点，但是此时不挂载（注意如果是 react 组件需要把组件解析为 dom 组件之后（执行 new Comp(props) 或者 fn(props)），放到当前组件 children 中）；
3. 遍历 children，由于 children 是 element 节点（虚拟 dom），需要转为 fiber 节点，并赋予 child 和 sibling 属性；
4. 深度优先遍历 fiber 节点：
  - 如果有 child，一直找到最底部的 child，设为下个执行节点；
  - 如果没有 child，但是有 sibling，下个执行节点是兄弟节点；
  - 如果都没有，找到上一个节点，重复上两步。
5. 在 requestIdleCallback 中执行上述步骤，记录下当前执行节点，在浏览器每次空闲时执行，空闲时间用完停止执行并记录下当前节点，直到所有 fiber 节点都执行完成。
6. 上述步骤可中断。在 fiber 节点解析为真实 dom 完毕之后，会进行深度优先递归处理将 fiber 节点的 dom 挂载，此过程不可中断。

## diff 核心思路
1. 同时维护两颗虚拟 dom 树，分别为 workInProgress（新的 dom 树） 和 current（当前展示的）
2. 从指定节点开始遍历 workInProgress 树的 fiber 节点，每个节点有个 alternate 属性指向 current 的同一位置的节点，对比新旧节点
- 如果 type 相同，表示是相同的元素，添加 Update 的 flag，直接更新 dom 元素的属性
- 如果 type 不同且新的 element 存在，添加 Placement 的 flag，表示需要创建新的 dom。同时还要对其添加 index 属性，记录在插入时在父节点下的下标位置
- 如果 type 不同且 oldFiber 存在，添加 Deletion 的 flag，表示需要对旧的 element 进行删除
