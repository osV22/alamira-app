---
description: Stage, commit, and push without any prompts
---

# Fast Commit and Push

When the user invokes `/commit-fast`, perform ALL steps automatically with NO prompts or questions.

## 1. Gather Context (parallel)

```bash
git status
git diff --stat
git log --oneline -3
```

## 2. Craft Commit Message

Write a commit message that:
- Starts with a verb (Add, Fix, Update, Remove, Refactor, Clean up)
- Describes WHAT changed and WHY
- Uses comma-separated clauses for multiple changes
- Is concise but informative

**Examples:**
- `Add font support, fix upload modal styling`
- `Fix widget sync race condition, clean up unused state`

## 3. Execute Immediately

Stage all changes, commit, and push in sequence:

```bash
git add .
git commit -m "<message>"
git push
```

**No changelog prompt. No push confirmation. Just do it.**

## 4. Report Result

Show:
- The commit message used
- The commit hash
- Push status (success or any errors)

## Rules

- Do NOT ask any questions
- Do NOT prompt for changelog updates
- Do NOT ask before pushing
- Do NOT use `git add -A`
- Do NOT amend previous commits
- Do NOT force push
- If push fails, report the error (don't retry automatically)