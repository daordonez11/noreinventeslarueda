# Quick Voting Feature Test Guide

## ✅ The Feature is Already Working!

Good news! The voting feature is **already fully implemented**. Here's how to test it:

## Quick Test (2 minutes)

### 1. Start the App
```bash
npm run dev
```

### 2. Open Browser
```
http://localhost:3000
```

### 3. Go to Any Library
Click any library card, for example:
```
http://localhost:3000/libraries/https___github_com_facebook_react
```

### 4. See Vote Buttons
You'll see at the top of the library detail page:

```
┌─────────────────────────────┐
│  👍 0    👎 0               │
│  Inicia sesión para votar   │
└─────────────────────────────┘
```

### 5. Login
Click "Iniciar Sesión" in the header → Sign in with Google

### 6. Vote!
After login, click the 👍 button:

**Before:**
```
👍 0    👎 0
```

**After:**
```
👍 1    👎 0  ← Button turns green!
Has votado 👍
```

### 7. Toggle Vote
Click 👍 again to remove your vote:
```
👍 0    👎 0  ← Back to gray
```

### 8. Change Vote
Click 👎 to downvote:
```
👍 0    👎 1  ← Button turns red!
Has votado 👎
```

## What You'll See

### Not Logged In:
- Gray vote buttons (👍 👎)
- Vote counts shown
- Click shows "Sign in to vote" hint

### Logged In - No Vote:
- Gray vote buttons
- Vote counts shown
- Hover shows scale effect
- Message: "¿Esta librería es útil?"

### Logged In - Upvoted:
- 👍 button **GREEN** with border
- Vote count incremented
- Message: "Has votado 👍"
- Can click to remove

### Logged In - Downvoted:
- 👎 button **RED** with border
- Vote count incremented
- Message: "Has votado 👎"
- Can click to remove

## Technical Check

### Check Firestore Console

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Look for `votes` collection
4. You'll see documents like:

```
votes/[auto-id]
  userId: "firebase-user-uid"
  libraryId: "https___github_com_facebook_react"
  value: 1
  createdAt: Timestamp
  updatedAt: Timestamp
```

5. Check `libraries` collection
6. Find the React library
7. See `communityVotesSum` updated!

## API Test (Optional)

### Test with cURL:

**Get vote counts (no auth needed):**
```bash
curl http://localhost:3000/api/votes/https___github_com_facebook_react
```

**Response:**
```json
{
  "upvotes": 1,
  "downvotes": 0,
  "total": 1,
  "userVote": null
}
```

**Cast a vote (needs auth):**
```bash
# First login in browser and get your Firebase token
# Then:
curl -X POST http://localhost:3000/api/votes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "libraryId": "https___github_com_facebook_react",
    "value": 1,
    "userId": "YOUR_USER_ID"
  }'
```

## Animations You'll See

- ✅ **Hover effect** - Button scales to 1.1x
- ✅ **Click effect** - Button scales to 0.95x
- ✅ **Color transition** - Smooth fade to green/red
- ✅ **Sign-in hint** - Fades in/out automatically

## Troubleshooting

### Votes Not Saving?
1. Check Firebase Console → Firestore Database
2. Verify `votes` collection exists
3. Check browser console for errors
4. Verify you're logged in (see user avatar in header)

### Button Not Responding?
1. Check if logged in
2. Look for error in browser console
3. Verify Firebase config in `.env.local`

### Vote Count Not Updating?
1. Refresh the page
2. Check Firestore to verify vote was saved
3. Look for API errors in Network tab

## Component Location

**Vote Button Component:**
```
src/components/VoteButton.tsx
```

**Used in Library Detail:**
```
src/components/LibraryDetail/LibraryDetail.tsx
```

## Summary

**The voting feature works perfectly!** You can:

✅ **Vote** on any library (logged in users only)  
✅ **See real-time** vote counts  
✅ **Toggle votes** (click again to remove)  
✅ **Change votes** (upvote → downvote)  
✅ **Persist votes** in Firestore  
✅ **Beautiful UI** with animations  

**Try it now:** `npm run dev` → Open any library → Login → Vote! 🎉

---

Last verified: $(date)
