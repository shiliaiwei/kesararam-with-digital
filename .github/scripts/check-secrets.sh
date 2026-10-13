#!/usr/bin/env bash
set -euo pipefail

# Secret Detection Script
# Checks for exposed credentials, .env files, and hardcoded secrets.

echo "[SCAN] Running security secret audit..."

FAILED=0

# 1. Check for tracked .env files
ENV_FILES=$(git ls-files | grep -E "^\.env" | grep -v "\.env\.example" || true)
if [ -n "$ENV_FILES" ]; then
  echo "[FAIL] Tracked .env file(s) found: $ENV_FILES"
  FAILED=1
else
  echo "[PASS] No tracked .env files."
fi

# 2. Check for private keys in src/
if git grep -inE "-----BEGIN (RSA |DSA |EC )?PRIVATE KEY-----" src/ 2>/dev/null; then
  echo "[FAIL] Private key pattern detected in src/"
  FAILED=1
else
  echo "[PASS] No private keys in src/."
fi

# 3. Check for database connection strings with credentials in src/
if git grep -inE "postgres(ql)?://[^:]+:[^@]{8,}@" src/ 2>/dev/null | grep -v "placeholder\|example\|test:test"; then
  echo "[FAIL] Database URL with live credentials detected in src/"
  FAILED=1
else
  echo "[PASS] No live database credentials in src/."
fi

# 4. Check for live API keys in src/
if git grep -inE "(sk_live_[0-9a-zA-Z]{24,}|AIzaSy[0-9A-Za-z_-]{33}|ghp_[0-9a-zA-Z]{36})" src/ 2>/dev/null; then
  echo "[FAIL] Hardcoded live API key pattern detected in src/"
  FAILED=1
else
  echo "[PASS] No live API keys in src/."
fi

if [ $FAILED -ne 0 ]; then
  echo "[RESULT] Security secret check failed. Resolve detected secrets before proceeding."
  exit 1
fi

echo "[RESULT] All security secret checks passed successfully."
exit 0
