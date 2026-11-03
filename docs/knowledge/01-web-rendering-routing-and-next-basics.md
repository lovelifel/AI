# Web 渲染、路由与 Next.js 基础

用于学习后的复习和面试表达。首次整理：2026-11-02。

- 返回：[知识库总目录](../../KNOWLEDGE_REVIEW.md)。
- 适用版本：当前项目 Next.js 16.4.2、App Router、开启 cacheComponents；缓存与导航行为需结合版本和配置判断。
- 状态：已讲解，部分代码已检查；实际验收证据见 LEARNING.md，不代表整篇独立验收通过。

## 1. 三个维度不要混在一起

| 维度 | 要回答的问题 | 相关概念 |
| --- | --- | --- |
| 应用组织与导航 | 页面如何组织、切换时是否加载新文档？ | SPA、MPA、客户端导航 |
| 内容生成 | 主要页面内容在哪里、什么时候生成？ | CSR、SSR、SSG |
| 组件生命周期 | 切换后组件被重新创建，还是保留状态？ | 挂载、重新渲染、卸载、缓存保留 |

CSR、SSR、SSG 与 SPA、MPA 不是五种互斥模式。一个应用可以混合多种渲染方式。

## 2. 缩写、含义与例子

| 缩写 | 英文全称 | 中文 | 例子 |
| --- | --- | --- | --- |
| CSR | Client-Side Rendering | 客户端渲染 | 常见 Vue 后台：浏览器运行 JS、请求 JSON、生成列表 DOM |
| SSR | Server-Side Rendering | 服务端渲染 | 任务详情首屏：服务端查询数据库，生成页面内容 |
| SSG | Static Site Generation | 静态站点生成 | VitePress 文档：构建时生成 HTML，访问时直接提供 |
| SPA | Single-Page Application | 单页应用 | Vue Router 切换用户页、订单页，不重新加载整个文档 |
| MPA | Multi-Page Application | 多页应用 | 传统 JSP 网站通常在跨页面导航时请求新的 HTML 文档 |

典型组合：Vue 管理后台常见 SPA + CSR；传统 JSP 网站常见 MPA + SSR。
这些是例子，不代表 Vue 只能 CSR，或所有 SSR 网站都必须整页导航。
Vue Router 的 hash/history 是 URL 管理方式，两者均可用于 SPA，与 CSR/SSR 不是同一维度。

## 3. 浏览器解析 HTML 不等于 CSR

所有网页最终都需要浏览器解析、布局和绘制，无论内容来自 CSR、SSR 还是 SSG。

简化过程：

```text
接收 HTML → 解析成 DOM
加载、解析 CSS → CSSOM
结合 DOM 与样式 → 计算可见内容
布局 → 计算位置和尺寸
绘制与合成 → 显示像素
```

脚本加载、执行与上述步骤可能交错；JS 可以修改 DOM 或样式，触发后续更新。并非每次更新都需要完整经历所有步骤。

SSR 的示例 HTML 已含主要内容：

```html
<ul><li>学习 React</li></ul>
```

典型 CSR 首先提供挂载点和脚本，再由浏览器中的 JS 创建主要内容：

```html
<div id="app"></div>
<script src="/app.js"></script>
```

两者区别在于主要内容由谁生成，不是浏览器是否解析 HTML。SSR 内容展示后，通常还需 JS 补上交互；React 的 hydration 会为已有服务端 HTML 接上客户端逻辑。

## 4. 当前 Next.js 项目的导航与渲染

| 操作 | 含义 |
| --- | --- |
| 地址栏直接访问、浏览器刷新 | 加载页面文档，服务端参与生成内容 |
| 点击 Next.js Link | 客户端导航，复用共享布局，使用预取结果或按需请求路由数据 |
| 请求 /api/tasks | 业务接口，主要返回 JSON |
| 请求页面的 RSC 数据 | 返回 React Server Component Payload，供框架更新服务端组件内容 |
| 提交 Server Action | 通过 POST 调用服务端函数 |
| Action 中调用 revalidatePath | 使相关路径数据失效；当前受影响页面可随本次操作更新 |

SSR 与客户端导航可以配合。RSC Payload 不是普通 JSON 业务接口，也不等同于 HTML 或 SSR 本身。

### 路由变化、重新渲染、重新挂载

- 路由变化：当前地址或展示的路由改变。
- 重新渲染：React 再次执行组件函数，计算 UI。
- 重新挂载：创建新的组件实例，重新初始化状态。

这三件事不等价。当前项目开启 cacheComponents，安装版本会借助 React Activity 在导航间保留客户端组件状态；具体状态是否保留，要结合导航路径与组件身份判断。

```tsx
const [tasks, setTasks] = useState([...taskList]);
```

这只是首次挂载时的状态初始化。后续即使组件重新渲染、taskList 收到新值，React 也不会自动用它覆盖已有 tasks。

Vue 类比：普通路由切换可能创建新组件；同组件参数变化可能复用实例；KeepAlive 可以保留状态。不要把 Next.js 状态保留机制与 KeepAlive 视为完全相同。

## 5. Next.js 特殊约定与自定义命名

以下约定以 App Router 的 app 路由目录为上下文，并非放在任意目录都生效。

| 名称 | 框架约定？ | 用途 |
| --- | --- | --- |
| page.tsx | 是 | 当前路径的页面 |
| layout.tsx | 是 | 共享布局 |
| loading.tsx | 是 | 加载界面与对应 Suspense 边界 |
| error.tsx | 是 | 对应路由段的错误界面 |
| not-found.tsx | 是 | 对应的资源不存在界面 |
| route.ts | 是 | HTTP 请求处理入口 |
| [id] 文件夹 | 是 | 动态路径参数 |
| generateMetadata 导出 | 是 | 动态页面元信息 |
| actions.ts | 否 | 自定义模块名，用于组织服务端操作 |
| TaskTitleForm.tsx | 否 | 自定义表单组件名 |
| lib/server/tasks.ts | 否 | 自定义查询模块路径 |

actions.ts 不会自动生成 /tasks/actions 路由；它通过 import 使用。单独导出 metadata 与 generateMetadata 不能在同一路由段同时使用。

## 6. Server Action 与表单的数据流

Action 是可以经网络调用的服务端函数；actions.ts 只是组织它们的普通文件。函数也可以在服务端页面中定义，再传给表单。

| 写法 | 作用 |
| --- | --- |
| use client 指令 | 声明客户端模块边界；不代表首屏 HTML 一定只在浏览器生成 |
| use server 指令 | 标记服务端可调用函数，或文件中的服务端函数导出 |
| import server-only | 防止服务端模块被客户端模块导入 |

表单根据控件的 name 收集字段，id 主要用于 DOM 标识和 label 关联。无 name 或 disabled 的输入框不会作为普通成功控件提交。

```text
form 提交 → FormData → 服务端 Action
→ Zod 校验 → 数据库更新 → 页面数据刷新 + 返回操作结果
```

前端限制可被绕过，服务端必须校验参数。隐藏 ID 也不能作为权限证明；涉及用户数据时还需认证和授权。
标题 trim 后再校验：首尾有空格的有效标题允许保存，纯空格会变为空字符串并失败。

### useActionState：React Hook，不是 Next.js 文件约定

```tsx
const [state, formAction, pending] = useActionState(updateTaskTitle, initialState);
```

变量名可改，但数组返回位置固定：结果状态、表单提交函数、是否提交中。

```text
formAction(FormData)
→ React 管理 pending，并传入上次状态
→ updateTaskTitle(prevState, FormData)
→ Action 返回值成为新的 state
```

formAction 最终调用 Action，但不等同于 Action；它还连接了状态管理。

## 7. 三类容易混淆的“刷新与缓存”

| 概念 | 作用 | 不保证什么 |
| --- | --- | --- |
| React cache | 同次服务端渲染中，相同缓存函数、相同参数共享查询结果 | 不跨请求长期保存数据库结果 |
| revalidatePath | 通知 Next.js 某路径数据需要更新 | 不等于路由跳转、浏览器整页刷新，也不自动覆盖任意客户端 useState 副本 |
| 浏览器刷新 | 重新加载整个页面文档，重新启动应用 | 不是日常数据同步的首选方案 |

当前案例：generateMetadata 和详情正文都查询同一 ID，可用 React cache 避免同次渲染重复查询。
修改标题同时影响详情与列表，应分别考虑路径数据更新和列表客户端状态同步。

### 项目验收记录：标题修改后返回列表

- 2026-11-02：Action 成功更新后，对详情路径和 /tasks 调用 revalidatePath。
- 学习者运行反馈：从详情改名后通过顶部导航返回，列表显示新标题。
- 学习者运行反馈：在 React 搜索中打开详情，将标题改为不含 React 后后退，搜索条件保留，任务不再出现在匹配结果中。
- 这两项场景已获反馈，无需额外添加客户端状态同步；不推断所有导航、并发或缓存场景均已覆盖。导师未在本轮自动化复验。

## 8. 自测与面试复述

1. 浏览器都要解析 HTML，为什么不都叫 CSR？
2. SSR 页面能否通过客户端导航切换？
3. Vue Router 的 history 模式是否等于 SSR？
4. React 组件函数再次执行，为什么 useState 不重新初始化？
5. actions.ts 改名后还能用吗？page.tsx 改名后会怎样？
6. formAction 与服务端 Action 的参数、职责有什么不同？
7. 数据库更新成功后，为什么当前列表仍可能显示旧内容？

排错顺序：确认数据库结果 → 确认服务端是否重新查询 → 确认客户端收到的数据 → 确认页面使用的是 props 还是保留的 state。不要看到旧 UI 就直接认定数据库更新失败或组件函数没有执行。
