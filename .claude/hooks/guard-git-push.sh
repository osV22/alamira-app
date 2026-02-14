#!/bin/bash
# PreToolUse hook for guarding dangerous git operations:
# - git push: only allowed from /commit or /commit-fast skills
# - git checkout -b / git switch -c / git branch: always ask before creating/switching branches
#
# Hook input (JSON on stdin):
#   { "tool_name": "Bash", "tool_input": { "command": "..." }, "transcript_path": "..." }
#
# Hook output (JSON on stdout):
#   Permission decision or exit 0 (no opinion)

set -euo pipefail

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Only care about Bash tool calls
if [[ "$TOOL_NAME" != "Bash" ]]; then
  exit 0
fi

# --- Branch creation/switching guard ---
# git checkout -b, git checkout <branch>, git switch, git branch <name>
if [[ "$COMMAND" == *"git checkout -b"* ]] || [[ "$COMMAND" == *"git checkout -B"* ]]; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"Creating a new branch requires confirmation."}}'
  exit 0
fi

if [[ "$COMMAND" == *"git switch -c"* ]] || [[ "$COMMAND" == *"git switch -C"* ]] || [[ "$COMMAND" == *"git switch --create"* ]]; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"Creating a new branch requires confirmation."}}'
  exit 0
fi

# git switch <branch> (switching to existing branch, but not --detach or -c)
if [[ "$COMMAND" =~ ^git[[:space:]]+switch[[:space:]] ]] && [[ "$COMMAND" != *"-c"* ]] && [[ "$COMMAND" != *"--create"* ]]; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"Switching branches requires confirmation."}}'
  exit 0
fi

# git checkout <branch> (switching branches — but not git checkout <file> or -b)
# Detect: "git checkout <branchname>" without flags like -b, --, -p, etc.
if [[ "$COMMAND" =~ ^git[[:space:]]+checkout[[:space:]] ]] && [[ "$COMMAND" != *"-b"* ]] && [[ "$COMMAND" != *"-B"* ]] && [[ "$COMMAND" != *"-- "* ]] && [[ "$COMMAND" != *"-p"* ]]; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"Switching branches requires confirmation."}}'
  exit 0
fi

# git branch <name> (creating a branch — but not listing: git branch, git branch -a, git branch -v, etc.)
if [[ "$COMMAND" =~ ^git[[:space:]]+branch[[:space:]] ]] && [[ "$COMMAND" != *"-a"* ]] && [[ "$COMMAND" != *"-v"* ]] && [[ "$COMMAND" != *"-l"* ]] && [[ "$COMMAND" != *"--list"* ]] && [[ "$COMMAND" != *"-d"* ]] && [[ "$COMMAND" != *"-D"* ]] && [[ "$COMMAND" != *"--show"* ]]; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"Creating a new branch requires confirmation."}}'
  exit 0
fi

# --- Git push guard ---
if [[ "$COMMAND" != *"git push"* ]]; then
  exit 0
fi

# Force push always requires user confirmation, even from /commit skills
if [[ "$COMMAND" == *"--force"* ]] || [[ "$COMMAND" == *" -f"* ]]; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"Force push always requires confirmation."}}'
  exit 0
fi

# Strategy 1: If the command contains "git commit" AND "git push" chained together,
# it's a commit-then-push workflow — allow it. This covers the common pattern:
#   git add . && git commit -m "..." && git push
if [[ "$COMMAND" == *"git commit"* ]] && [[ "$COMMAND" == *"git push"* ]]; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow","permissionDecisionReason":"Allowed: git push chained with git commit"}}'
  exit 0
fi

# Strategy 2: Check transcript for recent /commit or /commit-fast skill invocation.
TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path // empty')

if [[ -n "$TRANSCRIPT_PATH" ]] && [[ -f "$TRANSCRIPT_PATH" ]]; then
  # Look for Skill invocations of commit or commit-fast in the last 200 lines.
  # The transcript is JSONL. Skill calls have "name": "Skill" with "skill": "commit".
  if tail -200 "$TRANSCRIPT_PATH" 2>/dev/null | grep -qE '"commit-fast"|"commit"'; then
    echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow","permissionDecisionReason":"Allowed: git push from /commit or /commit-fast skill"}}'
    exit 0
  fi
fi

# Not from a commit skill — ask the user
echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"Git push requires confirmation outside /commit workflows"}}'
exit 0