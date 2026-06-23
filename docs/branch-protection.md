# Branch protection for `main`

Without branch protection, the `verify` CI check is only *advisory* — anyone can
merge a red PR or push straight to `main`. A ruleset turns the check into a **gate**.
This is config-as-code: the ruleset lives in [`.github/ruleset.json`](../.github/ruleset.json)
and you apply it once with the command below (it can't be applied from inside an
agent session — it's an owner-only repo setting).

## Apply it

```bash
gh api --method POST repos/0xff-96/perth-agent-con-workshop/rulesets \
  --input .github/ruleset.json
```

To update an existing ruleset later, find its id (`gh api repos/OWNER/REPO/rulesets`)
and `PUT repos/OWNER/REPO/rulesets/<id>` with the same `--input`.

## What it enforces

| Rule (in `ruleset.json`) | Effect |
|---|---|
| `pull_request` | Changes to `main` must go through a PR → **direct pushes are blocked** |
| `required_status_checks` → `verify` | The **`verify`** CI job must pass; `strict` means the branch must also be up to date with `main` |
| `non_fast_forward` | **Force-pushes blocked** |
| `deletion` | The `main` branch can't be deleted |

## Two things specific to this repo

1. **Require only `verify`.** That's the CI quality-gate job name
   (`.github/workflows/ci.yml` → `jobs: verify`). Do **not** add the AI-review checks
   (`review`, `principled-review`) as required — they depend on a secret, skip on
   forks, and are advisory, so requiring them would block every merge.

2. **`required_approving_review_count` is `0`.** GitHub won't let you approve your
   own PR, so for a solo maintainer a value of `1` would make `main` un-mergeable.
   With `0` you still get: PR required + `verify` green + no direct/force push. Bump
   it to `1` once you have a second reviewer — or enable **Copilot automatic review**
   (Settings → Rules → Rulesets → "Request automatic Copilot code review") to satisfy
   the human-review gate without a second person.

## UI equivalent

Settings → **Rules → Rulesets → New branch ruleset** → Enforcement **Active** →
Target **Include default branch** → enable *Require a pull request before merging*,
*Require status checks to pass* (add **`verify`**, tick "Require branches to be up to
date"), and *Block force pushes*.

> Reference: [GitHub — available rules for rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
