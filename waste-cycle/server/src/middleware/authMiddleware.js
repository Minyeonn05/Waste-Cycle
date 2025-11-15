// server/src/middleware/authMiddleware.js
import asyncHandler from './asyncHandler.js';

// Check if we're using mock mode (for development without Firebase)
const USE_MOCK_AUTH = process.env.USE_MOCK_AUTH === 'true';

/**
 * Mock authentication middleware for development
 * Allows requests with mock user data in headers
 */
const mockVerifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // In mock mode, accept any token or no token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Create a mock user for development
      req.user = {
        uid: 'mock-user-1',
        id: 'mock-user-1',
        email: 'mock@example.com',
        displayName: 'Mock User',
        role: 'user',
      };
      console.log('⚠️  Mock Auth: No token provided, using mock user');
      return next();
    }
    
    // Try to decode mock user info from token
    // In mock mode, token might be JSON string or simple string
    const token = authHeader.split('Bearer ')[1];
    
    try {
      // Try to parse as JSON (if frontend sends user data)
      const userData = JSON.parse(token);
      req.user = {
        uid: userData.id || userData.uid || 'mock-user-1',
        id: userData.id || userData.uid || 'mock-user-1',
        email: userData.email || 'mock@example.com',
        displayName: userData.name || userData.displayName || 'Mock User',
        role: userData.role || 'user',
      };
    } catch {
      // If not JSON, create default mock user
      req.user = {
        uid: token || 'mock-user-1',
        id: token || 'mock-user-1',
        email: 'mock@example.com',
        displayName: 'Mock User',
        role: token && token.includes('admin') ? 'admin' : 'user',
      };
    }
    
    console.log(`⚠️  Mock Auth: ${req.user.email} (${req.user.role})`);
    next();
  } catch (error) {
    console.error('❌ Mock Auth error:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Mock authentication failed',
      code: 'MOCK_AUTH_FAILED'
    });
  }
};

/**
 * Firebase authentication middleware (production mode)
 */
const firebaseVerifyToken = async (req, res, next) => {
  try {
    const { auth, db } = await import('../config/firebaseConfig.js');
    
    // Check if Firebase is properly initialized
    if (!auth || !db) {
      console.error('❌ Firebase Auth or DB is not initialized');
      return res.status(500).json({
        success: false,
        error: 'Authentication service is not available. Please check Firebase configuration.',
        code: 'FIREBASE_NOT_INITIALIZED'
      });
    }
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
        code: 'NO_TOKEN'
      });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // Verify Firebase Auth token
    const decodedToken = await auth.verifyIdToken(token, true); // checkRevoked = true
    
    // Get user document from Firestore
    let userDoc;
    try {
      userDoc = await db.collection('users').doc(decodedToken.uid).get();
    } catch (firestoreError) {
      console.error('Firestore error:', firestoreError.message);
      console.error('Error code:', firestoreError.code);
      
      if (firestoreError.code === 5) {
        console.error('\n⚠️  Firestore NOT_FOUND Error Detected');
        console.error('This usually means:');
        console.error('1. Firestore Database is not enabled in Firebase Console');
        console.error('2. Go to: https://console.firebase.google.com/project/waste-cycle-a6c6e/firestore');
        console.error('3. Click "Create database" and choose "Start in production mode" or "Start in test mode"');
        console.error('4. Select a location for your Firestore database\n');
        
        return res.status(404).json({
          success: false,
          error: 'User profile not found. Please complete registration. (Firestore may need to be enabled)',
          code: 'USER_NOT_FOUND'
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Database error occurred',
        code: 'DB_ERROR'
      });
    }
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found in database',
        code: 'USER_NOT_FOUND'
      });
    }
    
    const userData = userDoc.data();
    
    req.user = {
      uid: decodedToken.uid,
      id: decodedToken.uid,
      email: decodedToken.email,
      displayName: userData.displayName || userData.name || decodedToken.name,
      photoURL: userData.photoURL || userData.avatar || decodedToken.picture,
      emailVerified: decodedToken.email_verified,
      role: userData.role || 'user',
      tokenIssuedAt: new Date(decodedToken.iat * 1000).toISOString(),
      tokenExpireAt: new Date(decodedToken.exp * 1000).toISOString()
    };
    
    console.log(`✅ Firebase Auth Success: ${req.user.email} (${req.user.uid})`);
    next();
  } catch (error) {
    console.error('❌ Token verification error:', error.code, error.message);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
        message: 'Please refresh your token or login again'
      });
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        success: false,
        error: 'Token revoked',
        code: 'TOKEN_REVOKED',
        message: 'Your session has been revoked. Please login again'
      });
    }
    
    if (error.code === 'auth/argument-error') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format',
        code: 'INVALID_TOKEN'
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      code: 'AUTH_FAILED',
      message: error.message
    });
  }
};

// Export the appropriate middleware based on environment
export const verifyToken = USE_MOCK_AUTH ? mockVerifyToken : firebaseVerifyToken;
export const protect = verifyToken; // Alias for compatibility

/**
 * ✅ Middleware เพิ่มเติม: ตรวจสอบว่า userId ตรงกับ resource
 */
export const requireOwnership = (resourceUserIdField = 'userId') => {
  return async (req, res, next) => {
    // Resource ID จาก params
    const resourceId = req.params.id;
    
    if (!resourceId) {
      return res.status(400).json({
        success: false,
        error: 'Resource ID is required'
      });
    }
    
    // เก็บไว้ใน req เพื่อใช้ใน controller
    req.resourceUserIdField = resourceUserIdField;
    req.isOwnershipRequired = true;
    
    next();
  };
};