#!/bin/bash

# Pre-commit hook for automatic file organization
# This runs before each git commit to organize files

ORGANIZER_DIR="$(git rev-parse --show-toplevel)/.fileorganizer"
ORGANIZE_SCRIPT="$ORGANIZER_DIR/organize.sh"

echo "🤖 Running automatic file organization..."

# Check if organize script exists
if [ ! -f "$ORGANIZE_SCRIPT" ]; then
    echo "⚠️  Organizer script not found, skipping..."
    exit 0
fi

# Make sure script is executable
chmod +x "$ORGANIZE_SCRIPT"

# Run the organizer
"$ORGANIZE_SCRIPT"

# If files were moved, add them to the commit
git add -A

echo "✅ File organization complete"
exit 0
