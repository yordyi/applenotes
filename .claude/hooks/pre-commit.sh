#!/bin/bash

echo "🔍 Running pre-commit checks..."

# Run ESLint
echo "📝 Running ESLint..."
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ ESLint check failed. Please fix the errors before committing."
  exit 1
fi

# Run TypeScript type checking
echo "🔧 Running TypeScript type check..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "❌ TypeScript type check failed. Please fix the errors before committing."
  exit 1
fi

# Format staged files with Prettier
echo "✨ Formatting staged files with Prettier..."
npx prettier --write $(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx|json|css)$')

# Re-add formatted files
git add -u

echo "✅ Pre-commit checks passed!"