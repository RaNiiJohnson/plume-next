import { vi } from "vitest";

export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

export const mockUseRouter = () => mockRouter;

export const mockUsePathname = vi.fn(() => "/");
export const mockUseSearchParams = vi.fn(() => new URLSearchParams());

// Auto-mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: mockUseRouter,
  usePathname: mockUsePathname,
  useSearchParams: mockUseSearchParams,
}));
