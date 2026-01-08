#!/bin/bash

# Deploy to GitHub Pages using git commands directly
# This avoids the E2BIG error with gh-pages

set -e

echo "Building for production..."
npm run build

echo "Deploying to GitHub Pages..."

# Store current branch
CURRENT_BRANCH=$(git branch --show-current)

# Stash any uncommitted changes before switching branches
git stash push -m "Deploy stash $(date +%Y-%m-%d)" || true

# Make sure we're on main branch
if [ "$CURRENT_BRANCH" != "main" ]; then
  git checkout main
fi

# Checkout or create gh-pages branch
if git show-ref --verify --quiet refs/heads/gh-pages; then
  git checkout gh-pages
  # Remove all files except .git
  find . -maxdepth 1 ! -name '.' ! -name '.git' ! -name 'node_modules' ! -name '.vite' -exec rm -rf {} + 2>/dev/null || true
else
  git checkout --orphan gh-pages
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

# Apply stashed changes back
git stash pop || true

echo "Deployment complete!"
echo "Your site should be available at: https://mohamedbasha275.github.io/portfolio/"