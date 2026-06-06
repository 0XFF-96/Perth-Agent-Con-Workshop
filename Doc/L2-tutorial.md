# L2 Tutorial · 手把手实现一个基础 Agent UI

**版本:** v1 · 2026-05-15
**配套阅读:** [L2.md](L2.md)
**估算时长:** 45–60 分钟（从零开始）

---

## 这份 tutorial 怎么用

下面把整个 L2 拆成 **7 个 checkpoint**，每个 checkpoint 都有：

- 🎯 **目标** —— 这一步要做成什么
- 🛠️ **操作** —— 具体改哪个文件、敲哪条命令
- ✅ **验收** —— 怎么确认这一步做对了
- ⚠️ **常见坑** —— 失败时往哪儿看

**做法**：一定要每个 checkpoint 都验证通过再进下一个。L2 的 bug 90% 是前面某一步没做对、又被下一步盖住了。

---

## 你最后会得到什么

一个能跑的项目，前端 `:5176` 上有一个 chat 输入框，后端 `:4000` 用 OpenAI 接 LangChain agent，中间走 AG-UI 协议。打开 chat 输入 "hello"，能看到流式（streaming）回复。

```
┌──────────────────────────────────┐
│ L2 — Basic Agent UI              │
├──────────────────────────────────┤
│ 🤖 Hi! Ask me anything.          │
│                                  │
│ 👤 hello                         │
│ 🤖 Hello! How can I help you?    │
│                                  │
│ [type a message...]      [send]  │
└──────────────────────────────────┘
```

---

## 技术栈 cheat sheet

L2 是后面所有 lesson 的地基，所以这些名字你最少混个脸熟：

| 名字 | 角色 |
|---|---|
| **AG-UI** | 协议层。前后端通过它沟通，跟具体 LLM 无关 |
| **CopilotKit** | AG-UI 的官方 SDK，前后端各一套 |
| **`CopilotRuntime`** | 后端的核心对象，负责管理 agent 和路由 |
| **`BuiltInAgent`** | CopilotKit 内置 agent，直接对接 OpenAI（也支持 Anthropic、Gemini） |
| **`<CopilotKit>`** | React provider，把整个 app 包进 CopilotKit 的上下文 |
| **`<CopilotChat>`** | 开箱即用的聊天 UI 组件 |

> **重要版本说明：** 当前装的是 `@copilotkit/runtime@2.x` 和 `@copilotkit/react-core@1.57.1`。这个项目的 `package.json` 写的是 `^1.8.0`，但实际装的是 1.57.1 —— API 差异很大。新版要求每个 action 有 `handler` 或 `available` 字段（这对 L2 没影响，但 L3 开始就会踩坑）。详见 [../TROUBLESHOOTING.md](../TROUBLESHOOTING.md)。

---

## Checkpoint 0 · 准备工作

### 🎯 目标
确认环境就绪。

### 🛠️ 操作

```bash
node -v    # 期望 ≥ 18.x
npm -v     # 期望 ≥ 9.x
```

去 https://platform.openai.com/api-keys 创建一个 key，先放着别贴到任何文件里。

新建项目根目录：

```bash
mkdir A2UI && cd A2UI
mkdir backend frontend
```

### ✅ 验收

- [ ] `node -v` 输出 ≥ 18
- [ ] 手上有一个 `sk-...` 开头的 OpenAI key
- [ ] 目录结构：`A2UI/backend/`、`A2UI/frontend/`

### ⚠️ 常见坑

- **Node < 18**：CopilotKit 用了较新 ESM 特性，会报奇怪的 import 错误。装 nvm 切到 ≥ 18。

---

## Checkpoint 1 · 后端最小骨架（不带 CopilotKit）

### 🎯 目标
先有一个能跑起来的纯 Express 服务，确认基础环境没问题，再叠 CopilotKit。**不要一上来就把所有东西堆一起。**

### 🛠️ 操作

`backend/package.json`：

```json
{
  "name": "a2ui-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2"
  }
}
```

> **必须有 `"type": "module"`** —— CopilotKit 后端用 ESM。少这一行，下面的 `import` 全部失败。

`backend/.env.example`（占位符，**不要写真实 key**）：

```
OPENAI_API_KEY=sk-your-key-here
PORT=4000
```

`backend/.env`（你的本地真实文件，**不要提交到 git**）：

```
OPENAI_API_KEY=sk-真实的-key
PORT=4000
```

`backend/index.js`（最小版）：

```js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
```

装依赖并启动：

```bash
cd backend
npm install
npm start
```

### ✅ 验收

- [ ] 终端打印 `Backend listening on http://localhost:4000`
- [ ] 新开终端跑 `curl http://localhost:4000/health` 返回 `{"ok":true}`
- [ ] 没有任何红色错误

### ⚠️ 常见坑

- **`SyntaxError: Cannot use import statement outside a module`** → 忘了在 package.json 加 `"type": "module"`
- **`Error: listen EADDRINUSE :::4000`** → 端口被占。`lsof -i :4000` 找出来 kill，或者改 `.env` 里的 `PORT`

---

## Checkpoint 2 · 把 CopilotKit Runtime 接上

### 🎯 目标
让后端有 `/copilotkit` 这个端点，能接 AG-UI 协议。

### 🛠️ 操作

补依赖（在 `backend/package.json` 的 `dependencies` 加两行）：

```json
{
  "dependencies": {
    "@copilotkit/runtime": "^2.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2"
  }
}
```

```bash
npm install
```

改 `backend/index.js`：

```js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { CopilotRuntime, BuiltInAgent } from '@copilotkit/runtime/v2';
import { createCopilotExpressHandler } from '@copilotkit/runtime/v2/express';

if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY. Copy .env.example to .env and set it.');
  process.exit(1);
}

const app = express();
app.use(cors());

const runtime = new CopilotRuntime({
  agents: {
    default: new BuiltInAgent({
      model: 'openai/gpt-4o-mini',
      apiKey: process.env.OPENAI_API_KEY,
      maxSteps: 5,
    }),
  },
});

app.use(
  createCopilotExpressHandler({
    runtime,
    basePath: '/copilotkit',
    cors: true,
  }),
);

app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}/copilotkit`);
});
```

重启：

```bash
npm start
```

### ✅ 验收

- [ ] 启动不再报 "Missing OPENAI_API_KEY"
- [ ] `curl http://localhost:4000/health` 仍然返回 `{"ok":true}`
- [ ] `curl -X POST http://localhost:4000/copilotkit` 返回的**不是 404**（可能是 400/500，只要不是 404 就说明路由生效了）

### 🔍 这一步发生了什么？

```
                ┌──── /health    ──── { ok: true }
请求 ──→ Express ┤
                └──── /copilotkit ──── CopilotRuntime
                                          ↓
                                       BuiltInAgent
                                          ↓
                                       OpenAI API
```

`CopilotRuntime` 是个中间人。`BuiltInAgent` 拿到 AG-UI 格式的消息，转换成 OpenAI 格式，调 OpenAI，把流式回复再转回 AG-UI 格式吐出去。前端完全不知道底下用的是 OpenAI 还是 Anthropic —— 这就是 L2 学习目标里 "swap backends" 的意思。

### ⚠️ 常见坑

- **`Cannot find module '@copilotkit/runtime/v2'`** → 装的版本太旧。`npm ls @copilotkit/runtime` 确认是 `2.x`
- **启动直接退出 + "Missing OPENAI_API_KEY"** → `.env` 没读到。确认 `backend/.env` 存在、和 `index.js` 同目录，且 `dotenv/config` 在所有 import 最前面

---

## Checkpoint 3 · 前端最小骨架（不带 CopilotKit）

### 🎯 目标
先有一个能跑的 Vite + React 空白页，再叠 CopilotKit。

### 🛠️ 操作

```bash
cd ../frontend
```

`frontend/package.json`：

```json
{
  "name": "a2ui-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^5.4.10"
  }
}
```

`frontend/vite.config.js`：

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5176 },
});
```

`frontend/index.html`：

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>A2UI Basic Demo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

`frontend/src/main.jsx`：

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

`frontend/src/App.jsx`：

```jsx
export default function App() {
  return <div style={{ padding: 20 }}>Hello A2UI</div>;
}
```

装依赖并启动：

```bash
npm install
npm run dev
```

### ✅ 验收

- [ ] 终端打印 `Local: http://localhost:5176/`
- [ ] 浏览器打开 http://localhost:5176 看到 "Hello A2UI" 文字
- [ ] 浏览器 DevTools Console 没有红色错误

### ⚠️ 常见坑

- **白屏 + console 有红字** → 99% 是 import 路径错。仔细看 stack trace 的第一行
- **`Failed to resolve module specifier "react"`** → 没装依赖，`npm install` 再来

---

## Checkpoint 4 · 把 CopilotKit Provider 包上

### 🎯 目标
让 React 树里能用 CopilotKit 的 hooks 和组件。**这一步不会有任何 UI 变化** —— 它只是接通了上下文。这是最容易让人怀疑 "我是不是做错了" 的一步。

### 🛠️ 操作

补 `frontend/package.json` 的 `dependencies`：

```json
"@copilotkit/react-core": "1.57.1",
"@copilotkit/react-ui":   "1.57.1",
```

> 注意：**精确版本，不要用 `^`**。原因见 [../TROUBLESHOOTING.md](../TROUBLESHOOTING.md)。

```bash
npm install
```

改 `frontend/src/main.jsx`，加一行 css import：

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import '@copilotkit/react-ui/styles.css';   // ← 新加

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

改 `frontend/src/App.jsx`：

```jsx
import { CopilotKit } from '@copilotkit/react-core';

export default function App() {
  return (
    <CopilotKit runtimeUrl="http://localhost:4000/copilotkit">
      <div style={{ padding: 20 }}>Hello A2UI</div>
    </CopilotKit>
  );
}
```

### ✅ 验收

- [ ] 浏览器仍然看到 "Hello A2UI"（UI 没变是正常的）
- [ ] Console **没有红色错误**
- [ ] Network 面板里能看到对 `http://localhost:4000/copilotkit` 的请求（可能 200，也可能因为没消息内容是别的状态，但**不应该是 CORS 错误或 connection refused**）

### ⚠️ 常见坑

- **Console 红字 "Failed to fetch"** → 后端没启。回 Checkpoint 2 确认 `:4000` 还在跑
- **Console 红字 CORS** → 后端 `cors: true` 没传给 `createCopilotExpressHandler`，回去看一下
- **CSS 看起来乱了** → `@copilotkit/react-ui/styles.css` 这一行漏了

---

## Checkpoint 5 · 加上 CopilotChat 组件

### 🎯 目标
看到真正的 chat UI。

### 🛠️ 操作

改 `frontend/src/App.jsx`：

```jsx
import { CopilotKit } from '@copilotkit/react-core';
import { CopilotChat } from '@copilotkit/react-ui';

export default function App() {
  return (
    <CopilotKit runtimeUrl="http://localhost:4000/copilotkit">
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
          <strong>A2UI Demo</strong>
        </header>
        <main style={{ flex: 1, minHeight: 0 }}>
          <CopilotChat
            instructions="You are a helpful assistant. Be concise."
            labels={{
              title: 'L2 — Basic Agent UI',
              initial: 'Hi! Ask me anything.',
            }}
          />
        </main>
      </div>
    </CopilotKit>
  );
}
```

### ✅ 验收

- [ ] 浏览器看到一个完整的聊天界面
- [ ] 顶部显示 "L2 — Basic Agent UI"
- [ ] 中间显示 initial message "Hi! Ask me anything."
- [ ] 底部有可输入的输入框和发送按钮
- [ ] Console 仍然干净

### 🔍 关键 prop 解释

| Prop | 作用 |
|---|---|
| `instructions` | 拼到 system prompt 里，控制 agent "性格" |
| `labels.title` | UI 标题 |
| `labels.initial` | 第一次打开时 bot 的开场白（**仅 UI 上显示，不进对话历史**） |

### ⚠️ 常见坑

- **白屏 + console 报 "Invalid action configuration"** → 这是 L3+ 才会出现的问题。如果 L2 出现说明你跑错版本/装错包了
- **看到 chat UI 但是只占屏幕一小块** → `<main>` 没设 `flex: 1` 和 `minHeight: 0`

---

## Checkpoint 6 · 真正发一条消息

### 🎯 目标
端到端联调成功。

### 🛠️ 操作

在 chat 输入框里输入 `hello`，按回车。

### ✅ 验收

- [ ] 你的消息出现在右边（或上方）
- [ ] **几秒内**看到 typing 动画 / loading 状态
- [ ] AI 的回复**逐字流式出现**（不是一次性蹦出来）
- [ ] 回复内容合理（不是错误信息）

打开 DevTools → Network → 筛 "copilotkit"，能看到：

- 一个对 `:4000/copilotkit` 的 **POST** 请求
- Response 是 `text/event-stream` 类型
- Response 体里能看到一串一串的 AG-UI event（`TextMessageStart`、`TextMessageContent`、`TextMessageEnd` 等）

### 🔍 这里发生了什么？

```
浏览器                  后端 :4000              OpenAI
   │                       │                      │
   │── POST /copilotkit ──→│                      │
   │   { messages: [...] } │                      │
   │                       │── ChatCompletion ───→│
   │                       │   stream=true        │
   │                       │←── SSE chunks ───────│
   │                       │                      │
   │←── SSE: AG-UI ────────│                      │
   │   TextMessageStart    │                      │
   │   TextMessageContent  │                      │
   │   ...                 │                      │
```

这一刻你应该恍然 —— **AG-UI 就是把 LLM 的 streaming 抽象出来的协议**。前端不直接接 OpenAI，而是接一个 "中立的" 流式协议。所以你后端换成 Anthropic、Gemini、自己的 LangGraph agent，前端 `<CopilotChat>` 一行不用改。

### ⚠️ 常见坑

- **消息发出去，转圈圈不停，没回复** →
  - 后端终端有红字？多半是 OpenAI key 不对 / 额度用完 / 网络问题
  - 后端没红字？检查浏览器 Network 里 `/copilotkit` 请求的 Response，错误信息在那里
- **流式不工作，整段一次性蹦出来** → CORS preflight 走了普通响应，但 SSE 没建立。`cors: true` 在 `createCopilotExpressHandler` 里有传吗？

---

## Checkpoint 7（选学）· 验证 "swap backends" 学习目标

### 🎯 目标
亲手验证 L2 的核心承诺：**换 LLM 后端，前端零改动**。

### 🛠️ 操作

把 `backend/index.js` 里：

```js
new BuiltInAgent({
  model: 'openai/gpt-4o-mini',
  apiKey: process.env.OPENAI_API_KEY,
  ...
})
```

改成（假设你有 Anthropic key）：

```js
new BuiltInAgent({
  model: 'anthropic/claude-haiku-4-5-20251001',
  apiKey: process.env.ANTHROPIC_API_KEY,
  ...
})
```

`.env` 加 `ANTHROPIC_API_KEY=...`，重启后端。**前端不动。**

### ✅ 验收

- [ ] 前端浏览器**不用刷新**或重启
- [ ] 再发一条消息，依然有回复
- [ ] 回复的"风格"明显跟 OpenAI 不一样（Claude 通常更啰嗦一点）

如果通过了，恭喜 —— 你刚刚证明了 AG-UI 协议层的价值。

---

## 完整文件清单 · 通关后你应该有的样子

```
A2UI/
├── backend/
│   ├── .env                    # 你的真实 key（不进 git）
│   ├── .env.example            # 占位符
│   ├── index.js
│   ├── node_modules/
│   ├── package.json
│   └── package-lock.json
└── frontend/
    ├── index.html
    ├── node_modules/
    ├── package.json
    ├── package-lock.json
    ├── src/
    │   ├── App.jsx
    │   └── main.jsx
    └── vite.config.js
```

---

## 下一步

- 想给 agent 加上 React 组件能力（航班卡、饼图）→ 进 [L3.md](L3.md)
- 想让 agent 动态拼复杂 layout → 进 [L4.md](L4.md)
- 整个 chat UI 白屏排查 → 看 [../TROUBLESHOOTING.md](../TROUBLESHOOTING.md)

---

## 附录 · 心智模型一句话总结

> **AG-UI 之于 chat UI，就像 HTTP 之于浏览器。** 浏览器不关心服务器是 Apache 还是 nginx，只要说 HTTP 就能渲染。CopilotChat 不关心后端是 OpenAI 还是 Claude 还是你写的 LangGraph，只要说 AG-UI 就能渲染。

L2 的全部价值，就是把这层抽象**实际跑通一次**，让你以后 L3–L6 在它之上加东西的时候知道 "我在动的是协议的哪一层"。
