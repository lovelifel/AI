# JavaScript 闭包：用 withAuth 理解作用域与执行时机

- 分类：JavaScript 基础。
- 创建日期：2026-11-03。
- 适用范围：JavaScript / TypeScript；React、Vue 与 Node.js 中同样适用。
- 学习状态：已讲解，学习者经提示能解释外层变量捕获；项目包装器尚未接入 GET，独立迁移验收待完成。

## 1. 什么是闭包

闭包是函数及其保留的外部词法环境。常见理解：内部函数引用外层作用域中的变量，并能在之后调用时继续访问它们。

词法作用域由代码定义的位置决定，不由之后在哪里调用决定。闭包不要求函数必须被返回；返回函数只是容易观察到它的常见方式。

```js
function createCounter() {
  let count = 0;

  return function increment() {
    count += 1;
    return count;
  };
}

const counter = createCounter();
counter(); // 1
counter(); // 2
```

createCounter 已执行结束，increment 仍能访问 count。它访问的是变量绑定，不是每次从 0 重新开始，也不只是创建时复制的数值。

## 2. 项目实例：withAuth

来自 src/lib/server/api-auth.ts，省略类型定义：

```ts
export function withAuth(fn: Handler) {
  return async function (request: Request): Promise<Response> {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "请先登录" }, { status: 401 });
    }

    return fn(request, user);
  };
}
```

| 标识符 | 从哪里来 | 是否为本例捕获的外层变量 |
| --- | --- | --- |
| fn | 调用 withAuth 时传入的业务函数 | 是，内层函数保留并使用它 |
| request | 每次调用返回的处理函数时传入 | 否，是内层函数自己的参数 |
| user | 内层函数执行时查询会话得到 | 否，是本次调用中的局部变量 |

withAuth 是高阶函数：接收函数并返回函数。高阶函数描述函数的输入输出形式；闭包描述函数和作用域的关系，两者不是同一个概念。

## 3. 创建函数不等于执行函数

```js
const sayHello = () => console.log("你好"); // 创建，不打印
sayHello(); // 调用，才打印
```

同样：

```ts
// 接入方式示意；不代表当前 GET 已迁移
export const GET = withAuth(async (request, user) => {
  return Response.json({ userId: user.id });
});
```

分成两个时机：

```text
模块加载
→ withAuth(fn) 执行
→ 创建并返回内层函数，赋给 GET
→ 此时不查询用户，不执行业务 fn

收到请求
→ Next.js 调用 GET(request)
→ 内层函数查询当前用户
→ 有用户时调用 fn(request, user)
→ 返回响应
```

业务函数 fn 返回的是 Response 或 Promise<Response>。返回另一个函数的是 withAuth，不要混淆两者。
request 由 Next.js 传给 GET，再由包装器显式传给 fn；不存在“只写了参数名就自动有值”。

## 4. 每次外层调用有独立环境

```js
const first = createCounter();
const second = createCounter();

first();  // 1
first();  // 2
second(); // 1
```

两次 createCounter 调用各自创建 count。独立来自不同的调用环境，不是仅仅因为变量名不同。

在 withAuth 中，不同包装器可以记住不同的业务 fn；同一个 GET 的不同请求又各自接收新的 request，并查询本次请求的 user。
不要在外层变量里保存“当前用户”供所有请求共享，否则可能引入跨请求串用身份的问题。

## 5. 易错点与 React / Vue 对比

- 闭包本身不意味着异步，也不要求使用 async。
- 外层函数返回后，仍被可达闭包引用的环境可以继续存在；闭包不是必然内存泄漏，关键是是否持有不再需要的数据或订阅。
- 闭包捕获变量绑定；但如果先读取一个基本类型值，保存到另一个变量，后者不会因此自动关联来源。
- Vue ref(props.title) 创建独立初值，不因为代码处于闭包中就自动同步；响应式依赖追踪是另一套机制。
- React 每次渲染都有自己的变量绑定，回调可能保留某次渲染的状态值。这是理解“旧闭包”的基础，不等于闭包都只保存创建时的快照。
- Vue 的组件状态、React 的 useState 不应简单概括为“就是闭包”；还涉及各框架的响应式或状态管理机制。

## 6. 验证与掌握边界

- 学习者已能指出 withAuth 的内层引用了外层 fn。
- 曾将 withAuth(fn) 与返回函数的执行混淆，经过实际代码和分步图纠正。
- 当前尚未通过独立迁移 GET 的运行验收；本条目不以“听懂”代替独立掌握。
- 计数器是说明机制的示例，不宣称本轮已经在项目中实际运行该示例。

## 7. 自测与面试表达

1. 执行 const GET = withAuth(fn) 时，会立即查询用户吗？
2. fn、request、user 哪个是内层引用的外层变量？
3. 外层函数已经返回，内层为什么还能调用 fn？
4. 为什么两次 createCounter 调用得到的计数器互不影响？
5. 闭包为什么不等于“永远保存一个固定快照”？

项目表达示例：我用高阶函数封装接口认证，利用闭包保留业务处理函数；请求到来时再验证会话，并把本次请求和可信用户传给业务函数，避免把当前用户放入跨请求共享变量。

## 关联条目

- [认证、会话与业务权限](04-authentication-sessions-and-authorization.md)
- [派生数据与编辑草稿](02-derived-data-and-editing-drafts.md)
- [知识库总目录](../../KNOWLEDGE_REVIEW.md)

## 更新记录

- 2026-11-03：从 withAuth 学习过程提炼为独立 JavaScript 条目，记录执行时机混淆及掌握边界。
