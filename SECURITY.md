# Security Policy

## Environment Variables

This application requires the following environment variables to be set. **Never commit these to version control.**

### Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT Authentication
JWT_SECRET=your-secure-jwt-secret-minimum-32-characters

# Cloudinary (for media uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Security Best Practices

1. **JWT_SECRET**: Use a strong, random string of at least 32 characters
   ```bash
   # Generate a secure JWT secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Database Credentials**: Use strong passwords and restrict database access to specific IP addresses

3. **Cloudinary**: Keep API keys secure and use signed uploads for production

4. **Environment Files**: 
   - `.env.local` is gitignored and should never be committed
   - Use `.env.example` as a template
   - For production, use environment variables in your hosting platform

## Role-Based Access Control

The application implements three user roles:

- **Student**: Can browse content, take quizzes, view own progress
- **Staff**: Can create content (requires admin approval), upload media
- **Admin**: Full access including content approval, user management

## API Security

All API endpoints implement:
- Session-based authentication
- Role-based authorization
- Input validation
- SQL injection prevention (via Drizzle ORM)
- XSS protection (via Next.js built-in sanitization)

## Content Security

- Staff-created content requires admin approval before publication
- All content changes are logged in audit_logs table
- Inactive content is hidden from students but visible to staff/admin
- File uploads are validated for type and size

## Reporting Security Issues

If you discover a security vulnerability, please email security@example.com with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

Do not create public GitHub issues for security vulnerabilities.
