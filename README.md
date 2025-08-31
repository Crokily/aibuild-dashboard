<div align="center">

# AI Build Dashboard

一款用于“采购 / 销售 / 库存”分析的 Next.js 15 仪表盘应用，支持 Excel 批量导入、数据库入库、可视化图表与 AI 智能洞察。

在线地址：<a href="https://aibuild.a2a.ing" target="_blank" rel="noreferrer">https://aibuild.a2a.ing</a>

</div>

---

## 功能特性

- Excel 数据导入：支持 `.xlsx/.xls`，基于 Zod 强校验，自动将“宽表（日维度）”转换为按天的交易与库存记录
- 数据持久化：PostgreSQL（Vercel Postgres/Neon）+ Drizzle ORM，事务化写入，幂等处理（产品 Upsert + 旧日记录清理）
- 身份认证：NextAuth.js 凭证登录（注册/登录）、JWT Session、受保护路由（中间件自动跳转）
- 数据可视化：Recharts 折线对比，支持多产品、多曲线（库存/采购额/销售额）切换
- 经营分析：KPI 汇总（营收/成本/毛利/库存/动销率等）+ AI 智能洞察（基于 OpenAI，流式返回）
- 单元测试：Vitest 测试上传 API、数据校验、AI 接口等，内置测试数据集


## 技术栈

- Next.js 15（App Router，Server Components 优先）
- React 19
- Drizzle ORM + @vercel/postgres（PostgreSQL）
- NextAuth.js（Credentials Provider）
- Recharts（图表）
- Zod（输入校验）
- Vitest（测试）
- Tailwind CSS 4（样式）
- AI SDK（@ai-sdk/openai + ai）


## 在线体验流程

1. 注册/登录账户（`/register` → `/login`）
2. 访问“Import”页（`/upload`），上传包含指定列的 Excel 文件
3. 前往“Dashboard”页（`/dashboard`），通过上方“Chart Customization”选择 1~5 个产品
4. 查看折线图、KPI 指标；点击“AI-Powered Insights”卡片生成智能分析


## 目录结构（关键路径）

- 应用与页面
  - `app/layout.tsx`：根布局（Provider、导航、错误边界）
  - `app/page.tsx`：默认重定向到 `/dashboard`
  - `app/dashboard/page.tsx`：服务端查询 + 客户端图表/分析
  - `app/upload/page.tsx`：Excel 上传 UI
  - `app/login/page.tsx`、`app/register/page.tsx`：登录/注册页面
- API 路由
  - `app/api/upload/route.ts`：Excel 上传与入库
  - `app/api/analyze/route.ts`：AI 智能分析（OpenAI，流式）
  - `app/api/auth/[...nextauth]/route.ts`：NextAuth 认证入口
  - `app/api/register/route.ts`：注册接口
- 数据层
  - `lib/db/schema.ts`：Drizzle Schema（`products`、`daily_records`、`user`）
  - `lib/db/index.ts`：Drizzle 客户端（Vercel Postgres）
- 组件
  - `components/ChartCustomizer.tsx`：产品选择/曲线开关
  - `components/ProductChart.tsx`：Recharts 折线图
  - `components/DataAnalysis.tsx`：KPI 汇总
  - `components/AIAnalysis.tsx`：AI 洞察（点击触发/流式展示）
- 中间件
  - `middleware.ts`：受保护路由重定向（`/dashboard`、`/upload`）
- 规则与计划
  - `.cursor/rules/`：项目工程规则（结构、风格、App Router、Drizzle、Auth、测试、图表等）
  - `.Information/developPlan.md`：开发计划与阶段说明


## 数据模型概览

- `user`
  - `id`（PK, text）、`email`（唯一）、`password`（hash）、`name`、`image`、`emailVerified`
- `products`
  - `id`（PK）、`productCode`（唯一）、`name`
- `daily_records`
  - `id`（PK）、`productId`（FK→products.id, 级联删除）、`recordDate`（date）
  - `openingInventory`、`procurementQty`、`procurementPrice`、`salesQty`、`salesPrice`、`closingInventory`
  - 复合唯一约束：同一产品同一日期仅一条记录；复合索引（`productId + recordDate`）优化查询


## Excel 模板要求

- 必填列：
  - `ID`（产品编码）
  - `Product Name`
  - `Opening Inventory`
- 天维度列（Day 1, Day 2, ...；需成对出现）：
  - `Procurement Qty (Day X)`
  - `Procurement Price (Day X)`
  - `Sales Qty (Day X)`
  - `Sales Price (Day X)`

示例（列名区分大小写，Day X 可为 1..N）：

```text
ID, Product Name, Opening Inventory, Procurement Qty (Day 1), Procurement Price (Day 1), Sales Qty (Day 1), Sales Price (Day 1)
P001, iPhone 15, 100, 50, 5000, 30, 6500
```

上传后，系统会：
- 校验格式与完整性（Zod），提供带行号的错误详情
- 将同一产品的历史日记录先清理后批量写入（事务保障一致性）
- 支持较大文件（默认最大约 50MB）


## 环境变量

请参考仓库中的 `.env.example` 创建 `.env.local`，并填入实际值（请勿提交任何真实机密）。常见变量：

- `POSTGRES_URL`：数据库连接字符串（Vercel Postgres/Neon，运行态与 Drizzle 均使用）
- `POSTGRES_URL_NON_POOLING`：（可选）非池化连接（某些脚本/迁移场景）
- `DATABASE_URL`：（可选）部分库习惯使用的别名，建议与 `POSTGRES_URL` 保持一致
- `NEXTAUTH_SECRET`：NextAuth 签名密钥
- `NEXTAUTH_URL`：站点地址（本地开发可设为 `http://localhost:3000`）
- `OPENAI_API_KEY`：用于 AI 洞察的 OpenAI Key

安全提示：`.env*` 已加入 `.gitignore`，请勿将任何机密写入代码或提交到仓库。


## 本地开发

- 前置要求：Node.js 18.17+（推荐 20 LTS）、npm 10+
- 安装依赖：

```bash
npm install
```

- 数据库建表（根据 Drizzle Schema 推送到数据库）：

```bash
npm run db:push
```

- 启动开发服务：

```bash
npm run dev
# 打开 http://localhost:3000
```

- 生产构建与启动：

```bash
npm run build
npm start
```

- 运行测试：

```bash
npm test              # 全量测试
npm run test:upload   # 仅上传 API 测试
npm run test:ui       # 启动 Vitest UI
```


## 关键 API

- 上传 Excel：`POST /api/upload`
  - Content-Type: `multipart/form-data`
  - 字段：`file`（Excel 文件）
  - 成功响应：`{ success, message, summary: { productsProcessed, recordsCreated } }`
  - 失败响应：`{ error, details? | validationErrors? }`

- AI 分析：`POST /api/analyze`
  - Body: `{ productKPIs: ProductKPI[] }`（由仪表盘页面服务端生成，包含营收/成本/净额/动销率等）
  - 返回：文本流（Streamed Text），前端实时渲染

- 认证：`/api/auth/[...nextauth]`（NextAuth）
- 注册：`POST /api/register`

受保护路由：`/dashboard`、`/upload`（未登录会被中间件重定向至 `/login`）。


## 部署说明（Vercel）

1. 连接 Git 仓库并导入至 Vercel
2. 在 Vercel 项目 Settings → Environment Variables 配置：
   - `POSTGRES_URL`、`POSTGRES_URL_NON_POOLING`（由 Vercel Postgres/Neon 提供）
   - `NEXTAUTH_SECRET`、`NEXTAUTH_URL`（线上域名）
   - `OPENAI_API_KEY`
3. 首次部署后，执行一次数据库推送（或在 CI 中执行）：

```bash
npm run db:push
```

> 若本地需同步线上变量，可使用 `vercel env pull .env.local`。


## 代码质量与规则

- 统一遵循 `.cursor/rules/` 中的规则：
  - `project-structure.mdc` / `next-app-router.mdc`：目录结构、App Router、服务端数据获取与缓存语义
  - `ts-style.mdc`：TS/React 代码风格（命名、错误处理、类型暴露等）
  - `drizzle.mdc` / `auth-nextauth.mdc` / `api-upload.mdc` / `ui-charts.mdc`
  - `vitest-testing.mdc`：测试组织与编写
- 开发计划参见 `.Information/developPlan.md`
- 提交前运行 `npm test`，保持 ESLint 通过


## 版权与安全

- 本项目未附带开源许可证，默认保留所有权利（如需开放请补充 LICENSE）
- 请务必妥善保管 `.env*` 中的所有密钥，避免泄露
- 若发现安全问题，请通过私有渠道反馈并及时更换凭证


## 致谢

- Next.js / Vercel / Recharts / Drizzle ORM / NextAuth / Vitest
- OpenAI 与 AI SDK 社区

