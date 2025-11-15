import asyncHandler from './asyncHandler.js';
import { auth, db } from '../config/firebaseConfig.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      token = authHeader.split(' ')[1];
      const decodedToken = await auth.verifyIdToken(token);
      
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();

      if (!userDoc.exists) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      req.user = {
        id: userDoc.id,
        uid: userDoc.id,
        ...userDoc.data(),
      };
      
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

export { protect };