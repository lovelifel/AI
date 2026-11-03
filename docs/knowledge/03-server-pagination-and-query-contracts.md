# 服务端分页与查询契约

- 日期：2026-11-03。
- 环境：Next.js 16.4.2、Drizzle、PostgreSQL、Zod。
- 状态：查询与请求层经提示修正后完成；分页 UI 与联动由导师实现，部分运行场景已验证，不记为完全独立实现。

## 目标与数据流

```text
首屏 URL q/page → page.tsx 校验 → listTasksPage → 数据库
页面内搜索/翻页 → getTasksPage → GET 参数校验 → listTasksPage
两条路径返回 TaskPage → 客户端展示列表与分页
```

路径与符号均关联 src/app/tasks/page.tsx、src/app/api/tasks/route.ts、src/lib/server/tasks.ts、src/lib/api/tasks.ts、src/components/TaskDraft.tsx。

## 分页参数

- page：从 1 开始的页码。
- pageSize：每页条数，当前固定为 5。
- offset = (page - 1) * pageSize：跳过多少条记录。
- tasks.length：本页条数。
- total：所有匹配条数，统计时使用相同搜索条件，但不使用 limit/offset。
- 总页数：Math.max(1, Math.ceil(total / pageSize))；本项目空结果按第 1 页展示。

12 条数据，每页 5 条，第 3 页跳过 10 条，返回 2 条，total 仍是 12。
列表先按 createdAt、id 升序，保证同一数据集具有确定顺序；offset 分页在并发增删时仍可能发生页间漂移，不等于数据库快照。

## 参数与返回值契约

- URL 输入的 page 是字符串，用 z.coerce.number().int().min(1) 转换校验。
- URLSearchParams.get 缺失返回 null，传给 default(1) 前应转换为 undefined。
- 返回对象为 { tasks, page, pageSize, total }，由 TaskPageResponseSchema 校验，类型由 z.infer 推导。
- 前端用 URLSearchParams 编码，避免搜索词中的 &、# 等被当成 URL 结构。
- listTasksPage 接收已经校验的参数，返回数据对象；GET 返回 HTTP Response，两者职责不同。

## Review 中发现的问题

1. async 函数返回对象不会自动 await 属性中的 Promise，查询本身要 await。
2. 修改旧 listTasks 的默认行为会使未迁移页面静默截断；迁移期间先独立提供分页查询。
3. GET 校验出 page 却没有传给查询，会始终使用默认第 1 页；TypeScript 无法识别合法可选参数漏传的业务错误。
4. 手动拼 URL 多出 } 导致页码无效，直接拼搜索词也会造成编码错误。

## 客户端状态与 URL

- 客户端保存完整 result，而非只保存 tasks；任务数组从 result.tasks 读取。
- 当前请求页码 page 与 totalPages 配合导航；总页数是派生值，不额外维护状态。
- 新搜索回到第一页；翻页保留搜索条件；首屏接收服务端查好的分页对象，不重复 GET。
- 延用 replaceState：更新当前历史项，不为每次翻页新增历史项。若产品要求逐页后退，应另行设计 pushState 策略。
- 保留防抖、AbortController、ignore 与写操作锁；状态更新按 ID 替换 result.tasks。
- 重查发现页码超出总页数时，切到新的最后一页再查询，覆盖删除末页唯一记录的场景。

## 已验证范围

- 类型与 ESLint 检查通过。
- GET 默认页、第 2 页、page=0/abc：返回结构和状态符合预期。
- 用 6 条唯一前缀测试任务，浏览器验证每页 5 条、第二页 1 条、第二页刷新。
- 第二页改变搜索词回到第 1 页，URL 与列表一致。
- 删除第二页唯一任务后，回到新的最后一页并同步 URL。
- 状态更新及从搜索返回全量列表正常。
- 6 条测试任务均按本次创建得到的专用 ID 清理，原有任务未修改。
- 截图：../../artifacts/task-pagination-acceptance.png（清理后界面）。

未完整验证：并发增删、真实网络错误与请求乱序、生产构建。旧 getTasks/listTasks 暂保留，未当作全量数据的新入口使用。

### 越界页地址规范化（2026-11-03）

- 学习者在 page.tsx 中查询后计算总页数，仅在请求页超出范围时 redirect 到最后有效页，保留并编码 q。
- Review 纠正：redirect 应放在越界分支内；目标页码是 totalPages；initialKeyword 仍为字符串。
- 类型检查通过；浏览器验证 q 为 React & Vue、page=99 时跳到 page=1，搜索词保持完整；正常 /tasks 页面正常展示，无循环跳转。测试未写数据库。
- redirect 改变访问地址并终止当前渲染；revalidatePath 通知路径数据更新，不等同于导航。API 越界返回空数组，页面层选择跳转，是不同层次的契约。

## 自测

### 扩展：可选状态筛选（2026-11-03）

- 输入 status 缺省表示全部；todo/done 表示筛选，其他值返回参数错误。Zod 使用 TaskStatusSchema.optional()。
- 条件使用 and(标题条件, 状态条件)，不需要的条件传 undefined；列表与计数复用该条件。
- 参数须贯穿：首屏 page → 查询；客户端请求 → GET → 查询。URL 越界跳转也保留 status，不能只改函数签名而不传值。
- 客户端将初始状态作为 prop 传入，监听 URL 的 q/page/status；程序自身写 URL 时记录同样的三元组，避免重复查询。
- 切换状态回到第一页，搜索与翻页保留状态，全部状态时删除 URL 的 status 参数。
- 带状态筛选时，更新一条任务可能使其退出当前结果，需重查以同步成员、total 和页码，不能仅替换行内容。
- 浏览器用 7 条专用测试任务验证：6 todo/1 done、todo 第二页首屏、切到 done 回第一页、todo 第二页唯一任务改 done 后回退、标题和状态组合搜索、越界跳转保留状态、顶部导航恢复全部。测试数据已按专用 ID 全部清理，未改原任务。
- 查询与入口由学习者在提示后完成，客户端联动由导师完成；不将本轮记为完全独立实现。类型与 lint 通过；并发写入和真实网络故障未全面验证。

1. 为什么 tasks.length 不能作为 total？
2. 为什么计数查询和分页查询必须使用相同搜索条件？
3. 为什么搜索变化应回到第 1 页？
4. 为什么类型通过，page=2 仍可能查询第 1 页？
5. 删除最后一页唯一任务后，如何避免留下空页？

[返回知识库目录](../../KNOWLEDGE_REVIEW.md)
