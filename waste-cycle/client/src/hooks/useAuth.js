// client/src/hooks/useAuth.js
import { useState, useEffect, useContext, createContext } from 'react';
import { 
  getAuth, 
  signInWithCustomToken,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const AuthContext = createContext(null);

export function AuthProvider({ children, firebaseAuth }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [idToken, setIdToken] = useState(null);

  const auth = firebaseAuth || getAuth();

  // ✅ CRITICAL: Listen to auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // ✅ CRITICAL: Get fresh token ทุกครั้ง
          const token = await firebaseUser.getIdToken(true); // force refresh
          setIdToken(token);
          
          console.log(`✅ Auth State Changed: ${firebaseUser.email}`);
          console.log(`   UID: ${firebaseUser.uid}`);

          // ✅ Fetch full user data from backend
          const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            const result = await response.json();
            setUser(result.data);
            
            console.log(`✅ User data loaded:`, result.data);
          } else {
            // Fallback to Firebase data
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: 'user'
            });
          }
        } catch (err) {
          console.error('❌ Error fetching user data:', err);
          setError(err.message);
          
          // ✅ CRITICAL: Clear state on error
          setUser(null);
          setIdToken(null);
        }
      } else {
        // ✅ CRITICAL: Clear all state when logged out
        console.log('🚪 User logged out - clearing state');
        setUser(null);
        setIdToken(null);
        
        // ✅ CRITICAL: Clear localStorage
        localStorage.clear();
        sessionStorage.clear();
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  // ✅ CRITICAL: Auto refresh token every 50 minutes
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          console.log('🔄 Auto-refreshing token...');
          const newToken = await currentUser.getIdToken(true);
          setIdToken(newToken);
          console.log('✅ Token refreshed');
        }
      } catch (err) {
        console.error('❌ Token refresh error:', err);
      }
    }, 50 * 60 * 1000); // 50 minutes

    return () => clearInterval(refreshInterval);
  }, [user, auth]);

  // ✅ Register
  const register = async (email, password, name, location) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log(`📝 Registering user: ${email}`);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, location })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      // ✅ Sign in with custom token
      await signInWithCustomToken(auth, result.data.customToken);
      
      console.log(`✅ User registered: ${email}`);

      return result.data;
    } catch (err) {
      console.error('❌ Register error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Login with Email
  const loginWithEmail = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log(`🔐 Logging in: ${email}`);
      
      // ✅ CRITICAL: Clear old data first
      localStorage.clear();
      sessionStorage.clear();

      await signInWithEmailAndPassword(auth, email, password);

      // ✅ CRITICAL: Get fresh token
      const token = await auth.currentUser.getIdToken(true);
      
      console.log(`✅ Login successful: ${email}`);
      console.log(`   Token issued at: ${new Date().toISOString()}`);

      // Sync with backend
      await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      return auth.currentUser;
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Login with Google
  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('🔐 Logging in with Google...');
      
      // ✅ CRITICAL: Clear old data first
      localStorage.clear();
      sessionStorage.clear();

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // ✅ CRITICAL: Get fresh token
      const token = await result.user.getIdToken(true);

      console.log(`✅ Google login successful: ${result.user.email}`);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token })
      });

      const backendResult = await response.json();

      if (!backendResult.success) {
        throw new Error(backendResult.error);
      }

      return backendResult.data;
    } catch (err) {
      console.error('❌ Google login error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logout
  const logout = async () => {
    try {
      setError(null);
      
      console.log(`🚪 Logging out: ${user?.email}`);
      
      await firebaseSignOut(auth);
      
      // ✅ CRITICAL: Clear all data
      setUser(null);
      setIdToken(null);
      localStorage.clear();
      sessionStorage.clear();
      
      console.log('✅ Logout successful - all data cleared');
    } catch (err) {
      console.error('❌ Logout error:', err);
      setError(err.message);
      throw err;
    }
  };

  // ✅ Make Authenticated Request
  const makeRequest = async (endpoint, options = {}) => {
    try {
      // ✅ CRITICAL: Get fresh token for every request
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('Not authenticated');
      }
      
      const token = await currentUser.getIdToken(false); // use cached if not expired

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      // ✅ Handle token expiration
      if (result.code === 'TOKEN_EXPIRED') {
        console.log('⚠️ Token expired, refreshing...');
        const newToken = await currentUser.getIdToken(true);
        setIdToken(newToken);
        
        // Retry request
        return makeRequest(endpoint, options);
      }
      
      // ✅ Handle revoked token
      if (result.code === 'TOKEN_REVOKED') {
        console.log('❌ Token revoked, logging out...');
        await logout();
        throw new Error('Session expired. Please login again.');
      }

      return result;
    } catch (err) {
      console.error('❌ Request error:', err);
      throw err;
    }
  };

  const value = {
    user,
    idToken,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    register,
    loginWithEmail,
    loginWithGoogle,
    logout,
    updateProfile,
    makeRequest
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}