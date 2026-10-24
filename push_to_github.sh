#!/bin/bash
# ==============================================================================
# VERTEX Architecture Studio - Robust GitHub Push Automation Script
# Supports:
#   1. ./push_to_github.sh https://<TOKEN>@github.com/<USER>/<REPO>.git
#   2. ./push_to_github.sh https://github.com/<USER>/<REPO>.git <TOKEN>
#   3. GITHUB_TOKEN=ghp_xxx ./push_to_github.sh https://github.com/<USER>/<REPO>.git
#   4. ./push_to_github.sh git@github.com:<USER>/<REPO>.git
# ==============================================================================

set -e

RAW_URL="$1"
TOKEN_ARG="$2"
ACTIVE_TOKEN="${TOKEN_ARG:-$GITHUB_TOKEN}"

# Clean any literal angle brackets users might leave from copy-paste
RAW_URL=$(echo "$RAW_URL" | sed 's/[<>]//g')
ACTIVE_TOKEN=$(echo "$ACTIVE_TOKEN" | sed 's/[<>]//g')

if [ -z "$RAW_URL" ]; then
  echo "========================================================================"
  echo "VERTEX Studio - Method A: GitHub Push Automation"
  echo "========================================================================"
  echo "Usage:"
  echo "  ./push_to_github.sh https://<YOUR_GITHUB_TOKEN>@github.com/<USERNAME>/<REPO>.git"
  echo ""
  echo "Or pass token as second argument:"
  echo "  ./push_to_github.sh https://github.com/<USERNAME>/<REPO>.git <YOUR_GITHUB_TOKEN>"
  echo ""
  echo "Or use SSH (if key is registered in GitHub settings):"
  echo "  ./push_to_github.sh git@github.com:<USERNAME>/<REPO>.git"
  echo "========================================================================"
  exit 1
fi

# If user passed a token argument or GITHUB_TOKEN env var and URL starts with https://github.com
if [ -n "$ACTIVE_TOKEN" ] && [[ "$RAW_URL" =~ ^https://github.com/(.*)$ ]]; then
  REPO_PATH="${BASH_REMATCH[1]}"
  TARGET_URL="https://${ACTIVE_TOKEN}@github.com/${REPO_PATH}"
else
  TARGET_URL="$RAW_URL"
fi

# Create a safe sanitized URL for log output (hides token)
SAFE_URL=$(echo "$TARGET_URL" | sed -E 's/(https:\/\/)[^@]+@/\1***@/')

echo "========================================================================"
echo "==> Configuring Git Author Identity..."
git config user.name "Lalith Varma"
git config user.email "lalithvarma12345@gmail.com"

echo "==> Configuring Remote Target: $SAFE_URL"
git remote remove origin 2>/dev/null || true
git remote add origin "$TARGET_URL"

echo "==> Setting active branch to 'main'..."
git branch -M main

echo "==> Verifying repository cleanliness..."
# Ensure any newly created/modified files are committed
git add -A
if ! git diff --cached --quiet; then
  git commit -m "chore(release): synchronize project state for production push"
fi

echo "==> Attempting push to origin main..."
# Try push directly; if rejected due to remote initial commit, rebase and push
if ! git push -u origin main; then
  echo ""
  echo "⚠️ Notice: Remote has existing commits (e.g. Initial README). Syncing with rebase..."
  git pull --rebase origin main || true
  git push -u origin main
fi

echo ""
echo "========================================================================"
echo "✅ Push successful! Code is now live on GitHub."
echo "Target: $SAFE_URL"
echo "========================================================================"
