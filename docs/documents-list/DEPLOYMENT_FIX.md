# Deployment Fix - Update Git Credentials

## Current Issue
The deployment is blocked because the commit author email doesn't have access to the Vercel project.

**Current email**: `70220432+shiliaiwei@users.noreply.github.com`

## Solution: Update Git Configuration

To fix the deployment, update the git configuration with your main GitHub email:

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/KWD/kesararam

# Set your main GitHub email
git config user.email "YOUR_MAIN_EMAIL@example.com"

# Set your GitHub username
git config user.name "YOUR_GITHUB_USERNAME"

# Verify the changes
git config user.email
git config user.name
```

## After Updating Credentials

1. Amend the last commit with the new author:
```bash
git commit --amend --no-edit
```

2. Force push to update GitHub:
```bash
git push origin docs --force-with-lease
```

3. The deployment should now succeed on Vercel

## Current Save Card Design

✅ **Background**: White (#ffffff)
✅ **Text colors**: 
  - Title: Teal (#25c1a4)
  - Description: Black (#000000)
  - Quote: Black (#000000)
  - Copyright: Black (#000000)
✅ **Sign image area**: Yellow (#ffd700)
✅ **Line separator**: Teal (#25c1a4)
✅ **QR code**: Bottom right corner

## Latest Commit
- **Commit**: `e4f775a` - "style: Change save card background to white with black text"
- **Branch**: docs
- **Status**: Ready for deployment once credentials are updated

## Steps to Complete

1. Replace `YOUR_MAIN_EMAIL@example.com` with your actual GitHub email
2. Replace `YOUR_GITHUB_USERNAME` with your GitHub username
3. Run the commands above
4. Deployment will proceed automatically
