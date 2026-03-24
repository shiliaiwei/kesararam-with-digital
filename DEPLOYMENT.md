# Deployment Guide

## Environment Variables Required for Production

Make sure to set these environment variables in your hosting platform (Vercel, Netlify, etc.):

### Cloudinary Configuration
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dpgivqzrl
CLOUDINARY_API_KEY=195832437932513
CLOUDINARY_API_SECRET=ZWiVpwR6ZuhfezN6Fc0sQDSiKZo
CLOUDINARY_URL=cloudinary://195832437932513:ZWiVpwR6ZuhfezN6Fc0sQDSiKZo@dpgivqzrl
```

### Database
```
DATABASE_URL=your-production-database-url
```

### JWT
```
JWT_SECRET=your-production-jwt-secret
```

### App URLs
```
NEXT_PUBLIC_APP_URL=https://kesararamwithdigital.tech
NEXT_PUBLIC_DASHBOARD_URL=https://dashboard.kesararamwithdigital.tech
NODE_ENV=production
```

### Google Drive API (Optional)
```
GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL=your-service-account-email
GOOGLE_DRIVE_PRIVATE_KEY=your-private-key
GOOGLE_DRIVE_MEDIA_FOLDER_ID=your-folder-id
```

## Vercel Deployment Steps

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add all the variables listed above
4. Redeploy your application

## Troubleshooting

If images don't show on production:
1. Check Vercel logs for errors
2. Verify all Cloudinary environment variables are set
3. Test the API endpoint: `https://your-domain.com/api/cloudinary/slide-images`
4. Check browser console for error messages
