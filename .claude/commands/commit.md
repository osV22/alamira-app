---
description: Stage all changes, commit with a descriptive message, and push to remote
---

# Commit and Push

When the user invokes `/commit`, perform the following steps:

## 1. Gather Context

Run these commands in parallel to understand the changes:

```bash
git status
git diff --stat
git log --oneline -5
```

## 2. Analyze Changes

Review what changed:
- New files added
- Files modified
- Files deleted
- The nature of changes (feature, fix, refactor, cleanup, etc.)

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

## 4. Update Changelog (Optional)

Ask the user if they want to update the CHANGELOG.md:

**Question:** "Would you like to add this to CHANGELOG.md?"
- Yes - update changelog
- No - skip changelog update

If yes, categorize changes into:
- **Added** - New features
- **Changed** - Modified behavior
- **Removed** - Deleted features
- **Fixed** - Bug fixes

### Changelog Format

```markdown
## X.X.X - Month Day, Year
### Added
- Brief description (5-10 words max)
```

### Writing Style

- **Keep entries brief** - 15-25 words max per bullet point
- **Start with the thing affected** - "Font upload modal", "Widget sync"
- **No paragraphs** - one concise line per entry
- **One feature per bullet** - split if needed
- **Sub-bullets only for essential detail**

**Good:**
- `Add LVGL font upload modal with conversion pipeline`
- `Fix widget sync race condition when switching screens`

**Too verbose:**
- ~~`Added a new modal component that allows users to upload custom fonts for use in LVGL projects, including automatic conversion to the required format`~~

### Update Rules

1. Read CHANGELOG.md to find the latest version number
2. Increment version (patch for fixes, minor for features)
3. Use the **Edit tool** to insert the new entry directly after the `# Changelog` heading — do NOT rewrite the file with Write
4. Use today's date, no git hash in the heading
5. Omit empty sections (only include Added/Changed/Removed/Fixed that apply)

**CRITICAL: NEVER use the Write tool on CHANGELOG.md.** Always use Edit to prepend new entries after `# Changelog\n`. This preserves all existing changelog history. The old_string should be `# Changelog\n` and the new_string should be `# Changelog\n\n## X.X.X - ...` with the new entry followed by the existing content left untouched.

## 5. Execute

If changelog was updated in step 4, it's already on disk and will be picked up by `git add`.

```bash
git add .
git commit -m "<message>"
git push
```

## 6. Confirm

Show the user the commit hash and confirm it was pushed.

If changelog was updated, show the new version entry that was added.

## Important

- Do NOT use `git add -A` (use `git add .` instead)
- Do NOT amend previous commits unless explicitly asked
- Do NOT force push
- If push fails due to remote changes, inform the user
- Changelog updates should reflect user-facing changes, not internal refactors (unless significant)
