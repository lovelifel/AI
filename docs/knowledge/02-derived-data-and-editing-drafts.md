# 派生数据与编辑草稿：React / Vue3 对比

- 日期：2026-11-02。
- 状态：已讲解、代码已检查；取消修改场景获学习者运行反馈通过，非整周独立验收。

## 要解决的问题

哪些值需要独立状态？父组件数据变化后，本地初始值会不会自动更新？

## 派生数据直接计算

React 中，状态更新会触发组件重新渲染，组件函数中的表达式会重新计算：

```tsx
const count = tasks.length;
const completedCount = tasks.filter(task => task.status === "done").length;
const canSave = !pending && value.trim() !== title && value.trim().length > 0;
```

这些值由现有数据确定，不需要再存一份 useState，否则每次更新都要维护同步。
Vue setup 中需要持续追踪的派生值通常用 computed；模板中直接读取响应式数据的表达式也会追踪依赖。

## 初始化不等于持续同步

```ts
// Vue：独立草稿
const value = ref(props.title);
const source = computed(() => props.title);
const draft = ref(source.value);
```

props.title 变化后，source.value 随依赖更新，但 value、draft 不自动同步。
读取字符串后再传入 ref，只是以该值初始化独立状态，不会持续关联来源。

```tsx
// React：也是独立草稿
const [value, setValue] = useState(title);
```

后续 title 变化或组件函数重新执行，不会重新初始化该状态；组件重新挂载是另一回事。

## 项目实例

src/components/TaskTitleForm.tsx 中：

- title：服务端传来的已保存标题。
- value：用户正在编辑的草稿，可以暂时与已保存值不同。
- hasChanges、canSave：直接计算的派生数据。
- 取消修改：setValue(title)，不提交网络请求。
- 取消按钮必须 type="button"，避免被当成提交按钮。
- 输入只包含空格、或 trim 后与已保存值相同，正常保存按钮禁用；服务端校验仍保留。

## 验证与实际结果

- 类型与 ESLint 检查通过。
- 学习者反馈：保存新标题后再次编辑，再取消，恢复的是刚保存的新标题。
- 该反馈验证当前操作路径，不代表所有 props 更新、导航、并发操作均已覆盖。

## 自测

1. 为什么任务完成数量不需要独立 useState？
2. 为什么 ref(props.title) 不会自动随 props.title 变化？
3. 为什么收到服务端新值后，不应该无条件覆盖正在编辑的草稿？
4. 为什么取消按钮使用普通按钮，而不是提交按钮？

## 关联

- [知识库总目录](../../KNOWLEDGE_REVIEW.md)
- [路由、渲染与状态保留](01-web-rendering-routing-and-next-basics.md)
