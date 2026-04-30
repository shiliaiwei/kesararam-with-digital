# 🚀 Security Quick Start (5 Minutes)

## ⚠️ DO THIS NOW (Critical - 5 minutes)

### Step 1: Add Google Maps API Key to .env.local
```bash
# Open .env.local and add:
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8
```

### Step 2: Install Security Hooks
```bash
npm run security:install-hooks
```

### Step 3: Test Everything Works
```bash
npm run security:full
```

---

## 🔴 URGENT: Rotate Exposed Secrets (15 minutes)

Your `.env.local` file was committed to Git. All secrets are now public and MUST be rotated:

### 1. Database Password (2 minutes)
```bash
# 1. Go to: https://console.neon.tech
# 2. Click your project → Settings → Reset Password
# 3. Copy new connection string
# 4. Update DATABASE_URL in .env.local
```

### 2. JWT Secrets (1 minute)
```bash
# Generate new secrets:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update in .env.local:
# - JWT_SECRET
# - PROFILE_TOKEN_SECRET
```

### 3. Cloudinary API Secret (2 minutes)
```bash
# 1. Go to: https://cloudinary.com/console/settings/security
# 2. Click "Reset API Secret"
# 3. Update CLOUDINARY_API_SECRET in .env.local
```

### 4. Google Maps API Key (3 minutes)
```bash
# 1. Go to: https://console.cloud.google.com/apis/credentials
# 2. Find key: AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8
# 3. Click "Regenerate Key" or create new one
# 4. Update NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local
```

### 5. Remove .env.local from Git (2 minutes)
```bash
# Remove from tracking
git rm --cached .env.local

# Commit the removal
git commit -m "security: remove exposed .env.local"

# Push
git push origin docs
```

---

## 🛡️ Enable GitHub Security (5 minutes)

### 1. Enable Secret Scanning
```bash
# Go to: https://github.com/shiliaiwei/kesararam/settings/security_analysis
# Enable:
# ✅ Secret scanning
# ✅ Push protection
# ✅ Dependabot alerts
# ✅ Dependabot security updates
```

### 2. Restrict Google Maps API Key
```bash
# Go to: https://console.cloud.google.com/apis/credentials
# Click your API key → Application restrictions:
# - Select "HTTP referrers"
# - Add: https://kesararamwithdigital.tech/*
# - Add: https://*.vercel.app/*
# 
# API restrictions:
# - Select "Restrict key"
# - Enable only: "Maps JavaScript API"
```

---

## ✅ Verification Checklist

Run these commands to verify everything is secure:

```bash
# 1. Check for secrets
npm run security:check

# 2. Audit dependencies
npm run security:audit

# 3. Run linter
npm run lint

# 4. Run tests
npm run test

# 5. Full security check
npm run security:full
```

**Expected Result**: All checks should pass ✅

---

## 📊 Security Status

After completing the above steps, your security status should be:

| Check | Before | After |
|-------|--------|-------|
| Exposed Secrets | 🔴 Critical | ✅ Fixed |
| API Key Restrictions | 🔴 None | ✅ Restricted |
| Secret Scanning | 🔴 Disabled | ✅ Enabled |
| Git Hooks | 🔴 None | ✅ Installed |
| Security Score | 3/10 | 8/10 |

---

## 🆘 Need Help?

### Common Issues

**Q: "npm run security:install-hooks" fails on Windows**
```bash
# Use Git Bash instead of PowerShell/CMD
# Or manually copy scripts/check-secrets.sh to .git/hooks/pre-commit
```

**Q: Pre-commit hook blocks my commit**
```bash
# This means secrets were detected!
# Fix the issue, don't bypass with --no-verify
# If you must bypass (not recommended):
git commit --no-verify
```

**Q: How do I know if secrets are still exposed?**
```bash
# Check GitHub:
# https://github.com/shiliaiwei/kesararam/security

# Run local check:
npm run security:check
```

---

## 📚 Next Steps

After completing this quick start:

1. Read [SECURITY_SETUP.md](./SECURITY_SETUP.md) for detailed setup
2. Check [SECURITY_DASHBOARD.md](./SECURITY_DASHBOARD.md) for status
3. Review [SECURITY.md](./SECURITY.md) for reporting vulnerabilities

---

## 🎯 Daily Security Routine

```bash
# Before starting work:
git pull
npm run security:audit

# Before committing:
npm run security:check
npm run lint

# Before pushing:
npm run security:full
```

---

**Time to Complete**: 25 minutes  
**Difficulty**: Easy  
**Impact**: Critical 🔴 → Secure ✅
