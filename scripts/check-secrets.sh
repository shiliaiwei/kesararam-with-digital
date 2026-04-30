#!/bin/bash

# 🔒 Secret Detection Script
# Checks for accidentally committed secrets before pushing

echo "🔍 Checking for exposed secrets..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FOUND_SECRETS=0

# Check for common secret patterns
echo ""
echo "Checking for API keys and secrets..."

# Check staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

if [ -z "$STAGED_FILES" ]; then
    echo "${YELLOW}⚠️  No staged files to check${NC}"
    exit 0
fi

# Patterns to search for
PATTERNS=(
    "AIzaSy[0-9A-Za-z_-]{33}"                    # Google API Key
    "sk-[0-9A-Za-z]{48}"                         # OpenAI API Key
    "postgres://[^:]+:[^@]+@[^/]+"               # Database URL with password
    "postgresql://[^:]+:[^@]+@[^/]+"             # PostgreSQL URL
    "cloudinary://[^:]+:[^@]+@[^/]+"             # Cloudinary URL
    "['\"]?JWT_SECRET['\"]?\s*[:=]\s*['\"]?[a-f0-9]{64}" # JWT Secret
    "['\"]?API_KEY['\"]?\s*[:=]\s*['\"]?[A-Za-z0-9_-]{20,}" # Generic API Key
    "['\"]?API_SECRET['\"]?\s*[:=]\s*['\"]?[A-Za-z0-9_-]{20,}" # Generic API Secret
    "-----BEGIN (RSA |DSA |EC )?PRIVATE KEY-----" # Private keys
)

PATTERN_NAMES=(
    "Google API Key"
    "OpenAI API Key"
    "Database URL (postgres)"
    "Database URL (postgresql)"
    "Cloudinary URL"
    "JWT Secret"
    "Generic API Key"
    "Generic API Secret"
    "Private Key"
)

# Check each staged file
for FILE in $STAGED_FILES; do
    # Skip binary files and specific allowed files
    if [[ "$FILE" == *.png ]] || [[ "$FILE" == *.jpg ]] || [[ "$FILE" == *.svg ]] || \
       [[ "$FILE" == *.ico ]] || [[ "$FILE" == *.woff* ]] || [[ "$FILE" == *.ttf ]] || \
       [[ "$FILE" == ".env.example" ]] || [[ "$FILE" == "SECURITY_SETUP.md" ]]; then
        continue
    fi

    # Check if file exists (not deleted)
    if [ ! -f "$FILE" ]; then
        continue
    fi

    # Check each pattern
    for i in "${!PATTERNS[@]}"; do
        PATTERN="${PATTERNS[$i]}"
        NAME="${PATTERN_NAMES[$i]}"
        
        MATCHES=$(git diff --cached "$FILE" | grep -E "$PATTERN" | grep "^\+" | grep -v "^\+\+\+")
        
        if [ ! -z "$MATCHES" ]; then
            echo ""
            echo "${RED}❌ FOUND: $NAME in $FILE${NC}"
            echo "${YELLOW}$MATCHES${NC}"
            FOUND_SECRETS=1
        fi
    done
done

# Check for .env files
echo ""
echo "Checking for .env files..."
ENV_FILES=$(echo "$STAGED_FILES" | grep -E "\.env(\.|$)")

if [ ! -z "$ENV_FILES" ]; then
    echo "${RED}❌ FOUND: .env file(s) staged for commit:${NC}"
    echo "${YELLOW}$ENV_FILES${NC}"
    echo ""
    echo "${RED}⚠️  NEVER commit .env files! They contain secrets.${NC}"
    FOUND_SECRETS=1
fi

# Final result
echo ""
if [ $FOUND_SECRETS -eq 1 ]; then
    echo "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "${RED}🚨 SECRETS DETECTED! DO NOT COMMIT!${NC}"
    echo "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "To fix:"
    echo "  1. Remove secrets from files"
    echo "  2. Move secrets to .env.local (never commit this file)"
    echo "  3. Use environment variables: process.env.YOUR_SECRET"
    echo "  4. If already committed, rotate all exposed secrets!"
    echo ""
    exit 1
else
    echo "${GREEN}✅ No secrets detected in staged files${NC}"
    echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
fi
