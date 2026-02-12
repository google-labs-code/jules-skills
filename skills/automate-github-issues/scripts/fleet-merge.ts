// Copyright 2026 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import path from "node:path";
import { findUpSync } from "find-up";
import type { IssueAnalysis } from "./types.js";
import { getGitRepoInfo } from "./github/git.js";

const repoInfo = await getGitRepoInfo();
const OWNER = repoInfo.owner;
const REPO = repoInfo.repo;
const BASE_BRANCH = process.env.FLEET_BASE_BRANCH ?? "main";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error("❌ GITHUB_TOKEN environment variable is required.");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
} as const;

const API = `https://api.github.com/repos/${OWNER}/${REPO}`;

const date = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" })
  .format(new Date())
  .replaceAll("-", "_");

const root = path.dirname(findUpSync(".git")!);
const fleetDir = path.join(root, ".fleet", date);

// Load task ordering (already sorted by risk in the analysis phase)
const analysis = await Bun.file(path.join(fleetDir, "issue_tasks.json")).json() as IssueAnalysis;

// Load session mapping written by fleet-dispatch.ts
const sessions = await Bun.file(path.join(fleetDir, "sessions.json")).json() as Array<{
  taskId: string;
  sessionId: string;
}>;

interface GitHubPR {
  number: number;
  head: { ref: string };
  body: string | null;
}

// Find open PRs created by fleet sessions
async function findFleetPRs() {
  const res = await fetch(`${API}/pulls?state=open&per_page=100`, { headers });
  const pulls = (await res.json()) as GitHubPR[];

  const prMap = new Map<string, GitHubPR>();
  for (const session of sessions) {
    const matchingPR = pulls.find((pr: GitHubPR) =>
      pr.head.ref.includes(session.sessionId) ||
      pr.body?.includes(session.sessionId)
    );
    if (matchingPR) {
      prMap.set(session.taskId, matchingPR);
    }
  }
  return prMap;
}

interface CheckRun {
  status: string;
  conclusion: string | null;
}

async function waitForCI(prNumber: number, maxWaitMs = 10 * 60 * 1000): Promise<boolean> {
  const start = Date.now();

  // First, get the head SHA for this PR
  const prRes = await fetch(`${API}/pulls/${prNumber}`, { headers });
  const prData = (await prRes.json()) as { head: { sha: string } };
  const headSha = prData.head.sha;

  while (Date.now() - start < maxWaitMs) {
    const res = await fetch(`${API}/commits/${headSha}/check-runs`, { headers });
    const data = (await res.json()) as { check_runs: CheckRun[] };

    // No CI configured — skip validation
    if (data.check_runs.length === 0) {
      console.log(`  ℹ️  No check runs found for PR #${prNumber}. Proceeding without CI.`);
      return true;
    }

    const allComplete = data.check_runs.every((run: CheckRun) => run.status === "completed");
    const allPassed = data.check_runs.every((run: CheckRun) =>
      run.conclusion === "success" || run.conclusion === "skipped"
    );

    if (allComplete && allPassed) return true;
    if (allComplete && !allPassed) return false;

    console.log(`  ⏳ CI still running for PR #${prNumber}... waiting 30s`);
    await new Promise(r => setTimeout(r, 30_000));
  }
  console.log(`  ⏰ CI timeout for PR #${prNumber}`);
  return false;
}

// Main: sequential merge in task order
const prMap = await findFleetPRs();

console.log(`Found ${prMap.size}/${analysis.tasks.length} fleet PRs`);
for (const [taskId, pr] of prMap) {
  console.log(`  ${taskId} → PR #${pr.number} (${pr.head.ref})`);
}

if (prMap.size !== analysis.tasks.length) {
  console.error(`❌ Expected ${analysis.tasks.length} PRs but found ${prMap.size}. Waiting for all PRs before merging.`);
  process.exit(1);
}

for (const task of analysis.tasks) {
  const pr = prMap.get(task.id);
  if (!pr) {
    console.error(`❌ No PR found for task "${task.id}". Aborting.`);
    process.exit(1);
  }

  console.log(`\n📦 Processing Task "${task.id}" → PR #${pr.number}`);

  // Update branch from base before merging (skip for first PR)
  if (analysis.tasks.indexOf(task) > 0) {
    console.log(`  🔄 Updating PR #${pr.number} branch from ${BASE_BRANCH}...`);
    const updateRes = await fetch(`${API}/pulls/${pr.number}/update-branch`, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
    });
    if (!updateRes.ok) {
      const body = await updateRes.text();
      if (updateRes.status === 422) {
        console.error(`  ❌ Merge conflict detected when updating PR #${pr.number}. Human intervention required.`);
        console.error(`  PR: https://github.com/${OWNER}/${REPO}/pull/${pr.number}`);
        process.exit(1);
      }
      throw new Error(`Update branch failed (${updateRes.status}): ${body}`);
    }
    // Wait for the update to propagate
    await new Promise(r => setTimeout(r, 5_000));
  }

  // Wait for CI to pass
  console.log(`  🧪 Waiting for CI on PR #${pr.number}...`);
  const ciPassed = await waitForCI(pr.number);
  if (!ciPassed) {
    console.error(`  ❌ CI failed for PR #${pr.number}. Aborting sequential merge.`);
    process.exit(1);
  }

  // Merge
  console.log(`  ✅ CI passed. Merging PR #${pr.number}...`);
  const mergeRes = await fetch(`${API}/pulls/${pr.number}/merge`, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ merge_method: "squash" }),
  });
  if (!mergeRes.ok) {
    const body = await mergeRes.text();
    console.error(`  ❌ Failed to merge PR #${pr.number}: ${body}`);
    process.exit(1);
  }
  console.log(`  🎉 PR #${pr.number} merged successfully.`);
}

console.log(`\n✅ All ${analysis.tasks.length} PRs merged sequentially. No conflicts.`);
