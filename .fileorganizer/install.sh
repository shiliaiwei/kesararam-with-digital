#!/bin/bash

# File Organizer Installation Script

echo "🤖 Installing File Organizer..."
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Make scripts executable
echo "Making scripts executable..."
chmod +x "$SCRIPT_DIR/organize.sh"
chmod +x "$SCRIPT_DIR/pre-commit-hook.sh"

# Create required directories
echo "Creating directories..."
mkdir -p "$PROJECT_ROOT/docs/auto-organized/markdown"
mkdir -p "$PROJECT_ROOT/docs/scripts"
mkdir -p "$PROJECT_ROOT/docs/archive/auto-backups"
mkdir -p "$PROJECT_ROOT/docs/archive/temp"
mkdir -p "$PROJECT_ROOT/data-content/raw-data"

echo ""
echo "✅ Installation complete!"
echo ""
echo "📋 Available options:"
echo ""
echo "1. Manual Organization (recommended to start):"
echo "   ./.fileorganizer/organize.sh"
echo ""
echo "2. Auto-organize on Git Commit:"
echo "   ./.fileorganizer/install-git-hook.sh"
echo ""
echo "3. View Rules:"
echo "   cat .fileorganizer/rules.json"
echo ""
echo "4. View Docs:"
echo "   cat .fileorganizer/README.md"
echo ""
echo "Run manual organization now? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    "$SCRIPT_DIR/organize.sh"
fi
