---
description: Stage all changes, commit with a descriptive message, update changelogs, and push to remote
---

# Commit and Push

When the user invokes `/commit`, perform ALL steps automatically with NO prompts or questions.

## 1. Gather Context (parallel)

```bash
git status
git diff --stat
git diff
git log --oneline -5
```

## 2. Analyze Changes

Review what changed:
- New files added
- Files modified
- Files deleted
- The nature of changes (feature, fix, refactor, cleanup, etc.)
- **Which apps/packages were touched** (connect, simulator, sk, packages/ui, etc.)

## 3. Craft Commit Message

Write a commit message that:
- Starts with a verb (Add, Fix, Update, Remove, Refactor, Clean up)
- Describes WHAT changed and WHY
- Uses comma-separated clauses for multiple changes
- Is concise but informative

**Examples:**
- `Add font support, fix upload modal styling`
- `Fix widget sync race condition, clean up unused state`
- `Update LVGL bridge to support color gradients`
- `Remove deprecated API calls, refactor data layer`

## 4. Update Changelogs (Always)

**Always update changelogs. Do NOT ask — just do it.**

### Two-tier changelog system

1. **Per-app changelogs** — Detailed, specific changes for each app that was touched:
   - `apps/connect/CHANGELOG.md`
   - `apps/simulator/CHANGELOG.md`
   - `apps/sk/CHANGELOG.md`

2. **Monorepo changelog** — High-level summary of which parts of the monorepo were touched:
   - `CHANGELOG.md` (root)

### Which changelogs to update

- Look at the files changed to determine which apps were affected
- Update **only the per-app changelogs for apps that had changes**
- **Always** update the root monorepo changelog with a summary line per affected app

### Per-App Changelog Format

Detailed entries categorized into whichever apply:
- **Added** — New features
- **Changed** — Modified behavior
- **Removed** — Deleted features
- **Fixed** — Bug fixes

```markdown
## X.X.X - Month Day, Year
### Added
- Brief description (5-10 words max)
```

Each app has its own independent version number. Increment per app (patch for fixes, minor for features).

### Monorepo Changelog Format

High-level, one line per affected area:

```markdown
## Month Day, Year
- Connect: Add device onboarding flow and BLE pairing
- Simulator: Fix firmware preview rendering
```

The monorepo changelog does NOT use version numbers — just dates. Each entry is a short summary of what happened in that app/area.

### Writing Style (applies to per-app changelogs)

- **Keep entries brief** — 15-25 words max per bullet point
- **Start with the thing affected** — "Font upload modal", "Widget sync"
- **No paragraphs** — one concise line per entry
- **One feature per bullet** — split if needed
- **Sub-bullets only for essential detail**

**Good:**
- `Add LVGL font upload modal with conversion pipeline`
- `Fix widget sync race condition when switching screens`

**Too verbose:**
- ~~`Added a new modal component that allows users to upload custom fonts for use in LVGL projects, including automatic conversion to the required format`~~

### Update Rules

1. Read the relevant CHANGELOG.md file(s) to find the latest version number
2. Increment version per app (patch for fixes, minor for features)
3. Use the **Edit tool** to insert the new entry directly after the `# Changelog` heading — do NOT rewrite the file with Write
4. Use today's date, no git hash in the heading
5. Omit empty sections (only include Added/Changed/Removed/Fixed that apply)

**CRITICAL: NEVER use the Write tool on an existing CHANGELOG.md.** Always use Edit to prepend new entries after `# Changelog\n`. This preserves all existing changelog history. The old_string should be `# Changelog\n` and the new_string should be `# Changelog\n\n## ...` with the new entry followed by the existing content left untouched.

### If changes touch shared packages only

If only `packages/ui/` or `packages/assets/` changed (no app changes), update only the root monorepo changelog with a line like:
- `packages/ui: Update theme colors`

## 5. Execute

Stage all changes (including the changelog updates), commit, and push in sequence:

```bash
git add .
git commit -m "<message>"
git push
```

**No confirmation prompts. No asking before pushing. Just do it.**

## 6. Report Result

Show:
- The commit message used
- The commit hash
- Push status (success or any errors)
- Which changelogs were updated and the entries added

## Rules

- Do NOT ask any questions
- Do NOT prompt before pushing
- Do NOT use `git add -A` (use `git add .`)
- Do NOT amend previous commits unless explicitly asked
- Do NOT force push
- If push fails due to remote changes, inform the user
- Changelog entries should reflect user-facing changes, not internal refactors (unless significant)