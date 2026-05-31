#!/usr/bin/env node

/**
 * Generate secure JWT secrets
 * Usage: node scripts/generate-jwt-secret.js
 */

const crypto = require('crypto');

console.log('\n🔐 Generating new JWT secrets...\n');
console.log('═══════════════════════════════════════════════════════════════\n');

// Generate two secrets
const secret1 = crypto.randomBytes(64).toString('hex');
const secret2 = crypto.randomBytes(64).toString('hex');

console.log('Copy these to your .env.local file:\n');
console.log('JWT_SECRET=' + secret1);
console.log('PROFILE_TOKEN_SECRET=' + secret2);

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('\n⚠️  IMPORTANT:');
console.log('1. Update .env.local with these new secrets');
console.log('2. Update Vercel environment variables');
console.log('3. Redeploy your application');
console.log('4. Never commit .env.local to Git!\n');
