# Vercel Environment Variables Setup

To configure your Cloudinary integration on Vercel, you need to add the following environment variables:

## Required Environment Variables

Go to your Vercel project settings → Environment Variables and add:

### Cloudinary Configuration

```
CLOUDINARY_URL=cloudinary://855448365679894:ZWiVpwR6ZuhfezN6Fc0sQDSiKZo@dpgivqzrl
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dpgivqzrl
CLOUDINARY_API_KEY=855448365679894
CLOUDINARY_API_SECRET=ZWiVpwR6ZuhfezN6Fc0sQDSiKZo
```

### Other Required Variables

Make sure you also have these set (copy from your .env.local):

```
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
NEXT_PUBLIC_APP_URL=your-production-url
NEXT_PUBLIC_DASHBOARD_URL=your-dashboard-url
NODE_ENV=production
```

## Steps to Add Variables in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable:
   - Name: Variable name (e.g., `CLOUDINARY_API_SECRET`)
   - Value: Variable value (e.g., `ZWiVpwR6ZuhfezN6Fc0sQDSiKZo`)
   - Environment: Select all (Production, Preview, Development)
5. Click "Save"
6. Redeploy your application for changes to take effect

## Important Notes

- The `NEXT_PUBLIC_` prefix makes variables accessible in the browser
- Never commit `.env.local` to git (it's already in .gitignore)
- After adding variables, trigger a new deployment
- You can verify variables are set by checking the deployment logs

## Vercel CLI Method (Alternative)

If you have Vercel CLI installed, you can also add variables using:

```bash
vercel env add CLOUDINARY_API_SECRET
# Then paste the value when prompted
```

Or pull existing variables:

```bash
vercel env pull .env.local
```
