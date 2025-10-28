# Quick Start Guide - Firebase Setup

## 🚀 Getting Started in 5 Minutes

This project now uses **Firebase** instead of Prisma/PostgreSQL and NextAuth. Here's how to get it running:

## Step 1: Create Firebase Project (2 min)

1. Go to https://console.firebase.google.com/
2. Click **"Add project"**
3. Enter project name: `noreinventeslarueda` (or your choice)
4. Disable Google Analytics (optional for development)
5. Click **"Create project"**

## Step 2: Enable Firestore (30 sec)

1. In Firebase Console sidebar → **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select location (closest to you)
5. Click **"Enable"**

## Step 3: Enable Authentication (1 min)

1. In Firebase Console sidebar → **Authentication**
2. Click **"Get started"**
3. Click **"Sign-in method"** tab
4. Enable **Google** provider (click, toggle on, save)
5. Enable **GitHub** provider:
   - Toggle on
   - Leave OAuth app fields empty for now
   - Click "Save"

## Step 4: Get Your Firebase Keys (1 min)

### Client Keys (Web App)
1. Go to **Project Settings** (gear icon) → **General**
2. Scroll to **"Your apps"** section
3. Click **"Web" icon** (</>) to add web app
4. Register app with nickname: `webapp`
5. Copy the `firebaseConfig` values

### Server Keys (Admin SDK)
1. Still in **Project Settings** → **Service accounts** tab
2. Click **"Generate new private key"**
3. Download the JSON file
4. Keep it safe! Don't commit it to git

## Step 5: Configure Environment Variables (30 sec)

1. Copy the example file:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` and add your keys:

```env
# From Web App config
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123..."
NEXT_PUBLIC_FIREBASE_APP_ID="1:123..."

# From Service Account JSON file
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Step 6: Seed Initial Data (10 sec)

```bash
npm run firestore:seed
```

This creates 7 categories (Frontend, Backend, Databases, etc.)

## Step 7: Run the App! (10 sec)

```bash
npm run dev
```

Visit http://localhost:3000 🎉

## Testing Authentication

1. Visit http://localhost:3000/auth/signin
2. Click **"Continue with Google"**
3. Sign in with your Google account
4. You should be redirected to the homepage
5. Try navigating to a library and voting!

## Common Issues & Fixes

### Issue: "Firebase not initialized"
**Fix**: Check that all `NEXT_PUBLIC_FIREBASE_*` variables are set in `.env.local`

### Issue: "Invalid API key"
**Fix**: Make sure you copied the Web App config (not iOS/Android)

### Issue: "Permission denied" when voting
**Fix**: Check that Firebase Authentication is enabled and you're signed in

### Issue: "Private key error"
**Fix**: Make sure `FIREBASE_PRIVATE_KEY` has `\n` for newlines, like:
```
"-----BEGIN PRIVATE KEY-----\nMIIE...\n...\n-----END PRIVATE KEY-----\n"
```

### Issue: "No categories showing"
**Fix**: Run `npm run firestore:seed` to create initial data

## What's Different from Before?

| Before | After |
|--------|-------|
| PostgreSQL database | Firestore (NoSQL) |
| Prisma ORM | Firebase Admin SDK |
| NextAuth.js | Firebase Authentication |
| `useSession()` hook | `useAuth()` hook |
| Database migrations | Firestore collections auto-created |
| `prisma studio` | Firebase Console |

## Next Steps

1. **Add Libraries**: You'll need to run the GitHub sync job to populate libraries
2. **Configure OAuth Apps**: For production, set up GitHub OAuth app in GitHub settings
3. **Add Security Rules**: Set up Firestore security rules (see FIREBASE_MIGRATION.md)
4. **Deploy**: Deploy to Vercel/Firebase Hosting

## Need More Help?

- **Full Migration Guide**: See `FIREBASE_MIGRATION.md`
- **Refactor Summary**: See `REFACTOR_COMPLETE.md`
- **Firebase Docs**: https://firebase.google.com/docs

## OAuth Apps Setup (Production Only)

When deploying to production, you'll need to set up OAuth apps:

### GitHub OAuth App
1. Go to https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Set **Authorization callback URL** to:
   ```
   https://your-project-id.firebaseapp.com/__/auth/handler
   ```
4. Copy Client ID and Secret to Firebase Console → Authentication → GitHub provider

### Google OAuth
Already configured automatically by Firebase! Just add your production domain to:
- Firebase Console → Authentication → Settings → Authorized domains

---

**That's it!** You're ready to use Firebase. Enjoy! 🔥
