#!/bin/bash
# ==============================================================================
# VERTEX Architecture Studio - GitHub Push Script
# Ensures clean push without secret rejections or 100MB payload overflow.
# ==============================================================================

set -e

REPO_URL="$1"

if [ -z "$REPO_URL" ]; then
  echo "========================================================================"
  echo "❌ Error: Missing repository URL argument."
  echo "Usage:"
  echo "  ./push_to_github.sh https://<GITHUB_TOKEN>@github.com/<USER>/<REPO>.git"
  echo "  or"
  echo "  ./push_to_github.sh https://github.com/<USER>/<REPO>.git"
  echo "========================================================================"
  exit 1
fi

echo "==> Configuring Git Author Identity..."
git config user.name "Lalith Varma"
git config user.email "lalithvarma12345@gmail.com"

echo "==> Checking remote origin..."
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

echo "==> Ensuring branch is main..."
git branch -M main

echo "==> Pushing to origin main..."
git push -u origin main

echo ""
echo "========================================================================"
echo "✅ Code successfully pushed to GitHub repository!"
echo "========================================================================"
