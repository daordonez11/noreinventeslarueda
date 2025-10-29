# No Reinventes la Rueda 🛞

**A curated technology library webapp to help Spanish-speaking developers discover modern, well-maintained libraries and frameworks.**

[![Production](https://img.shields.io/badge/status-production%20ready-success)](https://noreinventeslarueda.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.33-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-orange)](https://firebase.google.com/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Development Setup](#-development-setup)
- [Firebase Configuration](#-firebase-configuration)
- [Voting System](#-voting-system)
- [Deployment](#-deployment)
- [Project Status](#-project-status)

---

## 🎯 Overview

**No Reinventes la Rueda** (Don't Reinvent the Wheel) helps developers discover the most popular, up-to-date, and reliable libraries for their projects. The webapp combines **automated GitHub metrics** with **community voting** to surface the best technology choices across multiple categories.

![Landing Page](./public/images/landing-page.png)

### Why This Project?

- **Spanish-first**: Content and UI in Spanish for Spanish-speaking developer community
- **Modern stack**: Built with Next.js 14, TypeScript, Firebase, and Framer Motion
- **SEO-optimized**: Server-side rendering, static generation, and semantic HTML
- **Community-driven**: Authenticated voting system influences library rankings
- **Beautiful UI**: Smooth animations and modern design patterns showcase cutting-edge web development

**Live Demo**: [noreinventeslarueda.vercel.app](https://noreinventeslarueda.vercel.app)

---

## ✨ Features

### Core Features (Production Ready)

✅ **Browse Technology Categories**
- 7 categories: Frontend, Backend, Databases, DevOps, Testing, Mobile, AI/ML
- Libraries ranked by curation score (GitHub stars + community votes)
- Modern card-based UI with smooth animations

✅ **Search & Filter**
- Real-time search across all libraries
- Filter by category
- Search-to-click conversion tracking

✅ **Detailed Library Pages**
- Comprehensive library information
- GitHub stats (stars, forks, last updated)
- Documentation links and installation guides
- Related libraries suggestions

✅ **Community Voting System**
- Authenticated voting via Firebase Auth
- Upvote/downvote libraries
- Vote counts influence rankings
- Firestore transactions ensure data consistency

✅ **Modern Animations**
- Framer Motion animations throughout
- Smooth page transitions
- Interactive hover effects
- Staggered entrance animations

✅ **Firebase Authentication**
- Google OAuth sign-in
- GitHub OAuth sign-in
- Protected voting API endpoints
- Server-side token verification

### Advanced Features

✅ **Performance & SEO**
- Incremental Static Regeneration (ISR) with 1-hour revalidation
- Pre-rendered pages for top 100 libraries
- On-demand page generation for remaining libraries
- Semantic HTML and meta tags

✅ **Analytics Integration**
- PostHog analytics tracking
- Page views, search queries, voting patterns
- Geographic distribution
- User engagement metrics

✅ **Accessibility**
- ARIA labels and semantic HTML
- Keyboard navigation support
- Screen reader optimized
- Color contrast compliance

---

## 🚀 Tech Stack

### Frontend
- **Next.js 14.2.33** - React framework with App Router, SSR, and ISR
- **React 18+** - UI library
- **TypeScript 5.x** - Type safety
- **Tailwind CSS 3.x** - Utility-first styling
- **Framer Motion 10.x** - Animation library

### Backend & Database
- **Firebase Firestore** - NoSQL database (migrated from Prisma/PostgreSQL)
- **Firebase Authentication** - OAuth providers (Google, GitHub)
- **Firebase Admin SDK** - Server-side operations

### Testing
- **Playwright** - End-to-end testing
- **Jest** - Unit testing
- **React Testing Library** - Component testing

### Deployment & DevOps
- **Vercel** - Production hosting
- **GitHub Actions** - CI/CD (planned)
- **Firebase Hosting** - Alternative deployment option

### Analytics & Monitoring
- **PostHog** - Product analytics
- **Vercel Analytics** - Web vitals monitoring

---

## ⚡ Quick Start

### Prerequisites

- Node.js 20+ and npm
- Firebase account (free tier is sufficient)
- Git

### 1. Clone Repository

```bash
git clone https://github.com/your-username/noreinventeslarueda.git
cd noreinventeslarueda
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase credentials (see [Firebase Configuration](#-firebase-configuration) for detailed setup).

### 4. Seed Database

```bash
npm run firestore:seed
```

This creates the 7 initial technology categories in Firestore.

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

---

## 🛠️ Development Setup

### Full Setup Guide

For complete setup including Docker databases (legacy), Prisma migrations (legacy), and OAuth configuration, see [DEV_SETUP.md](./DEV_SETUP.md).

### Firebase Migration

This project **migrated from Prisma/PostgreSQL + NextAuth.js to Firebase** in late 2024.

**What changed:**
- Database: PostgreSQL → Firestore (NoSQL)
- ORM: Prisma → Firebase Admin SDK
- Auth: NextAuth.js → Firebase Authentication

See [FIREBASE_MIGRATION.md](./FIREBASE_MIGRATION.md) for full migration details and rollback instructions.

### Project Structure

```
noreinventeslarueda/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── api/                # API routes
│   │   ├── auth/               # Authentication pages
│   │   ├── categories/[slug]/  # Category detail pages
│   │   ├── libraries/[id]/     # Library detail pages
│   │   └── search/             # Search page
│   ├── components/             # React components
│   ├── lib/
│   │   ├── firebase/           # Firebase config & utilities
│   │   ├── analytics/          # PostHog integration
│   │   ├── animations/         # Framer Motion configs
│   │   └── utils/              # Helper functions
│   └── __tests__/              # Test files
├── specs/                      # Feature specifications
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Firestore composite indexes
└── firebase.json               # Firebase config
```

### Available Scripts

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Jest tests
npm run test:e2e     # Run Playwright E2E tests
npm run firestore:seed  # Seed Firestore with categories
```

---

## 🔥 Firebase Configuration

### Step 1: Create Firebase Project (2 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `noreinventeslarueda`
4. Disable Google Analytics (optional for development)
5. Click **"Create project"**

### Step 2: Enable Firestore (30 seconds)

1. Firebase Console → **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select location (closest to you)
5. Click **"Enable"**

### Step 3: Enable Authentication (1 minute)

1. Firebase Console → **Authentication**
2. Click **"Get started"**
3. Click **"Sign-in method"** tab
4. Enable **Google** provider
5. Enable **GitHub** provider (configure OAuth app in production)

### Step 4: Get Firebase Keys

#### Client Keys (Web App)

1. Project Settings (gear icon) → **General**
2. Scroll to **"Your apps"** → Click web icon (`</>`)
3. Register app with nickname: `webapp`
4. Copy `firebaseConfig` values to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123..."
NEXT_PUBLIC_FIREBASE_APP_ID="1:123..."
```

#### Admin SDK Keys (Server-side)

1. Project Settings → **Service accounts** tab
2. Click **"Generate new private key"**
3. Download JSON file (keep secure, don't commit!)
4. Add to `.env.local`:

```env
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Step 5: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

Or manually copy rules from `firestore.rules` in Firebase Console.

### Step 6: Create Firestore Indexes

Deploy composite indexes for optimal query performance:

```bash
firebase deploy --only firestore:indexes
```

See [FIREBASE_MIGRATION.md](./FIREBASE_MIGRATION.md) for manual index creation instructions.

### Common Issues

**Issue**: "Firebase not initialized"  
**Fix**: Verify all `NEXT_PUBLIC_FIREBASE_*` variables are set in `.env.local`

**Issue**: "Permission denied" when voting  
**Fix**: Ensure Firebase Authentication is enabled and you're signed in

**Issue**: "Private key error"  
**Fix**: Ensure `FIREBASE_PRIVATE_KEY` preserves `\n` for newlines:
```
"-----BEGIN PRIVATE KEY-----\nMIIE...\n...\n-----END PRIVATE KEY-----\n"
```

**Issue**: "No categories showing"  
**Fix**: Run `npm run firestore:seed` to create initial data

See [QUICK_START_FIREBASE.md](./QUICK_START_FIREBASE.md) for detailed troubleshooting.

---

## 🗳️ Voting System

### How It Works

1. **Authentication Required**: Users must sign in with Google or GitHub to vote
2. **One Vote Per User Per Library**: Each user can cast one vote (upvote or downvote) per library
3. **Firestore Transactions**: Votes use transactions to ensure data consistency
4. **Composite Document IDs**: Vote documents use `userId_libraryId` format for efficient lookups
5. **Ranking Impact**: Community votes are weighted with GitHub stars in curation score

### Technical Implementation

**Vote Document Structure:**
```typescript
{
  id: `${userId}_${libraryId}`,
  userId: string,
  libraryId: string,
  value: 1 | -1,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Transaction Flow:**
```typescript
// Read phase (must execute before writes)
const libraryRef = db.collection('libraries').doc(libraryId);
const voteRef = db.collection('votes').doc(`${userId}_${libraryId}`);
const [libraryDoc, voteDoc] = await Promise.all([
  transaction.get(libraryRef),
  transaction.get(voteRef)
]);

// Write phase (after all reads complete)
transaction.set(voteRef, voteData);
transaction.update(libraryRef, { communityVotesSum: newVoteSum });
```

**Security Rules:**
```javascript
match /votes/{voteId} {
  allow read: if true;
  allow create: if request.auth != null;
  allow update, delete: if request.auth != null && 
                         request.auth.uid == resource.data.userId;
}
```

See [VOTING_FEATURE_COMPLETE.md](./VOTING_FEATURE_COMPLETE.md) for implementation details and fixes.

---

## 🌐 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/)
   - Import Git repository
   - Select framework preset: **Next.js**

2. **Configure Environment Variables**:
   - Add all Firebase variables from `.env.local`
   - Add production OAuth credentials
   - Add PostHog API key (if using analytics)

3. **Deploy**:
   - Click **"Deploy"**
   - Vercel will build and deploy automatically
   - Configure custom domain (optional)

4. **Update Firebase**:
   - Add production domain to Firebase → Authentication → Authorized domains
   - Update OAuth redirect URLs for GitHub OAuth app

### Build Configuration

```javascript
// next.config.js
const nextConfig = {
  // ... other config
  
  // Enable ISR
  experimental: {
    incrementalCacheHandlerPath: undefined,
  },
};
```

**Static Generation:**
- Homepage: Pre-rendered at build time
- Category pages: Pre-rendered at build time
- Library detail pages: Top 100 pre-rendered, rest generated on-demand
- Revalidation: 1 hour (3600 seconds)

### Deployment Checklist

- [ ] Firebase environment variables configured
- [ ] GitHub OAuth app created with production callback URL
- [ ] Google OAuth authorized domain added in Firebase
- [ ] Firestore security rules deployed
- [ ] Firestore indexes deployed
- [ ] Custom domain configured (optional)
- [ ] Analytics configured
- [ ] Test authentication flow
- [ ] Test voting system
- [ ] Verify SEO meta tags

See [VERCEL_DEPLOY_READY.md](./VERCEL_DEPLOY_READY.md) for complete deployment guide.

---

## 📊 Project Status

### Current Status: **Production Ready** ✅

**Last Updated**: January 2025

### Completed Phases

✅ **Phase 1**: Core Features (Categories, Libraries, Search)  
✅ **Phase 2**: Library Detail Pages  
✅ **Phase 3**: Firebase Migration  
✅ **Phase 4**: Voting System  
✅ **Phase 5**: Animations & UI Polish  
✅ **Phase 6**: Testing (E2E, Unit, Integration)  
✅ **Phase 7**: Performance, Accessibility, Analytics  

**All 9 planned tasks complete** (see [PROJECT_COMPLETION_INDEX.md](./PROJECT_COMPLETION_INDEX.md))

### Key Achievements

- ✅ Full Firebase migration from Prisma/PostgreSQL
- ✅ Voting system with Firestore transactions
- ✅ Modern color palette (vibrant blues, oranges, purples)
- ✅ Framer Motion animations throughout
- ✅ Comprehensive Playwright E2E tests
- ✅ Accessibility compliance (ARIA, keyboard navigation)
- ✅ PostHog analytics integration
- ✅ Vercel deployment with ISR

### Recent Fixes

**Voting System**:
- Fixed Firestore transaction ordering (reads before writes)
- Implemented composite document IDs for votes
- Updated Firestore security rules for vote operations

**Deployment**:
- Added `dynamicParams = true` for on-demand page generation
- Fixed dynamic server usage errors (reverted to direct Firestore queries)
- Resolved TypeScript compilation errors

### Known Limitations

- **Library Data**: Requires GitHub sync job to populate libraries (not yet automated)
- **GitHub Rate Limits**: Manual GitHub API integration (no automated syncing yet)
- **i18n**: Spanish-first, but no multi-language support planned

### Next Steps (Future Enhancements)

- [ ] Automated GitHub sync job (cron job or webhook)
- [ ] Admin dashboard for managing libraries
- [ ] User profiles with vote history
- [ ] Email notifications for new libraries in followed categories
- [ ] Advanced search filters (by popularity, last updated, etc.)
- [ ] Integration with npm, PyPI, Maven Central
- [ ] Library comparison feature

---

## 📚 Documentation

- [Project Specification](./specs/001-tech-library-webapp/spec.md) - Original feature specification
- [Firebase Migration Guide](./FIREBASE_MIGRATION.md) - Complete migration documentation
- [Quick Start Firebase](./QUICK_START_FIREBASE.md) - 5-minute Firebase setup
- [Development Setup](./DEV_SETUP.md) - Detailed development environment setup
- [Voting Feature](./VOTING_FEATURE_COMPLETE.md) - Voting system implementation
- [Project Completion Index](./PROJECT_COMPLETION_INDEX.md) - All completed phases and tasks
- [Phase 7 Summary](./PHASE_7_SUMMARY.md) - Performance, accessibility, and analytics

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Daniel Ordóñez**

- GitHub: [@your-github-username](https://github.com/your-github-username)
- Website: [noreinventeslarueda.vercel.app](https://noreinventeslarueda.vercel.app)

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) by Vercel
- Powered by [Firebase](https://firebase.google.com/)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- Analytics by [PostHog](https://posthog.com/)
- Inspired by the Spanish-speaking developer community

---

**¡No reinventes la rueda! Use las mejores tecnologías disponibles.** 🛞✨
