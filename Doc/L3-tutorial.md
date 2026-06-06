# L3 Tutorial · 手把手给 Agent 加上 UI 组件能力

**版本:** v1 · 2026-05-15
**前置:** [L2-tutorial.md](L2-tutorial.md) 已完成（chat UI 能跑通）
**配套阅读:** [L3.md](L3.md)
**估算时长:** 40–60 分钟

---

## 这份 tutorial 怎么用

跟 [L2-tutorial.md](L2-tutorial.md) 一样，**6 个 checkpoint**，每个都有：

- 🎯 目标 / 🛠️ 操作 / ✅ 验收 / ⚠️ 常见坑

**关键**：L2 的 backend 不用改一行。L3 全部是**前端**的工作。如果你发现自己在改 `backend/index.js`，停下来 —— 走错路了。

---

## 你最后会得到什么

```
┌──────────────────────────────────────────────┐
│ L3 — Controlled Generative UI                │
├──────────────────────────────────────────────┤
│ 👤 Show me a flight: Pacific Air SFO → JFK   │
│    at 08:30 for $249                         │
│                                              │
│ 🤖 Here's your flight:                       │
│    ┌────────────────────────────┐            │
│    │ Pacific Air      SFO → JFK │            │
│    │  SFO  ✈ ───────────  JFK   │            │
│    │  Departure 08:30           │            │
│    │  Price     $249            │            │
│    │   ||| || |||| BOARDING ||| │            │
│    └────────────────────────────┘            │
│                                              │
│ 👤 Pie chart of my time: 40% coding, ...     │
│ 🤖 [renders a pie chart]                     │
│                                              │
│ [type a message...]                  [send]  │
└──────────────────────────────────────────────┘
```

agent 收到自然语言请求，**自主决定**调哪个组件、传什么参数；React 把它渲染成真实的 UI。

---

## 心智模型 · 一句话先讲清楚

> **L2 让 agent 会"说话"，L3 让 agent 会"做卡片"。**

在 L2 里，agent 唯一能给你的是文字。在 L3 里，前端**预先注册**了一批 React 组件（带 schema），agent 把它们当作"工具"来调用 —— 跟 function calling 一样的机制，只不过"function 返回值"是一段 UI 而不是一段文字。

### 这就是 Controlled Generative UI（受控生成式 UI）

generative UI 有一条光谱：

```
更受控 ←─────────────────────────────────────→ 更开放
[L3]               [L4]               [L5]
Controlled       Declarative          Open
(注册组件)        (catalog + schema)   (整个外部 app)
```

L3 是最右边受约束的一端：**agent 只能渲染你显式注册过的组件**。好处是稳、好测、设计可控；代价是每加一种 UI 能力都要写一个组件。

---

## Checkpoint 0 · 起点确认

### 🎯 目标
确认你站在 L2 的肩膀上，再往上爬。

### ✅ 验收

- [ ] `backend/` 和 `frontend/` 两个服务都能 `npm start` / `npm run dev` 起来
- [ ] http://localhost:5176 能看到 chat UI
- [ ] 在 chat 里发 `hello`，能拿到 streaming 回复
- [ ] 浏览器 console 干净

**任何一项不通过，回 [L2-tutorial.md](L2-tutorial.md) 先解决，不要硬上 L3。**

---

## Checkpoint 1 · 把第一个组件写出来（纯 React，没有 agent）

### 🎯 目标
先把 `<FlightCard />` 当成一个普通 React 组件写出来、在屏幕上看到，再考虑接给 agent 调。**永远先验证最小的那一层。**

### 🛠️ 操作

新建 `frontend/src/components/FlightCard.jsx`：

```jsx
export default function FlightCard({ airline, from, to, departure, price }) {
  return (
    <div
      style={{
        border: '1px solid #1f2937',
        borderRadius: 12,
        overflow: 'hidden',
        background: '#fff',
        maxWidth: 360,
        fontFamily: 'system-ui, sans-serif',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <div
        style={{
          background: '#0f172a',
          color: '#fff',
          padding: '10px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 13,
        }}
      >
        <strong>{airline}</strong>
        <span style={{ opacity: 0.8 }}>
          Flight from {from} to {to}
        </span>
      </div>
      <div style={{ padding: '18px 14px 6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{from}</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>Origin</div>
          </div>
          <div style={{ flex: 1, position: 'relative', height: 24 }}>
            <div style={{ position: 'absolute', top: 11, left: 0, right: 0, borderTop: '1px dashed #9ca3af' }} />
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', fontSize: 18 }}>✈</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{to}</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>Destination</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 13 }}>
          <div>
            <div style={{ color: '#6b7280', fontSize: 11 }}>Departure</div>
            <div style={{ fontWeight: 600 }}>{departure}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#6b7280', fontSize: 11 }}>Price</div>
            <div style={{ fontWeight: 600 }}>${price}</div>
          </div>
        </div>
      </div>
      <div
        style={{
          borderTop: '1px dashed #d1d5db',
          padding: '8px 14px',
          fontFamily: 'monospace',
          fontSize: 11,
          color: '#6b7280',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ letterSpacing: 1 }}>|||||| ||| |||| ||||| || |||||| |||</span>
        <span>BOARDING PASS</span>
      </div>
    </div>
  );
}
```

**临时**改 `frontend/src/App.jsx`，把它直接 mount 到首页来验证（一会儿会改回去）：

```jsx
import FlightCard from './components/FlightCard.jsx';

export default function App() {
  return (
    <div style={{ padding: 40, background: '#f8fafc', minHeight: '100vh' }}>
      <FlightCard
        airline="Pacific Air"
        from="SFO"
        to="JFK"
        departure="08:30"
        price={249}
      />
    </div>
  );
}
```

### ✅ 验收

- [ ] 浏览器 http://localhost:5176 看到一张登机牌样式的卡片
- [ ] 显示 Pacific Air、SFO → JFK、Departure 08:30、Price $249
- [ ] 没有 console 错误

### ⚠️ 常见坑

- **看不到卡片** → import 路径错。注意 `.jsx` 扩展名要写
- **样式塌了** → 不要紧，组件长得丑没关系，先证明它能渲染就行

### 🧠 为什么这么做？

很多人会想 "我直接接 agent 不就完了？" —— **不要**。如果你直接写 `useCopilotAction` 接 agent，组件渲染又有问题，你会分不清是 agent 没调到、是 schema 错了、还是组件本身坏了。**先把组件单独验证过，后面排查只剩一种可能。**

---

## Checkpoint 2 · 注册成 agent 的工具

### 🎯 目标
让 agent 能调到这个组件。**这一步 chat 还在，但首页 mount 的 FlightCard 我们要拿掉。**

### 🛠️ 操作

恢复 `frontend/src/App.jsx` 到 L2 的样子，但 `<CopilotChat>` 抽出来变成一个 lesson 组件，方便以后加 tab：

`frontend/src/lessons/L3Chat.jsx`（新建）：

```jsx
import { useCopilotAction } from '@copilotkit/react-core';
import { CopilotChat } from '@copilotkit/react-ui';
import FlightCard from '../components/FlightCard.jsx';

export default function L3Chat() {
  useCopilotAction({
    name: 'showFlightCard',
    description:
      'Render a flight card in the chat with airline, origin (IATA code), ' +
      'destination (IATA code), departure time, and price in USD.',
    available: 'frontend',
    parameters: [
      { name: 'airline',   type: 'string', required: true,
        description: 'Airline name, e.g. "Pacific Air"' },
      { name: 'from',      type: 'string', required: true,
        description: 'Origin IATA code, e.g. "SFO"' },
      { name: 'to',        type: 'string', required: true,
        description: 'Destination IATA code, e.g. "JFK"' },
      { name: 'departure', type: 'string', required: true,
        description: 'Departure time, e.g. "08:30"' },
      { name: 'price',     type: 'number', required: true,
        description: 'Price in USD' },
    ],
    render: ({ args }) => <FlightCard {...args} />,
  });

  return (
    <div style={{ height: '100%' }}>
      <CopilotChat
        instructions={
          'You are a helpful assistant that uses rich UI components when appropriate. ' +
          'When the user asks about flights, call showFlightCard. ' +
          'Otherwise, reply in plain text.'
        }
        labels={{
          title: 'L3 — Controlled Generative UI',
          initial:
            'Try: "Show a flight card for Pacific Air from SFO to JFK at 08:30 for $249"',
        }}
      />
    </div>
  );
}
```

改 `frontend/src/App.jsx` 用 lesson 组件：

```jsx
import { CopilotKit } from '@copilotkit/react-core';
import L3Chat from './lessons/L3Chat.jsx';

export default function App() {
  return (
    <CopilotKit runtimeUrl="http://localhost:4000/copilotkit">
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
          <strong>A2UI Demo</strong>
        </header>
        <main style={{ flex: 1, minHeight: 0 }}>
          <L3Chat />
        </main>
      </div>
    </CopilotKit>
  );
}
```

### ✅ 验收

**这一步不会立刻看出来"agent 多了一个工具"**，因为还没真正发消息。先做最弱的验收：

- [ ] 浏览器仍然看到 chat UI（顶部写 "L3 — Controlled Generative UI"）
- [ ] **Console 没有 "Invalid action configuration" 错误**
- [ ] 也没有别的红字

### ⚠️ 常见坑（最关键的一节）

**`Error: Invalid action configuration` → 页面白屏**

这是 L3 最大的坑。原因：你装的 `@copilotkit/react-core` 是 `1.57.1`（不是 `package.json` 上写的 `^1.8.0`），新版要求每个 action 必须声明下面**至少一个字段**：

| 字段 | 用法 |
|---|---|
| `handler` | action 有副作用 / 要返回值给 LLM |
| `renderAndWait` / `renderAndWaitForResponse` | human-in-the-loop（要等用户操作） |
| `available: 'frontend'` 或 `'disabled'` | 纯渲染 UI，没有返回值 |
| `available: 'enabled'` 或 `'remote'` | 前端工具变体 |

L3 的两个 action 都是"展示一张卡，不返回任何东西给 LLM" → **`available: 'frontend'`**。

少写这行 → `getActionConfig` 抛 "Invalid action configuration" → React 整棵树炸 → 白屏。这件事详细经过见 [../TROUBLESHOOTING.md](../TROUBLESHOOTING.md)。

### 🔍 这个 action 的 schema 在跟谁说话？

```
useCopilotAction({...})
        │
        │  注册到 CopilotKit 前端上下文
        ▼
浏览器 ── POST /copilotkit (含 tool 列表) ──→ 后端
                                              │
                                              │  作为 tool 传给 LLM
                                              ▼
                                          OpenAI API
                                              │
                                              │  LLM 决定调 showFlightCard
                                              ▼
浏览器 ←── SSE: tool_call event ──────────── 后端
   │
   │  CopilotKit 解析 args，调你的 render()
   ▼
<FlightCard {...args} /> 出现在 chat 里
```

`parameters` 数组就是给 LLM 看的 **JSON Schema**。你写得越清楚（特别是 `description`），LLM 调对的概率越高。

---

## Checkpoint 3 · 真正让 agent 调一次

### 🎯 目标
端到端跑通，看到 agent 自主决定调 `showFlightCard` 并渲染卡片。

### 🛠️ 操作

打开 http://localhost:5176，在 chat 里输入：

```
Show me a flight card for Pacific Air from SFO to JFK at 08:30 for $249
```

按回车。

### ✅ 验收

- [ ] **几秒内**看到 typing 动画
- [ ] 然后 chat 里出现一张 **FlightCard 卡片**（不是文字 "Pacific Air SFO → JFK..."）
- [ ] 卡片内容正确（airline、from、to、departure、price 都对得上）
- [ ] DevTools Network 里能看到对 `/copilotkit` 的 POST，response 是 SSE，里面有 `ToolCallStart` / `ToolCallArgs` 类事件

### 🎉 这一刻发生了什么？

你刚才**没**告诉 agent "请用 showFlightCard 工具"，你只说了 "show me a flight card"。但 agent 自主：

1. 看到 tool 列表里有 `showFlightCard`，描述里写了 "Render a flight card..."
2. 从用户文字里解析出 5 个参数（airline、from、to、departure、price）
3. 决定调用 `showFlightCard({airline:"Pacific Air", from:"SFO", to:"JFK", departure:"08:30", price:249})`
4. CopilotKit 收到 tool_call 事件 → 找到对应的 `render` 函数 → 渲染

**这就是 Controlled Generative UI 的全部魔法。** 不需要 prompt engineering，不需要硬编码 if-else，schema 写得好 + description 写得清晰 → agent 自然就会用。

### ⚠️ 常见坑

- **agent 回复的是文字而不是卡片** → description 写得不够清楚。把 `description` 改长一点、明确点："Always call this tool when the user mentions a flight"
- **卡片出现但参数全空/错乱** → parameters 的 `type` 写错了（price 应该是 `number`，不是 `string`）
- **看到 react 报错 "Cannot read property 'X' of undefined"** → render 时 args 还在 streaming 没到齐。L3 的 `render` 是 streaming-friendly 的，但你的组件要能容忍 props 为 `undefined`

---

## Checkpoint 4 · 第二个组件，验证模式可复用

### 🎯 目标
加一个完全不同形态的组件（饼图），证明"加新能力 = 加一个 component + 一个 useCopilotAction"，不需要碰别的地方。

### 🛠️ 操作

新建 `frontend/src/components/PieChart.jsx`：

```jsx
const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'];

export default function PieChart({ title, slices }) {
  const data = Array.isArray(slices) ? slices : [];
  const total = data.reduce((sum, s) => sum + Number(s?.value || 0), 0);
  if (total <= 0) return <div style={{ color: '#6b7280', fontSize: 13 }}>No data for pie chart.</div>;

  const radius = 80, cx = 100, cy = 100;
  let cumulative = 0;
  const paths = data.map((slice, i) => {
    const value = Number(slice.value) || 0;
    const startAngle = (cumulative / total) * Math.PI * 2;
    cumulative += value;
    const endAngle = (cumulative / total) * Math.PI * 2;
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const x1 = cx + radius * Math.sin(startAngle);
    const y1 = cy - radius * Math.cos(startAngle);
    const x2 = cx + radius * Math.sin(endAngle);
    const y2 = cy - radius * Math.cos(endAngle);
    return {
      d: `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: COLORS[i % COLORS.length],
      label: slice.label,
      value,
    };
  });

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff', maxWidth: 420, fontFamily: 'system-ui, sans-serif' }}>
      {title && <div style={{ fontWeight: 600, marginBottom: 12 }}>{title}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <svg width={200} height={200} viewBox="0 0 200 200">
          {paths.map((p, i) => <path key={i} d={p.d} fill={p.color} stroke="#fff" strokeWidth={1} />)}
        </svg>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13 }}>
          {paths.map((p, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ width: 12, height: 12, background: p.color, borderRadius: 2, display: 'inline-block' }} />
              <span style={{ color: '#374151' }}>{p.label} — {((p.value / total) * 100).toFixed(1)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

在 `L3Chat.jsx` 里**追加**第二个 `useCopilotAction`（不要删 `showFlightCard`），并 import PieChart：

```jsx
import PieChart from '../components/PieChart.jsx';
```

```jsx
useCopilotAction({
  name: 'showPieChart',
  description:
    'Render a pie chart given a title and an array of slices. ' +
    'Use this when the user asks to visualize proportions or breakdowns.',
  available: 'frontend',
  parameters: [
    { name: 'title', type: 'string', required: false },
    {
      name: 'slices',
      type: 'object[]',                   // ← 数组类型
      required: true,
      attributes: [                       // ← 嵌套 schema
        { name: 'label', type: 'string', required: true },
        { name: 'value', type: 'number', required: true },
      ],
    },
  ],
  render: ({ args }) => <PieChart title={args.title} slices={args.slices} />,
});
```

同时把 `instructions` 也加一句：

```jsx
instructions={
  'You are a helpful assistant that uses rich UI components when appropriate. ' +
  'When the user asks about flights, call showFlightCard. ' +
  'When the user asks to visualize a breakdown, distribution, or proportions, call showPieChart. ' +
  'Otherwise, reply in plain text.'
}
```

### ✅ 验收

在 chat 里发：

```
Pie chart of my time: 40% coding, 30% meetings, 20% email, 10% other
```

- [ ] 渲染出一个饼图，4 个扇区颜色不同
- [ ] 右边图例显示 4 项 + 百分比
- [ ] 角度大致跟数字对得上（40% 那块最大）

再发：

```
Show me a flight: Air China from PEK to SYD at 23:55 for $1180
```

- [ ] 还是渲染 FlightCard，参数正确

### 🔑 模式总结

加一种 UI 能力 = 三步：

1. 写 React 组件 `<XxxCard />`
2. 在 lesson 组件里加一个 `useCopilotAction({ name, description, available: 'frontend', parameters, render })`
3. 在 `instructions` 里告诉 agent 啥时候用

**后端、provider、整体架构 —— 一律不用碰。**

### ⚠️ 常见坑

- **饼图算错 / 一团黑** → `slices` 没拿到数组。在 PieChart 里加 `console.log(slices)` 看 args 是什么形状
- **嵌套 schema 不识别** → `attributes` 是 CopilotKit 老 API 的语法，1.57.x 里依然支持但官方推荐 Zod。下面 Checkpoint 6 有讲

---

## Checkpoint 5 · 看清协议层（选学但强烈建议做）

### 🎯 目标
打开 Network 面板，亲眼看 AG-UI 协议是怎么传 tool_call 的。**理解了这个，你对所有 L3+ 调试都心里有数。**

### 🛠️ 操作

1. DevTools → Network → 筛 `copilotkit`
2. 清空记录
3. chat 里发 "Show a flight card for Pacific Air..."
4. 找到那条 POST 请求 → Response 标签

### 🔍 你会看到什么

Response 是 `text/event-stream`，一段一段往下流。**截取一个 tool_call 流的样子（简化）**：

```
event: ToolCallStart
data: { "toolCallId": "call_abc", "toolCallName": "showFlightCard" }

event: ToolCallArgs
data: { "toolCallId": "call_abc", "delta": "{\"airline\":\"Pa" }

event: ToolCallArgs
data: { "toolCallId": "call_abc", "delta": "cific Air\"," }

... （args 一个字一个字传下来）

event: ToolCallEnd
data: { "toolCallId": "call_abc" }
```

CopilotKit 前端订阅这些 event，**args 边收边渲染**（`render` 函数会被多次调用，每次拿到目前为止的 args）。这就是为什么 FlightCard 出现的时候你可能看到字段先空后填 —— 在流式更新。

### ✅ 验收

- [ ] 看到至少一对 `ToolCallStart` / `ToolCallEnd`
- [ ] 中间夹着多个 `ToolCallArgs` delta
- [ ] 能在 `delta` 里看到拼起来的 JSON 片段

### 🧠 心智收获

**"agent 调了组件" 的本质 = LLM 生成的一段 streaming JSON，被 CopilotKit 解析成 props 喂给你的 React 组件。**

理解这一点之后，L4（让 agent 拼整个 layout 树）和 L6（agent 通过 tool_call 修改前端 state）就一通百通了。

---

## Checkpoint 6（选学）· 现代 API 替代方案：`useComponent`

### 🎯 目标
认识 [L3.md](L3.md) 里推荐的 `useComponent` 写法。它是 CopilotKit 后期版本的简化 API，配 Zod 用，更类型安全。

### 🛠️ 操作（**只是了解，不必改你已经跑通的代码**）

L3.md 里的写法：

```jsx
import { useComponent } from '@copilotkit/react-core';
import { z } from 'zod';

useComponent({
  name: 'showFlightCard',
  description: 'Render a flight card...',
  parameters: z.object({
    airline:   z.string().describe('Airline name'),
    from:      z.string().describe('Origin IATA code'),
    to:        z.string().describe('Destination IATA code'),
    departure: z.string().describe('Departure time'),
    price:     z.number().describe('Price in USD'),
  }),
  render: FlightCard,
});
```

### 跟 `useCopilotAction` 的差别

| 维度 | `useCopilotAction` | `useComponent` |
|---|---|---|
| API 年代 | 老 v1.x 起源 | 新（v1.5+ 起源） |
| schema 形式 | `parameters` 数组 | Zod schema |
| 类型安全 | 一般 | 强（Zod 推断） |
| 必须写 `available` | **是**（render-only 必须 `'frontend'`） | 不需要（默认就是 render） |
| 灵活性 | 高（能同时给 `handler` 做副作用） | 专注 display-only |

### 怎么选

- **现在动**：留着 `useCopilotAction`（你已经跑通了）
- **新项目**：直接用 `useComponent`，schema 用 Zod
- 想换的话：装 `zod`（`npm i zod`），把 `parameters` 数组改成 `z.object({...})`，把 `render` 改成传组件本身（而不是函数）

### ✅ 验收

- [ ] 知道两个 API 的区别
- [ ] 知道为什么 [L3Chat.jsx](../frontend/src/lessons/L3Chat.jsx) 用 `useCopilotAction` 而 [L3.md](L3.md) 教 `useComponent`（前者是项目历史代码，后者是文档推荐）

---

## 完整文件清单 · 通关后应该有的样子

```
A2UI/frontend/src/
├── App.jsx                    # 由 L2 改造而来，<L3Chat /> 取代 <CopilotChat />
├── main.jsx                   # 不变
└── lessons/
│   └── L3Chat.jsx             # 新建，两个 useCopilotAction
└── components/
    ├── FlightCard.jsx         # 新建
    └── PieChart.jsx           # 新建
```

**`backend/index.js` 没动过一行**。这是 L3 学习目标里最重要的事 —— 新的 UI 能力是纯前端的工作。

---

## 下一步

- **L4** · 让 agent 自由拼 layout（一个 tool 渲染任意 schema 树）→ [L4.md](L4.md)
- **L5** · agent 嵌入完整外部 app（Excalidraw、tldraw）→ [L5.md](L5.md)
- **L6** · agent 跟前端共享 state（双向同步的 todo list）→ [L6.md](L6.md)

---

## 附录 · 常见思维误区

### "我得不得在 backend 里也声明这些 tool？"
**不用。** CopilotKit 把前端注册的 action 自动同步给后端 runtime，后端再把它们作为 tools 传给 LLM。你只在前端写一次 schema。

### "为什么 agent 有时候不用我注册的组件，用文字回复？"
两种可能：
1. `description` 写得不够清楚，LLM 不知道这个 tool 干嘛用
2. `instructions` 没明确告诉 agent "遇到 X 情况一定要用 showXxx"

修改这两个字段，比改任何代码都有效。

### "我能在 render 里访问外部 state 吗？"
能。`render` 是普通 React render —— 你可以用 hooks、读 context、做任何 React 能做的事。这是 L3 比纯 LLM-driven UI 强的地方：**渲染是你掌控的**。

### "agent 偶尔传错参数怎么办？"
- 加强 `description` 里每个参数的说明（特别是格式：date format、IATA code、单位）
- 在组件里做 graceful fallback（看 PieChart 第一行的 `Array.isArray` 兜底）
- 不要在 schema 里加约束（required/min/max），LLM 看不到这些 —— 它只读 description
