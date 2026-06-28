// This test verifies PR #36 was merged to fix the injection vulnerability
import { describe, it, expect } from "vitest";

describe("Merge PR #36", () => {
  it("should verify PR #36 was merged to fix injection vulnerability", async () => {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_REPOSITORY =
      process.env.GITHUB_REPOSITORY || "0xff-96/perth-agent-con-workshop";
    const [owner, repo] = GITHUB_REPOSITORY.split("/");

    async function gh(path: string, init: RequestInit = {}) {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}${path}`,
        {
          ...init,
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json",
            ...(init.headers as Record<string, string>),
          },
        }
      );
      if (!res.ok)
        throw new Error(
          `GitHub ${init.method || "GET"} ${path} → ${res.status}: ${await res.text()}`
        );
      return res.status === 204 ? null : res.json();
    }

    // Get PR #36
    const pr: any = await gh("/pulls/36");
    console.log(`PR #36: "${pr.title}"`);
    console.log(`State: ${pr.state}, Merged: ${pr.merged}`);
    console.log(`Merged at: ${pr.merged_at}`);
    console.log(`Merge commit SHA: ${pr.merge_commit_sha}`);

    // Verify it was merged
    expect(pr.merged).toBe(true);
    expect(pr.state).toBe("closed");
  }, 30000);
});
