# 身份认证、会话与业务权限

- 日期：2026-11-03。
- 环境：Next.js 16.4.2、Better Auth / Drizzle adapter 1.7.15、PostgreSQL。
- 状态：认证配置、建表及注册登录流程已检查并局部运行验收；任务权限尚未实现。

## 核心分工

- Authentication：认证身份，确认你是谁。
- Session Management：会话管理，后续请求如何持续识别登录者。
- Authorization：业务授权，当前用户能否访问或修改某条任务。

库验证用户身份；业务仍须按当前用户 ID 检查任务归属。隐藏按钮不能防止直接构造接口请求。
身份 ID 必须来自服务端验证的会话，不能相信客户端提交的 userId。

## 数据库会话流程

```text
验证登录信息 → 创建服务端会话 → 通过 Set-Cookie 下发凭证
后续请求携带 Cookie → 服务端验证会话及有效期 → 得到用户身份
→ 按业务归属条件访问数据
```

Cookie 是凭证传输方式，不等于有效身份。HttpOnly 限制页面 JS 读取，不证明凭证真实；伪造内容无法自动产生有效会话。
不用认证库时，需要自己实现密码哈希与验证、会话生成与失效、Cookie 配置、注册登录退出、过期处理与相关安全防护；仍应依赖成熟密码工具，不自己设计算法。

## 项目文件分工

| 文件 | 职责 |
| --- | --- |
| src/lib/auth.ts | 服务端认证实例，包含 server-only 与 Drizzle adapter |
| src/lib/auth-options.ts | 共享影响认证表结构的选项 |
| auth-schema.config.ts | 仅用于生成 schema 的 CLI 配置，读取本地环境，不导入 db |
| src/lib/db/auth-schema.ts | 用户、账号、会话、验证表的 Drizzle 定义 |
| drizzle.config.ts | 指定任务及认证表定义，生成数据库迁移 |
| src/app/api/auth/[...all]/route.ts | Next.js catch-all 请求入口，将 GET/POST 交给库 |
| src/lib/auth-client.ts | 浏览器使用的认证客户端，同源请求 /api/auth |
| src/components/AuthPanel.tsx | 登录/注册表单、会话展示与退出交互 |
| src/app/login/page.tsx | Next.js /login 页面入口 |

route.ts、page.tsx 及 catch-all 目录语法是 Next.js 约定；其余文件名是自定义组织。

## 库内部做了什么

- 注册：输入校验、密码哈希、创建用户/账号，默认自动登录。
- 登录：根据邮箱查询账号、验证密码、创建会话、设置 Cookie。
- 获取会话：识别凭证、验证会话与过期时间、返回当前身份。
- 退出：使当前会话失效并处理 Cookie。

浏览器调用 signUp.email / signIn.email / signOut，useSession 读取会话状态；客户端方法仍发网络请求，不会直接连接数据库。
当前使用认证客户端 + Route Handler，不通过自定义登录 Server Action，不需要为这条路径额外引入 nextCookies 插件。

## 数据表与迁移

- user：用户资料，邮箱唯一。
- account：账号与认证方式；密码哈希等认证数据，不向页面返回。
- session：会话凭证、用户关系与过期时间，不记录到日志或截图。
- verification：验证类临时凭证；建表不表示已配置邮箱验证或找回密码服务。

schema 代码 → drizzle-kit generate 生成 SQL → Review → drizzle-kit migrate 应用。
本项目 0002_add_auth_tables 保留 tasks，新增四张认证表、约束和索引；实际数据库与迁移记录已只读确认。

## 排错案例：CLI 无法加载 server-only

Next.js 支持的服务端边界标记，并非所有独立 Node CLI 都能解析。
生成工具加载运行配置报 Cannot find module server-only 时，不移除业务保护。
本项目拆出 CLI 配置并共享 auth-options，使用：

```powershell
npx.cmd auth@1.7.15 generate --config ./auth-schema.config.ts --adapter drizzle --dialect postgresql --output ./src/lib/db/auth-schema.ts
```

CLI 可以在不加载 db 的情况下生成表定义；重新生成时检查文件差异，避免覆盖既有手改内容。

## 实际验收与边界

- 类型、ESLint 检查通过。
- 专用测试账号通过页面注册并自动登录、刷新保持会话、退出、错误密码提示、正确密码重新登录。
- 只统计测试用户的账号和会话数量，不输出哈希、token、Cookie 或密钥。
- 测试账号已退出，并按专用 ID 与邮箱共同限定删除；关联账号和会话均已清理，原任务未修改。
- 注册登录页面与客户端接线由导师实现；学习者仍需独立观察请求与复述流程。
- 任务归属、页面访问保护、所有业务 API/Action 的权限检查尚未接入。不能把认证流程可用表述为多用户数据隔离已完成。
- 邮箱验证、找回密码、生产部署与安全边界测试未在本轮完成。

## 自测与资料

### withAuth 与闭包：创建和执行是两个时机

完整 JavaScript 原理与自测见 [闭包专题](05-javascript-closures.md)，本节保留认证包装器的上下文。

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

- withAuth(fn) 接收业务函数，创建并返回处理函数；此时不执行返回函数内部的代码，不查询用户。
- 接入方式是 export const GET = withAuth(fn)。GET 就是返回的函数，Next.js 收到请求后调用它并传入 request。
- 内层函数查询用户，再明确调用 fn(request, user)；业务回调的参数不是自动出现的。
- 内层函数保留外层 fn 的引用，这是闭包；request 是每次调用内层函数传入的新参数，不是外层捕获值。
- Handler 返回类型 Response | Promise<Response> 同时允许同步、异步业务函数。
- 2026-11-03 收尾时，包装器已经编写，但 GET 尚未迁移；统一异常处理及动态路由 context 支持仍未实现。

复习题：加载模块执行 withAuth(fn) 时会查询用户吗？收到请求后由谁传入 request？外层返回后为什么仍能调用 fn？

1. 登录有效为什么不等于可以操作所有任务？
2. HttpOnly 和会话有效性校验分别负责什么？
3. 为什么退出不能只清空页面中的用户变量？
4. 页面怎样通过客户端、认证入口、库和数据库完成一次登录？

- [Better Auth 基本使用](https://better-auth.com/docs/basic-usage)
- [Next.js 集成](https://better-auth.com/docs/integrations/next)
- [Drizzle adapter](https://better-auth.com/docs/adapters/drizzle)
- [CLI](https://better-auth.com/docs/concepts/cli)
- [知识库目录](../../KNOWLEDGE_REVIEW.md)
