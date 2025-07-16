#!/bin/bash

# Get the edited file path
FILE_PATH=$1

# Check if file is a TypeScript/JavaScript file
if [[ $FILE_PATH =~ \.(ts|tsx|js|jsx)$ ]]; then
  echo "🎨 Formatting $FILE_PATH with Prettier..."
  npx prettier --write "$FILE_PATH"
  
  echo "🔍 Checking types for $FILE_PATH..."
  npx tsc --noEmit "$FILE_PATH"
fi

# Check if file is a CSS file
if [[ $FILE_PATH =~ \.css$ ]]; then
  echo "🎨 Formatting $FILE_PATH with Prettier..."
  npx prettier --write "$FILE_PATH"
fi

# Check if file is in the components directory
if [[ $FILE_PATH =~ components/.+\.tsx$ ]]; then
  echo "🧩 Component file detected. Ensuring Apple design standards..."
  # Add any component-specific checks here
fi