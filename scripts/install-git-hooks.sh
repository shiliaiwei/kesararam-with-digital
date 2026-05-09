#!/bin/bash

# 🔧 Git Hooks Installer
# Installs pre-commit hooks for security checks

echo "🔧 Installing Git hooks..."

# Make check-secrets script executable
chmod +x scripts/check-secrets.sh

# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# Run secret detection before commit
./scripts/check-secrets.sh

# If secrets found, abort commit
if [ $? -ne 0 ]; then
    exit 1
fi

# Run linter
echo ""
echo "🔍 Running ESLint..."
npm run lint

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ ESLint failed. Fix errors before committing."
    exit 1
fi

echo ""
echo "✅ All pre-commit checks passed!"
exit 0
EOF

# Make pre-commit hook executable
chmod +x .git/hooks/pre-commit

echo "✅ Git hooks installed successfully!"
echo ""
echo "Pre-commit hook will now:"
echo "  1. Check for exposed secrets"
echo "  2. Run ESLint"
echo ""
echo "To bypass (not recommended): git commit --no-verify"
