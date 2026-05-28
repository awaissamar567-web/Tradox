import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, isFirebaseConfigured, db } from '../firebase/config';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface UserProfile {
  userPlan: 'free' | 'pro';
  onboardingComplete: boolean;
  country?: string;
  timezone: string;
  tradingStyle: string; // 'Day Trader' | 'Swing Trader' | 'Scalper'
  primaryMarket: string; // 'Forex' | 'Crypto' | 'Stocks' | 'Futures'
  currency: string; // 'USD' | 'EUR' | 'GBP' | 'PKR'
  brokerLabel: string;
  theme: 'dark' | 'light';
  customAvatarUrl?: string | null;
  paymentPlanType?: 'monthly' | 'lifetime' | null;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isMockMode: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  
  // PROFILE & PLANS
  userPlan: 'free' | 'pro';
  onboardingComplete: boolean;
  profileSettings: UserProfile | null;
  updateProfileSettings: (settings: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profileSettings, setProfileSettings] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isMockMode = !isFirebaseConfigured;

  // Initialize and synchronize user profile config
  useEffect(() => {
    if (!user) {
      setProfileSettings(null);
      return;
    }

    let unsubscribe: () => void = () => {};
    let whopUnsubscribe: () => void = () => {};

    const loadProfile = async () => {
      if (isFirebaseConfigured && db) {
        try {
          // Sync email to root user document for query in webhook (normalized to lowercase)
          const userRootRef = doc(db, 'users', user.uid);
          const normalizedEmail = user.email ? user.email.toLowerCase().trim() : null;
          await setDoc(userRootRef, { email: normalizedEmail, uid: user.uid }, { merge: true });

          const docRef = doc(db, 'users', user.uid, 'profile', 'config');
          
          // Setup real-time listener for profile config changes
          unsubscribe = onSnapshot(
            docRef, 
            (docSnap) => {
              if (docSnap.exists()) {
                setProfileSettings(docSnap.data() as UserProfile);
              } else {
                // Initialize default profile in DB
                const defaultProfile: UserProfile = {
                  userPlan: 'free',
                  onboardingComplete: false,
                  country: 'United States',
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
                  tradingStyle: 'Day Trader',
                  primaryMarket: 'Forex',
                  currency: 'USD',
                  brokerLabel: '',
                  theme: 'dark',
                  customAvatarUrl: null
                };
                setDoc(docRef, defaultProfile);
                setProfileSettings(defaultProfile);
              }
            },
            (error) => {
              console.error("Firestore config subscription error, falling back to localStorage:", error);
              const key = `edgelog_profile_${user.uid}`;
              const stored = localStorage.getItem(key);
              if (stored) {
                setProfileSettings(JSON.parse(stored));
              } else {
                const defaultProfile: UserProfile = {
                  userPlan: 'free',
                  onboardingComplete: false,
                  country: 'United States',
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
                  tradingStyle: 'Day Trader',
                  primaryMarket: 'Forex',
                  currency: 'USD',
                  brokerLabel: '',
                  theme: 'dark',
                  customAvatarUrl: null
                };
                setProfileSettings(defaultProfile);
              }
            }
          );

          // Setup real-time listener for whop memberships registry to auto-sync plans
          if (normalizedEmail) {
            const whopMembershipRef = doc(db, 'whop_memberships', normalizedEmail);
            whopUnsubscribe = onSnapshot(whopMembershipRef, async (whopSnap) => {
              if (whopSnap.exists()) {
                const whopData = whopSnap.data();
                try {
                  const currentProfileDoc = await getDoc(docRef);
                  if (currentProfileDoc.exists()) {
                    const currentProfile = currentProfileDoc.data();
                    if (currentProfile.userPlan !== whopData.userPlan || 
                        currentProfile.paymentPlanType !== (whopData.paymentPlanType || null)) {
                      console.log(`⚡ Syncing Whop ${whopData.userPlan} subscription to user profile config for ${normalizedEmail}`);
                      await setDoc(docRef, {
                        userPlan: whopData.userPlan,
                        paymentPlanType: whopData.paymentPlanType || null
                      }, { merge: true });
                    }
                  } else {
                    await setDoc(docRef, {
                      userPlan: whopData.userPlan,
                      paymentPlanType: whopData.paymentPlanType || null
                    }, { merge: true });
                  }
                } catch (err) {
                  console.error("Error during whop membership sync check:", err);
                }
              }
            }, (error) => {
              console.error("Firestore whop_memberships subscription error:", error);
            });
          }
        } catch (error) {
          console.error("Error loading user profile from Firestore:", error);
        }
      } else {
        // Local storage fallback
        const key = `edgelog_profile_${user.uid}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          setProfileSettings(JSON.parse(stored));
        } else {
          const defaultProfile: UserProfile = {
            userPlan: 'free',
            onboardingComplete: false,
            country: 'United States',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            tradingStyle: 'Day Trader',
            primaryMarket: 'Forex',
            currency: 'USD',
            brokerLabel: '',
            theme: 'dark',
            customAvatarUrl: null
          };
          localStorage.setItem(key, JSON.stringify(defaultProfile));
          setProfileSettings(defaultProfile);
        }
      }
    };

    loadProfile();

    return () => {
      unsubscribe();
      whopUnsubscribe();
    };
  }, [user]);

  // Sync theme to root class name
  useEffect(() => {
    const activeTheme = profileSettings?.theme || 'dark';
    if (activeTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [profileSettings?.theme]);

  const updateProfileSettings = async (settings: Partial<UserProfile>) => {
    if (!user || !profileSettings) return;

    const updated = { ...profileSettings, ...settings };
    setProfileSettings(updated);

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'users', user.uid, 'profile', 'config');
        await setDoc(docRef, updated, { merge: true });
      } catch (error) {
        console.error("Error updating user profile in Firestore:", error);
      }
    } else {
      localStorage.setItem(`edgelog_profile_${user.uid}`, JSON.stringify(updated));
    }
  };

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Mock Authentication loading
      const localMockUser = localStorage.getItem('edgelog_mock_user');
      if (localMockUser) {
        setUser(JSON.parse(localMockUser));
      }
      setLoading(false);
    }
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    if (isFirebaseConfigured && auth) {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        setUser({
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName || 'Trader',
          photoURL: cred.user.photoURL,
        });
      }
    } else {
      // Mock log in
      if (!email || !pass) throw new Error('Invalid email or password');
      if (pass.length < 6) throw new Error('Password must be at least 6 characters');
      const mockUser: AppUser = {
        uid: 'mock-uid-12345',
        email: email,
        displayName: email.split('@')[0].toUpperCase(),
        photoURL: null,
      };
      localStorage.setItem('edgelog_mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    if (isFirebaseConfigured && auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        setUser({
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: 'Trader',
          photoURL: null,
        });
      }
    } else {
      // Mock register
      if (!email || !pass) throw new Error('Invalid email or password');
      if (pass.length < 6) throw new Error('Password must be at least 6 characters');
      const mockUser: AppUser = {
        uid: 'mock-uid-12345',
        email: email,
        displayName: email.split('@')[0].toUpperCase(),
        photoURL: null,
      };
      localStorage.setItem('edgelog_mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
    }
  };

  const signInWithGoogle = async () => {
    if (isFirebaseConfigured && auth && googleProvider) {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user) {
        setUser({
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName,
          photoURL: cred.user.photoURL,
        });
      }
    } else {
      // Mock Google Auth
      const mockUser: AppUser = {
        uid: 'mock-uid-google',
        email: 'trader.edge@gmail.com',
        displayName: 'MOCK TRADER',
        photoURL: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=80&q=80',
      };
      localStorage.setItem('edgelog_mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
    }
  };

  const signOut = async () => {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
      setUser(null);
    } else {
      // Mock logout
      localStorage.removeItem('edgelog_mock_user');
      setUser(null);
    }
  };

  // Helper variables for easy destructuring
  const userPlan = profileSettings?.userPlan || 'free';
  const onboardingComplete = !!profileSettings?.onboardingComplete;
  const isAppLoading = loading || (!!user && profileSettings === null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: isAppLoading,
        isMockMode,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        userPlan,
        onboardingComplete,
        profileSettings,
        updateProfileSettings
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
