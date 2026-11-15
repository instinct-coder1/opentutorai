import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "@/lib/redirects";

describe("safeRedirectPath", () => {
  it("keeps same-site paths", () => {
    expect(safeRedirectPath("/app/onboarding")).toBe("/app/onboarding");
  });
  it("rejects other sites and falls back to the dashboard", () => {
    expect(safeRedirectPath("https://evil.example")).toBe("/app/dashboard");
    expect(safeRedirectPath("//evil.example")).toBe("/app/dashboard");
    expect(safeRedirectPath(undefined)).toBe("/app/dashboard");
  });
});
