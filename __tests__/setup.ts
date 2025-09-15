import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Mock window.matchMedia pour next-themes
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock de scrollIntoView pour Radix UI
Object.defineProperty(Element.prototype, "scrollIntoView", {
  writable: true,
  value: () => {},
});

// Nettoie après chaque test
afterEach(() => {
  cleanup();
});
