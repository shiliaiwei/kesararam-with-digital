#!/bin/bash

# Install Git Pre-commit Hook for Auto-organization

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
GIT_HOOKS_DIR="$PROJECT_ROOT/.git/hooks"
PRE_COMMIT_HOOK="$GIT_HOOKS_DIR/pre-commit"

echo "🔗 Installing Git pre-commit hook..."

# Check if .git exists
if [ ! -d "$PROJECT_ROOT/.git" ]; then
    echo "❌ Not a git repository"
    exit 1
fi

# Backup existing pre-commit hook if it exists
if [ -f "$PRE_COMMIT_HOOK" ]; then
    echo "⚠️  Existing pre-commit hook found, backing up..."
    cp "$PRE_COMMIT_HOOK" "$PRE_COMMIT_HOOK.backup"
fi

# Copy our hook
cp "$SCRIPT_DIR/pre-commit-hook.sh" "$PRE_COMMIT_HOOK"
chmod +x "$PRE_COMMIT_HOOK"

echo "✅ Git hook installed!"
echo ""
echo "The file organizer will now run automatically before each commit."
echo ""
echo "To disable: rm .git/hooks/pre-commit"
echo "To restore backup: mv .git/hooks/pre-commit.backup .git/hooks/pre-commit"
