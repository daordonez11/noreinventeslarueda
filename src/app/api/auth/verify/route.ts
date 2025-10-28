import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { COLLECTIONS } from '@/lib/firebase/collections';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userRef = adminDb.collection(COLLECTIONS.USERS).doc(uid);
    const userDoc = await userRef.get();

    let userData;
    if (!userDoc.exists) {
      userData = {
        email: decodedToken.email || '',
        name: decodedToken.name || 'User',
        oauthProvider: decodedToken.firebase.sign_in_provider || 'unknown',
        oauthId: uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await userRef.set(userData);
    } else {
      userData = userDoc.data();
      await userRef.update({ updatedAt: new Date() });
    }

    return NextResponse.json({
      id: uid,
      ...userData,
    });
  } catch (error) {
    console.error('POST /api/auth/verify error:', error);
    return NextResponse.json(
      { error: 'Invalid token or authentication failed' },
      { status: 401 }
    );
  }
}
