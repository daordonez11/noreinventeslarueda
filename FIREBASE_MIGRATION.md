# Firebase Migration Guide

> [!NOTE]
> **STATUS: COMPLETED** ✅
> The migration from Prisma/NextAuth to Firebase has been fully completed. This document serves as a reference for the architectural changes and setup steps that were performed.

## Overview

This project has been migrated from **Prisma/PostgreSQL** with **NextAuth.js** to **Firebase Firestore** with **Firebase Authentication**.

## What Changed

### Database: PostgreSQL → Firestore

- **Before**: Prisma ORM with PostgreSQL
- **After**: Firebase Firestore (NoSQL)
  
All collections mirror the previous Prisma schema:
- `users` - User accounts with OAuth info
- `categories` - Technology categories
- `libraries` - Technology libraries/frameworks
- `votes` - User votes on libraries

### Authentication: NextAuth.js → Firebase Auth

- **Before**: NextAuth.js with GitHub/Google OAuth providers
- **After**: Firebase Authentication with Google and GitHub providers
- Uses `AuthProvider` context for client-side auth state
- Server-side verification via Firebase Admin SDK

## Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Firestore Database** (start in production mode)
4. Enable **Authentication** → Sign-in methods:
   - Google (enable)
   - GitHub (enable, add OAuth app credentials)

### 2. Get Firebase Configuration

#### Client Configuration (Web SDK)
1. Go to Project Settings → General
2. Scroll to "Your apps" → Add app → Web
3. Copy the firebaseConfig object values to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcdef"
```

#### Admin SDK (Server-side)
1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Add to `.env.local`:

```env
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**Alternative**: Set the entire service account JSON as one variable:
```env
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

### 3. Configure OAuth Providers

#### GitHub OAuth
1. Go to GitHub → Settings → Developer Settings → OAuth Apps
2. Create new OAuth app:
   - Homepage URL: `http://localhost:3000` (dev) or your domain
   - Authorization callback URL: `https://your-project-id.firebaseapp.com/__/auth/handler`
3. Copy Client ID and Secret to Firebase Console → Authentication → Sign-in method → GitHub

#### Google OAuth
1. Firebase automatically configures Google Sign-In
2. Add authorized domains in Firebase Console → Authentication → Settings → Authorized domains

### 4. Seed Firestore Data

Run the seeder to populate categories:

```bash
npm run firestore:seed
```

Or manually:
```bash
node firestore-seed.js
```

### 5. Create Firestore Indexes

For optimal query performance, create these composite indexes in Firestore Console:

1. **Libraries by category + curation score**:
   - Collection: `libraries`
   - Fields: `categoryId` (Ascending), `curationScore` (Descending)

2. **Libraries by category + stars**:
   - Collection: `libraries`
   - Fields: `categoryId` (Ascending), `stars` (Descending)

3. **Libraries by category + votes**:
   - Collection: `libraries`
   - Fields: `categoryId` (Ascending), `communityVotesSum` (Descending)

4. **Votes by library**:
   - Collection: `votes`
   - Fields: `libraryId` (Ascending), `createdAt` (Descending)

5. **Votes by user + library** (for upsert logic):
   - Collection: `votes`
   - Fields: `userId` (Ascending), `libraryId` (Ascending)

### 6. Update package.json Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "firestore:seed": "node firestore-seed.js"
  }
}
```

### 7. Remove Old Dependencies (Optional)

You can now remove Prisma-related packages:

```bash
npm uninstall prisma @prisma/client next-auth @auth/prisma-adapter
```

And delete:
- `/prisma` directory
- `src/app/api/auth/[...nextauth].ts` (already removed)

## API Changes

### Authentication Headers

All protected API routes now require Firebase ID token:

```typescript
// Before (NextAuth)
const session = await getServerSession(authOptions)

// After (Firebase)
const authHeader = request.headers.get('authorization')
const idToken = authHeader.split('Bearer ')[1]
const decodedToken = await adminAuth.verifyIdToken(idToken)
const userId = decodedToken.uid
```

### Client-side Auth

```typescript
// Before (NextAuth)
import { useSession, signIn, signOut } from 'next-auth/react'
const { data: session } = useSession()

// After (Firebase)
import { useAuth } from '@/lib/firebase/auth-context'
const { user, firebaseUser, signInWithGoogle, signInWithGithub, signOut } = useAuth()
```

### Making Authenticated Requests

```typescript
// Get user's ID token
const idToken = await firebaseUser.getIdToken()

// Include in API requests
const response = await fetch('/api/votes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`
  },
  body: JSON.stringify({ libraryId, value: 1 })
})
```

## Firestore Security Rules

Add these security rules in Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Categories collection - read-only
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if false; // Only via Admin SDK
    }
    
    // Libraries collection - read-only for clients
    match /libraries/{libraryId} {
      allow read: if true;
      allow write: if false; // Only via Admin SDK
    }
    
    // Votes collection
    match /votes/{voteId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                             request.auth.uid == resource.data.userId;
    }
  }
}
```

## Testing

1. Start development server:
   ```bash
   npm run dev
   ```

2. Test authentication:
   - Visit `/auth/signin`
   - Try Google and GitHub sign-in

3. Test API endpoints:
   - `GET /api/categories` - should return seeded categories
   - `GET /api/libraries` - should work (empty until you sync GitHub data)
   - `POST /api/votes` - requires authentication

## Production Deployment

1. Update environment variables in your hosting platform (Vercel, etc.)
2. Add production domain to Firebase → Authentication → Authorized domains
3. Update OAuth redirect URLs for production domain
4. Enable Firestore in production mode
5. Deploy security rules

## Rollback Plan

If you need to rollback to Prisma/NextAuth:
1. Restore from git: `git checkout <previous-commit>`
2. Reinstall dependencies: `npm install`
3. Run migrations: `npx prisma migrate deploy`

## Need Help?

- Firebase Docs: https://firebase.google.com/docs
- Firestore Guide: https://firebase.google.com/docs/firestore
- Firebase Auth: https://firebase.google.com/docs/auth
