#!/bin/bash

# Deploy to GitHub Pages using git commands directly
# This avoids the E2BIG error with gh-pages

set -e

echo "Building for production..."
# If you have a build step, uncomment the next line:
# npm run build

echo "Deploying to GitHub Pages..."

# Clean up any problematic cache
rm -rf node_modules/.cache/gh-pages 2>/dev/null || true

# Store current branch
CURRENT_BRANCH=$(git branch --show-current)

# Make sure we're on main branch
if [ "$CURRENT_BRANCH" != "main" ]; then
  git checkout main 2>/dev/null || true
fi

# Stash any uncommitted changes
git stash push -u -m "Deploy stash $(date +%Y-%m-%d)" 2>/dev/null || true

# Checkout or create gh-pages branch
if git show-ref --verify --quiet refs/heads/gh-pages; then
  git checkout gh-pages 2>/dev/null || git checkout -b gh-pages
  # Remove all tracked files
  git ls-files | xargs git rm -f 2>/dev/null || true
else
  git checkout --orphan gh-pages 2>/dev/null || git checkout -b gh-pages
fi

# Copy dist files
cp -r dist/* . 2>/dev/null || true
cp dist/.nojekyll . 2>/dev/null || touch .nojekyll

# Add all files
git add -A

# Commit
git commit -m "Deploy portfolio - $(date +%Y-%m-%d)" || echo "No changes to commit"

# Push to origin
git push -f origin gh-pages

# Return to original branch
git checkout "$CURRENT_BRANCH" 2>/dev/null || git checkout main

# Restore stashed changes if any
git stash pop 2>/dev/null || true

echo "Deployment complete!"
