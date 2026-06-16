import "@testing-library/jest-dom/vitest";

// recharts' ResponsiveContainer uses ResizeObserver which is not available in jsdom
if (typeof ResizeObserver === "undefined") {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
