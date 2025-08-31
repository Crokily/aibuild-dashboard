<div align="center">

# AI Build Dashboard

Next.js 15 dashboard for inventory and sales analytics. Import Excel, persist to Postgres via Drizzle, visualize with Recharts, and generate AI insights.

Live: <a href="https://aibuild.a2a.ing" target="_blank" rel="noreferrer">https://aibuild.a2a.ing</a>

English first · 中文说明见下方

</div>

---

## Features

- Excel import: `.xlsx/.xls` with strict Zod validation, converts wide daily format into per-day records
- Data persistence: PostgreSQL (Vercel Postgres/Neon) + Drizzle ORM with transactions and idempotent upsert/cleanup
- Authentication: NextAuth Credentials login (register/login), JWT session, protected routes via middleware
- Visualization: Recharts multi-series lines across products and metrics (inventory/procurement/sales)
- Business analysis: KPI summary (revenue/cost/profit/inventory/sell-through) + AI insights (OpenAI, streamed text)
- Testing: Vitest covering upload API, validation, AI endpoint; bundled test dataset


## Tech Stack

- Next.js 15 (App Router, Server Components by default)
- React 19
- Drizzle ORM + @vercel/postgres (PostgreSQL)
- NextAuth.js (Credentials Provider)
- Recharts (charts)
- Zod (validation)
- Vitest (tests)
- Tailwind CSS 4 (styling)
- AI SDK (@ai-sdk/openai + ai)

## User Flow

1. Register/Login (`/register` → `/login`)
2. Upload Excel at `/upload`
3. Open `/dashboard`, pick 1–5 products in “Chart Customization”
4. View charts and KPIs; click the “AI-Powered Insights” card to generate analysis


## Project Structure (key paths)

- App & Pages
  - `app/layout.tsx`: root layout (providers, nav, error boundary)
  - `app/page.tsx`: redirects to `/dashboard`
  - `app/dashboard/page.tsx`: server fetch + client charts/analysis
  - `app/upload/page.tsx`: Excel upload UI
  - `app/login/page.tsx`, `app/register/page.tsx`: auth pages
- API Routes
  - `app/api/upload/route.ts`: Excel ingestion + persistence
  - `app/api/analyze/route.ts`: AI insights (OpenAI streaming)
  - `app/api/auth/[...nextauth]/route.ts`: NextAuth entry
  - `app/api/register/route.ts`: registration
- Data Layer
  - `lib/db/schema.ts`: Drizzle schema (`products`, `daily_records`, `user`)
  - `lib/db/index.ts`: Drizzle client (Vercel Postgres)
- Components
  - `components/ChartCustomizer.tsx`: product picker and curve toggles
  - `components/ProductChart.tsx`: Recharts lines
  - `components/DataAnalysis.tsx`: KPI summary
  - `components/AIAnalysis.tsx`: AI insights (click to stream)
- Middleware
  - `middleware.ts`: protected routes (`/dashboard`, `/upload`)
- Rules & Plan
  - `.cursor/rules/`: engineering rules (structure, style, App Router, Drizzle, Auth, tests, charts)
  - `.Information/developPlan.md`: staged development plan


## Data Model

- `user`: `id` (text, PK), `email` (unique), `password` (hash), `name`, `image`, `emailVerified`
- `products`: `id` (PK), `productCode` (unique), `name`
- `daily_records`: `id` (PK), `productId` (FK→products.id, cascade), `recordDate` (date),
  `openingInventory`, `procurementQty`, `procurementPrice`, `salesQty`, `salesPrice`, `closingInventory`
- Constraints & Indexes: unique (productId, recordDate) + index for query performance


## Excel Format

- Required columns:
  - `ID` (product code)
  - `Product Name`
  - `Opening Inventory`
- Daily columns (Day 1, Day 2, ...; must come as a set):
  - `Procurement Qty (Day X)`
  - `Procurement Price (Day X)`
  - `Sales Qty (Day X)`
  - `Sales Price (Day X)`

Example:

```text
ID, Product Name, Opening Inventory, Procurement Qty (Day 1), Procurement Price (Day 1), Sales Qty (Day 1), Sales Price (Day 1)
P001, iPhone 15, 100, 50, 5000, 30, 6500
```

Processing guarantees:
- Zod validation with row-numbered error messages
- Transactional upsert: clear prior daily records per product, then bulk insert
- Large file friendly (default ~50MB max)


## Environment Variables

Create `.env.local` based on `.env.example` and fill real values (never commit secrets):

- `POSTGRES_URL`: database URL (used by app and Drizzle)
- `POSTGRES_URL_NON_POOLING`: optional non-pooled URL
- `DATABASE_URL`: optional alias
- `NEXTAUTH_SECRET`: NextAuth secret
- `NEXTAUTH_URL`: site URL (e.g. `http://localhost:3000` for dev)
- `OPENAI_API_KEY`: OpenAI key for AI insights

`.env*` is ignored by git for safety.


## Development

Prereqs: Node.js 18.17+ (20 LTS recommended), npm 10+

```bash
npm install
npm run db:push       # create tables from Drizzle schema
npm run dev           # http://localhost:3000

# production
npm run build && npm start

# tests
npm test              # all tests
npm run test:upload   # upload API tests only
npm run test:ui       # Vitest UI
```


## API

- Upload Excel: `POST /api/upload`
  - Content-Type: `multipart/form-data`
  - Field: `file`
  - 200: `{ success, message, summary: { productsProcessed, recordsCreated } }`
  - 4xx/5xx: `{ error, details? | validationErrors? }`

- AI Analysis: `POST /api/analyze`
  - Body: `{ productKPIs: ProductKPI[] }`
  - Returns streamed text

- Auth: `/api/auth/[...nextauth]`
- Register: `POST /api/register`

Protected routes: `/dashboard`, `/upload` (redirect to `/login` when unauthenticated).


## Deployment (Vercel)

1. Import repo into Vercel
2. Configure env vars: `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `OPENAI_API_KEY`
3. Push schema to DB:

```bash
npm run db:push
```

Optional: `vercel env pull .env.local` to sync envs locally.

## AI-Assisted Development

- Used Cursor and Codex to assist in the development.

## Quality & Rules

- Follow `.cursor/rules/` for structure, style, App Router, Drizzle, Auth, tests, charts
- Run `npm test` before commits; keep ESLint green


## Security & Notices

- No license attached by default; add a LICENSE if needed
- Keep secrets out of the repo; rotate credentials on any suspected leak


## Acknowledgements

- Next.js / Vercel / Recharts / Drizzle ORM / NextAuth / Vitest
- OpenAI and the AI SDK ecosystem


---

## 中文说明

一款用于“采购 / 销售 / 库存”分析的 Next.js 15 仪表盘应用，支持 Excel 批量导入、数据库入库、可视化图表与 AI 智能洞察。

在线地址：<a href="https://aibuild.a2a.ing" target="_blank" rel="noreferrer">https://aibuild.a2a.ing</a>

### 功能特性

- Excel 数据导入：支持 `.xlsx/.xls`，基于 Zod 强校验，自动将“宽表（日维度）”转换为按天的交易与库存记录
- 数据持久化：PostgreSQL（Vercel Postgres/Neon）+ Drizzle ORM，事务化写入，幂等处理（产品 Upsert + 旧日记录清理）
- 身份认证：NextAuth.js 凭证登录（注册/登录）、JWT Session、受保护路由（中间件自动跳转）
- 数据可视化：Recharts 折线对比，支持多产品、多曲线（库存/采购额/销售额）切换
- 经营分析：KPI 汇总（营收/成本/毛利/库存/动销率等）+ AI 智能洞察（基于 OpenAI，流式返回）
- 单元测试：Vitest 测试上传 API、数据校验、AI 接口等，内置测试数据集

### 技术栈

- Next.js 15（App Router，Server Components 优先）
- React 19
- Drizzle ORM + @vercel/postgres（PostgreSQL）
- NextAuth.js（Credentials Provider）
- Recharts（图表）
- Zod（输入校验）
- Vitest（测试）
- Tailwind CSS 4（样式）
- AI SDK（@ai-sdk/openai + ai）

### 使用流程

1. 注册/登录（`/register` → `/login`）
2. 在 `/upload` 上传 Excel
3. 打开 `/dashboard`，在 “Chart Customization” 选择 1~5 个产品
4. 查看图表与 KPI；点击 “AI-Powered Insights” 卡片生成分析

### 目录结构（关键路径）

- `app/layout.tsx`、`app/page.tsx`、`app/dashboard/page.tsx`、`app/upload/page.tsx`、`app/login/page.tsx`、`app/register/page.tsx`
- `app/api/upload/route.ts`、`app/api/analyze/route.ts`、`app/api/auth/[...nextauth]/route.ts`、`app/api/register/route.ts`
- `lib/db/schema.ts`、`lib/db/index.ts`
- `components/ChartCustomizer.tsx`、`components/ProductChart.tsx`、`components/DataAnalysis.tsx`、`components/AIAnalysis.tsx`
- `middleware.ts`
- `.cursor/rules/`、`.Information/developPlan.md`

### 数据模型

- `user`、`products`、`daily_records`（含唯一约束与索引）

### Excel 模板

- 必填：`ID`、`Product Name`、`Opening Inventory`
- 每日列（成组）：`Procurement Qty/Price (Day X)`、`Sales Qty/Price (Day X)`

示例：

```text
ID, Product Name, Opening Inventory, Procurement Qty (Day 1), Procurement Price (Day 1), Sales Qty (Day 1), Sales Price (Day 1)
P001, iPhone 15, 100, 50, 5000, 30, 6500
```

### 环境变量

参考 `.env.example` 新建 `.env.local` 并填写真实值（切勿提交机密）：

- `POSTGRES_URL`、`POSTGRES_URL_NON_POOLING`、`DATABASE_URL`
- `NEXTAUTH_SECRET`、`NEXTAUTH_URL`
- `OPENAI_API_KEY`

### 本地开发

```bash
npm install
npm run db:push
npm run dev

# 生产
npm run build && npm start

# 测试
npm test
npm run test:upload
npm run test:ui
```

### API 概览

- `POST /api/upload`（表单字段 `file`）
- `POST /api/analyze`（Body: `{ productKPIs: ProductKPI[] }`，流式文本）
- 认证：`/api/auth/[...nextauth]`；注册：`/api/register`
- 受保护路由：`/dashboard`、`/upload`

### 部署（Vercel）

配置环境变量后，执行：

```bash
npm run db:push
```
### AI 辅助开发说明

- 使用了 Cursor 与 Codex 等 AI 辅助工具进行开发。

### 代码质量与安全

- 遵循 `.cursor/rules/`
- 提交前运行 `npm test`，严禁提交任何机密


