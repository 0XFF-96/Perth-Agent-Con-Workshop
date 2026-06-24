import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export type LoopToolResult = unknown | { component: string; props: Record<string, unknown> };

export type LoopTool = {
  name: string;
  description: string;
  parameters: z.ZodObject<z.ZodRawShape>;
  kind: "data" | "ui";
  execute: (args: Record<string, unknown>) => LoopToolResult;
};

export function defineLoopTool(tool: LoopTool): LoopTool {
  return tool;
}

// Same figures L4 uses (kept local so the loop registry stays a plain, shared,
// secret-free module — do not import the CopilotKit defineTool from l4-tools).
export const SALES_FIGURES = {
  totalRevenue: "$1.2M",
  newCustomers: 3842,
  conversionRate: "3.6%",
  revenueByCategory: [
    { label: "Electronics", value: 420000 },
    { label: "Clothing", value: 310000 },
    { label: "Home & Garden", value: 185000 },
    { label: "Sports", value: 160000 },
    { label: "Books", value: 125000 },
  ],
} as const;

export const getSalesData = defineLoopTool({
  name: "get_sales_data",
  description:
    "Fetch current sales metrics: total revenue, new customers, conversion rate, and revenue broken down by category.",
  parameters: z.object({}),
  kind: "data",
  execute: () => SALES_FIGURES,
});

export const calculate = defineLoopTool({
  name: "calculate",
  description:
    "Do ONE arithmetic operation on two numbers. Use this for any math instead of computing it yourself.",
  parameters: z.object({
    a: z.number().describe("Left operand"),
    b: z.number().describe("Right operand"),
    op: z.enum(["+", "-", "*", "/"]).describe("The operation"),
  }),
  kind: "data",
  execute: (args) => {
    const { a, b, op } = args as { a: number; b: number; op: "+" | "-" | "*" | "/" };
    const result =
      op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : b === 0 ? null : a / b;
    return { a, b, op, result };
  },
});

export const makePieChart = defineLoopTool({
  name: "make_pie_chart",
  description:
    "Render a pie chart from labeled values to VISUALIZE a breakdown. Do not repeat the chart data in text afterward.",
  parameters: z.object({
    title: z.string().describe("Chart title"),
    slices: z
      .array(z.object({ label: z.string(), value: z.number() }))
      .describe("Pie slices: each a label and a numeric value"),
  }),
  kind: "ui",
  execute: (args) => {
    const { title, slices } = args as { title: string; slices: { label: string; value: number }[] };
    return { component: "pieChart", props: { title, slices } };
  },
});

// 🪁 EXTENSION POINT: add your own tool — run /add-loop-tool, or copy a
// defineLoopTool({ name, description, parameters, kind, execute }) block and add
// it to the array below. The real model decides when to call it; UI tools
// (kind:"ui") must return { component, props } where `component` is a key in
// src/agent-loop/loop-component-registry.tsx.
export const loopTools: LoopTool[] = [getSalesData, calculate, makePieChart];

export function findLoopTool(name: string): LoopTool | undefined {
  return loopTools.find((t) => t.name === name);
}

export function buildOpenAITools(tools: LoopTool[]) {
  return tools.map((t) => ({
    type: "function" as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: zodToJsonSchema(t.parameters, { target: "jsonSchema7" }) as Record<string, unknown>,
    },
  }));
}
