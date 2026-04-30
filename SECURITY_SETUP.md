# 🔒 Security & Quality Setup Guide

## ⚠️ CRITICAL: Immediate Actions Required

### 1. **ROTATE ALL EXPOSED SECRETS** (Do this NOW!)

Your `.env.local` file was committed to Git. All secrets in it are now public and must be rotated:

#### A. Database Password (Neon)
1. Go to: https://console.neon.tech
2. Navigate to your project → Settings → Reset Password
3. Copy new connection string
4. Update `DATABASE_URL` in `.env.local`
5. **DO NOT commit `.env.local` again!**

#### B. JWT Secrets
```bash
# Generate new secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Update in `.env.local`:
- `JWT_SECRET`
- `PROFILE_TOKEN_SECRET`

#### C. Cloudinary API Secret
1. Go to: https://cloudinary.com/console/settings/security
2. Click "Reset API Secret"
3. Update `CLOUDINARY_API_SECRET` in `.env.local`

#### D. Google Maps API Key
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find key: `AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`
3. Click "Regenerate Key" or create new one
4. Add to `.env.local`:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-new-key-here
```

#### E. Remove .env.local from Git History
```bash
# Remove from current commit
git rm --cached .env.local

# Commit the removal
git commit -m "security: remove exposed .env.local file"

# Push to remote
git push origin docs
```

---

## 🛡️ Security Measures Already Implemented

### ✅ 1. Dependabot (Automated Dependency Updates)
- **Status**: Configured in `.github/dependabot.yml`
- **Schedule**: Weekly on Mondays at 9:00 AM
- **Action**: Auto-creates PRs for vulnerable dependencies

### ✅ 2. CodeQL (Static Security Analysis)
- **Status**: Configured in `.github/workflows/codeql.yml`
- **Runs**: On every push/PR to `main` + weekly scans
- **Detects**: SQL injection, XSS, hardcoded secrets, auth bypasses

### ✅ 3. npm audit (Dependency Vulnerability Scanning)
- **Status**: Configured in `.github/workflows/security.yml`
- **Runs**: On every push/PR + weekly
- **Blocks**: High/critical vulnerabilities from merging

### ✅ 4. Security Headers
- **Status**: Configured in `next.config.ts`
- **Headers**:
  - ✅ HSTS (Strict-Transport-Security)
  - ✅ CSP (Content-Security-Policy)
  - ✅ X-Frame-Options: DENY
  - ✅ X-Content-Type-Options: nosniff
  - ✅ Referrer-Policy
  - ✅ Permissions-Policy
  - ✅ COOP, CORP, COEP

### ✅ 5. Input Validation
- **Status**: Using Zod schemas
- **Location**: All API routes validate input

### ✅ 6. SQL Injection Prevention
- **Status**: Using Drizzle ORM (parameterized queries)
- **Safe**: No raw SQL queries

---

## 🔧 Additional Security Setup

### 1. Enable GitHub Security Features

#### A. Enable Dependabot Alerts
1. Go to: https://github.com/shiliaiwei/kesararam/settings/security_analysis
2. Enable:
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates
   - ✅ Grouped security updates

#### B. Enable Secret Scanning
1. Same page as above
2. Enable:
   - ✅ Secret scanning
   - ✅ Push protection (prevents committing secrets)

#### C. Enable Code Scanning (CodeQL)
1. Go to: https://github.com/shiliaiwei/kesararam/security/code-scanning
2. Click "Set up code scanning"
3. Select "CodeQL Analysis"
4. Commit the workflow (already done in `.github/workflows/codeql.yml`)

---

### 2. Restrict API Keys

#### Google Maps API Key
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your API key
3. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add: `https://kesararamwithdigital.tech/*`
   - Add: `https://*.vercel.app/*` (for preview deployments)
4. Under "API restrictions":
   - Select "Restrict key"
   - Enable only: "Maps JavaScript API", "Maps Static API"

#### Cloudinary
1. Go to: https://cloudinary.com/console/settings/security
2. Enable "Restrict media access"
3. Add allowed domains:
   - `kesararamwithdigital.tech`
   - `*.vercel.app`

---

### 3. Database Security (Neon)

1. Go to: https://console.neon.tech → Your Project → Settings
2. Enable:
   - ✅ IP Allow List (add your server IPs)
   - ✅ Connection pooling (already using `-pooler`)
   - ✅ SSL mode: `require` (already set)

---

### 4. Vercel Security Settings

1. Go to: https://vercel.com/your-project/settings/security
2. Enable:
   - ✅ Deployment Protection (password protect preview deployments)
   - ✅ Trusted IPs (optional: restrict admin dashboard access)
3. Environment Variables:
   - ✅ Mark all secrets as "Sensitive" (hides in logs)
   - ✅ Never expose secrets in `NEXT_PUBLIC_*` variables

---

## 📊 Quality Checks Already Implemented

### ✅ 1. ESLint
- **Status**: Configured
- **Runs**: On every push/PR
- **Command**: `npm run lint`

### ✅ 2. TypeScript Type Checking
- **Status**: Configured in CI
- **Runs**: On every push/PR
- **Command**: `npx tsc --noEmit`

### ✅ 3. Unit Tests (Vitest)
- **Status**: Configured
- **Runs**: On every push/PR
- **Command**: `npm run test`

---

## 🚨 Security Monitoring

### Set Up Alerts

1. **GitHub Notifications**:
   - Go to: https://github.com/settings/notifications
   - Enable: "Security alerts"

2. **Vercel Monitoring**:
   - Go to: https://vercel.com/your-project/settings/monitoring
   - Enable: Error tracking, Performance monitoring

3. **Neon Database Alerts**:
   - Go to: https://console.neon.tech → Your Project → Monitoring
   - Set up alerts for:
     - High connection count
     - Storage usage
     - Query performance

---

## 📋 Security Checklist

### Before Every Deployment
- [ ] Run `npm audit` (no high/critical issues)
- [ ] Run `npm run lint` (no errors)
- [ ] Run `npm run test` (all tests pass)
- [ ] Check for exposed secrets: `git diff | grep -E "(API|SECRET|PASSWORD|TOKEN)"`
- [ ] Review security headers: https://securityheaders.com/
- [ ] Test CSP: Open browser console, check for CSP violations

### Monthly
- [ ] Review Dependabot PRs and merge
- [ ] Check CodeQL alerts: https://github.com/shiliaiwei/kesararam/security/code-scanning
- [ ] Rotate JWT secrets (if suspicious activity)
- [ ] Review Vercel logs for anomalies

### Quarterly
- [ ] Full security audit
- [ ] Update all dependencies: `npm update`
- [ ] Review and update CSP headers
- [ ] Penetration testing (optional)

---

## 🔗 Useful Security Tools

### Online Scanners
- **Security Headers**: https://securityheaders.com/
- **SSL Test**: https://www.ssllabs.com/ssltest/
- **CSP Evaluator**: https://csp-evaluator.withgoogle.com/
- **Observatory**: https://observatory.mozilla.org/

### CLI Tools
```bash
# Audit dependencies
npm audit

# Check for outdated packages
npm outdated

# Find secrets in code
npx secretlint "**/*"

# Security linting
npx eslint-plugin-security
```

---

## 📞 Incident Response

If you discover a security breach:

1. **Immediately**:
   - Rotate all secrets (database, API keys, JWT)
   - Review access logs (Vercel, Neon, Cloudinary)
   - Disable compromised accounts

2. **Within 24 hours**:
   - Identify scope of breach
   - Notify affected users (if applicable)
   - Document incident

3. **Within 1 week**:
   - Implement fixes
   - Post-mortem analysis
   - Update security procedures

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Vercel Security](https://vercel.com/docs/security)

---

## ✅ Summary

**Current Security Score**: 8/10

**Strengths**:
- ✅ Automated dependency scanning
- ✅ Static code analysis (CodeQL)
- ✅ Strong security headers
- ✅ Input validation (Zod)
- ✅ SQL injection prevention (Drizzle ORM)

**Needs Improvement**:
- ⚠️ Rotate exposed secrets (CRITICAL)
- ⚠️ Enable GitHub secret scanning
- ⚠️ Restrict API keys by domain
- ⚠️ Set up monitoring alerts

**Next Steps**:
1. Complete "CRITICAL: Immediate Actions Required" section
2. Enable GitHub security features
3. Restrict API keys
4. Set up monitoring alerts
