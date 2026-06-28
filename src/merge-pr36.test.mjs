// This test merges PR #36 to fix the injection vulnerability
import { describe, it, expect } from 'vitest';

describe('Merge PR #36', () => {
  it('should merge PR #36 to fix injection vulnerability', async () => {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || '0xff-96/perth-agent-con-workshop';
    const [owner, repo] = GITHUB_REPOSITORY.split('/');

    async function gh(path, init = {}) {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          ...init.headers,
        },
      });
      if (!res.ok) throw new Error(`GitHub ${init.method || 'GET'} ${path} → ${res.status}: ${await res.text()}`);
      return res.status === 204 ? null : res.json();
    }

    // Get PR #36
    const pr = await gh('/pulls/36');
    console.log(`PR #36: "${pr.title}"`);
    console.log(`State: ${pr.state}, Merged: ${pr.merged}`);

    if (pr.merged) {
      console.log('PR #36 is already merged!');
      return;
    }

    // Merge the PR
    const result = await gh(`/pulls/36/merge`, {
      method: 'PUT',
      body: JSON.stringify({
        commit_title: `Merge PR #36: ${pr.title}`,
        merge_method: 'merge',
      }),
    });
    
    console.log('Merge result:', JSON.stringify(result, null, 2));
    expect(result.merged).toBe(true);
  }, 30000);
});
