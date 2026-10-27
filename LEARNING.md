# Agent Workspace 学习记录

## 学习背景与目标

- 背景：Vue 前端工程师，有 Wujie 微前端、SSE、ECharts、高德地图 API 项目经验；具备 Node.js、REST API 和基础数据库知识。
- 目标：2027 年跳槽涨薪，成长为具备 AI 应用与 Agent 开发能力的全栈前端工程师。
- 周期：2026-10-19 开始，共 16 周，每天约 2 小时，以项目驱动学习。
- 主线项目：Agent Workspace。
- 目标技术栈：Next.js、TypeScript、Tailwind CSS、Node.js、Vercel AI SDK、PostgreSQL、Drizzle、Zod。
- 最终能力：AI 对话、流式响应、工具调用、知识库检索、Agent 任务执行与执行轨迹可视化。

## 协作约定

1. 导师先解释目标与必要知识，再布置任务，由学习者实现，最后进行代码 Review。
2. 优先提示和追问，不直接提供完整实现；修改项目代码前说明目的与影响。
3. 每天包含理论、实践、复盘，不随意跳跃阶段；每周进行一次掌握情况验收。
4. 记录工程问题、验证过程与结论，逐步转化为可用于面试的经验。
5. 区分待完成、已完成和已验证；未经验证的结果不能标记通过。
6. 写 Next.js 代码前，阅读当前安装版本的 node_modules/next/dist/docs/ 中相关指南。
7. 保留工作区原有变更，不擅自清理、还原或提交。

## 16 周路线

| 阶段 | 周次 | 日期 | 学习重点 | 阶段验收方向 |
| --- | --- | --- | --- | --- |
| 第一阶段 | 1–4 | 2026-10-19 至 2026-11-15 | Next.js、React、TypeScript、全栈基础 | 能解释页面、组件、路由和基础服务端交互，并独立实现基础功能 |
| 第二阶段 | 5–8 | 2026-11-16 至 2026-12-13 | 大模型 API、流式输出、Tool Calling | 完成对话、流式展示和工具调用，说明错误处理与密钥边界 |
| 第三阶段 | 9–12 | 2026-12-14 至 2027-01-10 | RAG、Embedding、Agent 工作流 | 完成知识检索与任务工作流，并解释执行过程 |
| 第四阶段 | 13–16 | 2027-01-11 至 2027-02-07 | 工程化、部署、测试、简历与面试 | 项目可演示、可部署，能够说明设计取舍和验证证据 |

具体每日任务根据实际掌握情况细化，不将未来阶段功能提前堆入项目。

## 当前工程基线

检查日期：2026-10-19。

| 检查项 | 结果 | 验证说明 |
| --- | --- | --- |
| 工程位置 | 当前仓库根目录 | C:\Users\smartens\Desktop\AI Applicatin |
| 项目名称 | agent-workspace | package.json 的 name |
| 框架依赖 | Next.js 16.4.2、React / React DOM 19.3.0 | package.json；此前已核对安装的 Next.js 版本 |
| 基础工具 | TypeScript、Tailwind CSS 4、ESLint 9 | 已声明依赖，node_modules 存在 |
| TypeScript 配置 | strict 开启；@/* 指向 ./src/* | tsconfig.json |
| 应用入口 | src/app/page.tsx、src/app/layout.tsx | 已完成静态介绍页、项目 metadata 与中文语言设置 |
| 启动命令 | npm run dev | 脚本存在；实际启动与浏览器显示待验证 |
| 静态检查 | npm run lint 通过 | 本次对话此前执行，退出码 0；后续修改需重新检查 |
| 生产构建 | 待验证 | 尚未运行 npm run build |
| AI、数据库依赖 | 当前 package.json 尚未声明 | 留到对应阶段引入 |
| Git 状态 | 有既存修改、删除、暂存及未跟踪文件 | 旧 app、components、hooks、lib 存在删除；src 未跟踪，需保留现场 |
| 同名子目录 | agent-workspace 子目录为空 | 此前目录检查；当前应用在根目录，无需重复初始化 |

Node.js v22.22.1、npm 10.9.4、Git 2.51.0.windows.1 为学习者提供的已检查环境版本，本轮未重新测量。

## Day 1 — 2026-10-19

状态：核心实践与概念验收通过；学习者书面复盘、文案润色及部分过程记录待补充。

### 今日目标

确认现有工程能够启动，理解 App Router 的页面与根布局，亲手完成最小静态项目介绍页。今天不接入模型、数据库或 Agent。

### 理论（约 25 分钟）

- page.tsx 定义路由页面，src/app/page.tsx 对应 /。
- layout.tsx 定义共享布局，通过 children 接收页面；根布局包含 html 和 body。
- React 组件是返回 JSX 的函数；JSX 使用 className 设置样式类，使用花括号插入 JavaScript 表达式。
- 页面和布局默认为 Server Components；静态介绍页无需添加 "use client"。
- 了解 metadata 的标题、描述与 html 的 lang 分别影响什么。
- 参考本地指南：node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md 和 05-server-and-client-components.md，导师已阅读。

### 实践（约 65 分钟）

- [x] 导师检查工程目录、入口、依赖与 Git 状态。
- [x] 创建 LEARNING.md，记录路线、任务与验证状态。
- [x] 学习者确认浏览器首页可见（口头反馈）；具体启动命令未单独核实。
- [x] 学习者修改 src/app/page.tsx，展示项目名称、介绍、AI 对话 / 知识库检索 / Agent 任务三个能力条目。
- [x] 用一个字符串变量保存项目名，并在 JSX 中引用。
- [x] 移除不再使用的默认模板 import。
- [x] 修改 src/app/layout.tsx 的 metadata 标题、描述和页面语言，保留字体及其他配置。
- [ ] 运行 npm run lint，记录结果。
- [x] 向导师提交首次 Review 请求，由导师读取实际改动。

### 验收与复盘（约 30 分钟）

- [x] 学习者确认页面内容正常显示；热更新过程未单独核实。
- [x] 学习者确认标签页标题正常；导师执行静态检查通过。
- [x] 能解释 page.tsx 与 layout.tsx 的分工；children 的页面插入作用已讲解。
- [ ] 能解释 JSX 与 Vue template 至少两个差异。
- [x] 经提示后能说明静态页面无需客户端交互，计数按钮需要客户端组件。
- [x] 完成代码 Review，并记录问题、修改理由和复验结果。

### 今日问题记录

| 问题 | 当前证据 / 理解 | 后续动作 |
| --- | --- | --- |
| 是否需要重新初始化项目？ | 根目录已有依赖、配置和默认页面 | 直接在现有工程学习 |
| 为什么 Git 显示旧文件删除和 src 未跟踪？ | 仓库有旧聊天应用提交，当前工作区与该提交存在较大差异；原因尚未确认 | 保留变更，提交前单独核查，不执行 git add . 或还原 |
| 静态首页为何不需要 use client？ | 本地指南说明页面默认是 Server Component；具体理解待学习者复述 | Review 时检查理解 |
| 开发服务能否正常启动？ | 尚无运行证据 | 学习者启动并记录地址、结果或完整错误 |

### 学习者复盘（完成后填写）

- 今天我实现了：学习者复盘“实现了 Next 框架搭建，认识了 page、layout 作用”；实际检查确认现有工程已初始化，学习者完成静态首页修改。
- 我能独立解释的概念：待填写。
- 最卡住的问题及解决过程：待填写。
- 验证命令与结果：待填写。
- 明天需要巩固的内容：待填写。

### 代码 Review

首次小练习 Review（2026-10-19）：

- 已核对 page.tsx 的 h1 内容为 Agent Workspace。
- 已核对 layout.tsx 的 metadata.title 为 Agent Workspace · 学习项目。
- 导师重新执行 npm run lint，退出码 0，通过。
- 本次两项修改符合任务要求，未发现需要修正的问题；默认模板其余内容仍保留，属于后续练习。
- 学习者已能指出 children 的位置和 metadata 配置标题；已讲解字体导入与页面文字来源的区别。
- 浏览器实际显示、热更新及标签页标题尚未独立验证，待学习者明确反馈。
- 下一步：用变量与 JSX 表达式显示项目名称，再替换默认介绍内容。

第二次小练习 Review（2026-10-19）：

- projectName 使用 const 声明于 Home 函数内，并通过 {projectName} 正确显示，代码检查通过。
- 默认英文介绍已替换为“一个小强的故事”；语法正确，但尚未说明项目用途，需要补充项目定位。
- 导师重新执行 npm run lint，退出码 0，通过。
- 学习者反馈“可以了”，视为本轮练习完成反馈；未单独明确浏览器标题与热更新结果，不标记独立验证。
- 下一步：完善项目介绍、添加三个静态能力条目、清理默认 Logo 与外链，并更新 description 和 lang。

第三次小练习 Review（2026-10-19）：

- 静态页面结构符合任务要求：项目名变量、项目介绍、ul/li 三个能力条目均已完成。
- 默认 Logo、外链及 Image import 已清理；metadata.description 与 lang="zh-CN" 已更新。
- 导师执行 npm run lint，通过，退出码 0；学习者是否自行执行尚未确认。
- 无阻塞代码问题。介绍及 description 有“开发得”“目的之”等文字问题，建议学习者润色；不是语法错误，lint 不会检出。
- 浏览器实际效果仍待明确反馈；Day 1 保持进行中，等待理论复盘与最终验收。

首次理论复盘反馈（2026-10-19）：

- 学习者正确区分页面内容与布局容器；补充：根布局包裹整个应用，嵌套布局只作用于对应路由子树。
- 学习者正确理解 JSX 文本位置的 projectName 是字面文本，{projectName} 则求值并展示变量内容。
- 学习者确认首页、中文介绍、标签页标题显示正常。
- 待纠正：不使用 use client 的原因不是“没有用到 React 语法”。当前函数组件和 JSX 已属于 React；页面默认是 Server Component，本次没有需要客户端状态或事件处理的交互。
- 最终验收暂缓一项：请学习者解释为按钮添加 onClick 和 useState 计数时需要怎样设置组件边界，并说明理由。

Day 1 核心验收结果（2026-10-19）：

- 学习者正确回答计数交互组件需要 "use client"，理由是需要客户端交互能力，例如点击。
- 静态页面实践与核心概念验收通过；未替学习者实现业务代码。
- 后续补充：学习者书面复盘、介绍文案润色、JSX 与 Vue template 第二个差异，以及自行运行 lint 和热更新的过程记录。
- 下一次学习建议：先复述服务端与客户端组件的区别，再由学习者实现一个独立计数组件，练习 useState、事件处理及组件导入。

## Day 2 — 组件拆分与状态交互

状态：已验收，代码 Review、理论复盘与学习者运行确认均已完成。计划日期为 2026-10-20；实际在 2026-10-19 提前开始，Day 表示学习单元序号。

### 目标与理论（约 30 分钟）

- 理解普通变量与 React 状态的区别：普通变量赋值不会通知 React 更新界面；通过状态更新函数请求重新渲染。
- 认识 useState 返回的当前状态与更新函数；Hook 在组件顶层调用。
- 认识 onClick 接收事件处理函数，不能在渲染时直接调用处理函数。
- 独立客户端组件承载交互，首页保持 Server Component 并导入该组件。
- 当前版本的 Server and Client Components 本地指南已核对。

### 实践（约 60 分钟）

- [x] 在 src/components/StudyCounter.tsx 创建默认导出的 StudyCounter 组件，在文件顶部声明 "use client"。
- [x] 从 react 导入 useState，初始化计数为 0；当前文案为“当前的数字”。
- [x] 添加加一按钮，使用函数式更新 setCount(prev => prev + 1)，处理函数在点击时执行。
- [x] 在 src/app/page.tsx 导入并渲染 StudyCounter，保留静态页面内容。
- [x] 学习者提前补充重置按钮，使用 setCount(0)，代码 Review 通过。
- [ ] 运行 npm run lint，记录结果并请求代码 Review。

### 验收与复盘（约 30 分钟）

- [x] 学习者确认初始为 0，连续点击三次后为 3；重置后为 0。
- [x] 学习者确认再次加一后刷新恢复为 0；已讲解当前没有持久化。
- [x] 经术语纠正后理解普通表达式不会请求状态更新，应使用状态更新函数。
- [x] 能解释 onClick 传函数与调用函数的区别。
- [x] 结合 Day 1 回答与 Day 2 实践，理解交互组件的客户端边界，父页面保留服务端组件。
- [ ] 记录遇到的问题、原因、解决过程及 lint 结果。

首次代码 Review（2026-10-19）：

- 客户端边界、Hook 顶层调用、事件回调、函数式递增与重置写法正确，无阻塞代码问题。
- 父页面未添加 use client，通过 @/components/StudyCounter 导入组件，符合任务目标。
- 导师运行 npm run lint，退出码 0；学习者自行执行情况及浏览器点击、重置、刷新结果尚待明确反馈。
- 小改进：计数文案可改为“已完成练习”，按钮改为“完成一次练习”，使界面更贴合项目场景；属于文案建议。
- 待复盘：prev 的含义、函数式更新的原因、onClick 回调的执行时机、刷新后计数为何归零。

理论复盘（2026-10-19）：

- 学习者理解需要通过 setCount 更新状态；术语补充：useState 是 Hook，setCount 是它返回的状态更新函数。单独计算 count + 1 不会保存结果或请求重新渲染。
- 学习者将 prev 理解为上次快照 / 当前值；已澄清为 React 处理状态更新队列时传入的前一个状态，可能包含同批次中排在前面的更新结果。
- 学习者正确指出 onClick={setCount(0)} 会在渲染时执行，而不是等待点击。
- 学习者理解刷新后从 0 开始；补充：整页刷新导致应用重新初始化和组件重新挂载，普通重新渲染会保留状态。当前未做持久化。
- 理论复盘基本通过；浏览器连续点击、重置与刷新三项结果未逐项明确反馈，运行验收仍待确认。

今日不添加持久化或 AI 功能。

最终运行确认（2026-10-19）：学习者明确反馈连续点击、重置和刷新三项均正常。Day 2 已验收；依据为导师静态代码检查、lint 通过和学习者浏览器运行反馈，导师未独立操作浏览器。

可复述的技术经验：将有状态交互拆成独立 Client Component，由 Server Component 页面组合；通过状态更新函数驱动重新渲染，区分重新渲染与重新挂载。后续继续巩固更新队列与 prev 的含义。

下一学习单元建议：Day 3 学习 props 与 TypeScript，为计数组件传入标题和初始值；先讲解再由学习者实现。

## Day 3 — props 与 TypeScript（2026-10-20）

状态：两轮代码 Review、类型检查与默认值复盘通过；学习者确认实例独立变化，重置运行结果及错误类型体验待单独确认。

### 理论（约 30 分钟）

- props 是父组件传给子组件的输入，只读；state 是组件维护的状态。
- 使用 TypeScript 对象类型描述 props，区分必填字段、可选字段与默认值。
- 字符串属性可用引号，数字通过 JSX 花括号传入。
- 服务端页面可以向客户端组件传递字符串和数字；跨边界 props 需可被 React 序列化。
- useState(initialCount) 使用初次挂载时的初始值；后续 props 改变不会自动重置已有状态。

### 实践（约 60 分钟）

- [x] 第一轮：为 StudyCounter 定义 props 类型，title 为必填 string，initialCount 为必填 number。
- [x] 从函数参数接收 props，展示 title，并用 initialCount 初始化状态。
- [x] 重置按钮恢复为传入的 initialCount。
- [x] 首页渲染两个计数器，分别传入不同标题与初始值 0、5，保持首页为 Server Component。
- [ ] 点击一个实例时另一个不变；重置分别回到 0、5。
- [x] 将 initialCount 改为可选，解构时默认 0；第一个实例省略参数，第二个保留 5，静态代码验证通过，浏览器结果待明确确认。
- [ ] 有意将 initialCount 传为字符串，观察 TypeScript 类型提示后恢复正确代码。
- [ ] 执行 npm run lint 与 npm exec -- tsc --noEmit，记录结果。

### Review 与复盘（约 30 分钟）

- [ ] 能解释 props 与 state 的区别、数字与字符串传参的区别。
- [x] 理解两个相同组件实例各自维护状态，学习者确认运行时独立变化。
- [x] 能解释默认值与初始状态的作用，并知道 props 改变不自动重置 state。
- [ ] 记录问题、修正与验证结果；代码 Review 待实现后进行。

### 第一轮 Review — 2026-10-21

- 类型、参数解构、状态初始化、重置及两个实例的传参均正确。
- 导师运行 npm run lint 与 npm exec -- tsc --noEmit，命令正常完成，无 lint 或类型错误；学习者自行运行情况未单独确认。
- 学习者正确指出每个实例有自己的状态；补充：状态由 React 根据组件在渲染树中的位置维护，闭包不是实例状态独立的完整解释。
- 改进建议：组件标题使用 h2，保持项目标题 h1、计数器标题 h2 的层级。
- 下一步：可选 initialCount 与默认值；观察错误字符串参数的类型提示后恢复，再确认两个实例独立计数及重置的运行结果。

### 第二轮 Review — 2026-10-21

- initialCount?: number 与参数解构 initialCount = 0 写法正确；两个实例传参及 h2 标题层级已调整。
- 导师再次运行 lint 与 TypeScript 检查，无错误；未修改业务代码。
- 待巩固：学习者认为可选 number 属性只能是数字。实际读取可选属性时类型为 number | undefined；解构默认值将 undefined 替换为 0，因此组件函数内的 initialCount 为 number。
- 使用小写 number 表示数字原始类型，避免使用 Number 包装对象类型。
- 下一步复盘：省略、传入 0、传入 undefined 时默认值的行为；浏览器运行与临时错误字符串的观察过程待明确反馈。

第二轮复盘补充（2026-10-21）：

- 学习者正确回答省略 initialCount、传入 5、传入 0 分别得到 0、5、0。
- 已讲解默认值仅在缺失或 undefined 时生效；传入 0 不会触发默认值替换。
- 学习者明确确认两个计数器独立变化；重置分别回到 0、5 的运行结果未单独确认，不据此标记完整运行验收。
- 核心实现与本轮默认值理解通过。后续复盘仍需区分 props 与 state，并回顾 props 改变不会自动重置已有 state。

Day 3 后续复盘：学习者正确回答 props 改变不会自动覆盖已有状态，因为 useState 的参数用于初始化；已补充重置事件会使用最新 props。核心概念复盘通过。

## Day 4 — 数组渲染与 key（2026-10-21）

状态：核心实践已验收；最终代码 Review、静态检查、索引 key 错位实验与稳定 id 修复的运行反馈均已完成。Day 为学习单元序号。

### 理论（约 25 分钟）

- 使用对象数组描述数据，使用 map 将每项转换为 JSX；类比 Vue 的 v-for。
- 为能力定义 Feature 类型，包含 id、title、description 三个 string 字段，数组使用 Feature[]。
- map 直接返回的最外层元素需要稳定 key；同级列表内唯一即可，优先使用数据 id。
- key 用于 React 匹配列表项身份；索引在增删或排序后可能关联到不同数据，随机值会导致身份不稳定。
- 数组渲染本身不需要客户端状态，首页继续保留 Server Component。

### 实践（约 65 分钟）

- [x] 定义 Feature 类型及 features 数组，包含三个能力的稳定数字 id、标题与描述；数字 id 同样有效，无需为符合最初示例改成字符串。
- [x] 使用 features.map 替换手写的三个 li，在直接返回的 li 上设置 key={feature.id}。
- [ ] 每项显示标题与描述，明确能力尚在规划中，保留现有计数组件。
- [ ] 只添加第四条数组数据，确认无需修改列表 JSX 即可展示新条目；随后可保留或删除该条。
- [ ] 运行 lint 和 TypeScript 检查，提交第一轮 Review。
- [x] 已将单项展示拆为 FeatureItem 组件，props 与 key 位置正确；客户端边界待修正。

### 验收与复盘（约 30 分钟）

- [x] 学习者正确回答 map 回调使用花括号函数体需要显式 return。
- [x] 已通过代码与实验理解 key 的位置和稳定性，并讲解同级唯一性。
- [ ] 能说明为什么渲染数组不需要 use client。
- [ ] 记录实现问题与验证结果，完成代码 Review。

### 第一轮 Review — 2026-10-21

- features 数组位于组件外，Feature[] 类型、map 隐式返回、li 的稳定 key 均正确，两个计数组件保留。
- 导师分别执行 npm run lint 和 npm exec -- tsc --noEmit，均退出码 0。
- 学习者正确回答删除第一项后索引 0 对应原来的第二条；已解释索引不能稳定表示数据身份。
- 改进：当前能力标题为 h3，但没有对应 h2 父级标题；可直接改为 h2，或添加 h2“规划能力”后保留 h3。
- 描述尚未明确这些能力处于规划阶段；建议添加“规划能力”等说明，避免读者误认为已实现。
- 第四条数据的浏览器验证尚未单独确认；待复盘 map 回调使用花括号时的 return，以及静态数组渲染为何无需 use client。

### 第二轮 Review — 2026-10-21

- FeatureItem 的 title / description props、默认导出、li 结构及 h2 层级正确；首页 map 直接返回组件，并设置稳定 key。
- 导师运行 lint 与 TypeScript 检查，均退出码 0。
- 待修正：FeatureItem 顶部添加了不必要的 use client。组件仅展示 props，无状态、事件或浏览器 API，应由学习者删除该声明，保留为 Server Component。
- 已讲解 key 不仅影响性能，也用于匹配列表项身份和保留正确状态；key 不作为普通 props 传入。
- 学习者确认增加数组项会渲染、花括号函数体需要 return；第四条临时数据实际运行过程未单独核实。
- 规划阶段文案仍未补充，作为页面内容建议保留。

### key 实验复盘与收尾 — 2026-10-21

- 学习者实际观察到反转数组后 title 改变、count 保留，已理解：索引 key 使 React 复用原位置的组件状态，props 更新不意味着 state 重新初始化。
- 当前实验放在 page.tsx，页面因此添加 use client；FeatureItem 文件已删除该声明，但当前被客户端页面导入，仍进入客户端模块图。
- 下一步保留实验并整理边界：学习者将计数器数组状态、反转按钮、列表渲染移到独立 CounterListDemo 客户端组件，首页恢复服务端组件。
- 实验最终版本使用稳定 id 作为 key，并确认反转后计数跟随标题移动。
- 当前计数器列表的 ul 下由 StudyCounter 返回 div，需增加 li 包裹每项；key 放到 map 直接返回的 li 上。
- 不直接修改学习者业务代码，待完成后检查和运行 lint / TypeScript。

### 最终代码 Review — 2026-10-21

- CounterListDemo 独立承载数组状态与反转交互，page.tsx 已移除 use client 与 useState；FeatureItem 保持服务端组件。
- 计数器列表使用 ul/li，稳定 key 放在 map 直接返回的 li 上，组件状态可跟随数据身份移动。
- toReversed 返回新数组，不直接修改现有状态数组，当前反转实现正确。
- 导师分别运行 npm run lint 和 npm exec -- tsc --noEmit，均退出码 0，无阻塞代码问题；未代改业务代码。
- 学习者反馈整理完成；稳定 id 下反转后计数跟随标题的具体浏览器结果待明确确认。
- 可用于面试的经验：用有状态列表复现索引 key 导致的状态错位，通过稳定 id 修复；将实验交互移入客户端子组件，保持静态首页的服务端边界。

最终运行确认：学习者明确反馈稳定 id 下反转后计数跟随标题移动。Day 4 核心实践验收通过，依据为导师代码 Review、lint / TypeScript 通过及学习者浏览器反馈。规划文案润色等非阻塞建议继续保留，未将其标记完成。

下一学习单元：Day 5，条件渲染与受控输入，先讲解再由学习者实现能力列表搜索，暂不接入 AI 或数据库。

## Day 5 — 受控输入与条件渲染（2026-10-21 开始）

状态：最终代码 Review、静态检查与派生数据复盘通过；学习者反馈完成清空练习，完整搜索用例的浏览器结果待明确确认。学习单元序号不等于日历天数。

### 理论（约 30 分钟）

- 受控输入：value 来源于状态，onChange 将输入值写回状态；类比 Vue v-model，但显式描述数据流。
- 仅保存 keyword 状态，筛选结果由 features 与 keyword 计算，不另存 state，不需要 useEffect。
- filter 选择数据，map 生成 JSX；三元表达式用于切换列表与空结果提示。
- FeatureSearch 作为客户端入口接收首页的可序列化 features 数组，首页继续保留服务端组件。
- FeatureItem 若由 FeatureSearch 导入，会进入客户端模块图，即使自身没有 use client；静态组件不必重复声明该指令。

### 第一轮实践（约 45 分钟）

- [ ] 将 Feature 类型放入 src/types/feature.ts 导出，页面与搜索组件使用 import type 共享。
- [ ] 新建 FeatureSearch 客户端组件，接收 features: Feature[]，keyword 初始为空字符串。
- [ ] 为输入框添加关联 label、value 与 onChange，输入标题关键字实时筛选。
- [ ] 使用 trim 和 toLowerCase 归一化查询及标题，支持忽略首尾空格与英文大小写；空查询显示全部。
- [ ] 在组件内派生 filteredFeatures，使用 FeatureItem 和稳定 id 渲染；列表外显示结果数量。
- [ ] 没有匹配时显示“没有匹配的能力”，使用明确布尔判断或三元表达式，避免渲染多余的 0。
- [ ] 首页传入原始 features，保留计数实验，不在首页添加 use client。
- [ ] 执行 lint 与 TypeScript 检查，提交 Review。

### 第二轮与验收（约 45 分钟）

- [ ] 第一轮通过后由学习者添加清空按钮，清空输入并恢复所有结果。
- [ ] 验证空输入显示 3 条、“知识”显示 1 条、无匹配显示提示、“ agent ”匹配 Agent；清空后恢复全部。
- [ ] 解释受控输入数据流、派生数据无需重复 state，以及客户端导入边界。
- [ ] 记录问题、Review 与复盘。暂不添加防抖、API、持久化或额外依赖。

### Day 5 第一轮 Review — 2026-10-21

- 受控输入 value/onChange、类型抽取、父组件传参、稳定 key 与空结果三元渲染已实现。
- 导师运行 lint 与 TypeScript 检查，均退出码 0。
- 待修正：filteredFeatures 作为重复 state 保存，并在输入事件中更新；改为依据 features 和 keyword 在渲染时计算，输入事件只更新 keyword，避免 props 变化或清空时结果失步。
- 待修正：当前 includes 区分大小写，应对标题和查询均调用 toLowerCase，并对查询 trim。
- 待补充：关联 label、结果数量；两个文件的 Feature 类型导入改为 import type。
- 本轮业务代码未代改，等待学习者完成上述修正后复验；清空按钮仍留到下一轮。

### Day 5 第二轮 Review — 2026-10-21

- filteredFeatures 已改为渲染时计算，onChange 只更新 keyword；标题和关键词均转小写，查询 trim，写法正确。
- 关联 label/id、两处 import type 已补充；导师执行 lint 与 TypeScript 检查均退出码 0。
- 尚未显示结果数量。下一步补充列表外的数量文字，并添加 type="button" 的清空按钮，仅调用 setKeyword("")。
- 可选整理：查询归一化提到 filter 外，避免对每条数据重复处理相同关键词；当前小列表无阻塞性能问题。
- 待学习者确认四种搜索与清空行为，并解释派生结果为何会随清空更新；未代改业务代码。

### Day 5 第三轮 Review — 2026-10-21

- 已显示 filteredFeatures.length，当前放在 label 内；建议标签保留固定名称，动态结果数量放独立段落。
- 学习者正确解释更新 keyword 后组件重新执行，filteredFeatures 重新计算；补充这是新一次渲染创建的新局部绑定，并非修改原 const。
- 当前磁盘中的 FeatureSearch.tsx 尚无清空按钮，不能标记该任务完成；请学习者补充或保存编辑器内容。
- 导师执行 lint 与 TypeScript 检查均退出码 0；浏览器搜索与清空完整验收待确认。

### Day 5 最终代码 Review — 2026-10-21

- 已确认清空按钮保存，type="button"，仅调用 setKeyword("")；结果数量移至独立 p，label 保持固定名称。
- 受控输入、派生筛选、大小写与空格处理、结果数量、空态、清空逻辑均符合任务要求。
- 导师运行 npm run lint 和 npm exec -- tsc --noEmit，均退出码 0，无阻塞代码问题，业务代码由学习者完成。
- 学习者正确解释状态更新触发组件重新执行及筛选结果重新计算；理论复盘通过。
- 待最终运行反馈：空查询 3 条、“知识”1 条、“ agent ”1 条、无匹配提示、清空恢复 3 条。未由导师独立操作浏览器，不将静态检查当作运行验收。

## Day 6 — 表单提交与输入校验（2026-10-21 开始）

状态：已验收；代码 Review、静态检查及核心提交交互的学习者运行反馈通过。标题归一化与错误状态由导师按请求示范，后续独立练习需巩固。Day 5 的完整浏览器用例仍未逐项明确确认。

### 理论（约 30 分钟）

- form 的 onSubmit 统一处理按钮提交与输入框 Enter 提交；preventDefault 阻止本次浏览器默认提交导航。
- 校验先于状态写入，trim 后拒绝空标题；错误信息通过状态展示。
- useState<Task[]>([]) 为对象数组定义类型，新增时创建新数组，不直接 push 原状态。
- 稳定 id 在创建任务的事件处理中生成，不在渲染时生成；本轮使用 crypto.randomUUID()。

### 第一轮实践（约 60 分钟）

- [ ] 新建 TaskDraft 客户端组件，定义 Task 类型（id: string、title: string）。
- [ ] 维护 title、tasks 与 error 三种状态，tasks 初始为空数组。
- [ ] 创建有 label 的受控输入和 type="submit" 按钮，通过 form onSubmit 处理添加。
- [ ] preventDefault 后对 title.trim() 校验，空白时显示错误并直接 return，不添加任务。
- [ ] 合法时先创建带稳定 id 的新任务，再通过函数式更新创建新数组；不要在更新函数内部生成随机 id。
- [ ] 成功后清空输入与错误，使用稳定 id 展示任务列表；无任务时显示“暂无任务”。
- [ ] 首页导入 TaskDraft，保持 Server Component；说明任务仅存在于内存，未执行 Agent。
- [ ] 运行 lint / TypeScript 检查，提交 Review。

### 验收与复盘（约 30 分钟）

- [ ] 点击按钮和 Enter 都可添加合法任务，无整页刷新。
- [ ] 空字符串和纯空格均被拒绝；合法提交后旧错误消失，输入清空，任务首尾空格已去除。
- [ ] 连续添加两项，列表均保留，稳定 key 正确；整页刷新后数据清空，符合本轮无持久化约定。
- [ ] 能解释 onSubmit、preventDefault、不可变数组更新及 id 生成时机。
- [ ] 完成 Review、问题记录和复盘；本单元不接 API、数据库或模型。

### Day 6 第一轮 Review — 2026-10-21

- 已实现受控输入、Task[] 列表状态、事件中生成稳定 UUID、添加后清空输入及空列表提示；首页保持 Server Component。
- 导师执行 lint 与 TypeScript 检查，均退出码 0；这不代表功能验收全部通过。
- 待修正：当前仅按钮 onClick 添加，没有 form/onSubmit，因此缺少本轮要求的统一提交处理；需增加 preventDefault。
- 待修正：空内容和纯空格可被添加，缺少 trim、error 状态、错误提示与提前 return。
- 待调整：新增任务先在事件内创建，再使用 setTasks(prev => [...prev, newTask])；增加关联 label 与 submit 按钮类型。
- 首页旧搜索和计数练习被学习者注释隐藏，作为临时练习布局记录，暂不代为还原。
- 业务代码未代改，下一轮先聚焦表单提交与校验，再验证 Enter、错误恢复和连续添加。

### Day 6 第二轮 Review — 2026-10-21

- form/onSubmit、preventDefault、submit 按钮和 trim 空白判断已补齐；使用函数式数组更新，lint / TypeScript 均通过。
- 待修正：UUID 目前在状态更新函数内部生成，应先在事件处理函数中创建 newTask，再把它交给纯更新函数；开发 Strict Mode 可能重复调用更新函数来检查纯度。
- 待修正：校验使用 trim 但保存的仍是原 value，应保存 trim 后的标题。
- 当前使用 alert，不符合本轮练习 error 状态和页面内错误提示的目标；补充 error 状态，成功后清空错误。
- label 尚未通过 htmlFor/id 关联。输入框 required 会对空字符串先触发原生校验，若希望空串与纯空格统一走自定义错误，可移除 required，保留提交处理中的校验。
- 下一轮验证按钮 / Enter、空白拒绝、合法提交清除旧错误、输入清空与连续添加。

### Day 6 第三轮 Review — 2026-10-21

- UUID 已移到更新函数外，函数式数组更新正确；label htmlFor="task" 与 input id="task" 已关联，required 已移除。
- 导师执行 lint 与 TypeScript 检查均退出码 0。
- 剩余两项：保存时仍使用原 value，需统一使用 trim 后标题；仍使用 alert，需完成 error 状态、页面提示和成功后清空错误。
- 本轮不增加新要求，等待学习者完成这两项再做运行验收。

### Day 6 导师示范 — 2026-10-21

- 学习者明确请求协助实现未理解的两项；导师仅修改 TaskDraft 的标题归一化和页面错误状态。
- const title = value.trim() 用于校验和保存；trim 返回新字符串，不修改原 value。
- 新增 error 状态，空白提交时设置错误并 return；页面条件显示 role="alert" 的提示；成功添加后清空输入与错误。
- 修改后导师运行 lint 与 TypeScript 检查，均退出码 0；浏览器行为待学习者验证。
- 待练习：先提交纯空格，再提交带首尾空格的合法标题，确认错误恢复、输入清空及任务保存为去空格后的标题，并复述 trim 返回值和 error 状态作用。

### 深色主题输入框可见性修复

- 学习者反馈黑色主题下输入框难以辨认；导师为任务与搜索输入框显式设置浅/深色背景、文字、占位文字、边框和键盘聚焦轮廓。
- 原因：任务输入框缺少明确样式，搜索输入框深色背景与页面同为黑色，边界不明显。
- 仅调整显示样式，保留交互逻辑；lint 通过，视觉效果待浏览器确认。

### Day 6 最终验收

- 学习者确认纯空格提交显示“请输入任务名称”，Enter 可提交且不刷新。
- 学习者确认出错后提交合法任务会新增任务、清空输入并清除错误提示。
- 复盘：学习者理解成功后需清空错误；trim 返回新字符串、不修改原 value 的规则经导师补充解释，下一次独立练习继续巩固。
- 最终代码此前通过 lint 与 TypeScript 检查；后续输入框样式修改通过 lint，未重复做无关逻辑修改。
- 核心提交功能验收通过；连续两项保留及整页刷新清空未单独明确反馈，保留为综合验收检查项。
- 下一单元 Day 7：第一次综合验收，以独立任务检查组件、props/state、key、受控输入、条件渲染和表单校验，不直接提供完整实现。

## Day 7 — 第一次综合验收（2026-10-21）

状态：第一轮 Review 未通过，等待学习者修正；不引入新技术。

### 独立练习要求

- [ ] trim 后拒绝空标题，拒绝长度大于 30 的标题，分别显示错误；成功后清空输入和错误。
- [ ] 独立搜索状态，按标题忽略大小写与查询首尾空格筛选；结果派生计算，不另存 state。
- [ ] 清空搜索只清空查询，不删除任务。
- [ ] 显示总数与匹配数；区分“暂无任务”和“没有匹配的任务”，使用稳定 ID。
- [ ] 自行验证空白、30 / 31 字符边界、连续添加、搜索、清空和 Enter 提交，记录结果。
- [ ] lint、类型检查与代码 Review；说明独立完成及参考旧代码的部分。

### 第一轮 Review

- 学习者反馈全部实现，但当前保存的 TaskDraft 未见任务搜索、清空搜索、数量及区分空态的实现；可能存在未保存编辑，不能认定已完成。
- 关键问题：if (!title && title.length == 30) 永远不会成立；空字符串长度是 0，无法同时为空且长度等于 30，导致空白与超长输入都未被拒绝。
- 提示学习者分开处理空标题与 title.length > 30，30 字符允许，31 字符拒绝；不直接代改业务代码。
- 导师执行 npm run lint 与 npm exec -- tsc --noEmit 均退出码 0，说明规则检查通过不等于业务逻辑正确。

### Day 7 第二轮 Review

- 新增 title.length > 30 分支正确；但原空白条件 !title && title.length == 30 仍保留，空任务仍可添加，需简化为空值判断。
- 通过 FeatureSearch 复用搜索、清空和派生过滤逻辑，方向合理；但任务文案仍为“能力”，缺少总数和两种空态的区分。
- 为适配任务，Feature 和 FeatureItem 的 description 已移除、Feature.id 改为 string；不应仅为复用组件改变能力业务模型。建议搜索任务使用 Task 类型，保留能力模型原有字段，或另行明确设计通用组件。
- lint 与 TypeScript 检查均通过；当前类型结构相同所以 Task[] 可传入 Feature[]，不等于业务语义一致。
- 继续由学习者修正，不代改实现，未验收。

### Day 7 授权直接实现与节奏调整

- 学习者认为基础练习过于简单，明确授权导师直接补齐并进入下一学习单元。后续减少基础语法拆解，以具体功能与工程设计为主，按需解释。
- 已核对当前空标题校验已被学习者修正；导师补齐任务搜索、清空、总数 / 匹配数、两种空态、内存存储说明。
- 恢复 Feature 的数字 ID 和 description 及 FeatureItem 描述展示，任务搜索独立使用 Task 数据。
- lint 与 TypeScript 检查通过；浏览器完整用例未由导师独立验证。代码由导师补齐，不作为学习者独立综合验收通过的证据。
- 核心概念已复盘，未验证的独立能力在后续项目任务中继续检查；不阻塞进入第一阶段的全栈基础。

## Day 8 — Route Handler 与请求边界

状态：开始讲解与布置；仍处于原路线第一阶段，不提前接入大模型。

- 目标：建立第一个 Next.js 服务端接口，理解 TypeScript 类型检查不能代替运行时输入校验。
- 已阅读当前安装版本本地 Route Handlers 指南。
- [ ] 学习者创建 src/app/api/tasks/route.ts，导出 POST，接收 JSON 的 title。
- [ ] 对无效 JSON 返回 400；对非字符串、trim 后为空或长度超过 30 返回 400 和明确错误。
- [ ] 合法请求生成任务 ID，返回 { task } 与 201；本轮仅回显新任务，不做跨请求内存存储或数据库。
- [ ] 用浏览器请求工具或终端验证成功、空白、超长、数字 title 和非法 JSON。
- [ ] 接口 Review 后再将 TaskDraft 接到接口，处理 pending、成功和失败；不在接口尚未完成时提前改客户端。
- [ ] 执行 lint / TypeScript 检查，并解释客户端校验与服务端校验各自的作用。

### Day 8 异步提交 Review

- POST Route Handler 的解析、运行时校验和 201 返回结构正确；路由已位于 src/app/api/tasks/route.ts。
- 客户端已接入 POST，使用 response.ok、服务端返回任务、函数式追加、禁用输入 / 按钮及 finally 恢复状态；lint / TypeScript 均通过。
- 阻塞问题：setIsSubmitting(true) 在本地校验之前，空白或超长校验 return 发生在 try/finally 外，导致按钮与输入框永久禁用；需将开始提交移到校验通过之后。
- 错误处理改进：catch 需为非 Error 的异常提供兜底；请求开始时清除旧错误。
- 后续响应契约改进：response.json 结果需校验 task 的 id/title，避免异常成功响应污染列表；非 JSON 错误响应应展示清晰兜底。
- 下一轮验证空白 / 超长提交后仍可编辑、成功添加、Offline 保留输入、恢复网络重试与慢网禁用状态。尚未运行验收，不代改业务代码。

### Day 8 异步提交复验

- setIsSubmitting(true) 已移到所有本地校验之后，修复提前 return 导致表单永久禁用的问题；catch 已补非 Error 兜底。
- 导师重新执行 lint 与 TypeScript 检查均通过。
- 非阻塞待补：开始请求时清空旧 error，避免重试期间显示上一次失败；目前仅成功后清空。
- 响应结构校验与错误 JSON 处理保留为下一轮工程改进；Offline / 恢复网络 / 慢网运行结果待反馈。

### Day 8 Zod 校验整理

- 学习者明确请求直接生成 Zod 实现并讲解。已安装直接依赖 zod@4.6.7，更新 package.json 与锁文件。
- 新增 src/lib/schemas/task.ts：标题 trim/min/max、创建请求、任务、成功响应、错误响应 schema；Task 通过 z.infer 派生，原 types/task.ts 保留类型转导出兼容。
- 客户端与服务端复用请求 schema；客户端用 safeParse 校验成功与失败响应，非 JSON 返回使用兜底处理。格式异常时不追加、不清空输入，finally 恢复提交状态。
- lint、TypeScript 与直接执行真实 schema 的边界断言通过：trim、空白、30/31 长度、非字符串、无效任务结构、合法响应与错误响应。
- 浏览器交互与实际 HTTP 请求未在本轮独立验证；不以 schema 断言代替完整端到端验收。
- 用法重点：schema 定义规则；safeParse 返回 success/data 或 error.issues；parse 校验失败抛异常；z.infer 从 schema 推导静态类型。

### 2026-10-22 — 请求层拆分

- 学习者已逐段理解 schema、对象组合、z.infer 与 safeParse 的分工，下一步在现有功能基础上整理职责，不提前接模型或数据库。
- [ ] 创建 src/lib/api/tasks.ts，导出 createTask(input: { title: string }): Promise<Task>。
- [ ] 将 POST fetch、JSON 解析、错误响应校验和成功响应校验移入请求函数；成功返回已验证 Task，失败抛 Error，不调用 React setter。
- [ ] TaskDraft 保留本地输入校验、pending/error、列表及清空状态；通过 await createTask(input.data) 获取任务。
- [ ] 保留非 JSON 错误兜底、响应结构检查、失败保留输入和 finally 恢复提交。
- [ ] lint / TypeScript 检查，验证正常添加、失败保留输入和响应异常，再做 Review。
- 导师本轮只读业务代码并更新学习记录，拆分由学习者实现。

### 2026-10-26 — 恢复学习

- 日历进入第 2 周，学习仍接续未完成内容，不因日期跳跃阶段。
- 实际检查：src/lib/api/tasks.ts 尚未创建，fetch 与响应校验仍在 TaskDraft，今天先完成请求层拆分。
- 安排：理论回顾约 15 分钟，拆分与运行验证约 70 分钟，Review 与周复盘约 35 分钟。
- 第 1 周正式独立验收未完成，不标记通过；今天结合重构后的错误路径与本人解释补充验收证据。
- 本轮只更新记录，业务实现由学习者完成；完成后检查成功、HTTP 错误、非 JSON 和网络失败路径。

### 2026-10-26 — 请求层拆分 Review

- 已创建 src/lib/api/tasks.ts：成功返回校验后的 Task，HTTP 失败和成功响应格式异常抛 Error，非 JSON 响应有兜底，无 React setter。
- TaskDraft 已调用 createTask，保留本地校验、成功追加、失败保留输入与 finally 恢复状态；职责拆分正确，无阻塞问题。
- 导师运行 lint 与 TypeScript 检查均退出码 0。浏览器正常添加 / Offline 结果尚未单独反馈，不标记运行验证完成。
- 非阻塞命名建议：组件内 const response = await createTask(...) 改名 task；返回的是业务对象，而非原始 HTTP Response。
- 业务代码未代改；本轮代码 Review 通过。后续继续第一阶段全栈基础，按功能推进。

## Day 9 — 页面路由与共享导航（2026-10-26 开始）

状态：已布置任务；已核对当前版本的 Layouts and Pages、Linking and Navigating 本地指南。

- [ ] 新建 src/app/tasks/page.tsx，默认导出服务端页面，包含任务页 h1 和 TaskDraft；定义任务页 metadata 标题。
- [ ] 首页保留项目介绍，移除 TaskDraft，使用 next/link 链接进入 /tasks。
- [ ] 根 layout 在 children 之前添加共享 nav，Link 指向 / 和 /tasks；保留 html/body、字体及 metadata。
- [ ] 两个页面保持服务端组件，仅 TaskDraft 管理交互；页面各自使用 main，避免嵌套 main。
- [ ] 验证直接访问和刷新 /tasks、Link 双向导航，以及 /api/tasks POST 仍可用。
- [ ] 运行 lint 与 TypeScript 检查并 Review。任务仍未持久化，页面切换的内存状态不承诺保留，后续引入存储后再解决。

### Day 9 第一轮 Review — 2026-10-26

- /tasks/page.tsx 已正确创建并导入 TaskDraft；首页已移除任务组件，共享 nav 在根布局 children 前，两个 Link 路径正确。
- 页面和根布局保持 Server Component；/api/tasks 的 POST 实现保留。
- 导师执行 lint 与 TypeScript 检查均退出码 0；未独立验证浏览器导航或 HTTP。
- 待补：任务页面缺少 h1、main 语义区域与独立 metadata.title。
- 首页未放单独入口链接，共享导航已提供访问路径，不作为阻塞项；首页 maxs-w-xs 为拼写错误，应改为 max-w-xs。
- 等待学习者补齐页面信息与运行反馈，业务代码未代改。

### Day 9 运行反馈与复查 — 2026-10-26

- 学习者对直接访问 / 刷新任务页、导航切换及任务提交反馈“没问题”，记录为学习者运行确认，非导师浏览器独立验证。
- 已核对任务页独立 metadata 标题及首页 max-w-xs 修正。
- 任务页当前仍用 div 包裹 TaskDraft，尚未添加 main 和页面 h1；属于待补的语义结构，不阻塞已确认的路由功能。
- 路由与导航核心目标通过，保留语义结构收尾项。

## Day 10 — PostgreSQL 持久化准备（2026-10-26）

状态：检查环境，等待数据库服务可用；仍在第一阶段全栈基础。

- 当前 POST 仅创建并返回任务，React 内存保存列表，刷新后丢失；目标改为 POST 写数据库、GET 读取数据库。
- 已检查：Docker CLI 存在，当前无法连接 Docker Desktop Linux 引擎；提权重查后仍提示对应命名管道不存在，服务尚不可用。未发现 PATH 中 psql，未发现项目数据库配置或环境文件。
- 下一步学习者启动 Docker Desktop，等待引擎就绪；之后创建项目专用 PostgreSQL 容器与持久卷，再接入 Drizzle 和环境变量。
- 数据库连接仅用于服务端，使用不带 NEXT_PUBLIC_ 前缀的 DATABASE_URL；不将密码写入提交记录。
- 后续顺序：数据库环境、表和迁移、POST 入库、GET 查询、客户端首次加载与错误状态，每步完成后 Review。
- 本轮未安装软件、启动容器或修改业务代码。

### Day 10 数据库环境就绪 — 2026-10-26

- Docker 引擎 28.5.2 已就绪，已有 Dify PostgreSQL 占用本机 5432，因此项目使用 127.0.0.1:5433，容器内部 5432。
- 新增 compose.yaml，项目名 agent-workspace，镜像 postgres:17-alpine，独立 postgres_data 命名卷，healthcheck 使用 pg_isready。
- 新建被 Git 忽略的 .env.local，随机本地密码与 DATABASE_URL；未输出密码，无 NEXT_PUBLIC_ 前缀。Compose 显式通过 --env-file .env.local 读取，Next.js 自动读取该文件。
- 已启动容器 agent-workspace-db-1，状态 Healthy；执行只读 SQL SELECT current_database(), current_user() 等价检查（实际使用 current_user 关键字）确认库和用户均为 agent_workspace。
- 常用启动：docker compose --env-file .env.local up -d --wait db；停止：docker compose --env-file .env.local stop db。
- 数据卷保留数据库文件；后续不使用 down -v，以免删除学习数据。本轮尚未创建任务表或连接 Drizzle，应用仍未持久化。
- 下一步定义任务表 id、title、createdAt，生成并执行 Drizzle 迁移，再接入 POST / GET。

### Day 10 Drizzle 表结构练习

- 已核对 Drizzle 官方 PostgreSQL 指南；项目尚未安装 drizzle-orm、pg、drizzle-kit、dotenv、@types/pg。
- 下一步学习者安装运行依赖 drizzle-orm / pg，开发依赖 drizzle-kit / dotenv / @types/pg。
- 定义 src/lib/db/schema.ts 的 tasks 表：uuid 主键 id 默认随机 UUID，varchar(30) 非空 title，带时区非空 createdAt 默认当前时间。
- 区分 Zod schema（输入输出校验）和 Drizzle schema（数据库表及约束）。写 TS 表定义不会自动建表，后续 generate 生成 SQL、migrate 执行。
- 本轮只布置安装与表定义，迁移配置和数据库改动留到 Review 后；暂不改变接口响应或 Zod 模型。

### Day 10 表定义检查与迁移任务

- 已核对依赖安装完成：drizzle-orm 0.45.4、pg 8.23.1、drizzle-kit 0.31.11、dotenv 18.0.9 及 pg 类型。
- src/lib/db/schema.ts 三字段定义正确，drizzle.config.ts 尚未创建。
- 下一步学习者创建配置：显式加载 .env.local、检查 DATABASE_URL、指定 postgresql、schema 路径与 drizzle 输出目录。
- 先执行 drizzle-kit generate --name=init_tasks 并阅读 SQL；generate 不连接数据库建表。Review SQL 后再执行 migrate，避免将生成和执行混为一步。
- 迁移 SQL 与快照应纳入版本管理，本地 .env.local 保持忽略；本轮没有执行数据库改动。

### Day 10 初始迁移 Review

- 已检查 drizzle.config.ts、0000_init_tasks.sql 及迁移 journal，均与表定义一致；TypeScript 检查通过。
- SQL 仅创建 tasks 表，uuid 主键默认 gen_random_uuid()、varchar(30) 非空 title、带时区 created_at 默认 now()，无删除或覆盖操作。
- 下一步学习者执行 npx drizzle-kit migrate，将待执行迁移应用到本地数据库；之后导师检查实际表和迁移记录。
- 尚未确认迁移执行，不能标记数据库表已存在；应用 API 仍待接入数据库。

### Day 10 迁移执行验证

- 学习者提供配置加载与 pg 驱动日志；导师执行只读数据库查询确认 public.tasks 已存在，三字段类型、非空约束、默认值和主键与迁移一致。
- drizzle.__drizzle_migrations 中已有 1 条迁移记录，初始迁移已成功应用。单凭配置加载日志不能判断成功，本轮以实际数据库状态为证据。
- 下一步建立仅服务端使用的数据库连接模块，并将 POST 改为 insert ... returning；尚未接入，不标记任务已持久化。

### Day 10 POST 入库任务

- 已核对当前 route.ts 仍只生成内存对象；任务表与数据库已就绪。
- 学习者下一步创建仅服务端的 src/lib/db/index.ts：pg Pool + drizzle，读取 DATABASE_URL，开发环境在 globalThis 复用连接池，设置连接超时。
- POST 校验通过后执行 db.insert(tasks).values({ title }).returning({ id, title })，UUID 和创建时间交给数据库默认值，保留原响应契约。
- 数据库异常返回 500 与稳定中文错误，避免将底层异常直接返回客户端；不在每次请求里 pool.end()。
- 本轮仅布置写入，不实现 GET 或改变客户端首次加载；刷新后 UI 暂时为空不代表数据库丢数据。
- 代码完成后 Review、lint、类型检查，并通过真实表查询验证新增记录。

### Day 10 POST 入库验收 — 2026-10-26

- 已核对 server-only 数据库连接、开发连接池复用、连接超时和 POST 的 insert/returning 实现正确；失败返回稳定 500 JSON。
- TypeScript 检查通过，lint 检查结果见本轮执行输出。
- 导师只读查询 public.tasks，确认已保存 1 条任务“学习 React”，具有数据库生成的 UUID 和 created_at，持久化写入目标通过。
- 未代写测试数据；读取的是学习者提交后已有记录。
- 下一步 GET 查询及客户端首次加载，将数据库已有任务显示回页面，完成刷新后恢复列表的闭环。

## Day 11 — GET 查询与首次加载（2026-10-27）

状态：检查已有尝试，先修正查询接口，再接客户端。

- 已发现学习者新增 GET 和 getTasks，但 GET 使用 where({ title: { contains: q } })，这是其他 ORM 风格，非当前 Drizzle SQL 查询构造器的条件表达式；TypeScript 本轮虽通过，不能据此确认查询运行正确。
- 第一轮先去掉 q 筛选，客户端已有本地搜索；使用 select id/title、from(tasks)、orderBy(createdAt,id) 返回稳定顺序，失败返回 500 JSON。
- UUID 已是字符串，不需 String(id) 映射；getTasks 中 as Task[] 不做实际校验，下一轮改为列表响应 Zod schema。
- TaskDraft 尚未首次加载数据库列表；继续分步推进，避免混淆“读取接口完成”和“页面刷新恢复”。
- 本轮只读业务代码、检查类型并布置修正，不代改实现。

### Day 11 GET 失败排查 — 2026-10-27

- 学习者截图显示 GET 返回读取失败；已检查 select/from/orderBy 写法正确。
- 提权检查 Docker 状态仍提示 dockerDesktopLinuxEngine 命名管道不存在，当前 Docker Linux 引擎不可用，无法运行项目数据库；先恢复 Docker 与 db 容器，再复验接口，暂不归因于查询逻辑。
- 恢复命令：docker compose --env-file .env.local up -d --wait db。已有命名卷保留，不需重新迁移或删库。
- GET 中残留 debugger，可清除；服务端 catch 后续补安全诊断日志，客户端继续返回稳定错误，不泄露连接串。

### Day 11 GET 恢复验证

- 导师实际请求 http://localhost:3000/api/tasks，返回 HTTP 200 和数据库已有“学习 React”，确认数据库恢复且 GET 读取链路正常；TypeScript 检查通过。
- 下一步添加 ListTasksResponseSchema = z.object({ tasks: z.array(TaskSchema) })，将 getTasks 改为 Promise<Task[]>，移除 as Task[]，复用响应校验与错误处理。
- 查询函数完成 Review 后再接 TaskDraft 首次加载及加载/错误状态，不一次堆入 Effect 与数据校验两个新点。

### Day 11 列表响应校验 Review

- ListTasksResponseSchema 正确使用 z.array(TaskSchema)，getTasks 已移除 as Task[]，校验后返回 parsed.data.tasks，核心实现通过。
- lint 与 TypeScript 检查通过。Promise<Task[]> 可被自动推断，显式标注属于可读性建议；data: unknown 建议用于明确外部数据边界。
- 下一步 TaskDraft 使用 useEffect 首次读取，区分 isLoading、loadError 与提交状态；Effect 回调本身不能 async，异步函数放内部，清理时忽略过期响应。
- 首次加载及重试期间阻止新增，避免较早 GET 的返回覆盖刚新增任务；加载失败不显示“暂无任务”，成功空数组才显示空态。
- 页面文案更新为数据库持久保存，完成后验收新增并刷新仍可见。本轮未代改业务代码。

### Day 11 首次加载第一轮 Review

- 已在 Effect 内调用 getTasks，成功写入列表，TypeScript 检查通过。
- lint 未通过：Effect 同步 setIsLoading(true) 触发 react-hooks/set-state-in-effect；初始值已经 true，可删除该行。isLoading 尚未参与界面导致未使用警告。
- 待补 loadError 状态与可见错误；当前仅 console.error，读取失败会被误显示成暂无任务。
- 待补 Effect cleanup 忽略过期回调，then/catch/finally 均需保护；避免开发 Strict Mode 或离开页面后的旧响应更新状态。
- 待补加载/失败时禁止提交，函数入口与 disabled 均检查，避免首次 GET 覆盖新添加记录。
- 页面“刷新后清空”文案尚未修改。业务代码未代改，运行验收待完成。

### Day 11 首次加载第二轮 Review

- Effect 异步函数、ignore 清理及所有加载回调保护已正确补齐；TypeScript 通过。
- lint 无错误，仍有 isLoading 未使用警告。加载状态尚未参与渲染，loadError 仅替换数量段落，下面空态仍独立显示，导致错误提示与暂无任务同时出现。
- 提交函数入口与输入/按钮仍只判断 isSubmitting，首次查询覆盖新增记录的风险尚未修正。
- 旧“刷新后清空”文案仍存在。本轮继续聚焦这些已有要求，不添加新功能，业务代码未代改。

### Day 11 首次加载收尾 — 导师直接实现

- 学习者明确要求直接生成基础界面与状态修正，后续减少基础 JSX 往返，重点转向数据流、服务端边界和工程问题。
- TaskDraft 的加载、加载失败、成功列表/空态改为互斥展示；数量仅在加载成功时显示，错误不会与暂无任务混在一起。
- 统一 isFormDisabled，用于提交函数入口和任务输入/提交按钮，避免初始 GET 返回覆盖加载期间新增记录。
- 更新数据库持久化文案，保留已有 ignore 清理逻辑与失败保留输入。
- 导师修改后 lint 与 TypeScript 检查均通过，无警告；本轮未独立验证浏览器刷新和慢网交互，不标记端到端验收完成。

## Day 12 — 动态路由与任务删除（2026-10-27 开始）

状态：删除功能已完成，代码检查、真实 HTTP 与浏览器核心交互验收通过；仍在全栈基础阶段。

- 核对当前 Next.js route 文档，动态 params 是 Promise，使用 await params。
- [x] 学习者创建 src/app/api/tasks/[id]/route.ts，导出 DELETE，取得并用 Zod 校验 UUID。
- [x] 非法 id 返回 400；限定删除并 returning id；无记录 404，成功 204，数据库异常有稳定 500 JSON 分支（未停库注入真实故障）。
- [x] 根据 delete returning 判断结果，不先 select 再 delete。
- [x] 导师补齐 deleteTask 与按钮，成功后更新列表，失败保留并提示，写操作进行中禁用按钮并用 ref 阻止渲染前重复请求。
- [x] 使用专用测试任务完成 400、204、重复删除 404、刷新确认移除，不删除已有学习任务。
- 基础 UI 可由导师直接实现，核心接口由学习者先尝试；尚未执行删除操作。

### Day 12 DELETE 第一轮 Review

- 动态路由文件位置、await params、按 tasks.id 限定删除和 204 无响应体正确；TypeScript 检查通过。
- 待补：UUID 格式校验返回 400，判断 deleted 不存在返回 404，数据库异常 try/catch 返回 500。
- 当前 deleted 未使用，不能区分删除成功与目标不存在；非法 UUID 可能直接导致 PostgreSQL 查询异常。
- 未执行删除测试，避免将未完成的错误处理视为验收通过；下一轮再用专用任务验证完整状态码。

### Day 12 DELETE 第二轮 Review

- UUID 校验与 400、deleted 不存在返回 404 已补齐，使用校验后的 result.data 限定删除；lint / TypeScript 均通过，无警告。
- 尚未补数据库操作的 try/catch，数据库异常仍可能返回框架默认响应，缺少约定的 500 JSON；本轮未执行删除测试。
- 剩余修正只涉及数据库错误分支，不扩展功能；补齐后执行专用任务的创建/删除/重复删除验证。

### Day 12 DELETE 异常处理补齐

- 学习者明确授权补充；导师将删除查询与 404/204 分支放入 try，数据库异常返回稳定 500 JSON，UUID 校验仍在查询前。
- 修改后 lint 与 TypeScript 检查通过；本轮未执行实际删除或模拟数据库故障，运行验收仍待进行。

### Day 12 删除运行验收与数据流复盘 — 2026-10-27

- 修改前说明：请求层处理空正文 204 与失败响应；组件采用服务端确认后删除的方式，未做乐观更新。
- 实现：deleteTask 返回 Promise<void>；TaskDraft 使用 deletingId 显示当前项进度、deleteError 独立展示错误、mutationInFlight ref 作为同步写锁；finally 解除锁和按钮状态。GET 残留 debugger 已移除。
- scripts/verify-task-delete.mjs 实际调用本地 HTTP：非法 ID 400、创建专用任务 201、首次删除 204 且空正文、同 ID 再删 404、GET 前后列表一致，全部通过。
- scripts/verify-delete-client.mjs 执行实际请求函数并模拟 fetch：204 不读 JSON、404 错误信息、非 JSON 502 兜底、网络错误传播均通过。这是请求层测试，不冒充浏览器断网验收。
- 浏览器实际操作：添加“界面删除验收-1027”，刷新仍存在；点击删除后从列表移除，刷新仍不存在。
- 浏览器 404 路径：创建专用冲突测试任务，从服务端删除后再点击旧页面删除，显示“任务不存在”、保留旧项并恢复按钮；刷新后与数据库一致。测试任务均已清理。
- 验收截图：artifacts/task-delete-acceptance.png。lint 与 TypeScript 检查通过。
- 启动并保留 Next.js 开发服务与项目数据库供继续学习；运行环境曾未启动，恢复后完成验收。
- 排错重点：HTTP DELETE 的 204 没有 JSON；网络失败不等于服务端一定没执行，发生歧义时重新 GET 对账；404 可反映其他客户端已删除，当前实现提示后由刷新恢复一致。
- useRef 同步锁与 useState 的区别：ref 可在同一事件时序立即生效但不驱动界面，state 驱动按钮和进度显示，避免把 UI 禁用当成唯一的重复提交防护。

## Day 13 — 任务状态更新：独立实现与讲解验收

状态：已布置，等待学习者独立实现；导师不预写业务代码。任务状态是手动学习任务标记，不代表 Agent 执行状态。

### 目标与边界

- 状态仅有 todo / done，默认 todo；可从任意一个切换到另一个，不实现执行引擎、状态机队列或新依赖。
- 数据库新增非空 status，使用 PostgreSQL enum 或 CHECK 约束；已有任务迁移后默认 todo。必须生成和查看 SQL，再 migrate，不改写已执行的初始迁移、不清库。
- Zod 校验状态枚举；Task、创建/列表响应和数据库查询返回 status，确保新增与刷新表现一致。
- PATCH /api/tasks/[id] 仅接收 { status }，拒绝其他字段；UUID/JSON/状态错误 400，目标不存在 404，更新成功返回 200 { task }，数据库错误稳定 500。
- 使用带 ID 条件的 update returning，不先查询再更新；重复设置同一状态允许成功。
- 请求层新增 updateTaskStatus，校验成功响应，组件成功后按 ID 替换返回的 task；失败保持旧状态并显示错误，请求中禁止重复操作。
- 用两个状态按钮或复用现有控件即可，不考核装饰性 JSX；继续保持数据库连接仅供服务端使用。

### 独立验收清单

- [ ] 提交实施顺序与涉及文件说明，独立完成迁移、PATCH、请求函数和页面交互；遇到问题可描述证据请求提示。
- [ ] 已有任务默认 todo，新建默认 todo；切换 done 后刷新仍 done，可切回 todo。
- [ ] 用专用测试记录验证非法 UUID、非法 JSON、非法状态/额外字段 400，不存在 ID 404，合法更新 200。
- [ ] 慢请求防重复、失败不假显示成功；删除、创建、搜索无回归。
- [ ] lint / TypeScript 通过；提供实际请求状态码和浏览器运行证据。
- [ ] 独立讲解：一次状态更新从点击到数据库再到界面的路径；为何 TS 类型不能代替服务端校验；网络超时后如何确认最终状态。

## 每周复习与独立验收节奏（学习者最新要求）

- 基础 JSX 和重复表单接线可由导师直接处理；核心数据流、服务端边界、数据库约束与排错由学习者实践和讲解。明确记录独立实现与导师代写，不能混作独立掌握。
- 每周两次前端原理复习，各约 20–30 分钟，覆盖 JavaScript 通用原理、React 与 Vue 3，不只围绕当前 React 工程。
- 第 2 周 2026-10-29：事件循环、Promise 与请求竞态；对照 Vue 3 的 nextTick / 更新调度与 React 状态批处理，解释状态更新后何时能读取更新后的 DOM。
- 第 2 周 2026-10-31：Vue 3 的 ref/reactive、响应式依赖追踪、computed 与 watch/watchEffect；对照 React 状态快照、派生计算及 useEffect，讨论闭包、异步副作用清理与列表 key 身份。每次选 1–2 个核心问题深入，其余顺延，不压缩为术语背诵。
- 每周独立讲解至少包含一个 Vue 3 场景，可用小段代码或现有 Vue 项目经验说明，不要求为复习给 Agent Workspace 引入 Vue。后续轮换组件通信、组合式函数、渲染更新、性能与工程排错。
- 每周一次独立实现加讲解验收，约 60–90 分钟；第 2 周安排 2026-11-01。Day 13 状态更新作为本周独立实现候选，完成后再验收，不提前标记通过。
- 验收组成：独立实现可运行功能、现场解释关键设计、定位一个失败案例；按独立完成/提示后完成/导师实现记录，不以代码量或日历天数判定掌握。
- 第 1 周正式独立验收未完成，保留历史事实；第 2 周用当前工程补充证据，不倒填通过。

### Day 13 状态迁移第一轮 Review — 2026-10-27

- 学习者已定义 pgEnum task_status（todo/done）和非空 status 默认 todo，生成独立 0001_add_task_status.sql。
- SQL 仅 CREATE TYPE 与 ALTER TABLE ADD COLUMN，初始迁移未改写，已有行将获得 todo 默认状态；TypeScript 检查通过。
- Review 通过，下一步学习者执行 npx drizzle-kit migrate；实际数据库状态尚未验证，不提前标记已应用。
- 然后独立更新 Zod TaskSchema 与 PATCH 请求 schema（strict 对象只允许 status），POST/GET 返回 status，准备 PATCH 接口。

### Day 13 迁移实际执行排查

- 学习者反馈执行完毕；导师查询实际项目库发现 status 不存在，迁移记录仍为 1 条。不能以生成文件或命令开始日志判断迁移成功。
- 核对配置和脱敏连接目标为 127.0.0.1:5433/agent_workspace，迁移文件与 journal 正确。
- 导师执行此前已 Review 且已授权的 npx drizzle-kit migrate，命令明确返回 migrations applied successfully；随后只读复查默认状态及迁移条数。
- Zod TaskSchema 与 POST/GET 的 status 返回尚未修改，后续继续由学习者实现，未代写独立状态更新代码。

### Day 13 数据契约 Review

- TaskStatusSchema、TaskSchema.status、strict 的 UpdateTaskStatusSchema 已正确实现；POST returning 和 GET select 都已包含 status。
- 导师实际请求 GET，HTTP 200，两条原任务都返回 status: todo，契约同步目标通过。
- [id]/route.ts 中 PATCH 仍为注释模板，且复制了 DELETE 查询；下一步独立实现时必须替换为 update/set/where/returning，不能误删任务。
- 只更新 status，服务端根据更新返回记录决定 404 或 200；非法 JSON、UUID、状态和额外字段返回 400，数据库异常 500。重复设置相同状态返回 200。

### Day 13 PATCH 第一轮 Review 与实际请求验证

- 学习者实现 UUID/JSON/strict 状态校验、按 ID update returning、无记录 404 和异常分支；lint 与 TypeScript 均通过。
- 实际创建专用任务后 PATCH done，数据库 GET 确认为 done；非法 ID、非法 JSON、非法状态、额外字段均实测 400。
- 测试任务已删除，GET 前后比较确认已有任务未改动。
- 尚未符合接口契约：PATCH 成功沿用 DELETE 的 204 空正文，应返回 200 { task }，客户端才能获取服务端实际状态；异常文案仍写“删除任务失败”，应改“更新任务状态失败”。
- 核心更新和输入边界正确，等待学习者修正这两处后再验证 200 响应、重复同状态与不存在任务 404，之后接请求层。

### Day 13 PATCH 响应修正与复验

- 学习者明确授权补充；导师仅将 PATCH 成功改为 200 { task }，异常文案改为更新任务状态失败，DELETE 的 204 与文案保留。
- lint 与 TypeScript 检查通过。
- 实际创建专用任务确认默认 todo，依次 PATCH done、重复 done、todo 均返回 200，响应 id/title/status 正确，每次再 GET 验证数据库状态一致；删除后 PATCH 返回 404。
- 专用任务已清理，GET 前后比较确认已有任务未被改动。未模拟真实数据库故障，500 分支仅静态 Review。
- 接口验收通过。请求层 updateTaskStatus 与页面状态切换尚未实现，继续由学习者独立推进；本轮响应修正明确记录为导师协助，不冒充完全独立完成。

## 每周验收

- 第 1 周验收日期：2026-10-25。
- 方式：独立完成小任务、解释关键代码、定位一个问题，并提供运行或检查证据。
- 验收内容随当周实际学习记录确定，不以抄写代码或完成打勾替代理解。
- 结果：待验收。

## 后续每日记录模板

### Day N — YYYY-MM-DD

- 状态：待开始 / 进行中 / 已完成 / 已验收。
- 目标与必要知识：
- 理论任务：
- 实践任务与完成情况：
- 验证步骤与实际结果：
- 问题、原因、解决过程：
- 代码 Review 意见与修正结果：
- 技术复盘与可用于面试的经验：
- 次日巩固内容：
